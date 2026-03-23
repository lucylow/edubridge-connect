const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');

// Import middleware
const {
  helmetConfig,
  apiLimiter,
  authLimiter,
  bookingLimiter,
  messageLimiter,
  sanitizeInput,
  securityLogger,
  corsOptions,
  securityHeaders,
  requestSizeLimit,
} = require('./middleware/security');

// Import services
const { initializeSocket } = require('./services/socketService');
const { notificationQueue } = require('./queues/notificationQueue');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(securityHeaders);
app.use(cors(corsOptions));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Security logging
app.use(securityLogger);

// Body parsing
app.use(express.json({ limit: requestSizeLimit }));
app.use(express.urlencoded({ extended: true, limit: requestSizeLimit }));

// Input sanitization
app.use(sanitizeInput);

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes with rate limiting
app.use('/api', apiLimiter);

// Example route structure (you'll need to implement these)
app.use('/api/auth', authLimiter); // auth routes with strict rate limiting
app.use('/api/sessions', bookingLimiter); // session booking routes
app.use('/api/messages', messageLimiter); // messaging routes

// Example route implementations (replace with your actual routes)
/*
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const matchRoutes = require('./routes/matches');
const messageRoutes = require('./routes/messages');

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
*/

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An error occurred'
    : err.message;

  res.status(err.status || 500).json({
    error: 'Server Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Initialize Socket.io
const io = initializeSocket(server);
logger.info('Socket.io initialized');

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Close Socket.io connections
      io.close(() => {
        logger.info('Socket.io closed');
      });

      // Close notification queue
      await notificationQueue.close();
      logger.info('Notification queue closed');

      // Close database connections (if using Prisma)
      // await prisma.$disconnect();
      // logger.info('Database disconnected');

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`CORS enabled for: ${corsOptions.origin}`);
});

module.exports = { app, server, io };
