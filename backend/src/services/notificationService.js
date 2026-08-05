import webpush from 'web-push';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Configure Web Push VAPID keys
// Generate these using `./node_modules/.bin/web-push generate-vapid-keys` 
// For now, we will auto-generate them if they are missing in dev.
let VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
let VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  const vapidKeys = webpush.generateVAPIDKeys();
  VAPID_PUBLIC_KEY = vapidKeys.publicKey;
  VAPID_PRIVATE_KEY = vapidKeys.privateKey;
  console.log('--- AUTO GENERATED VAPID KEYS ---');
  console.log('Add these to backend .env and frontend .env');
  console.log(`VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY}`);
  console.log(`VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY}`);
}

webpush.setVapidDetails(
  'mailto:support@weatherverse.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Configure Nodemailer (Mock SMTP for dev)
// Use ethereal.email for testing
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'test@ethereal.email',
    pass: process.env.SMTP_PASS || 'pass123'
  }
});

/**
 * Send a Web Push Notification
 */
export const sendWebPush = async (subscription, payload) => {
  try {
    if (!subscription) return false;
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Error sending web push:', error);
    // If the subscription is expired/invalid, web-push throws an error.
    // In a real app, we might want to catch 410 Gone and delete the sub from DB.
    return false;
  }
};

/**
 * Send an Email Notification
 */
export const sendEmailAlert = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"WeatherVerse Alerts" <alerts@weatherverse.com>',
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
