const mongoose = require('mongoose');

const weatherEventSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['twitter', 'imd_api', 'openweather', 'citizen', 'news_web', 'public_dataset'],
      required: true,
      default: 'imd_api',
    },
    sourceName: {
      type: String,
      default: 'IMD AWS & Radar Doppler',
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    eventType: {
      type: String,
      enum: [
        'rainfall',
        'flooding',
        'heatwave',
        'thunderstorm',
        'fog',
        'dust_storm',
        'strong_winds',
        'other',
      ],
      required: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    hashtags: {
      type: [String],
      default: [],
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'radar', 'text_only'],
      default: 'image',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'fake', 'misleading', 'needs_review'],
      default: 'pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    mlConfidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.85,
    },
    verificationFactors: {
      sourceReliability: { type: Number, default: 85 },
      locationConsistency: { type: Number, default: 90 },
      weatherConsistency: { type: Number, default: 85 },
      contentAnalysis: { type: Number, default: 88 },
      duplicateSimilarity: { type: Number, default: 80 },
    },
    isFake: {
      type: Boolean,
      default: false,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeatherEvent',
      default: null,
    },
    duplicateGroupId: {
      type: String,
      default: null,
    },
    similarityScore: {
      type: Number,
      default: 0,
    },
    reportCount: {
      type: Number,
      default: 1,
    },
    associatedReports: [
      {
        reportId: String,
        source: String,
        text: String,
        timestamp: { type: Date, default: Date.now },
        reporterName: String,
      },
    ],
    processingTimeline: [
      {
        step: String,
        timestamp: { type: Date, default: Date.now },
        details: String,
      },
    ],
    processingStatus: {
      type: String,
      enum: ['raw', 'processing', 'processed', 'flagged'],
      default: 'processed',
    },
    ingestionTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for geo queries, search and fast filtering
weatherEventSchema.index({ 'location.coordinates': '2dsphere' });
weatherEventSchema.index({ eventType: 1, state: 1, verificationStatus: 1, timestamp: -1 });
weatherEventSchema.index({ source: 1, isDuplicate: 1, duplicateGroupId: 1 });

module.exports = mongoose.model('WeatherEvent', weatherEventSchema);
