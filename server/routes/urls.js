const express = require('express');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');
const authMiddleware = require('../middleware/authMiddleware');
const { validateUrl } = require('../middleware/validate');
const { generateUniqueShortCode } = require('../utils/generateShortCode');

const router = express.Router();

// All URL routes are protected
router.use(authMiddleware);

/**
 * @route   POST /api/urls
 * @desc    Create a shortened URL
 * @access  Private
 */
router.post('/', validateUrl, async (req, res) => {
  const { originalUrl, customAlias, expiresAt } = req.body;
  const userId = req.user._id;

  try {
    let shortCode;

    if (customAlias) {
      // Check if the custom alias is already used as a short code or alias
      const aliasExists = await Url.findOne({
        $or: [{ shortCode: customAlias }, { customAlias }],
      });

      if (aliasExists) {
        return res.status(400).json({
          success: false,
          message: 'This custom alias is already taken. Please try another one.',
        });
      }
      shortCode = customAlias;
    } else {
      // Generate unique short code
      shortCode = await generateUniqueShortCode();
    }

    const newUrl = await Url.create({
      userId,
      originalUrl,
      shortCode,
      customAlias: customAlias || undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    return res.status(201).json({
      success: true,
      data: newUrl,
      message: 'URL shortened successfully',
    });
  } catch (error) {
    console.error('URL creation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to shorten URL due to a server error',
    });
  }
});

/**
 * @route   GET /api/urls
 * @desc    Get all URLs for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: urls,
      message: 'URLs retrieved successfully',
    });
  } catch (error) {
    console.error('Get URLs error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve URLs',
    });
  }
});

/**
 * @route   DELETE /api/urls/:id
 * @desc    Delete a shortened URL
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const url = await Url.findById(req.id || req.params.id);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    // Check ownership
    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this URL',
      });
    }

    // Delete URL and associated analytics
    await Url.deleteOne({ _id: url._id });
    await Analytics.deleteMany({ urlId: url._id });

    return res.status(200).json({
      success: true,
      data: {},
      message: 'URL and its analytics deleted successfully',
    });
  } catch (error) {
    console.error('Delete URL error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete URL',
    });
  }
});

/**
 * @route   GET /api/urls/:id/analytics
 * @desc    Get detailed analytics for a URL
 * @access  Private
 */
router.get('/:id/analytics', async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    // Check ownership
    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this URL',
      });
    }

    // Last visited time
    const lastVisit = await Analytics.findOne({ urlId: url._id }).sort({ visitedAt: -1 });

    // Recent visits table (limit to 30)
    const recentVisits = await Analytics.find({ urlId: url._id })
      .sort({ visitedAt: -1 })
      .limit(30);

    // Group clicks by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clicksByDate = await Analytics.aggregate([
      {
        $match: {
          urlId: url._id,
          visitedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format daily clicks for Recharts
    const dailyClicks = clicksByDate.map((item) => ({
      date: item._id,
      clicks: item.clicks,
    }));

    // Device breakdown
    const deviceBreakdown = await Analytics.aggregate([
      { $match: { urlId: url._id } },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Browser breakdown
    const browserBreakdown = await Analytics.aggregate([
      { $match: { urlId: url._id } },
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Country breakdown
    const countryBreakdown = await Analytics.aggregate([
      { $match: { urlId: url._id } },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        url,
        summary: {
          totalClicks: url.totalClicks,
          lastVisitedAt: lastVisit ? lastVisit.visitedAt : null,
        },
        dailyClicks,
        devices: deviceBreakdown.map(d => ({ name: d._id, value: d.count })),
        browsers: browserBreakdown.map(b => ({ name: b._id, value: b.count })),
        countries: countryBreakdown.map(c => ({ name: c._id, value: c.count })),
        recentVisits,
      },
      message: 'Analytics data retrieved successfully',
    });
  } catch (error) {
    console.error('Get Analytics error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
    });
  }
});

module.exports = router;
