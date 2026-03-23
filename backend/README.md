# EduBridge Connect - Advanced Backend Implementation

## Overview

This backend implements advanced, production-ready features for the EduBridge Connect tutoring platform, including sophisticated matching algorithms, real-time scheduling with concurrency control, WebRTC video communication, and comprehensive security measures.

## 🚀 Key Features

### 1. Sophisticated Matching Algorithm

**Location:** `backend/services/matchingService.js`

The matching algorithm uses a multi-factor scoring system to find optimal tutor-learner pairings:

- **Subject Relevance (40%)**: Intersection-based similarity between tutor expertise and learner needs
- **Availability (25%)**: Number of free slots in the next 7 days, with exact time matching
- **Reputation (15%)**: Weighted average of recent reviews with recency bias
- **Past Success (10%)**: Completion rate and positive feedback from previous sessions
- **Location (5%)**: Geographic proximity for in-person options
- **Preferred Days (5%)**: Overlap between availability and learner preferences

**Caching:** Results are cached in Redis for 5 minutes to reduce database load.

**Usage:**
```javascript
const { getMatches } = require('./services/matchingService');

const matches = await getMatches(
  learnerId,
  'Mathematics',
  new Date('2026-03-25T14:00:00Z') // optional preferred time
);

// Returns top 10 tutors sorted by score
```

### 2. Real-time Scheduling with Concurrency Control

**Location:** `backend/services/schedulingService.js`

Prevents double-booking through:
- **Distributed Locks**: Redis-based locking via Redlock
- **Database Transactions**: Atomic operations with Prisma
- **Optimistic Concurrency**: Version checking and row-level locks

**Features:**
- Slot booking with race condition prevention
- Smart time slot suggestions based on learner history
- Conflict detection
- Session cancellation with slot freeing
- Cache invalidation on updates

**Usage:**
```javascript
const { bookSlot } = require('./services/schedulingService');

try {
  const session = await bookSlot(slotId, userId);
  // Session booked successfully, slot locked
} catch (error) {
  // Handle booking conflict
}
```

### 3. Integrated Video/Text Communication

**WebRTC Video Calling:**
- **Frontend:** `src/components/VideoCall.jsx`
- **Backend:** `backend/services/socketService.js`

Features:
- Peer-to-peer video/audio using simple-peer
- Screen sharing support
- Audio/video toggle controls
- Connection state management
- Automatic cleanup on disconnect

**Real-time Text Chat:**
- **Frontend:** `src/components/ChatWindow.jsx`
- **Backend:** Socket.io message handling

Features:
- Real-time message delivery
- Typing indicators
- Message persistence
- User join/leave notifications
- Connection status display

**Usage:**
```jsx
import VideoCall from './components/VideoCall';
import ChatWindow from './components/ChatWindow';

<VideoCall sessionId={sessionId} />
<ChatWindow sessionId={sessionId} />
```

### 4. Background Jobs & Notifications

**Location:** `backend/queues/notificationQueue.js`

Bull queue for processing:
- Session booking confirmations
- Session reminders (15 minutes before)
- Cancellation notifications
- Review requests
- In-app notifications

**Features:**
- Automatic retries with exponential backoff
- Priority-based processing
- Job persistence
- Event monitoring

**Usage:**
```javascript
const { addNotification } = require('./queues/notificationQueue');

await addNotification('session_booked', recipientEmail, {
  sessionId: 123,
  tutorName: 'Jane Doe',
  scheduledStart: new Date(),
});
```

### 5. Production-Grade Security

**Location:** `backend/middleware/security.js`

**Security Measures:**
- **Helmet.js**: Security headers (CSP, XSS protection, etc.)
- **CORS**: Configurable origin whitelisting
- **Rate Limiting**: Multiple tiers
  - General API: 100 req/15min
  - Auth: 5 req/15min
  - Booking: 10 req/hour
  - Messaging: 60 req/minute
- **Input Sanitization**: XSS prevention
- **Brute Force Protection**: Redis-backed attempt tracking
- **Security Logging**: Failed auth and suspicious activity tracking
- **Content Type Validation**: Prevent malformed requests

