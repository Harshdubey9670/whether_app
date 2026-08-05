import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', process.env.CLIENT_URL].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', process.env.CLIENT_URL].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
import authRoutes from './src/routes/authRoutes.js';
import weatherRoutes from './src/routes/weatherRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import communityRoutes from './src/routes/communityRoutes.js';
import journalRoutes from './src/routes/journalRoutes.js';

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'WeatherVerse AI API is running' });
});

// Import and use routes here
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/journal', journalRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
