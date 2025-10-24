// models/Analytics.js
// Purpose: Track website usage and statistics

const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['page_view', 'research_view', 'download', 'search', 'user_action'],
    required: true
  },
  research: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Research'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Can store any additional data
    default: {}
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster analytics queries
analyticsSchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);