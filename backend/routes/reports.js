const express = require('express');
const router = express.Router();
const CitizenReport = require('../models/CitizenReport');
const WeatherEvent = require('../models/WeatherEvent');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// @route   POST /api/reports
// @desc    Submit a new citizen weather report
// @access  Private (Authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const {
      reporterName,
      reporterPhone,
      city,
      state,
      coordinates,
      eventType,
      description,
      photoUrl,
      eventTimestamp,
    } = req.body;

    if (!city || !state || !eventType || !description) {
      return res.status(400).json({
        success: false,
        message: 'City, state, event type, and description are required',
      });
    }

    if (description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 20 characters long to provide sufficient detail.',
      });
    }

    const defaultCoords = [77.2090, 28.6139]; // Default coordinates (New Delhi) if not provided
    const lng = coordinates && Array.isArray(coordinates) && coordinates.length >= 2 ? Number(coordinates[0]) : defaultCoords[0];
    const lat = coordinates && Array.isArray(coordinates) && coordinates.length >= 2 ? Number(coordinates[1]) : defaultCoords[1];

    // Create CitizenReport document
    const report = await CitizenReport.create({
      reporterName: reporterName || req.user.name,
      reporterPhone: reporterPhone || req.user.phone || '',
      reporterId: req.user._id,
      city: city.trim(),
      state: state.trim(),
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      eventType,
      description: description.trim(),
      photoUrl: photoUrl || '',
      eventTimestamp: eventTimestamp ? new Date(eventTimestamp) : new Date(),
      verificationStatus: 'pending',
      submittedAt: new Date(),
    });

    // Also automatically create a WeatherEvent marked with source 'citizen' and status 'pending'
    const weatherEvent = await WeatherEvent.create({
      source: 'citizen',
      title: `Citizen Report: ${eventType.toUpperCase()} in ${city}`,
      description: description.trim(),
      eventType,
      city: city.trim(),
      state: state.trim(),
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      timestamp: eventTimestamp ? new Date(eventTimestamp) : new Date(),
      hashtags: ['#CitizenReport', `#${city.replace(/\s+/g, '')}Weather`, `#${eventType}`],
      mediaUrls: photoUrl ? [photoUrl] : [],
      verificationStatus: 'pending',
      mlConfidenceScore: 0.65,
      isFake: false,
    });

    const reportCode = `WS-${Math.floor(1000 + Math.random() * 9000)}`;

    res.status(201).json({
      success: true,
      message: 'Weather report submitted successfully to IMD National Central Grid.',
      reportId: report._id,
      reportCode,
      report,
      weatherEventId: weatherEvent._id,
    });
  } catch (error) {
    console.error('Error submitting citizen report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit citizen report',
      error: error.message,
    });
  }
});

// @route   GET /api/reports
// @desc    Get all citizen reports (admin review)
// @access  Private (Admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.verificationStatus = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [total, reports] = await Promise.all([
      CitizenReport.countDocuments(filter),
      CitizenReport.find(filter)
        .populate('reporterId', 'name email phone')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      reports,
    });
  } catch (error) {
    console.error('Error fetching citizen reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve citizen reports',
      error: error.message,
    });
  }
});

module.exports = router;
