// models/DocumentAccessLog.js
// Purpose: Log all document access and security events

const mongoose = require('mongoose');

const documentAccessLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  research: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Research',
    required: true
  },
  action: {
    type: String,
    enum: [
      'VIEW_DOCUMENT',
      'DOWNLOAD_DOCUMENT',
      'ATTEMPT_COPY',
      'ATTEMPT_PRINT',
      'ATTEMPT_SCREENSHOT',
      'ATTEMPT_DOWNLOAD',
      'SECURITY_WARNING',
      'SESSION_START',
      'SESSION_END'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'INFO'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: String,
  sessionId: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for better query performance
documentAccessLogSchema.index({ user: 1, timestamp: -1 });
documentAccessLogSchema.index({ research: 1, timestamp: -1 });
documentAccessLogSchema.index({ action: 1, timestamp: -1 });
documentAccessLogSchema.index({ severity: 1, timestamp: -1 });

// Static method to log access
documentAccessLogSchema.statics.logAccess = async function(logData) {
  try {
    const log = await this.create(logData);
    console.log(`📋 Document Log [${logData.action}]:`, {
      user: logData.user,
      research: logData.research,
      severity: logData.severity
    });
    return log;
  } catch (error) {
    console.error('Error logging document access:', error);
    return null;
  }
};

module.exports = mongoose.model('DocumentAccessLog', documentAccessLogSchema);