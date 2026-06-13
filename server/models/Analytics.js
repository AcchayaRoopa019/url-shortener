const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true,
  },
  visitedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    default: 'Unknown',
  },
  userAgent: {
    type: String,
    default: 'Unknown',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  device: {
    type: String,
    default: 'Unknown',
  },
  country: {
    type: String,
    default: 'Unknown',
  },
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
