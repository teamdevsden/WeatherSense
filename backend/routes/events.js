const express = require('express');
const router = express.Router();
const WeatherEvent = require('../models/WeatherEvent');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { processAndIngestReport } = require('../services/ingestionService');
const { classifyWeatherText, extractHashtags } = require('../services/classificationService');
const { evaluateEventAuthenticity } = require('../services/verificationService');

// @route   GET /api/events
// @desc    Get weather events with filters, search, and pagination
// @access  Public / Protected
router.get('/', async (req, res) => {
  try {
    const {
      type,
      state,
      status,
      source,
      startDate,
      endDate,
      search,
      includeDuplicates = 'true',
      minConfidence,
      page = 1,
      limit = 20,
      all = false,
    } = req.query;

    const filter = {};

    if (type && type !== 'all') {
      const types = type.split(',').map((t) => t.trim());
      filter.eventType = { $in: types };
    }

    if (state && state !== 'all' && state !== 'All States') {
      filter.state = { $regex: new RegExp(`^${state.trim()}$`, 'i') };
    }

    if (status && status !== 'all') {
      if (status === 'fake' || status === 'misleading') {
        filter.verificationStatus = { $in: ['fake', 'misleading'] };
      } else {
        filter.verificationStatus = status;
      }
    }

    if (source && source !== 'all') {
      filter.source = source;
    }

    if (includeDuplicates === 'false' || includeDuplicates === false) {
      filter.isDuplicate = { $ne: true };
    }

    if (minConfidence) {
      filter.mlConfidenceScore = { $gte: parseFloat(minConfidence) };
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { city: regex },
        { state: regex },
        { hashtags: regex },
        { sourceName: regex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // If 'all=true' query parameter is passed (e.g. for map or analytics), return full set
    if (all === 'true' || all === true) {
      const events = await WeatherEvent.find(filter)
        .populate('verifiedBy', 'name email')
        .populate('duplicateOf', 'title city eventType')
        .sort({ timestamp: -1 });

      return res.json({
        success: true,
        total: events.length,
        events,
      });
    }

    const [total, events] = await Promise.all([
      WeatherEvent.countDocuments(filter),
      WeatherEvent.find(filter)
        .populate('verifiedBy', 'name email')
        .populate('duplicateOf', 'title city eventType')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasMore: pageNum < totalPages,
      events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather events',
      error: error.message,
    });
  }
});

// @route   POST /api/events/process
// @desc    Process a raw weather report via the AI Intelligence Pipeline (Classification + Hashtags + Authenticity + Deduplication)
// @access  Public / Protected
router.post('/process', async (req, res) => {
  try {
    const {
      source = 'twitter',
      rawText = '',
      title = '',
      description = '',
      city = 'Mumbai',
      state = 'Maharashtra',
      coordinates = [72.8777, 19.0760],
      eventType,
      hashtags = [],
      mediaUrls = [],
      mediaType = 'image',
      timestamp = new Date(),
      reporterName = 'Social Stream Ingestion',
      isFake = false,
    } = req.body;

    const result = await processAndIngestReport({
      source,
      rawText,
      title,
      description,
      city,
      state,
      coordinates,
      explicitEventType: eventType,
      hashtags,
      mediaUrls,
      mediaType,
      timestamp,
      reporterName,
      isExplicitFake: isFake,
      verifiedBy: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message: 'Weather report processed through AI Intelligence Pipeline',
      ...result,
    });
  } catch (error) {
    console.error('Error processing event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process report through AI pipeline',
      error: error.message,
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get single weather event by ID with rich intelligence breakdown
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await WeatherEvent.findById(req.params.id)
      .populate('verifiedBy', 'name email')
      .populate('duplicateOf', 'title city eventType timestamp source reportCount');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Weather event not found' });
    }

    // If this event has duplicates linked to it, fetch child reports
    let linkedDuplicates = [];
    if (event.reportCount > 1 || event.duplicateGroupId) {
      linkedDuplicates = await WeatherEvent.find({
        $or: [
          { duplicateOf: event._id },
          { duplicateGroupId: event.duplicateGroupId, _id: { $ne: event._id } },
        ],
      }).limit(20);
    }

    res.json({
      success: true,
      event,
      linkedDuplicates,
      clusterStats: {
        totalReports: event.reportCount || (linkedDuplicates.length + 1),
        sourceDistribution: event.associatedReports?.reduce((acc, r) => {
          acc[r.source] = (acc[r.source] || 0) + 1;
          return acc;
        }, {}) || {},
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving event details', error: error.message });
  }
});

// @route   GET /api/events/:id/timeline
// @desc    Get timeline history for a specific event
// @access  Public
router.get('/:id/timeline', async (req, res) => {
  try {
    const event = await WeatherEvent.findById(req.params.id).select('processingTimeline title eventType timestamp city');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({
      success: true,
      timeline: event.processingTimeline || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving timeline', error: error.message });
  }
});

// @route   POST /api/events
// @desc    Create a new weather event manually
// @access  Private (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const {
      source = 'imd_api',
      title,
      description,
      eventType,
      city,
      state,
      coordinates,
      timestamp = new Date(),
      hashtags = [],
      mediaUrls = [],
      verificationStatus = 'verified',
      mlConfidenceScore = 0.95,
      isFake = false,
    } = req.body;

    if (!title || !description || !eventType || !city || !state || !coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, eventType, city, state, and coordinates are required',
      });
    }

    const allTags = [...new Set([...hashtags, ...extractHashtags(title + ' ' + description)])];

    const newEvent = await WeatherEvent.create({
      source,
      sourceName: source === 'imd_api' ? 'IMD AWS & Radar Doppler' : source,
      title,
      description,
      eventType,
      city,
      state,
      location: {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      },
      timestamp: new Date(timestamp),
      hashtags: allTags,
      mediaUrls,
      verificationStatus,
      verifiedBy: req.user._id,
      mlConfidenceScore: Number(mlConfidenceScore) || 0.9,
      verificationFactors: {
        sourceReliability: 95,
        locationConsistency: 95,
        weatherConsistency: 95,
        contentAnalysis: 95,
        duplicateSimilarity: 90,
      },
      isFake: Boolean(isFake),
      reportCount: 1,
      processingTimeline: [
        {
          step: 'Admin Direct Ingestion',
          timestamp: new Date(),
          details: `Logged directly by Officer ${req.user.name}`,
        },
      ],
    });

    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Failed to create weather event', error: error.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Update a weather event
// @access  Private (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const event = await WeatherEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Weather event not found' });
    }

    const updates = { ...req.body };
    if (updates.verificationStatus === 'verified' && !event.verifiedBy) {
      updates.verifiedBy = req.user._id;
    }
    if (updates.verificationStatus === 'fake' || updates.verificationStatus === 'misleading') {
      updates.isFake = true;
    }

    const updated = await WeatherEvent.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('verifiedBy', 'name email');

    res.json({ success: true, event: updated });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, message: 'Failed to update event', error: error.message });
  }
});

module.exports = router;
