const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const client = require('../config/redis');
const Redlock = require('redlock');

// Initialize Redlock with shared Redis client
const redlock = new Redlock([client], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200,
  retryJitter: 200,
  automaticExtensionThreshold: 500,
});

/**
 * Book a slot with optimistic locking and Redis distributed lock to prevent race conditions
 */
exports.bookSlot = async (slotId, userId) => {
  const lockKey = `slot:${slotId}`;
  let lock;

  try {
    // Acquire distributed lock (5 second duration)
    lock = await redlock.acquire([lockKey], 5000);

    // Start database transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Get slot with current state
      const slot = await prisma.availabilitySlot.findUnique({
        where: { id: slotId },
        include: { tutor: true },
      });

      if (!slot) {
        throw new Error('Slot not found');
      }
      if (slot.isBooked) {
        throw new Error('Slot already booked');
      }

      // Verify slot is in the future
      if (new Date(slot.startTime) <= new Date()) {
        throw new Error('Cannot book past slots');
      }

      // Create session
      const session = await prisma.session.create({
        data: {
          tutorId: slot.tutorId,
          learnerId: userId,
          scheduledStart: slot.startTime,
          scheduledEnd: slot.endTime,
          status: 'SCHEDULED',
        },
        include: {
          tutor: true,
          learner: true,
        },
      });

      // Update slot as booked
      await prisma.availabilitySlot.update({
        where: { id: slotId },
        data: { isBooked: true },
      });

      return session;
    });

    // Invalidate related caches
    try {
      await client.del(`slots:${result.tutorId}`);
      const matchKeys = await client.keys(`matches:${userId}:*`);
      if (matchKeys.length > 0) {
        await client.del(matchKeys);
      }
    } catch (cacheErr) {
      console.error('Cache invalidation error:', cacheErr);
    }

    return result;
  } catch (error) {
    throw error;
  } finally {
    // Release lock
    if (lock) {
      try {
        await lock.release();
      } catch (releaseErr) {
        console.error('Lock release error:', releaseErr);
      }
    }
  }
};

/**
 * Suggest optimal time slots using scoring algorithm
 */
exports.suggestSlots = async (tutorId, learnerId, daysAhead = 7) => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);

  // Get all available slots for tutor in the next N days
  const slots = await prisma.availabilitySlot.findMany({
    where: {
      tutorId,
      isBooked: false,
      startTime: {
        gte: new Date(),
        lte: endDate,
      },
    },
    orderBy: { startTime: 'asc' },
  });

  if (slots.length === 0) {
    return [];
  }

  // Get learner's past session preferences
  const pastSessions = await prisma.session.findMany({
    where: {
      learnerId,
      status: { in: ['COMPLETED', 'SCHEDULED'] },
    },
    select: { scheduledStart: true },
  });

  // Score each slot based on:
  // 1. How soon it is (sooner is better, but not too soon)
  // 2. Time of day preferences from past sessions
  // 3. Day of week preferences
  const scoredSlots = slots.map(slot => {
    let score = 0;
    const slotDate = new Date(slot.startTime);
    const dayOfWeek = slotDate.getDay();
    const hourOfDay = slotDate.getHours();

    // 1. Recency score (prefer 2-4 days out)
    const daysUntil = (slotDate - new Date()) / (1000 * 60 * 60 * 24);
    if (daysUntil >= 2 && daysUntil <= 4) {
      score += 3;
    } else if (daysUntil >= 1 && daysUntil < 7) {
      score += 2;
    } else {
      score += 1;
    }

    // 2. Time of day preference
    if (pastSessions.length > 0) {
      const preferredHours = pastSessions.map(s => new Date(s.scheduledStart).getHours());
      const avgHour = preferredHours.reduce((a, b) => a + b, 0) / preferredHours.length;
      const hourDiff = Math.abs(hourOfDay - avgHour);
      score += Math.max(0, 3 - hourDiff / 2); // Closer to preferred time = higher score
    }

    // 3. Day of week preference
    if (pastSessions.length > 0) {
      const preferredDays = pastSessions.map(s => new Date(s.scheduledStart).getDay());
      if (preferredDays.includes(dayOfWeek)) {
        score += 2;
      }
    }

    // 4. Avoid very early or very late hours
    if (hourOfDay >= 9 && hourOfDay <= 20) {
      score += 1;
    }

    return { ...slot, score };
  });

  // Sort by score and return top suggestions
  scoredSlots.sort((a, b) => b.score - a.score);
  return scoredSlots.slice(0, 5);
};

/**
 * Cancel a session and free up the slot
 */
exports.cancelSession = async (sessionId, userId) => {
  const lockKey = `session:${sessionId}`;
  let lock;

  try {
    lock = await redlock.acquire([lockKey], 5000);

    const result = await prisma.$transaction(async (prisma) => {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      // Verify user is part of this session
      if (session.tutorId !== userId && session.learnerId !== userId) {
        throw new Error('Unauthorized to cancel this session');
      }

      // Don't allow cancellation of completed sessions
      if (session.status === 'COMPLETED') {
        throw new Error('Cannot cancel completed session');
      }

      // Update session status
      const updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: { status: 'CANCELLED' },
      });

      // Find and free up the corresponding slot
      const slot = await prisma.availabilitySlot.findFirst({
        where: {
          tutorId: session.tutorId,
          startTime: session.scheduledStart,
          endTime: session.scheduledEnd,
        },
      });

      if (slot) {
        await prisma.availabilitySlot.update({
          where: { id: slot.id },
          data: { isBooked: false },
        });
      }

      return updatedSession;
    });

    // Invalidate caches
    try {
      await client.del(`slots:${result.tutorId}`);
    } catch (cacheErr) {
      console.error('Cache invalidation error:', cacheErr);
    }

    return result;
  } finally {
    if (lock) {
      try {
        await lock.release();
      } catch (releaseErr) {
        console.error('Lock release error:', releaseErr);
      }
    }
  }
};

/**
 * Check for scheduling conflicts
 */
exports.checkConflicts = async (tutorId, startTime, endTime) => {
  const conflicts = await prisma.session.findMany({
    where: {
      tutorId,
      status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      OR: [
        {
          scheduledStart: { lte: startTime },
          scheduledEnd: { gt: startTime },
        },
        {
          scheduledStart: { lt: endTime },
          scheduledEnd: { gte: endTime },
        },
        {
          scheduledStart: { gte: startTime },
          scheduledEnd: { lte: endTime },
        },
      ],
    },
  });

  return conflicts;
};

module.exports = exports;
