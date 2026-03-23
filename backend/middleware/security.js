const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { cacheService } = require('../services/cacheService');

/**
 * Helmet security middleware configuration
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      mediaSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for WebRTC
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
  skip: (req) => {
    // Skip rate limiting for certain paths or authenticated admins
    return req.path === '/health' || req.user?.role === 'ADMIN';
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Please try again in 15 minutes',
    });
  },
});

/**
 * Rate limiter for session booking
 * Prevent spam bookings - 10 per hour
 */
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Booking limit exceeded',
      message: 'You can only book 10 sessions per hour',
    });
  },
});

/**
 * Rate limiter for messaging
 * Prevent spam - 60 messages per minute per user
 */
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Message rate limit exceeded',
      message: 'Please slow down',
    });
  },
});

/**
 * Advanced rate limiter with Redis store
 * For more sophisticated rate limiting across multiple servers
 */
const createRedisRateLimiter = (options = {}) => {
  const { max = 100, windowMs = 15 * 60 * 1000, keyPrefix = 'rl' } = options;

  return async (req, res, next) => {
    const key = `${keyPrefix}:${req.user?.id || req.ip}`;

    try {
      const current = await cacheService.increment(key, Math.ceil(windowMs / 1000));

      if (current > max) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests',
        });
      }

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));

      next();
    } catch (err) {
      // If Redis fails, fallback to allowing the request (fail open)
      console.error('Rate limiter error:', err);
      next();
    }
  };
};

/**
 * Input sanitization middleware
 */
const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized input detected - ${req.method} ${req.path} - key: ${key}`);
  },
});

/**
 * Request logging for security monitoring
 */
const securityLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    };

    // Log suspicious activity
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn('🚨 Security Alert:', logData);
    } else if (res.statusCode >= 400) {
      console.error('❌ Error:', logData);
    } else if (duration > 5000) {
      console.warn('⚠️  Slow request:', logData);
    }
  });

  next();
};

/**
 * CORS configuration with dynamic origin validation
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
};

/**
 * Brute force protection for sensitive operations
 */
const bruteForceProtection = (maxAttempts = 5, windowMinutes = 30) => {
  return async (req, res, next) => {
    const key = `bf:${req.path}:${req.user?.id || req.ip}`;

    try {
      const attempts = await cacheService.get(key) || 0;

      if (attempts >= maxAttempts) {
        return res.status(429).json({
          error: 'Too many failed attempts',
          message: `Please try again in ${windowMinutes} minutes`,
        });
      }

      // Store original response send to track failures
      const originalSend = res.send;
      res.send = function (data) {
        if (res.statusCode >= 400) {
          // Increment failed attempts
          cacheService.set(key, attempts + 1, windowMinutes * 60).catch(console.error);
        } else {
          // Clear on success
          cacheService.invalidate(key).catch(console.error);
        }
        originalSend.call(this, data);
      };

      next();
    } catch (err) {
      console.error('Brute force protection error:', err);
      next();
    }
  };
};

/**
 * IP whitelist middleware (for admin routes)
 */
const ipWhitelist = (allowedIps = []) => {
  return (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;

    if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
      console.warn(`Blocked request from IP: ${clientIp}`);
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP is not whitelisted',
      });
    }

    next();
  };
};

/**
 * Request size limiter
 */
const requestSizeLimit = '10mb'; // Adjust based on needs

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(self), camera=(self)');

  next();
};

module.exports = {
  helmetConfig,
  apiLimiter,
  authLimiter,
  bookingLimiter,
  messageLimiter,
  createRedisRateLimiter,
  sanitizeInput,
  securityLogger,
  corsOptions,
  bruteForceProtection,
  ipWhitelist,
  requestSizeLimit,
  securityHeaders,
};
