const express = require('express');
const router = express.Router();
const CitizenReport = require('../models/CitizenReport');
const WeatherEvent = require('../models/WeatherEvent');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { processAndIngestReport } = require('../services/ingestionService');

// @route   POST /api/reports
// @desc    Submit a new citizen weather report with AI verification & duplicate detection
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
      videoUrl,
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

    const reportCode = `WS-${Math.floor(10000 + Math.random() * 90000)}`;

    // Ingest through the unified AI pipeline (Classification + Deduplication + Authenticity Scoring)
    const ingestResult = await processAndIngestReport({
      source: 'citizen',
      title: `Citizen Report: ${eventType.toUpperCase()} in ${city.trim()}`,
      description: description.trim(),
      city: city.trim(),
      state: state.trim(),
      coordinates: [lng, lat],
      explicitEventType: eventType,
      hashtags: ['#CitizenReport', `#${city.replace(/\s+/g, '')}Weather`, `#${eventType}`],
      mediaUrls: photoUrl ? [photoUrl] : [],
      mediaType: videoUrl ? 'video' : photoUrl ? 'image' : 'text_only',
      timestamp: eventTimestamp ? new Date(eventTimestamp) : new Date(),
      reporterName: reporterName || req.user.name,
      reporterPhone: reporterPhone || req.user.phone || '',
      verifiedBy: null,
    });

    const weatherEvent = ingestResult.event;

    // Create CitizenReport document linking to the WeatherEvent
    const report = await CitizenReport.create({
      reportCode,
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
      videoUrl: videoUrl || '',
      weatherEventId: weatherEvent._id,
      aiConfidenceScore: weatherEvent.mlConfidenceScore || 0.75,
      eventTimestamp: eventTimestamp ? new Date(eventTimestamp) : new Date(),
      verificationStatus: weatherEvent.verificationStatus || 'pending',
      submittedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Weather report submitted successfully to IMD National Central Grid.',
      reportId: report._id,
      reportCode,
      report,
      weatherEventId: weatherEvent._id,
      aiEvaluation: {
        authenticityScore: weatherEvent.mlConfidenceScore,
        status: weatherEvent.verificationStatus,
        isDuplicate: weatherEvent.isDuplicate,
      },
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

// @route   GET /api/reports/my-reports
// @desc    Get reports submitted by the logged-in citizen
// @access  Private (Authenticated users)
router.get('/my-reports', auth, async (req, res) => {
  try {
    const reports = await CitizenReport.find({
      $or: [
        { reporterId: req.user._id || req.user.id },
        { reporterName: req.user.name },
      ],
    })
      .populate('weatherEventId', 'mlConfidenceScore verificationStatus verificationFactors isDuplicate title city state')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error('Error fetching citizen my-reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your weather reports',
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
        .populate('weatherEventId', 'mlConfidenceScore verificationStatus isDuplicate')
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
