/**
 * Database Seed Script for WeatherVerse AI
 * Run with: node seed.js
 * This seeds demo users, community reports, and journal entries.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// ── Models (inline schemas to avoid import issues) ──────────────────────────

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });

const weatherReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { name: String, lat: Number, lng: Number },
  reportType: { type: String, enum: ['Rain', 'Flood', 'Fog', 'Storm', 'Snow', 'Traffic', 'Wildfire', 'Clear'] },
  description: String,
  media: [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

const journalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  location: { name: String, lat: Number, lng: Number },
  weather: { temperature: Number, condition: String },
  mood: { type: String, enum: ['Excellent', 'Good', 'Neutral', 'Bad', 'Terrible'], default: 'Good' },
  activities: [{ type: String }],
  notes: String,
  photos: [{ type: String }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const WeatherReport = mongoose.model('WeatherReport', weatherReportSchema);
const Journal = mongoose.model('WeatherJournal', journalSchema);

// ── Seed Data ────────────────────────────────────────────────────────────────

const seedUsers = [
  { name: 'Alex Storm', email: 'alex@weatherverse.ai', password: 'demo1234', role: 'admin', avatar: 'https://i.pravatar.cc/150?img=1', isVerified: true },
  { name: 'Maya Raindrop', email: 'maya@weatherverse.ai', password: 'demo1234', role: 'user', avatar: 'https://i.pravatar.cc/150?img=47', isVerified: true },
  { name: 'Carlos Viento', email: 'carlos@weatherverse.ai', password: 'demo1234', role: 'user', avatar: 'https://i.pravatar.cc/150?img=12', isVerified: true },
  { name: 'Priya Sunshin', email: 'priya@weatherverse.ai', password: 'demo1234', role: 'user', avatar: 'https://i.pravatar.cc/150?img=45', isVerified: true },
  { name: 'James Cloudy', email: 'james@weatherverse.ai', password: 'demo1234', role: 'user', avatar: 'https://i.pravatar.cc/150?img=33', isVerified: true },
];

const communityReportTemplates = [
  { reportType: 'Rain', description: '🌧️ Heavy rain started about 20 min ago near the highway. Roads are slippery — drive carefully! Visibility is quite low. Stay safe everyone.', location: { name: 'Mumbai, IN', lat: 19.076, lng: 72.877 } },
  { reportType: 'Storm', description: '⚡ Massive thunderstorm rolling in from the west. Lightning every few seconds! Hail the size of marbles is falling in the downtown area. Seek shelter immediately!', location: { name: 'Chicago, US', lat: 41.878, lng: -87.629 } },
  { reportType: 'Fog', description: '🌫️ Dense fog advisory. Visibility under 200m on the main expressway. Multiple cars pulled over. Please use fog lights and slow down.', location: { name: 'London, UK', lat: 51.507, lng: -0.127 } },
  { reportType: 'Clear', description: '☀️ Beautiful sunny day here! Temperature is 26°C with a slight breeze. Perfect weather for outdoor activities. The sky is crystal clear.', location: { name: 'Sydney, AU', lat: -33.868, lng: 151.209 } },
  { reportType: 'Snow', description: '❄️ It\'s snowing heavily in the mountain areas. About 10cm accumulation already. Roads are closed. Ski resorts are thrilled!', location: { name: 'Denver, US', lat: 39.739, lng: -104.984 } },
  { reportType: 'Flood', description: '🌊 Water levels rising quickly near the river banks. Street flooding reported in lower parts of town. Local authorities are on scene. Stay away from low areas!', location: { name: 'Bangkok, TH', lat: 13.756, lng: 100.501 } },
  { reportType: 'Rain', description: '🌦️ Light drizzle all morning, perfect tea weather! Temperature has dropped about 5 degrees since yesterday. Bring an umbrella if you\'re heading out.', location: { name: 'New Delhi, IN', lat: 28.613, lng: 77.209 } },
  { reportType: 'Wildfire', description: '🔥 Smoke visible from the hills to the north. Strong winds are pushing it towards the residential area. Authorities have issued an evacuation advisory. Stay alert!', location: { name: 'Los Angeles, US', lat: 34.052, lng: -118.243 } },
];

const moodOptions = ['Excellent', 'Good', 'Neutral', 'Bad', 'Terrible'];
const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Foggy', 'Partly Cloudy'];
const journalNotes = [
  'Took a long walk in the rain today. Surprisingly refreshing!',
  'The weather was perfect for reading outside. Had coffee on the porch.',
  'Storm kept me inside all day. Good for productivity though.',
  'Couldn\'t go out today because of the fog. Was very eerie outside.',
  'Beautiful sunny morning! Went for a jog in the park.',
  'Cold and windy but cozy indoors. Made some hot soup.',
  'First snow of the season! Kids were ecstatic playing in the yard.',
];

// ── Seed Function ────────────────────────────────────────────────────────────

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await WeatherReport.deleteMany({});
    await Journal.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users with hashed passwords
    const createdUsers = [];
    for (const u of seedUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(u.password, salt);
      const user = await User.create({ ...u, password: hashed });
      createdUsers.push(user);
    }
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create community reports
    const reportPromises = communityReportTemplates.map((template, i) => {
      const userIndex = i % createdUsers.length;
      const secondUser = createdUsers[(i + 1) % createdUsers.length];
      return WeatherReport.create({
        ...template,
        user: createdUsers[userIndex]._id,
        likes: [secondUser._id],
        comments: [
          {
            user: secondUser._id,
            text: ['Stay safe!', 'Thanks for the update!', 'Crazy weather!', 'Same here!', 'Appreciate the heads up!'][i % 5],
          }
        ],
        createdAt: new Date(Date.now() - (i * 3600000)), // Stagger creation times
      });
    });
    await Promise.all(reportPromises);
    console.log(`📋 Created ${communityReportTemplates.length} community reports`);

    // Create journal entries for first 3 users
    const journalPromises = [];
    for (let u = 0; u < 3; u++) {
      for (let j = 0; j < 5; j++) {
        journalPromises.push(Journal.create({
          user: createdUsers[u]._id,
          location: { name: ['Mumbai', 'New York', 'London', 'Tokyo', 'Sydney'][j % 5] },
          weather: {
            temperature: Math.round(15 + Math.random() * 20),
            condition: conditions[j % conditions.length],
          },
          mood: moodOptions[(u + j) % moodOptions.length],
          activities: [['Jogging', 'Reading', 'Working', 'Hiking', 'Cooking'][j % 5]],
          notes: journalNotes[(u + j) % journalNotes.length],
          date: new Date(Date.now() - (j * 86400000)),
        }));
      }
    }
    await Promise.all(journalPromises);
    console.log(`📖 Created ${journalPromises.length} journal entries`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📧 Demo Login Accounts:');
    console.log('──────────────────────────────────');
    for (const u of seedUsers) {
      console.log(`  [${u.role.toUpperCase().padEnd(5)}] ${u.email} / demo1234`);
    }
    console.log('──────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
