const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let io;

/**
 * Initialize Socket.io server with authentication
 */
exports.initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, role: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.id})`);

    // Join user's personal room
    socket.join(`user-${socket.user.id}`);

    // Join session room
    socket.on('join-session', async (sessionId) => {
      try {
        // Verify user is part of this session
        const session = await prisma.session.findFirst({
          where: {
            id: parseInt(sessionId),
            OR: [
              { tutorId: socket.user.id },
              { learnerId: socket.user.id },
            ],
          },
        });

        if (!session) {
          socket.emit('error', { message: 'Unauthorized or session not found' });
          return;
        }

        socket.join(`session-${sessionId}`);
        console.log(`${socket.user.name} joined session ${sessionId}`);

        // Notify other participant
        socket.to(`session-${sessionId}`).emit('user-joined', {
          userId: socket.user.id,
          userName: socket.user.name,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('Join session error:', err);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Leave session room
    socket.on('leave-session', (sessionId) => {
      socket.leave(`session-${sessionId}`);
      socket.to(`session-${sessionId}`).emit('user-left', {
        userId: socket.user.id,
        userName: socket.user.name,
        timestamp: new Date(),
      });
      console.log(`${socket.user.name} left session ${sessionId}`);
    });

    // WebRTC signaling - offer
    socket.on('offer', (data) => {
      console.log(`Offer from ${socket.user.name} in session ${data.sessionId}`);
      socket.to(`session-${data.sessionId}`).emit('offer', {
        offer: data.offer,
        from: socket.user.id,
        fromName: socket.user.name,
      });
    });

    // WebRTC signaling - answer
    socket.on('answer', (data) => {
      console.log(`Answer from ${socket.user.name} in session ${data.sessionId}`);
      socket.to(`session-${data.sessionId}`).emit('answer', {
        answer: data.answer,
        from: socket.user.id,
        fromName: socket.user.name,
      });
    });

    // WebRTC signaling - ICE candidate
    socket.on('ice-candidate', (data) => {
      socket.to(`session-${data.sessionId}`).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.user.id,
      });
    });

    // Text chat message
    socket.on('send-message', async (data) => {
      try {
        const { sessionId, message } = data;

        // Verify user is part of session
        const session = await prisma.session.findFirst({
          where: {
            id: parseInt(sessionId),
            OR: [
              { tutorId: socket.user.id },
              { learnerId: socket.user.id },
            ],
          },
        });

        if (!session) {
          socket.emit('error', { message: 'Unauthorized or session not found' });
          return;
        }

        // Save message to database (optional, for persistence)
        const savedMessage = await prisma.message.create({
          data: {
            sessionId: parseInt(sessionId),
            senderId: socket.user.id,
            content: message,
          },
        });

        // Broadcast to all users in session (including sender)
        io.to(`session-${sessionId}`).emit('new-message', {
          id: savedMessage.id,
          userId: socket.user.id,
          userName: socket.user.name,
          message: message,
          timestamp: savedMessage.createdAt,
        });
      } catch (err) {
        console.error('Send message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing-start', (data) => {
      socket.to(`session-${data.sessionId}`).emit('user-typing', {
        userId: socket.user.id,
        userName: socket.user.name,
      });
    });

    socket.on('typing-stop', (data) => {
      socket.to(`session-${data.sessionId}`).emit('user-stopped-typing', {
        userId: socket.user.id,
      });
    });

    // Watch tutor availability (for real-time slot booking updates)
    socket.on('watch-tutor', (tutorId) => {
      socket.join(`tutor-${tutorId}`);
      console.log(`${socket.user.name} watching tutor ${tutorId}`);
    });

    socket.on('unwatch-tutor', (tutorId) => {
      socket.leave(`tutor-${tutorId}`);
    });

    // Session status updates
    socket.on('session-status-update', async (data) => {
      try {
        const { sessionId, status } = data;

        // Verify permission and update session
        const session = await prisma.session.findFirst({
          where: {
            id: parseInt(sessionId),
            OR: [
              { tutorId: socket.user.id },
              { learnerId: socket.user.id },
            ],
          },
        });

        if (!session) {
          socket.emit('error', { message: 'Unauthorized or session not found' });
          return;
        }

        await prisma.session.update({
          where: { id: parseInt(sessionId) },
          data: { status },
        });

        io.to(`session-${sessionId}`).emit('session-status-changed', {
          sessionId,
          status,
          updatedBy: socket.user.id,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('Session status update error:', err);
        socket.emit('error', { message: 'Failed to update session status' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user.id})`);
    });
  });

  console.log('Socket.io initialized');
  return io;
};

/**
 * Emit slot booked event to all watching users
 */
exports.emitSlotBooked = (tutorId, slotId) => {
  if (io) {
    io.to(`tutor-${tutorId}`).emit('slot-booked', { tutorId, slotId, timestamp: new Date() });
  }
};

/**
 * Emit notification to specific user
 */
exports.emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user-${userId}`).emit('notification', notification);
  }
};

/**
 * Get Socket.io instance
 */
exports.getIO = () => io;

module.exports = exports;
