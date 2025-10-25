// backend/routes/team.js
// Purpose: Manage team members (admin can edit)

const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');

// Get all team members (public - no auth required)
router.get('/', async (req, res) => {
  try {
    const members = await TeamMember.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, members });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// All routes below require admin authentication
router.use(protect);
router.use(adminOnly);

// Get all team members including inactive (admin only)
router.get('/all', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, members });
  } catch (error) {
    console.error('Get all team members error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create team member (admin only)
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, role, order } = req.body;

    if (!name || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and role are required' 
      });
    }

    const member = await TeamMember.create({
      name: name.trim(),
      role: role.trim(),
      order: order ? parseInt(order) : 0,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    console.log('✅ Team member created:', member.name);
    res.status(201).json({ success: true, member });
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update team member (admin only)
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { name, role, order } = req.body;
    
    const updateData = {
      updatedAt: Date.now()
    };

    if (name) updateData.name = name.trim();
    if (role) updateData.role = role.trim();
    if (order !== undefined) updateData.order = parseInt(order);

    if (req.file) {
      updateData.photoUrl = `/uploads/${req.file.filename}`;
    }

    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team member not found' 
      });
    }

    console.log('✅ Team member updated:', member.name);
    res.json({ success: true, member });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete team member (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team member not found' 
      });
    }

    console.log('✅ Team member deleted:', member.name);
    res.json({ success: true, message: 'Team member deleted' });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;