**Usage:**
```javascript
const {
  helmetConfig,
  apiLimiter,
  authLimiter,
  sanitizeInput,
} = require('./middleware/security');

app.use(helmetConfig);
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use(sanitizeInput);
```

## 📦 Installation

### Prerequisites
- Node.js 16+
- Redis 6+
- PostgreSQL (or your database of choice)

### Install Dependencies

```bash
npm install
```

**Key packages:**
- `redis` - Redis client for caching and distributed locks
- `redlock` - Distributed locking
- `bull` - Queue management
- `socket.io` - WebSocket server
- `socket.io-client` - WebSocket client
- `simple-peer` - WebRTC implementation
- `express-rate-limit` - Rate limiting
- `helmet` - Security headers
- `winston` - Logging
- `jsonwebtoken` - Authentication

### Environment Variables

Create a `.env` file:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/edubridge

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (optional - for notifications)
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@edubridge.com

# Logging
LOG_LEVEL=info
```

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### With Redis and Queue Worker
```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Main server
npm start

# Terminal 3: Queue worker (if separated)
node backend/workers/notificationWorker.js
```

## 📁 Project Structure

```
backend/
├── config/
│   └── redis.js              # Redis client configuration
├── middleware/
│   └── security.js           # Security middleware
├── services/
│   ├── matchingService.js    # Tutor matching algorithm
│   ├── schedulingService.js  # Slot booking & scheduling
│   └── socketService.js      # WebRTC signaling & chat
├── queues/
│   └── notificationQueue.js  # Background job processing
├── routes/
│   └── matches.js           # Example API routes
├── server.js                # Express server setup
└── README.md               # This file

src/components/
├── VideoCall.jsx           # WebRTC video component
└── ChatWindow.jsx          # Real-time chat component
```

## 🧪 Testing

### Manual Testing

1. **Matching Algorithm:**
```bash
curl -X GET "http://localhost:3000/api/matches?subjectName=Mathematics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

2. **Book a Session:**
```bash
curl -X POST "http://localhost:3000/api/sessions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slotId": 123}'
```

3. **WebSocket Connection:**
```javascript
// In browser console
const socket = io('http://localhost:3000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connect', () => console.log('Connected'));
socket.emit('join-session', 123);
```

## 🔒 Security Best Practices

1. **Always use HTTPS in production**
2. **Set strong JWT secrets** (minimum 32 characters)
3. **Configure CORS** properly for your domain
4. **Enable rate limiting** on all public endpoints
5. **Regularly update dependencies** for security patches
6. **Monitor logs** for suspicious activity
7. **Use environment variables** for all secrets
8. **Implement proper authentication** before deploying

## 📊 Performance Optimizations

1. **Redis Caching:**
   - Match results: 5 minutes
   - Availability slots: 1 minute
   - User sessions: 24 hours

2. **Database Indexing:**
   - Index on `tutorId`, `startTime`, `isBooked` for availability queries
   - Index on `subjectId` for subject lookups
   - Composite index on session queries

3. **Connection Pooling:**
   - Configure Prisma connection pool
   - Redis connection reuse

4. **Rate Limiting:**
   - Prevents API abuse
   - Reduces server load
   - Protects against DDoS

## 🐛 Troubleshooting

### Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server
```

### WebRTC Not Connecting
- Check STUN/TURN server configuration
- Verify firewall allows WebRTC ports
- Check browser console for errors

### High Memory Usage
- Adjust Bull queue retention settings
- Increase Redis max memory
- Enable result removal in Bull options

## 📈 Monitoring

### Key Metrics to Monitor

1. **API Response Times**
2. **Queue Processing Time**
3. **Cache Hit Rate**
4. **WebSocket Connection Count**
5. **Failed Authentication Attempts**
6. **Error Rates**

### Logging

Winston logs are saved to:
- `logs/error.log` - Error level logs
- `logs/combined.log` - All logs

## 🚀 Deployment

### Docker Setup (Optional)

```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

EXPOSE 3000
CMD ["node", "backend/server.js"]
```

### Environment-specific Configs

- **Development**: Verbose logging, CORS relaxed
- **Production**: Minimal logging, strict CORS, HTTPS only

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow security best practices and include tests.

---

**Built with ❤️ for EduBridge Connect**
