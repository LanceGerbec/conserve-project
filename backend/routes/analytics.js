// routes/analytics.js
const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const Research = require('../models/Research');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Get stats (Admin only)
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResearch = await Research.countDocuments({ status: 'approved' });
    const pendingResearch = await Research.countDocuments({ status: 'pending' });
    
    const totalViews = await Research.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$viewCount' } } }
    ]);

    const totalDownloads = await Research.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalResearch,
        pendingResearch,
        totalViews: totalViews[0]?.total || 0,
        totalDownloads: totalDownloads[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Log analytics
router.post('/log', async (req, res) => {
  try {
    const { type, researchId, metadata } = req.body;

    await Analytics.create({
      type,
      research: researchId || null,
      metadata: metadata || {},
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Log analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;