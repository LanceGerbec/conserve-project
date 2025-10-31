// routes/verification.js
// Purpose: Verify student numbers before allowing registration

const express = require('express');
const router = express.Router();
const AuthorizedNumber = require('../models/AuthorizedNumber');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/verification/check-number
// @desc    Verify if student number is authorized
// @access  Public
router.post('/check-number', async (req, res) => {
  try {
    const { studentNumber } = req.body;

    if (!studentNumber || !studentNumber.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Student number is required' 
      });
    }

    const normalized = studentNumber.trim().toUpperCase();

    const authorized = await AuthorizedNumber.findOne({ 
      studentNumber: normalized,
      isUsed: false 
    });

    if (!authorized) {
      return res.status(404).json({ 
        success: false,
        message: 'This student number is not authorized or has already been used. Please contact the administrator.',
        isAuthorized: false
      });
    }

    res.json({ 
      success: true,
      isAuthorized: true,
      message: 'Student number verified successfully',
      data: {
        type: authorized.type,
        studentNumber: authorized.studentNumber
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during verification' 
    });
  }
});

// @route   POST /api/verification/mark-used
// @desc    Mark number as used during registration (internal)
// @access  Private (called by registration)
router.post('/mark-used', protect, async (req, res) => {
  try {
    const { studentNumber, userId } = req.body;

    const authorized = await AuthorizedNumber.findOneAndUpdate(
      { studentNumber: studentNumber.trim().toUpperCase() },
      { 
        isUsed: true,
        usedBy: userId,
        usedAt: new Date()
      },
      { new: true }
    );

    if (!authorized) {
      return res.status(404).json({ 
        success: false,
        message: 'Authorized number not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Number marked as used' 
    });
  } catch (error) {
    console.error('Mark used error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;