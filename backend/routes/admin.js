// routes/admin.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const Research = require('../models/Research');
const SubjectArea = require('../models/SubjectArea');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/email');

// Public route - no auth required
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await SubjectArea.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add authentication for other routes
router.use(protect);
router.use(adminOnly);

// ⭐ NEW: Get all research (for management page)
router.get('/research/all', async (req, res) => {
  try {
    const researches = await Research.find({ isActive: true })
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName email')
      .sort({ submittedAt: -1 });

    res.json({ success: true, researches });
  } catch (error) {
    console.error('Get all research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending research
router.get('/research/pending', async (req, res) => {
  try {
    const researches = await Research.find({ status: 'pending' })
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName email')
      .sort({ submittedAt: -1 });

    res.json({ success: true, researches });
  } catch (error) {
    console.error('Get pending research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ⭐ NEW: Update research details
router.put('/research/:id', async (req, res) => {
  try {
    const { title, subjectArea, yearPublished } = req.body;

    const research = await Research.findById(req.params.id);
    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    // Update fields
    if (title) research.title = title;
    if (subjectArea) research.subjectArea = subjectArea;
    if (yearPublished) research.yearPublished = yearPublished;
    research.updatedAt = Date.now();

    await research.save();

    res.json({ 
      success: true, 
      message: 'Research updated successfully',
      research 
    });
  } catch (error) {
    console.error('Update research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve research
router.put('/research/:id/approve', async (req, res) => {
  try {
    const research = await Research.findById(req.params.id)
      .populate('submittedBy', 'email firstName lastName');

    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    research.status = 'approved';
    research.approvedAt = new Date();
    research.reviewedBy = req.user.id;
    await research.save();

    await SubjectArea.findByIdAndUpdate(
      research.subjectArea,
      { $inc: { researchCount: 1 } }
    );

    sendApprovalEmail(research.submittedBy.email, research.title);

    res.json({ 
      success: true, 
      message: 'Research approved',
      research 
    });
  } catch (error) {
    console.error('Approve research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject research
router.put('/research/:id/reject', async (req, res) => {
  try {
    const { reviewNotes } = req.body;

    const research = await Research.findById(req.params.id)
      .populate('submittedBy', 'email firstName lastName');

    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    research.status = 'rejected';
    research.reviewNotes = reviewNotes;
    research.reviewedBy = req.user.id;
    await research.save();

    sendRejectionEmail(
      research.submittedBy.email,
      research.title,
      reviewNotes || 'Please review and resubmit'
    );

    res.json({ 
      success: true, 
      message: 'Research rejected',
      research 
    });
  } catch (error) {
    console.error('Reject research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete research
router.delete('/research/:id', async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);

    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    research.isActive = false;
    await research.save();

    if (research.status === 'approved') {
      await SubjectArea.findByIdAndUpdate(
        research.subjectArea,
        { $inc: { researchCount: -1 } }
      );
    }

    res.json({ 
      success: true, 
      message: 'Research deleted' 
    });
  } catch (error) {
    console.error('Delete research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create subject
router.post('/subjects', async (req, res) => {
  try {
    const { name, description } = req.body;

    const existing = await SubjectArea.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Subject already exists' });
    }

    const subject = await SubjectArea.create({
      name,
      description,
      createdBy: req.user.id
    });

    res.status(201).json({ 
      success: true, 
      subject 
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subject
router.put('/subjects/:id', async (req, res) => {
  try {
    const { name, description } = req.body;

    const subject = await SubjectArea.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ success: true, subject });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete subject
router.delete('/subjects/:id', async (req, res) => {
  try {
    const subject = await SubjectArea.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const researchCount = await Research.countDocuments({ 
      subjectArea: req.params.id,
      isActive: true 
    });

    if (researchCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete. ${researchCount} research papers use this subject.` 
      });
    }

    await subject.deleteOne();

    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user status
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      success: true, 
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      user 
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;