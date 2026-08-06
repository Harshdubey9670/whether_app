import mongoose from 'mongoose';

const weatherJournalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    location: {
      name: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    weather: {
      temperature: { type: Number },
      condition: { type: String },
      icon: { type: String },
    },
    mood: {
      type: String,
      enum: ['Excellent', 'Good', 'Neutral', 'Bad', 'Terrible'],
      default: 'Good',
    },
    activities: [{ type: String }],
    notes: {
      type: String,
    },
    photos: [{ type: String }], // Cloudinary URLs
  },
  {
    timestamps: true,
  }
);

const WeatherJournal = mongoose.model('WeatherJournal', weatherJournalSchema);

export default WeatherJournal;
