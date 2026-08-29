const mongoose = require('mongoose');

const citizenReportSchema = new mongoose.Schema(
  {
    reportCode: {
      type: String,
      default: () => `WS-${Math.floor(10000 + Math.random() * 90000)}`,
      unique: true,
    },
    reporterName: {
      type: String,
      required: [true, 'Reporter name is required'],
      trim: true,
    },
    reporterPhone: {
      type: String,
      default: '',
      trim: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    photoUrl: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    weatherEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeatherEvent',
      default: null,
    },
    aiConfidenceScore: {
      type: Number,
      default: 0.75,
    },
    eventTimestamp: {
      type: Date,
      default: Date.now,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'fake', 'misleading', 'needs_review'],
      default: 'pending',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CitizenReport', citizenReportSchema);
