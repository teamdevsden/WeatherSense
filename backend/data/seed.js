const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const WeatherEvent = require('../models/WeatherEvent');
const CitizenReport = require('../models/CitizenReport');

dotenv.config();

const CITIES_DATA = [
  { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { city: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  { city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
  { city: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { city: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lng: 74.7973 },
  { city: 'Chandigarh', state: 'Punjab', lat: 30.7333, lng: 76.7794 },
  { city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
  { city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  { city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  { city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
  { city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
  { city: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
  { city: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lng: 75.3433 },
];

const EVENT_TEMPLATES = {
  rainfall: {
    titles: [
      'Heavy Downpour Recorded in {city}',
      'Monsoon Inundation across {city} Suburbs',
      'Persistent Intense Rains Observed in {city}',
      'IMD Issues Red Alert: Torrential Precipitation in {city}',
    ],
    descriptions: [
      'Continuous rainfall exceeding 115mm recorded within 6 hours. Stormwater drainage operating at maximum capacity across low-lying sectors.',
      'Localized water accumulation reported along major arterial roadways. Public transit advisory issued by municipal authorities.',
      'Active monsoon depression bringing widespread precipitation and gusty localized winds throughout the district.',
    ],
    hashtags: ['#IMD', '#HeavyRain', '#MumbaiRains', '#WeatherUpdate', '#Monsoon2026'],
  },
  flooding: {
    titles: [
      'Urban Flood Inundation Warning in {city}',
      'River Level Surges Past Danger Mark near {city}',
      'Flash Flood Alert in Low-Lying Zones of {city}',
    ],
    descriptions: [
      'Severe waterlogging reaching 3 to 4 feet in arterial intersections. NDRF and SDRF rescue battalions deployed for preventive evacuation.',
      'Discharge from upstream reservoirs has elevated river levels. Emergency helpline operational; citizens advised to remain indoors.',
    ],
    hashtags: ['#FloodAlert', '#IMDAlert', '#RescueOps', '#HeavyRain', '#DisasterManagement'],
  },
  heatwave: {
    titles: [
      'Severe Heatwave Warning for {city} Region',
      'Mercury Hits 45.8°C in {city}',
      'Orange Alert: Extreme Day Temperatures in {city}',
    ],
    descriptions: [
      'Daytime maximum temperatures recorded 5.2°C above seasonal normal. Severe thermal stress conditions expected during peak afternoon hours.',
      'Dry continental westerly winds driving heatwave conditions across the district. Advisory issued for outdoor workers and vulnerable groups.',
    ],
    hashtags: ['#Heatwave', '#IMD', '#SummerHeat', '#WeatherUpdate', '#HealthAdvisory'],
  },
  thunderstorm: {
    titles: [
      'Squall and Lightning Storm Active over {city}',
      'Severe Thunderstorm with Hail Reported in {city}',
      'Nowcast Alert: Squally Winds and Lightning in {city}',
    ],
    descriptions: [
      'Convective storm cell generating lightning strikes and wind gusts up to 65 km/h. Multiple tree fall and temporary power disruption reports received.',
      'Doppler radar indicates intense cumulonimbus cloud band traversing the urban center. Outdoor activities suspended.',
    ],
    hashtags: ['#Thunderstorm', '#LightningAlert', '#IMD', '#WeatherWarning'],
  },
  fog: {
    titles: [
      'Dense Fog Shrouds {city} — Visibility Below 50m',
      'Dense Radiation Fog Disrupts Morning Commute in {city}',
      'Airport Operations Slowed due to Zero-Visibility Fog in {city}',
    ],
    descriptions: [
      'Surface visibility plummeted to under 50 meters in peripheral regions. CAT III Instrument Landing System engaged for aviation safety.',
      'Dense fog layer lingering into late morning hours due to high relative humidity and calm surface winds.',
    ],
    hashtags: ['#FogAlert', '#DenseFog', '#IMD', '#WinterWeather'],
  },
  dust_storm: {
    titles: [
      'High-Velocity Dust Storm Sweeps {city}',
      'Sudden Visibility Reduction in {city} due to Dust Gale',
    ],
    descriptions: [
      'Strong north-westerly gale winds carrying dense suspended particulate matter. Horizontal visibility reduced sharply to 300 meters.',
    ],
    hashtags: ['#DustStorm', '#IMDAlert', '#AirQuality', '#WeatherWarning'],
  },
  strong_winds: {
    titles: [
      'Gale-Force Coastal Winds Reported in {city}',
      'High Wind Advisory in Effect across {city}',
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
    // 30% rainfall (18)
    'rainfall', 'rainfall', 'rainfall', 'rainfall', 'rainfall', 'rainfall',
    'rainfall', 'rainfall', 'rainfall', 'rainfall', 'rainfall', 'rainfall',
    'rainfall', 'rainfall', 'rainfall', 'rainfall', 'rainfall', 'rainfall',
    // 20% flooding (12)
    'flooding', 'flooding', 'flooding', 'flooding', 'flooding', 'flooding',
    'flooding', 'flooding', 'flooding', 'flooding', 'flooding', 'flooding',
    // 15% heatwave (9)
    'heatwave', 'heatwave', 'heatwave', 'heatwave', 'heatwave', 'heatwave',
    'heatwave', 'heatwave', 'heatwave',
    // 15% thunderstorm (9)
    'thunderstorm', 'thunderstorm', 'thunderstorm', 'thunderstorm', 'thunderstorm', 'thunderstorm',
    'thunderstorm', 'thunderstorm', 'thunderstorm',
    // 10% fog (6)
    'fog', 'fog', 'fog', 'fog', 'fog', 'fog',
    // 5% dust_storm (3)
    'dust_storm', 'dust_storm', 'dust_storm',
    // 5% strong_winds (3)
    'strong_winds', 'strong_winds', 'strong_winds',
  ];

  const sourcesPool = [
    'twitter', 'twitter', 'twitter', 'twitter', // 40%
    'imd_api', 'imd_api', 'imd_api',           // 30%
    'openweather', 'openweather',               // 20%
    'citizen',                                  // 10%
  ];

  const statusPool = [
    'verified', 'verified', 'verified', 'verified', 'verified', // 50%
    'pending', 'pending',                                      // 20%
    'fake',                                                    // 10%
    'pending', 'verified',                                     // remaining balance (new/verified)
  ];

  for (let i = 0; i < 60; i++) {
    const cityData = CITIES_DATA[i % CITIES_DATA.length];
    const eventType = eventTypesPool[i % eventTypesPool.length];
    const source = sourcesPool[i % sourcesPool.length];
    const status = statusPool[i % statusPool.length];
    const template = EVENT_TEMPLATES[eventType] || EVENT_TEMPLATES.rainfall;

    const rawTitle = getRandomItem(template.titles);
    const title = rawTitle.replace('{city}', cityData.city);
    const description = getRandomItem(template.descriptions);
    const hashtags = [...template.hashtags];

    // Jitter coordinates slightly around the city center
    const latJitter = (Math.random() - 0.5) * 0.08;
    const lngJitter = (Math.random() - 0.5) * 0.08;

    // Timestamps distributed over past 7 days, with several within today
    const hoursAgo = Math.floor(Math.random() * (i < 15 ? 12 : 160));
    const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000 - Math.random() * 60 * 1000);

    const isFake = status === 'fake';
    const mlConfidenceScore = isFake
      ? getRandomFloat(0.12, 0.39)
      : status === 'verified'
      ? getRandomFloat(0.78, 0.99)
      : getRandomFloat(0.50, 0.77);

    events.push({
      source,
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
        `https://images.unsplash.com/photo-1514632595-4944383f2737?w=600&auto=format&fit=crop&q=80`,
      ],
      verificationStatus: status,
      verifiedBy: status === 'verified' ? adminUserId : null,
      mlConfidenceScore,
      isFake,
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

    if (!isForce && eventCount >= 40 && userCount >= 2) {
      console.log(`Database already populated (${eventCount} events, ${userCount} users). Skipping seed.`);
      return;
    }

    console.log('Clearing old records and seeding fresh data...');
    await User.deleteMany({});
    await WeatherEvent.deleteMany({});
    await CitizenReport.deleteMany({});

    // Seed default users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const citizenPassword = await bcrypt.hash('citizen123', salt);

    const adminUser = await User.create({
      name: 'IMD Admin',
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

    // Seed 60 weather events
    const mockEvents = generateMockEvents(adminUser._id);
    const insertedEvents = await WeatherEvent.insertMany(mockEvents);
    console.log(`Successfully seeded ${insertedEvents.length} weather events across 25 Indian cities.`);

    // Seed some initial citizen reports
    const citizenReports = [
      {
        reporterName: 'Aarav Sharma',
        reporterPhone: '+91 98200 11223',
        reporterId: citizenUser._id,
        city: 'Mumbai',
        state: 'Maharashtra',
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        eventType: 'rainfall',
        description: 'Severe waterlogging near Hindmata cinema flyover. Traffic moving at a crawl.',
        photoUrl: 'https://images.unsplash.com/photo-1514632595-4944383f2737?w=600&auto=format&fit=crop&q=80',
        eventTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        verificationStatus: 'verified',
      },
      {
        reporterName: 'Pooja Nair',
        reporterPhone: '+91 94470 55443',
        reporterId: citizenUser._id,
        city: 'Kochi',
        state: 'Kerala',
        location: { type: 'Point', coordinates: [76.2673, 9.9312] },
        eventType: 'flooding',
        description: 'Canal overflow along Marine Drive following 3 hours of continuous torrential rain.',
        photoUrl: 'https://images.unsplash.com/photo-1545048702-79360700129e?w=600&auto=format&fit=crop&q=80',
        eventTimestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        verificationStatus: 'pending',
      },
      {
        reporterName: 'Vikram Singh',
        reporterPhone: '+91 98110 33221',
        reporterId: citizenUser._id,
        city: 'Delhi',
        state: 'Delhi',
        location: { type: 'Point', coordinates: [77.1025, 28.7041] },
        eventType: 'fog',
        description: 'Dense morning fog on DND flyway; visibility dropped below 30 meters.',
        photoUrl: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=600&auto=format&fit=crop&q=80',
        eventTimestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
        verificationStatus: 'verified',
      },
    ];

    await CitizenReport.insertMany(citizenReports);
    console.log(`Seeded ${citizenReports.length} initial citizen reports.`);
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
