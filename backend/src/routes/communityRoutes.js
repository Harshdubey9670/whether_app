import express from 'express';
import {
  createReport,
  getReports,
  toggleLikeReport,
  addComment,
} from '../controllers/communityController.js';
import { protect, requireGuestOrAuth } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/reports')
  .post(protect, upload.array('media', 3), createReport) // max 3 files
  .get(requireGuestOrAuth, getReports);

router.post('/reports/:id/like', protect, toggleLikeReport);
router.post('/reports/:id/comments', protect, addComment);

export default router;
