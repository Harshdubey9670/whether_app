import express from 'express';
import { getCurrentWeather, searchLocation } from '../controllers/weatherController.js';

const router = express.Router();

router.get('/current', getCurrentWeather);
router.get('/search', searchLocation);

export default router;
