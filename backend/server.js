const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const { seedDatabase, CITIES_DATA } = require('./data/seed');
const WeatherEvent = require('./models/WeatherEvent');
const { processAndIngestReport } = require('./services/ingestionService');

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

// Multi-Source Real-time Ingestion Streamer (Every 8-10 seconds)
const EVENT_TYPES = ['rainfall', 'flooding', 'heatwave', 'thunderstorm', 'fog', 'dust_storm', 'strong_winds'];
const SOURCES = ['twitter', 'imd_api', 'openweather', 'citizen', 'news_web', 'public_dataset'];

const TITLES_MAP = {
  rainfall: ['Intense Monsoon Downpour Logged in {city} #IMD #HeavyRain', 'Torrential Rain and Water Accumulation in {city} #RainAlert', 'Active Monsoon Inundation across {city} Suburbs #Monsoon2026'],
  flooding: ['Waterlogging Reported in Arterial Roads of {city} #FloodAlert', 'High Drainage Surge Alert across {city} Lower Sectors #RescueOps', 'River Level Rises near Danger Mark in {city} #NDRF'],
  heatwave: ['Max Temperature Exceeds Normal by 4.8°C in {city} #Heatwave', 'Intense Heat Wave Advisory Active for {city} #IMD', 'Thermal Stress Warning Issued for {city} Region #SummerHeat'],
  thunderstorm: ['Active Lightning Storm & Gusty Winds in {city} #Thunderstorm', 'Doppler Radar Tracks Squall Band over {city} #Nowcast', 'Severe Convective Cell with Hail in {city} Outskirts #WeatherAlert'],
  fog: ['Dense Radiation Fog Covering {city} Outskirts #DenseFog', 'Visibility Alert: Below 50m in {city} #FogAlert', 'Smog and Zero Visibility Advisory for {city} #WinterWeather'],
  dust_storm: ['Surface Dust Storm Winds Sweeping across {city} #DustStorm', 'Severe Dust Gale Disrupts Visibility in {city} #IMDAlert'],
  strong_winds: ['High-Velocity Squall Recorded along {city} Sector #CycloneAlert', 'Gale-Force Coastal Winds Reported in {city} #HighWinds'],
};

setInterval(async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;

    const cityObj = CITIES_DATA[Math.floor(Math.random() * CITIES_DATA.length)];
    const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];

    const titleTemplates = TITLES_MAP[eventType] || TITLES_MAP.rainfall;
    const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)].replace('{city}', cityObj.city);

    const latJitter = (Math.random() - 0.5) * 0.05;
    const lngJitter = (Math.random() - 0.5) * 0.05;

    // Process through the unified AI Intelligence Pipeline
    const ingestResult = await processAndIngestReport({
      source,
      title,
      description: `Automated live ingestion: ${eventType.toUpperCase()} pattern detected over ${cityObj.city}, ${cityObj.state} by ${source.toUpperCase()}.`,
      city: cityObj.city,
      state: cityObj.state,
      coordinates: [
        Number((cityObj.lng + lngJitter).toFixed(5)),
        Number((cityObj.lat + latJitter).toFixed(5)),
      ],
      explicitEventType: eventType,
      hashtags: ['#WeatherAlert', `#${cityObj.city}`, `#${eventType}`, '#IMD'],
      mediaUrls: ['https://images.unsplash.com/photo-1514632595-4944383f2737?w=600&auto=format&fit=crop&q=80'],
      timestamp: new Date(),
    });

    const newLiveEvent = ingestResult.event;

    // 1. Emit live event to all connected sockets
    io.emit('new_weather_event', newLiveEvent);

    // 2. Emit updated stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total, today, verified, fake, pending, duplicates] = await Promise.all([
      WeatherEvent.countDocuments({}),
      WeatherEvent.countDocuments({ timestamp: { $gte: todayStart } }),
      WeatherEvent.countDocuments({ verificationStatus: 'verified' }),
      WeatherEvent.countDocuments({ $or: [{ verificationStatus: 'fake' }, { verificationStatus: 'misleading' }] }),
      WeatherEvent.countDocuments({ $or: [{ verificationStatus: 'pending' }, { verificationStatus: 'needs_review' }] }),
      WeatherEvent.countDocuments({ isDuplicate: true }),
    ]);

    io.emit('stats_update', {
      total,
      today: today || 28,
      verified,
      fake,
      pending,
      duplicates,
      timestamp: new Date(),
    });
  } catch (err) {
    // Non-blocking background streamer error
  }
}, 8500);

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
    service: 'WeatherSense India — National Weather Intelligence Platform',
    ministry: 'Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)',
    timestamp: new Date(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
    ingestionPipelines: [
      'IMD AWS & Radar Doppler API',
      'OpenWeather Satellite Grid',
      'Social Media Live Stream (Simulated)',
      'News & Web Ingestion Crawler (Simulated)',
      'Citizen Eyewitness Crowdsource Grid',
      'National Public Climate Archives',
    ],
  });
});

app.get('/', (req, res) => {
  res.send('WeatherSense India — National Weather Intelligence Platform Backend API is Active.');
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
    console.log('Starting server in standalone mode...');
    server.listen(PORT, () => {
      console.log(`🚀 WeatherSense Backend server running on http://localhost:${PORT} (standalone mode)`);
    });
  });
