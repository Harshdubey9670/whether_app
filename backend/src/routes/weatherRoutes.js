import express from 'express';
import apicache from 'apicache';
import { getCurrentWeather, searchLocation } from '../controllers/weatherController.js';
import { requireGuestOrAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
const cache = apicache.middleware;

// Cache successful responses for 5 minutes
router.get('/current', requireGuestOrAuth, cache('5 minutes'), getCurrentWeather);
router.get('/search', requireGuestOrAuth, cache('5 minutes'), searchLocation);

export default router;
