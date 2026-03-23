const redis = require('redis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error('Redis reconnection limit exceeded');
      }
      return retries * 100;
    },
  },
});

// Initialize Redis connection
(async () => {
  try {
    await client.connect();
    console.log('Redis cache service connected');
  } catch (err) {
    console.error('Redis cache connection error:', err);
  }
})();

// Handle Redis errors
client.on('error', (err) => {
  console.error('Redis cache error:', err);
});

client.on('reconnecting', () => {
  console.log('Redis cache reconnecting...');
});

/**
 * Cache TTL constants (in seconds)
 */
const TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
};

/**
 * Generic cache getter with fallback to database
 */
const getOrSet = async (key, fetchFunction, ttl = TTL.MEDIUM) => {
  try {
    // Try to get from cache
    const cached = await client.get(key);
    if (cached) {
      console.log(`Cache hit: ${key}`);
      return JSON.parse(cached);
    }

    console.log(`Cache miss: ${key}`);
    // Fetch from database
    const data = await fetchFunction();

    // Store in cache
    if (data !== null && data !== undefined) {
      await client.setEx(key, ttl, JSON.stringify(data));
    }

    return data;
  } catch (err) {
    console.error(`Cache error for key ${key}:`, err);
    // Fallback to database on cache error
    return await fetchFunction();
  }
};

/**
 * Cache user profile
 */
const cacheUserProfile = async (userId) => {
  const key = `user:${userId}`;
  return getOrSet(
    key,
    async () => {
      return await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subjects: {
            include: { subject: true },
          },
        },
      });
    },
    TTL.LONG
  );
};

/**
 * Cache tutor availability slots
 */
const cacheTutorSlots = async (tutorId) => {
  const key = `slots:${tutorId}`;
  return getOrSet(
    key,
    async () => {
      return await prisma.availabilitySlot.findMany({
        where: {
          tutorId,
          isBooked: false,
          startTime: { gte: new Date() },
        },
        orderBy: { startTime: 'asc' },
      });
    },
    TTL.SHORT
  );
};

/**
 * Cache session details
 */
const cacheSession = async (sessionId) => {
  const key = `session:${sessionId}`;
  return getOrSet(
    key,
    async () => {
      return await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          tutor: true,
          learner: true,
          reviews: true,
        },
      });
    },
    TTL.MEDIUM
  );
};

/**
 * Cache tutor reviews and ratings
 */
const cacheTutorReviews = async (tutorId) => {
  const key = `reviews:${tutorId}`;
  return getOrSet(
    key,
    async () => {
      const reviews = await prisma.review.findMany({
        where: { revieweeId: tutorId },
        include: { reviewer: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      return {
        reviews,
        averageRating: avgRating,
        totalReviews: reviews.length,
      };
    },
    TTL.LONG
  );
};

/**
 * Cache popular subjects
 */
const cachePopularSubjects = async () => {
  const key = 'subjects:popular';
  return getOrSet(
    key,
    async () => {
      return await prisma.subject.findMany({
        take: 10,
        include: {
          _count: {
            select: { users: true },
          },
        },
        orderBy: {
          users: {
            _count: 'desc',
          },
        },
      });
    },
    TTL.VERY_LONG
  );
};

/**
 * Cache user sessions
 */
const cacheUserSessions = async (userId) => {
  const key = `user:${userId}:sessions`;
  return getOrSet(
    key,
    async () => {
      return await prisma.session.findMany({
        where: {
          OR: [{ tutorId: userId }, { learnerId: userId }],
        },
        include: {
          tutor: true,
          learner: true,
        },
        orderBy: { scheduledStart: 'desc' },
        take: 50,
      });
    },
    TTL.SHORT
  );
};

/**
 * Invalidate cache by key or pattern
 */
const invalidate = async (keyOrPattern) => {
  try {
    if (keyOrPattern.includes('*')) {
      // Pattern matching - get all keys and delete
      const keys = await client.keys(keyOrPattern);
      if (keys.length > 0) {
        await client.del(keys);
        console.log(`Invalidated ${keys.length} keys matching pattern: ${keyOrPattern}`);
      }
    } else {
      // Single key
      await client.del(keyOrPattern);
      console.log(`Invalidated cache: ${keyOrPattern}`);
    }
  } catch (err) {
    console.error(`Cache invalidation error for ${keyOrPattern}:`, err);
  }
};

/**
 * Invalidate all user-related caches
 */
const invalidateUserCache = async (userId) => {
  await invalidate(`user:${userId}`);
  await invalidate(`user:${userId}:sessions`);
  await invalidate(`matches:${userId}:*`);
};

/**
 * Invalidate tutor-related caches
 */
const invalidateTutorCache = async (tutorId) => {
  await invalidate(`slots:${tutorId}`);
  await invalidate(`reviews:${tutorId}`);
  await invalidate(`user:${tutorId}`);
};

/**
 * Invalidate session cache
 */
const invalidateSessionCache = async (sessionId) => {
  await invalidate(`session:${sessionId}`);
};

/**
 * Set a simple key-value pair
 */
const set = async (key, value, ttl = TTL.MEDIUM) => {
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
    console.log(`Cache set: ${key}`);
  } catch (err) {
    console.error(`Cache set error for ${key}:`, err);
  }
};

/**
 * Get a simple key-value pair
 */
const get = async (key) => {
  try {
    const value = await client.get(key);
    if (value) {
      console.log(`Cache hit: ${key}`);
      return JSON.parse(value);
    }
    console.log(`Cache miss: ${key}`);
    return null;
  } catch (err) {
    console.error(`Cache get error for ${key}:`, err);
    return null;
  }
};

/**
 * Increment a counter (useful for rate limiting, statistics, etc.)
 */
const increment = async (key, ttl = TTL.MEDIUM) => {
  try {
    const value = await client.incr(key);
    if (value === 1) {
      // First increment, set TTL
      await client.expire(key, ttl);
    }
    return value;
  } catch (err) {
    console.error(`Cache increment error for ${key}:`, err);
    return null;
  }
};

/**
 * Check if a key exists
 */
const exists = async (key) => {
  try {
    return await client.exists(key);
  } catch (err) {
    console.error(`Cache exists error for ${key}:`, err);
    return false;
  }
};

/**
 * Clear all cache (use with caution!)
 */
const clearAll = async () => {
  try {
    await client.flushAll();
    console.log('All cache cleared');
  } catch (err) {
    console.error('Cache clear all error:', err);
  }
};

/**
 * Get cache statistics
 */
const getStats = async () => {
  try {
    const info = await client.info('stats');
    return info;
  } catch (err) {
    console.error('Cache stats error:', err);
    return null;
  }
};

module.exports = {
  client,
  TTL,
  getOrSet,
  cacheUserProfile,
  cacheTutorSlots,
  cacheSession,
  cacheTutorReviews,
  cachePopularSubjects,
  cacheUserSessions,
  invalidate,
  invalidateUserCache,
  invalidateTutorCache,
  invalidateSessionCache,
  set,
  get,
  increment,
  exists,
  clearAll,
  getStats,
};
