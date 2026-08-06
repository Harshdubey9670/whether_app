import express from 'express';
import { createJournalEntry, getJournalEntries } from '../controllers/journalController.js';
import { protect, requireGuestOrAuth } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.array('photos', 5), createJournalEntry)
  .get(requireGuestOrAuth, getJournalEntries);

export default router;
