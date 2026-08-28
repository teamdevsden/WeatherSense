const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const { seedDatabase, CITIES_DATA } = require('./data/seed');
const WeatherEvent = require('./models/WeatherEvent');

// Route imports
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const reportsRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Broadcast Real-time Weather Events every 8 seconds
const EVENT_TYPES = ['rainfall', 'flooding', 'heatwave', 'thunderstorm', 'fog', 'dust_storm', 'strong_winds'];
const SOURCES = ['twitter', 'imd_api', 'openweather', 'citizen'];
const STATUSES = ['verified', 'verified', 'pending', 'verified'];

const TITLES_MAP = {
  rainfall: ['Sudden Intense Monsoon Downpour in {city}', 'Heavy Rainfall Activity Logged at {city} Observatory', 'Continuous Precipitation Alert: {city}'],
  flooding: ['Waterlogging Reported in Arterial Roads of {city}', 'High Drainage Surge Alert across {city} Lower Sectors'],
  heatwave: ['Max Temperature Exceeds Normal by 4.8°C in {city}', 'Intense Heat Wave Advisory Active for {city}'],
  thunderstorm: ['Active Lightning Storm & Gusty Winds in {city}', 'Doppler Radar Tracks Squall Band over {city}'],
  fog: ['Dense Radiation Fog Covering {city} Outskirts', 'Visibility Alert: Below 100m in {city}'],
  dust_storm: ['Surface Dust Storm Winds Sweeping across {city}'],
  strong_winds: ['High-Velocity Squall Recorded along {city} Sector'],
};

setInterval(async () => {
  try {
    const cityObj = CITIES_DATA[Math.floor(Math.random() * CITIES_DATA.length)];
    const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];

    const titleTemplates = TITLES_MAP[eventType] || TITLES_MAP.rainfall;
    const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)].replace('{city}', cityObj.city);

    const latJitter = (Math.random() - 0.5) * 0.05;
    const lngJitter = (Math.random() - 0.5) * 0.05;

    const isFake = status === 'fake';
    const mlConfidenceScore = isFake
      ? Number((0.15 + Math.random() * 0.2).toFixed(2))
      : Number((0.78 + Math.random() * 0.2).toFixed(2));

    const newLiveEvent = await WeatherEvent.create({
      source,
      title,
      description: `Automated live sensor ingestion: ${eventType} pattern confirmed over ${cityObj.city}, ${cityObj.state} by ${source.toUpperCase()}.`,
      eventType,
      city: cityObj.city,
      state: cityObj.state,
      location: {
        type: 'Point',
        coordinates: [Number((cityObj.lng + lngJitter).toFixed(5)), Number((cityObj.lat + latJitter).toFixed(5))],
      },
      timestamp: new Date(),
      hashtags: ['#WeatherAlert', `#${cityObj.city}Weather`, `#${eventType}`, '#IMD'],
      mediaUrls: ['https://images.unsplash.com/photo-1514632595-4944383f2737?w=600&auto=format&fit=crop&q=80'],
      verificationStatus: status,
      mlConfidenceScore,
      isFake,
    });

    // 1. Emit live event to all connected sockets
    io.emit('new_weather_event', newLiveEvent);

    // 2. Emit updated stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total, today, verified, fake, pending] = await Promise.all([
      WeatherEvent.countDocuments({}),
      WeatherEvent.countDocuments({ timestamp: { $gte: todayStart } }),
      WeatherEvent.countDocuments({ verificationStatus: 'verified' }),
      WeatherEvent.countDocuments({ verificationStatus: 'fake' }),
      WeatherEvent.countDocuments({ verificationStatus: 'pending' }),
    ]);

    io.emit('stats_update', {
      total,
      today: today || 24,
      verified,
      fake,
      pending,
      timestamp: new Date(),
    });
  } catch (err) {
    // Non-blocking background streamer error
    // console.error('Streamer error:', err.message);
  }
}, 8000);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'WeatherSense India — National Weather Big Data Analytics Platform',
    ministry: 'Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)',
    timestamp: new Date(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
  });
});

app.get('/', (req, res) => {
  res.send('WeatherSense India Backend API Server is Active.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start Server & Connect Database
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/weathersense';

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB database successfully.');
    // Check and auto-seed if required
    await seedDatabase(false);
    server.listen(PORT, () => {
      console.log(`🚀 WeatherSense Backend server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.io live stream active on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('Starting server in fallback standalone mode...');
    server.listen(PORT, () => {
      console.log(`🚀 WeatherSense Backend server running on http://localhost:${PORT} (fallback mode)`);
    });
  });
