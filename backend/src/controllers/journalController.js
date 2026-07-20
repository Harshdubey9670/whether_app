import WeatherJournal from '../models/WeatherJournal.js';

// @desc    Create a new journal entry
// @route   POST /api/journal
// @access  Private
const createJournalEntry = async (req, res, next) => {
  try {
    const { location, weather, mood, activities, notes } = req.body;
    
    // Map uploaded files
    const photos = req.files ? req.files.map(file => file.path) : [];
    
    // Parse JSON fields if they are sent as strings
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    const parsedWeather = typeof weather === 'string' ? JSON.parse(weather) : weather;
    const parsedActivities = typeof activities === 'string' ? JSON.parse(activities) : activities;

    const entry = await WeatherJournal.create({
      user: req.user._id,
      location: parsedLocation,
      weather: parsedWeather,
      mood,
      activities: parsedActivities,
      notes,
      photos,
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

// @desc    Get journal entries (all if no auth, user-specific if authenticated)
// @route   GET /api/journal
// @access  Public
const getJournalEntries = async (req, res, next) => {
  try {
    const filter = req.user ? { user: req.user._id } : {};
    const entries = await WeatherJournal.find(filter).sort({ date: -1 }).limit(20);
    res.json(entries);
  } catch (error) {
    next(error);
  }
};

export { createJournalEntry, getJournalEntries };
