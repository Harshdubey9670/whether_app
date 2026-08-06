import express from 'express';
import { askAI } from '../controllers/aiController.js';
import { requireGuestOrAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/ask', requireGuestOrAuth, askAI);

export default router;
