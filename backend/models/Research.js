// models/Research.js - UPDATED WITH COMPLETED/PUBLISHED STATUS
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
  // NEW: Publication workflow status
  publicationStatus: {
    type: String,
    enum: ['completed', 'published'], // completed = finalized but not public, published = visible on homepage
    default: 'completed'
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
  // NEW: DOI support (optional)
  doi: {
    type: String,
    trim: true,
    sparse: true
  },
  // NEW: Category for organization
  category: {
    type: String,
    enum: ['thesis', 'dissertation', 'journal', 'conference', 'other'],
    default: 'other'
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
  // NEW: Published date (when moved to published section)
  publishedAt: Date,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster searching
researchSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
researchSchema.index({ publicationStatus: 1, status: 1 });

module.exports = mongoose.model('Research', researchSchema);