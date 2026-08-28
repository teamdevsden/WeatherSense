const express = require('express');
const router = express.Router();
const WeatherEvent = require('../models/WeatherEvent');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

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
      filter.verificationStatus = status;
    }

    if (source && source !== 'all') {
      filter.source = source;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of the day if date string provided
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
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // If 'all=true' query parameter is passed (e.g. for map or analytics), return full set
    if (all === 'true' || all === true) {
      const events = await WeatherEvent.find(filter)
        .populate('verifiedBy', 'name email')
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

// @route   GET /api/events/:id
// @desc    Get single weather event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await WeatherEvent.findById(req.params.id).populate('verifiedBy', 'name email');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Weather event not found' });
    }
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving event', error: error.message });
  }
});

// @route   POST /api/events
// @desc    Create a new weather event
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

    const newEvent = await WeatherEvent.create({
      source,
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
      hashtags,
      mediaUrls,
      verificationStatus,
      verifiedBy: req.user._id,
      mlConfidenceScore: Number(mlConfidenceScore) || 0.9,
      isFake: Boolean(isFake),
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
    if (updates.verificationStatus === 'fake') {
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
