import mongoose from 'mongoose';

const weatherReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    location: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    reportType: {
      type: String,
      enum: ['Rain', 'Flood', 'Fog', 'Storm', 'Snow', 'Traffic', 'Wildfire', 'Clear'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    media: [
      {
        url: { type: String },
        type: { type: String, enum: ['image', 'video'] },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const WeatherReport = mongoose.model('WeatherReport', weatherReportSchema);

export default WeatherReport;
