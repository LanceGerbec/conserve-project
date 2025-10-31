// routes/documentLogs.js
// Purpose: Handle document access logging and security audit

const express = require('express');
const router = express.Router();
const DocumentAccessLog = require('../models/DocumentAccessLog');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/document-logs
// @desc    Log document access event
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { researchId, action, severity, metadata } = req.body;

    if (!researchId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Research ID and action are required'
      });
    }

    const log = await DocumentAccessLog.logAccess({
      user: req.user.id,
      research: researchId,
      action,
      severity: severity || 'INFO',
      metadata: metadata || {},
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      sessionId: req.session?.id || 'no-session'
    });

    res.json({
      success: true,
      message: 'Access logged',
      logId: log?._id
    });
  } catch (error) {
    console.error('Log document access error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging access'
    });
  }
});

// @route   GET /api/document-logs/my-activity
// @desc    Get current user's document access history
// @access  Private
router.get('/my-activity', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    let query = { user: req.user.id };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      DocumentAccessLog.find(query)
        .populate('research', 'title authors')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      DocumentAccessLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get my activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity'
    });
  }
});

// @route   GET /api/document-logs/admin/all
// @desc    Get all document access logs (Admin)
// @access  Admin only
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userId, 
      researchId, 
      action, 
      severity,
      startDate,
      endDate 
    } = req.query;

    let query = {};

    if (userId) query.user = userId;
    if (researchId) query.research = researchId;
    if (action) query.action = action;
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      DocumentAccessLog.find(query)
        .populate('user', 'firstName lastName email studentId')
        .populate('research', 'title authors')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      DocumentAccessLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get all logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching logs'
    });
  }
});

// @route   GET /api/document-logs/admin/stats
// @desc    Get document access statistics (Admin)
// @access  Admin only
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.timestamp = {};
      if (startDate) dateQuery.timestamp.$gte = new Date(startDate);
      if (endDate) dateQuery.timestamp.$lte = new Date(endDate);
    }

    const [
      totalLogs,
      logsByAction,
      logsBySeverity,
      securityEvents
    ] = await Promise.all([
      DocumentAccessLog.countDocuments(dateQuery),
      
      DocumentAccessLog.aggregate([
        { $match: dateQuery },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      DocumentAccessLog.aggregate([
        { $match: dateQuery },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),

      DocumentAccessLog.countDocuments({
        ...dateQuery,
        severity: { $in: ['WARNING', 'CRITICAL'] }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalLogs,
        securityEvents,
        byAction: logsByAction.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        bySeverity: logsBySeverity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

module.exports = router;