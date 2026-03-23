const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const client = require('../config/redis');

// Weights (could be dynamically adjusted via A/B testing)
const WEIGHTS = {
  SUBJECT_RELEVANCE: 0.4,
  AVAILABILITY: 0.25,
  REPUTATION: 0.15,
  PAST_SUCCESS: 0.1,
  LOCATION: 0.05,
  PREFERRED_DAYS: 0.05,
};

/**
 * Computes a score for a tutor based on multiple factors
 */
async function computeTutorScore(tutor, learner, preferredTime) {
  let score = 0;

  // 1. Subject relevance: cosine similarity between tutor's subjects and learner's needs
  const learnerSubjects = learner.subjects?.map(s => s.subjectId) || [];
  const tutorSubjects = tutor.subjects?.map(s => s.subjectId) || [];
  const intersection = learnerSubjects.filter(id => tutorSubjects.includes(id)).length;
  const relevance = intersection / Math.max(learnerSubjects.length, 1);
  score += relevance * WEIGHTS.SUBJECT_RELEVANCE;

  // 2. Availability: number of overlapping slots in next 7 days
  let availabilityScore = 0;
  if (preferredTime) {
    // check exact slot match
    const slot = await prisma.availabilitySlot.findFirst({
      where: {
        tutorId: tutor.id,
        startTime: preferredTime,
        isBooked: false,
      },
    });
    availabilityScore = slot ? 1 : 0;
  } else {
    // count free slots in next 7 days
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        tutorId: tutor.id,
        isBooked: false,
        startTime: { gte: new Date(), lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      },
    });
    availabilityScore = Math.min(slots.length / 10, 1);
  }
  score += availabilityScore * WEIGHTS.AVAILABILITY;

  // 3. Reputation: average rating from reviews (with recency bias)
  const reviews = await prisma.review.findMany({
    where: { revieweeId: tutor.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  if (reviews.length > 0) {
    // Apply recency bias: newer reviews have more weight
    let weightedSum = 0;
    let weightSum = 0;
    reviews.forEach((review, index) => {
      const weight = 1 / (index + 1); // Diminishing weight for older reviews
      weightedSum += review.rating * weight;
      weightSum += weight;
    });
    const avgRating = weightedSum / weightSum;
    const reputationScore = avgRating / 5;
    score += reputationScore * WEIGHTS.REPUTATION;
  }

  // 4. Past success: sessions completed with positive outcomes
  const sessions = await prisma.session.findMany({
    where: { tutorId: tutor.id, status: 'COMPLETED' },
    include: { reviews: true },
  });
  const successRate = sessions.length > 0
    ? sessions.filter(s => s.reviews.some(r => r.rating >= 4)).length / sessions.length
    : 0;
  score += successRate * WEIGHTS.PAST_SUCCESS;

  // 5. Location: placeholder for future geolocation feature
  // Could implement IP-based distance calculation

  // 6. Preferred days: placeholder for learner preference matching
  // Could check if tutor's availability overlaps with learner's preferred days

  return score;
}

/**
 * Get top tutors for a learner, with caching
 */
exports.getMatches = async (learnerId, subjectName, preferredTime = null) => {
  const cacheKey = `matches:${learnerId}:${subjectName}:${preferredTime || 'any'}`;

  try {
    const cached = await client.get(cacheKey);
    if (cached) {
      console.log('Cache hit for matches');
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('Redis get error:', err);
  }

  const learner = await prisma.user.findUnique({
    where: { id: learnerId },
    include: { subjects: true },
  });

  const subject = await prisma.subject.findUnique({ where: { name: subjectName } });
  if (!subject) return [];

  // Find tutors who have this subject
  const tutorSubjects = await prisma.userSubject.findMany({
    where: { subjectId: subject.id },
    include: {
      user: {
        include: {
          subjects: true,
          availabilitySlots: true,
          reviewsReceived: true
        }
      }
    },
  });
  const tutors = tutorSubjects.map(ts => ts.user);

  // Compute scores in parallel
  const scored = await Promise.all(tutors.map(async tutor => {
    const score = await computeTutorScore(tutor, learner, preferredTime);
    return { tutor, score };
  }));
  scored.sort((a, b) => b.score - a.score);

  const topMatches = scored.slice(0, 10);

  // Cache for 5 minutes
  try {
    await client.setEx(cacheKey, 300, JSON.stringify(topMatches));
  } catch (err) {
    console.error('Redis set error:', err);
  }

  return topMatches;
};

/**
 * Invalidate matching cache for a user
 */
exports.invalidateMatchCache = async (userId) => {
  try {
    const keys = await client.keys(`matches:${userId}:*`);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (err) {
    console.error('Redis invalidate error:', err);
  }
};

module.exports = exports;
