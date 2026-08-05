import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  subscribePush,
  updatePreferences,
  triggerTestNotification,
  getVapidPublicKey,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', protect, subscribePush);
router.put('/preferences', protect, updatePreferences);
router.post('/test', protect, triggerTestNotification);

export default router;
