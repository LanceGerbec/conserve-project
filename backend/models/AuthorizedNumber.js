// models/AuthorizedNumber.js
// Purpose: Store authorized student/faculty numbers for registration

const mongoose = require('mongoose');

const authorizedNumberSchema = new mongoose.Schema({
  studentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['student', 'faculty'],
    default: 'student'
  },
  firstName: String,
  lastName: String,
  program: String,
  yearLevel: String,
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  usedAt: Date
});

// Index for faster lookups
authorizedNumberSchema.index({ studentNumber: 1 });
authorizedNumberSchema.index({ isUsed: 1 });

module.exports = mongoose.model('AuthorizedNumber', authorizedNumberSchema);