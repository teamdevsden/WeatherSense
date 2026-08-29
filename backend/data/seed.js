const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const WeatherEvent = require('../models/WeatherEvent');
const CitizenReport = require('../models/CitizenReport');

dotenv.config();

const CITIES_DATA = [
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { city: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
  { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
  { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { city: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243 },
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
  { city: 'Puri', state: 'Odisha', lat: 19.8135, lng: 85.8312 },
  { city: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { city: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lng: 74.7973 },
  { city: 'Chandigarh', state: 'Punjab', lat: 30.7333, lng: 76.7794 },
  { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  { city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366 },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
];

const EVENT_TEMPLATES = {
  rainfall: {
    titles: [
      'Heavy Downpour Recorded in {city} #IMD #HeavyRain #{city}',
      'Monsoon Inundation across {city} Suburbs #WeatherAlert #{city}',
      'Intense Precipitation Logged at {city} Observatory #Monsoon2026',
      'Continuous Rainfall Exceeds 120mm in {city} District #IMD',
    ],
    descriptions: [
      'Torrential monsoon rain logged over past 4 hours. Automated telemetry reports localized water logging and slow transit traffic.',
      'Active monsoon depression bringing widespread precipitation and gusty localized winds throughout the district.',
      'IMD radar confirms continuous rain spell. Drainage lines operating at high capacity across low-lying municipal sectors.',
    ],
    hashtags: ['#IMD', '#HeavyRain', '#Monsoon2026', '#WeatherAlert'],
  },
  flooding: {
    titles: [
      'Severe Waterlogging & Flood Alert in {city} Lower Sectors #FloodAlert #{city}',
      'River Surge Crosses Warning Level near {city} #NDRF #{city}',
      'Urban Inundation Reported across Major Intersections in {city} #RescueOps',
    ],
    descriptions: [
      'Water levels rising 2 to 3 feet in arterial roadways. SDRF battalions deployed for preventive evacuation in low-lying zones.',
      'Heavy discharge from upstream river reservoir has elevated municipal drainage. Citizens advised to avoid underpasses.',
    ],
    hashtags: ['#FloodAlert', '#IMDAlert', '#RescueOps', '#HeavyRain', '#DisasterManagement'],
  },
  heatwave: {
    titles: [
      'Severe Heatwave Advisory: Mercury Touches 45.6°C in {city} #Heatwave #{city}',
      'Extreme Day Temperature Alert for {city} Region #IMD #SummerHeat',
      'Orange Alert: Prolonged Heat Wave Conditions Active in {city}',
    ],
    descriptions: [
      'Daytime maximum temperatures recorded 5.4°C above seasonal normal. Severe thermal stress conditions expected during peak afternoon.',
      'Dry continental westerly winds driving heatwave conditions across the district. Health advisory active for vulnerable groups.',
    ],
    hashtags: ['#Heatwave', '#IMD', '#SummerHeat', '#WeatherUpdate', '#HealthAdvisory'],
  },
  thunderstorm: {
    titles: [
      'Active Lightning Storm & Squall Band over {city} #Thunderstorm #{city}',
      'Doppler Radar Tracks Squall Band over {city} Sector #Nowcast',
      'Severe Thunderstorm with Hail Reported near {city} Outskirts #IMDAlert',
    ],
    descriptions: [
      'Convective storm cell generating intense lightning strikes and wind gusts up to 70 km/h. Outdoor activities suspended.',
      'Doppler radar indicates intense cumulonimbus cloud band traversing the urban center. Power distribution teams on standby.',
    ],
    hashtags: ['#Thunderstorm', '#LightningAlert', '#IMD', '#WeatherWarning'],
  },
  fog: {
    titles: [
      'Dense Radiation Fog Shrouds {city} — Visibility Below 40m #DenseFog #{city}',
      'Airport & Highway Operations Slowed due to Zero Fog in {city} #FogAlert',
      'Dense Morning Smog and Fog Advisory for {city} #WinterWeather',
    ],
    descriptions: [
      'Surface visibility plummeted to under 40 meters in peripheral regions. CAT III Instrument Landing System engaged for airport safety.',
      'Dense fog layer lingering into late morning hours due to high relative humidity and calm surface winds.',
    ],
    hashtags: ['#FogAlert', '#DenseFog', '#IMD', '#WinterWeather'],
  },
  dust_storm: {
    titles: [
      'High-Velocity Dust Storm Sweeping across {city} #DustStorm #{city}',
      'Sudden Visibility Reduction in {city} due to Dense Dust Gale #IMDAlert',
    ],
    descriptions: [
      'Strong north-westerly gale winds carrying dense suspended particulate matter. Horizontal visibility reduced sharply to 300 meters.',
    ],
    hashtags: ['#DustStorm', '#IMDAlert', '#AirQuality', '#WeatherWarning'],
  },
  strong_winds: {
    titles: [
      'Gale-Force Coastal Winds Reported in {city} #CycloneAlert #{city}',
      'High Wind Advisory in Effect across {city} Coastal Corridor #IMD',
    ],
    descriptions: [
      'Deep depression in adjacent maritime basin causing sustained wind speeds of 55-65 km/h with gusts touching 80 km/h along coastlines.',
    ],
    hashtags: ['#CycloneAlert', '#HighWinds', '#IMD', '#CoastalSafety'],
  },
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomFloat = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));

const generateMockEvents = (adminUserId) => {
  const events = [];
  const eventTypesPool = [
    'rainfall', 'rainfall', 'rainfall', 'rainfall', 'rainfall', 'rainfall', 'rainfall', 'rainfall', 'rainfall',
    'flooding', 'flooding', 'flooding', 'flooding', 'flooding', 'flooding',
    'heatwave', 'heatwave', 'heatwave', 'heatwave', 'heatwave',
    'thunderstorm', 'thunderstorm', 'thunderstorm', 'thunderstorm', 'thunderstorm',
    'fog', 'fog', 'fog',
    'dust_storm', 'dust_storm',
    'strong_winds', 'strong_winds',
  ];

  const sourcesPool = [
    'twitter', 'twitter', 'twitter',        // 30% social media
    'imd_api', 'imd_api', 'imd_api',        // 30% official IMD
    'openweather', 'openweather',            // 20% weather API
    'citizen',                              // 10% citizen
    'news_web',                             // 5% news
    'public_dataset',                       // 5% public dataset
  ];

  const statusPool = [
    'verified', 'verified', 'verified', 'verified', 'verified',
    'pending', 'pending',
    'fake',
    'verified', 'pending',
  ];

  for (let i = 0; i < 75; i++) {
    const cityData = CITIES_DATA[i % CITIES_DATA.length];
    const eventType = eventTypesPool[i % eventTypesPool.length];
    const source = sourcesPool[i % sourcesPool.length];
    const status = statusPool[i % statusPool.length];
    const template = EVENT_TEMPLATES[eventType] || EVENT_TEMPLATES.rainfall;

    const rawTitle = getRandomItem(template.titles);
    const title = rawTitle.replace(/{city}/g, cityData.city);
    const description = getRandomItem(template.descriptions);
    const hashtags = [...template.hashtags, `#${cityData.city}`, `#${cityData.state.replace(/\s+/g, '')}`];

    // Jitter coordinates slightly around city center
    const latJitter = (Math.random() - 0.5) * 0.06;
    const lngJitter = (Math.random() - 0.5) * 0.06;

    // Timestamps distributed over past 7 days, with several within today
    const hoursAgo = Math.floor(Math.random() * (i < 20 ? 12 : 160));
    const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000 - Math.random() * 60 * 1000);

    const isFake = status === 'fake';
    const isDuplicate = i >= 65; // Create 10 duplicate clustered events
    const reportCount = isDuplicate ? 1 : Math.floor(Math.random() * 8 + 1);

    const mlConfidenceScore = isFake
      ? getRandomFloat(0.15, 0.38)
      : status === 'verified'
      ? getRandomFloat(0.85, 0.98)
      : getRandomFloat(0.55, 0.79);

    const verificationFactors = isFake
      ? {
          sourceReliability: 25,
          locationConsistency: 40,
          weatherConsistency: 30,
          contentAnalysis: 20,
          duplicateSimilarity: 25,
        }
      : {
          sourceReliability: Math.round(mlConfidenceScore * 100) - 2,
          locationConsistency: 95,
          weatherConsistency: Math.round(mlConfidenceScore * 100) + 1,
          contentAnalysis: 90,
          duplicateSimilarity: reportCount > 2 ? 94 : 80,
        };

    const sourceNameMap = {
      imd_api: 'IMD AWS & Radar Doppler',
      openweather: 'OpenWeather Satellite Grid',
      twitter: 'X / Twitter Weather Stream',
      news_web: 'News & Web Ingestion',
      citizen: 'Citizen Crowdsource Mobile Portal',
      public_dataset: 'National Public Weather Archives',
    };

    const processingTimeline = [
      {
        step: 'Raw Data Ingested',
        timestamp: new Date(timestamp),
        details: `Received via ${sourceNameMap[source] || source}`,
      },
      {
        step: 'NLP Multi-Hazard Classification',
        timestamp: new Date(timestamp.getTime() + 1200),
        details: `Categorized as ${eventType.toUpperCase()} with confidence ${Math.round(mlConfidenceScore * 100)}%`,
      },
      {
        step: isDuplicate ? 'Duplicate Cluster Merged' : 'Deduplication Analysis',
        timestamp: new Date(timestamp.getTime() + 2500),
        details: isDuplicate
          ? `Linked with active incident cluster in ${cityData.city}`
          : `Corroborated across ${reportCount} multi-source eyewitness reports`,
      },
      {
        step: 'AI Authenticity Scoring',
        timestamp: new Date(timestamp.getTime() + 3800),
        details: `Authenticity Score: ${Math.round(mlConfidenceScore * 100)}% (${status.toUpperCase()})`,
      },
    ];

    if (status === 'verified') {
      processingTimeline.push({
        step: 'IMD Officer Verification',
        timestamp: new Date(timestamp.getTime() + 6000),
        details: 'Approved & broadcasted to National Emergency Response Grid',
      });
    }

    events.push({
      source,
      sourceName: sourceNameMap[source] || source,
      title,
      description,
      eventType,
      city: cityData.city,
      state: cityData.state,
      location: {
        type: 'Point',
        coordinates: [Number((cityData.lng + lngJitter).toFixed(5)), Number((cityData.lat + latJitter).toFixed(5))],
      },
      timestamp,
      hashtags,
      mediaUrls: [
        'https://images.unsplash.com/photo-1514632595-4944383f2737?w=600&auto=format&fit=crop&q=80',
      ],
      mediaType: 'image',
      verificationStatus: status,
      verifiedBy: status === 'verified' ? adminUserId : null,
      mlConfidenceScore,
      verificationFactors,
      isFake,
      isDuplicate,
      duplicateGroupId: `WS-GRP-${cityData.city.slice(0, 3).toUpperCase()}-${eventType.slice(0, 3).toUpperCase()}`,
      similarityScore: isDuplicate ? 0.91 : 0,
      reportCount,
      associatedReports: [
        {
          reportId: `REP-${Math.floor(10000 + Math.random() * 90000)}`,
          source,
          text: title,
          timestamp,
          reporterName: source === 'citizen' ? 'Citizen Reporter' : 'Automated Ingestion',
        },
      ],
      processingTimeline,
      processingStatus: 'processed',
      ingestionTimestamp: timestamp,
      createdAt: timestamp,
    });
  }

  return events;
};

const seedDatabase = async (isForce = false) => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weathersense';

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected for seeding.');
    }

    const eventCount = await WeatherEvent.countDocuments();
    const userCount = await User.countDocuments();

    if (!isForce && eventCount >= 50 && userCount >= 2) {
      console.log(`Database already populated (${eventCount} events, ${userCount} users). Skipping seed.`);
      return;
    }

    console.log('Clearing old records and seeding fresh SIH 2026 intelligence dataset...');
    await User.deleteMany({});
    await WeatherEvent.deleteMany({});
    await CitizenReport.deleteMany({});

    // Seed default users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const citizenPassword = await bcrypt.hash('citizen123', salt);

    const adminUser = await User.create({
      name: 'IMD Officer',
      email: 'admin@imd.gov.in',
      password: adminPassword,
      phone: '+91 11 2461 1000',
      role: 'admin',
      isBanned: false,
    });

    const citizenUser = await User.create({
      name: 'Test Citizen',
      email: 'citizen@demo.com',
      password: citizenPassword,
      phone: '+91 98765 43210',
      role: 'citizen',
      isBanned: false,
    });

    console.log('Users seeded:');
    console.log('  Admin: admin@imd.gov.in / admin123');
    console.log('  Citizen: citizen@demo.com / citizen123');

    // Seed 75 weather events across India
    const mockEvents = generateMockEvents(adminUser._id);
    const insertedEvents = await WeatherEvent.insertMany(mockEvents);
    console.log(`Successfully seeded ${insertedEvents.length} weather events across 25 Indian cities with AI verification metadata.`);

    // Seed initial citizen reports
    const citizenReports = [
      {
        reportCode: 'WS-10482',
        reporterName: 'Aarav Sharma',
        reporterPhone: '+91 98200 11223',
        reporterId: citizenUser._id,
        city: 'Mumbai',
        state: 'Maharashtra',
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        eventType: 'rainfall',
        description: 'Severe waterlogging near Hindmata cinema flyover. Traffic moving at a crawl following continuous intense downpour.',
        photoUrl: 'https://images.unsplash.com/photo-1514632595-4944383f2737?w=600&auto=format&fit=crop&q=80',
        weatherEventId: insertedEvents[0]._id,
        aiConfidenceScore: 0.92,
        eventTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        verificationStatus: 'verified',
      },
      {
        reportCode: 'WS-10483',
        reporterName: 'Pooja Nair',
        reporterPhone: '+91 94470 55443',
        reporterId: citizenUser._id,
        city: 'Kochi',
        state: 'Kerala',
        location: { type: 'Point', coordinates: [76.2673, 9.9312] },
        eventType: 'flooding',
        description: 'Canal overflow along Marine Drive following 3 hours of continuous torrential rain. Water entering ground level shops.',
        photoUrl: 'https://images.unsplash.com/photo-1545048702-79360700129e?w=600&auto=format&fit=crop&q=80',
        weatherEventId: insertedEvents[1]._id,
        aiConfidenceScore: 0.88,
        eventTimestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        verificationStatus: 'pending',
      },
      {
        reportCode: 'WS-10484',
        reporterName: 'Vikram Singh',
        reporterPhone: '+91 98110 33221',
        reporterId: citizenUser._id,
        city: 'Delhi',
        state: 'Delhi',
        location: { type: 'Point', coordinates: [77.1025, 28.7041] },
        eventType: 'fog',
        description: 'Dense morning radiation fog on DND flyway; visibility dropped below 30 meters. Vehicles moving with hazard lights.',
        photoUrl: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=600&auto=format&fit=crop&q=80',
        weatherEventId: insertedEvents[2]._id,
        aiConfidenceScore: 0.95,
        eventTimestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
        verificationStatus: 'verified',
      },
    ];

    await CitizenReport.insertMany(citizenReports);
    console.log(`Seeded ${citizenReports.length} initial citizen reports with verification references.`);
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seed:', error);
    throw error;
  }
};

// Run directly if invoked from command line
if (require.main === module) {
  seedDatabase(true)
    .then(() => {
      console.log('Seed CLI execution complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDatabase, CITIES_DATA };
