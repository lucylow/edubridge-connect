const Queue = require('bull');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Initialize Bull queue with Redis
const notificationQueue = new Queue('notifications', process.env.REDIS_URL || 'redis://localhost:6379', {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

/**
 * Process notification jobs
 */
notificationQueue.process(async (job) => {
  const { type, recipient, data } = job.data;
  console.log(`Processing notification: ${type} for ${recipient.email || recipient.id}`);

  try {
    switch (type) {
      case 'session_booked':
        await sendSessionBookedNotification(recipient, data);
        break;

      case 'session_reminder':
        await sendSessionReminderNotification(recipient, data);
        break;

      case 'session_cancelled':
        await sendSessionCancelledNotification(recipient, data);
        break;

      case 'session_completed':
        await sendSessionCompletedNotification(recipient, data);
        break;

      case 'review_received':
        await sendReviewReceivedNotification(recipient, data);
        break;

      case 'message_received':
        await sendMessageNotification(recipient, data);
        break;

      default:
        console.warn(`Unknown notification type: ${type}`);
    }

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: recipient.id,
        type,
        title: getNotificationTitle(type),
        message: getNotificationMessage(type, data),
        data: JSON.stringify(data),
        isRead: false,
      },
    });

    console.log(`Notification processed successfully: ${type}`);
  } catch (error) {
    console.error(`Failed to process notification: ${type}`, error);
    throw error; // This will trigger retry
  }
});

/**
 * Send session booked notification
 */
async function sendSessionBookedNotification(recipient, data) {
  const { sessionId, learnerName, time, subject } = data;

  // In production, integrate with email service (SendGrid, AWS SES, etc.)
  console.log(`📧 Email to ${recipient.email}:`);
  console.log(`Subject: New Session Booked`);
  console.log(`Body: ${learnerName} has booked a session with you for ${subject} at ${new Date(time).toLocaleString()}`);

  // Could also send push notification via Firebase Cloud Messaging, etc.
}

/**
 * Send session reminder notification
 */
async function sendSessionReminderNotification(recipient, data) {
  const { sessionId, otherPartyName, time } = data;

  console.log(`📧 Email to ${recipient.email}:`);
  console.log(`Subject: Session Reminder`);
  console.log(`Body: Your session with ${otherPartyName} starts in 15 minutes at ${new Date(time).toLocaleString()}`);
}

/**
 * Send session cancelled notification
 */
async function sendSessionCancelledNotification(recipient, data) {
  const { sessionId, cancelledBy, time } = data;

  console.log(`📧 Email to ${recipient.email}:`);
  console.log(`Subject: Session Cancelled`);
  console.log(`Body: Your session scheduled for ${new Date(time).toLocaleString()} has been cancelled by ${cancelledBy}`);
}

/**
 * Send session completed notification
 */
async function sendSessionCompletedNotification(recipient, data) {
  const { sessionId, otherPartyName } = data;

  console.log(`📧 Email to ${recipient.email}:`);
  console.log(`Subject: Session Completed - Leave a Review`);
  console.log(`Body: Your session with ${otherPartyName} is complete. Please take a moment to leave a review!`);
}

/**
 * Send review received notification
 */
async function sendReviewReceivedNotification(recipient, data) {
  const { reviewerName, rating, comment } = data;

  console.log(`📧 Email to ${recipient.email}:`);
  console.log(`Subject: New Review Received`);
  console.log(`Body: ${reviewerName} left you a ${rating}-star review: "${comment}"`);
}

/**
 * Send message notification (when user is offline)
 */
async function sendMessageNotification(recipient, data) {
  const { senderName, message, sessionId } = data;

  console.log(`📧 Email to ${recipient.email}:`);
  console.log(`Subject: New Message from ${senderName}`);
  console.log(`Body: ${senderName} sent you a message: "${message}"`);
}

/**
 * Get notification title based on type
 */
function getNotificationTitle(type) {
  const titles = {
    session_booked: 'New Session Booked',
    session_reminder: 'Session Reminder',
    session_cancelled: 'Session Cancelled',
    session_completed: 'Session Completed',
    review_received: 'New Review',
    message_received: 'New Message',
  };
  return titles[type] || 'Notification';
}

/**
 * Get notification message based on type
 */
function getNotificationMessage(type, data) {
  switch (type) {
    case 'session_booked':
      return `${data.learnerName} has booked a session with you`;
    case 'session_reminder':
      return `Your session starts in 15 minutes`;
    case 'session_cancelled':
      return `Your session has been cancelled`;
    case 'session_completed':
      return `Your session is complete. Leave a review!`;
    case 'review_received':
      return `You received a ${data.rating}-star review`;
    case 'message_received':
      return `New message from ${data.senderName}`;
    default:
      return 'You have a new notification';
  }
}

/**
 * Event listeners for queue events
 */
notificationQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

notificationQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} has stalled`);
});

/**
 * Add a notification to the queue
 */
const addNotification = async (type, recipient, data) => {
  try {
    const job = await notificationQueue.add(
      { type, recipient, data },
      {
        priority: getPriority(type),
        delay: getDelay(type),
      }
    );
    console.log(`Notification job ${job.id} added to queue`);
    return job;
  } catch (error) {
    console.error('Failed to add notification to queue:', error);
    throw error;
  }
};

/**
 * Get priority based on notification type
 */
function getPriority(type) {
  const priorities = {
    session_reminder: 1, // Highest priority
    session_cancelled: 2,
    message_received: 3,
    session_booked: 4,
    session_completed: 5,
    review_received: 6,
  };
  return priorities[type] || 10;
}

/**
 * Get delay based on notification type (in milliseconds)
 */
function getDelay(type) {
  // Session reminders should be sent 15 minutes before
  // Others can be sent immediately
  return 0;
}

/**
 * Schedule session reminder
 */
const scheduleSessionReminder = async (session) => {
  const reminderTime = new Date(session.scheduledStart);
  reminderTime.setMinutes(reminderTime.getMinutes() - 15);

  const delay = reminderTime.getTime() - Date.now();

  if (delay > 0) {
    // Add job for tutor
    await notificationQueue.add(
      {
        type: 'session_reminder',
        recipient: { id: session.tutorId, email: session.tutor.email },
        data: {
          sessionId: session.id,
          otherPartyName: session.learner.name,
          time: session.scheduledStart,
        },
      },
      { delay }
    );

    // Add job for learner
    await notificationQueue.add(
      {
        type: 'session_reminder',
        recipient: { id: session.learnerId, email: session.learner.email },
        data: {
          sessionId: session.id,
          otherPartyName: session.tutor.name,
          time: session.scheduledStart,
        },
      },
      { delay }
    );

    console.log(`Session reminders scheduled for session ${session.id}`);
  }
};

module.exports = {
  notificationQueue,
  addNotification,
  scheduleSessionReminder,
};
