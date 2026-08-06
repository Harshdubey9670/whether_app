import express from 'express';
import apicache from 'apicache';
import { getCurrentWeather, searchLocation } from '../controllers/weatherController.js';

const router = express.Router();
const cache = apicache.middleware;

// Cache successful responses for 5 minutes
router.get('/current', cache('5 minutes'), getCurrentWeather);
router.get('/search', cache('5 minutes'), searchLocation);

export default router;
