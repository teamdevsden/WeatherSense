const mongoose = require('mongoose');

const weatherEventSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['twitter', 'imd_api', 'openweather', 'citizen'],
      required: true,
      default: 'imd_api',
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
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'fake'],
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
    isFake: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for geo queries and search
weatherEventSchema.index({ 'location.coordinates': '2dsphere' });
weatherEventSchema.index({ eventType: 1, state: 1, verificationStatus: 1, timestamp: -1 });

module.exports = mongoose.model('WeatherEvent', weatherEventSchema);
