import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { sendWebPush, sendEmailAlert } from '../services/notificationService.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Standard Redis connection for BullMQ
const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null
});

// Initialize Notification Queue
export const notificationQueue = new Queue('notifications', {
  connection: redisConnection
});

// Initialize the Worker to process jobs
const worker = new Worker('notifications', async (job) => {
  const { type, userId, payload } = job.data;
  console.log(`Processing job ${job.id} of type ${type} for user ${userId}`);

  const user = await User.findById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Handle Web Push
  if (user.preferences?.notifications?.pushAlerts && user.pushSubscription) {
    const success = await sendWebPush(user.pushSubscription, payload);
    if (!success) {
      console.log(`Failed to push notification to user ${userId}`);
    }
  }

  // Handle Email Alerts
  if (user.preferences?.notifications?.emailAlerts) {
    await sendEmailAlert(
      user.email,
      payload.title || 'WeatherVerse Alert',
      payload.body || 'You have a new alert from WeatherVerse.'
    );
  }

  return { success: true };
}, {
  connection: redisConnection
});

worker.on('completed', job => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} has failed with ${err.message}`);
});

/**
 * Helper function to schedule a weather alert
 */
export const scheduleAlert = async (userId, title, body, delay = 0) => {
  await notificationQueue.add('alert', {
    type: 'alert',
    userId,
    payload: { title, body }
  }, { delay });
};
