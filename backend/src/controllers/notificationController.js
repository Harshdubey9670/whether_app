import User from '../models/User.js';
import { scheduleAlert } from '../workers/queueWorker.js';

// @desc    Save Push Subscription
// @route   POST /api/notifications/subscribe
// @access  Private
const subscribePush = async (req, res, next) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription) {
      res.status(400);
      throw new Error('No subscription provided');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.pushSubscription = subscription;
    
    // Automatically enable push alerts if they are saving a subscription
    if (!user.preferences) user.preferences = {};
    if (!user.preferences.notifications) user.preferences.notifications = {};
    user.preferences.notifications.pushAlerts = true;

    await user.save();
    res.json({ message: 'Push subscription saved successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Notification Preferences
// @route   PUT /api/notifications/preferences
// @access  Private
const updatePreferences = async (req, res, next) => {
  try {
    const { notifications } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!user.preferences) user.preferences = {};
    
    user.preferences.notifications = {
      ...user.preferences.notifications,
      ...notifications
    };

    await user.save();
    res.json({ message: 'Preferences updated successfully', notifications: user.preferences.notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger Test Notification
// @route   POST /api/notifications/test
// @access  Private
const triggerTestNotification = async (req, res, next) => {
  try {
    const { type } = req.body; // 'push' or 'email'
    
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Temporarily force the preference to true for the test, 
    // or just assume the queue worker checks it so they must have it on.
    
    await scheduleAlert(
      user._id.toString(),
      'WeatherVerse Test Alert',
      `This is a test ${type} notification from WeatherVerse!`
    );

    res.json({ message: 'Test notification queued successfully. Check your browser/email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get VAPID Public Key
// @route   GET /api/notifications/vapid-public-key
// @access  Public
const getVapidPublicKey = (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

export { subscribePush, updatePreferences, triggerTestNotification, getVapidPublicKey };
