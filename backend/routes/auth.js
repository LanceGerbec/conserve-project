// routes/auth.js
// Purpose: Handle user registration, login, and authentication

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/email');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token valid for 30 days
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  // Validation rules
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'faculty']).withMessage('Invalid role')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role, studentId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Will be hashed automatically by User model
      role,
      studentId: role === 'student' ? studentId : undefined
    });

    // Generate token
    const token = generateToken(user._id);

    // Send welcome email (async, doesn't block response)
    sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/register
// @desc    Register new user (WITH STUDENT NUMBER VERIFICATION)
// @access  Public
router.post('/register', [
  // Validation rules
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['student', 'faculty']).withMessage('Invalid role'),
  body('studentId').trim().notEmpty().withMessage('Student/Faculty number is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role, studentId } = req.body;

    // ==========================================
    // NEW: VERIFY STUDENT NUMBER FIRST
    // ==========================================
    const AuthorizedNumber = require('../models/AuthorizedNumber');
    
    const normalizedId = studentId.trim().toUpperCase();
    const authorized = await AuthorizedNumber.findOne({ 
      studentNumber: normalizedId,
      isUsed: false 
    });

    if (!authorized) {
      return res.status(400).json({ 
        message: 'This student/faculty number is not authorized or has already been used. Please contact the administrator.' 
      });
    }
    // ==========================================

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Will be hashed automatically by User model
      role,
      studentId: normalizedId
    });

    // ==========================================
    // NEW: MARK NUMBER AS USED
    // ==========================================
    await AuthorizedNumber.findByIdAndUpdate(authorized._id, {
      isUsed: true,
      usedBy: user._id,
      usedAt: new Date()
    });
    // ==========================================

    // Generate token
    const token = generateToken(user._id);

    // Send welcome email (async, doesn't block response)
    sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('bookmarks');

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const { firstName, lastName, studentId } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (studentId && req.user.role === 'student') updateData.studentId = studentId;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;