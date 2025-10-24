// models/Research.js
// Purpose: Defines structure for research papers

const mongoose = require('mongoose');

const researchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  authors: [{
    name: {
      type: String,
      required: true
    },
    email: String
  }],
  abstract: {
    type: String,
    required: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  subjectArea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubjectArea',
    required: true
  },
  yearPublished: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  pdfUrl: {
    type: String,
    required: true
  },
  coverImage: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  bookmarkCount: {
    type: Number,
    default: 0
  },
  citationCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster searching
researchSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });

module.exports = mongoose.model('Research', researchSchema);