// routes/research.js - COMPLETE FINAL VERSION WITH ALL FIXES
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Research = require('../models/Research');
const SubjectArea = require('../models/SubjectArea');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');
const { fuzzySearch } = require('../utils/fuzzySearch');
const mongoose = require('mongoose');

// ====================================
// HELPER FUNCTIONS
// ====================================

/**
 * Convert Cloudinary URL to viewable format (opens in browser, not downloads)
 * @param {string} url - Original Cloudinary URL
 * @returns {string} Modified URL for inline viewing
 */
function getViewableCloudinaryUrl(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  // Remove any existing fl_attachment parameters
  let modifiedUrl = url.replace(/\/fl_attachment[^\/]*\//g, '/');
  
  // Add inline display flag to force browser viewing instead of download
  if (modifiedUrl.includes('/upload/')) {
    modifiedUrl = modifiedUrl.replace('/upload/', '/upload/fl_inline/');
  }
  
  return modifiedUrl;
}

/**
 * Convert Cloudinary URL to download format
 * @param {string} url - Original Cloudinary URL
 * @returns {string} Modified URL for downloading
 */
function getDownloadCloudinaryUrl(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  // Remove any existing flags
  let modifiedUrl = url.replace(/\/fl_[^\/]*\//g, '/');
  
  // Add attachment flag to force download
  if (modifiedUrl.includes('/upload/')) {
    modifiedUrl = modifiedUrl.replace('/upload/', '/upload/fl_attachment/');
  }
  
  return modifiedUrl;
}

// ====================================
// PUBLIC ROUTES (No authentication)
// ====================================

/**
 * @route   GET /api/research
 * @desc    Get all approved research with filters and pagination
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      subjectArea, 
      year, 
      author, 
      page = 1, 
      limit = 12,
      sort = 'recent' 
    } = req.query;

    // Build query
    let query = { status: 'approved', isActive: true };

    if (subjectArea) {
      if (!mongoose.Types.ObjectId.isValid(subjectArea)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid subject area ID' 
        });
      }
      query.subjectArea = subjectArea;
    }

    if (year) {
      const yearNum = parseInt(year);
      if (isNaN(yearNum)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid year format' 
        });
      }
      query.yearPublished = yearNum;
    }

    if (author) {
      query['authors.name'] = { $regex: author, $options: 'i' };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { viewCount: -1, downloadCount: -1 };
        break;
      case 'recent':
        sortOption = { approvedAt: -1, submittedAt: -1 };
        break;
      case 'mostCited':
        sortOption = { citationCount: -1 };
        break;
      case 'alphabetical':
        sortOption = { title: 1 };
        break;
      default:
        sortOption = { approvedAt: -1 };
    }

    // Fetch research
    let researches = await Research.find(query)
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance

    // Apply fuzzy search if search term provided
    if (search && search.trim()) {
      researches = fuzzySearch(search, researches);
    }

    // Convert URLs to viewable format
    researches = researches.map(r => {
      if (r.pdfUrl) {
        r.pdfUrl = getViewableCloudinaryUrl(r.pdfUrl);
      }
      if (r.coverImage) {
        r.coverImage = getViewableCloudinaryUrl(r.coverImage);
      }
      return r;
    });

    // Get total count for pagination
    const total = await Research.countDocuments(query);

    res.json({
      success: true,
      researches,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: skip + researches.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get research error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching research',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/research/popular
 * @desc    Get most popular research (by views and downloads)
 * @access  Public
 */
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    let researches = await Research.find({ 
      status: 'approved', 
      isActive: true 
    })
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName')
      .sort({ viewCount: -1, downloadCount: -1 })
      .limit(limit)
      .lean();

    // Convert URLs to viewable format
    researches = researches.map(r => {
      if (r.pdfUrl) {
        r.pdfUrl = getViewableCloudinaryUrl(r.pdfUrl);
      }
      if (r.coverImage) {
        r.coverImage = getViewableCloudinaryUrl(r.coverImage);
      }
      return r;
    });

    res.json({ success: true, researches });
  } catch (error) {
    console.error('Get popular research error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/research/recent
 * @desc    Get most recent research
 * @access  Public
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    let researches = await Research.find({ 
      status: 'approved', 
      isActive: true 
    })
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName')
      .sort({ approvedAt: -1, submittedAt: -1 })
      .limit(limit)
      .lean();

    // Convert URLs to viewable format
    researches = researches.map(r => {
      if (r.pdfUrl) {
        r.pdfUrl = getViewableCloudinaryUrl(r.pdfUrl);
      }
      if (r.coverImage) {
        r.coverImage = getViewableCloudinaryUrl(r.coverImage);
      }
      return r;
    });

    res.json({ success: true, researches });
  } catch (error) {
    console.error('Get recent research error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/research/:id
 * @desc    Get single research by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid research ID format' 
      });
    }

    const research = await Research.findById(req.params.id)
      .populate('subjectArea', 'name description')
      .populate('submittedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName')
      .lean();

    if (!research) {
      return res.status(404).json({ 
        success: false,
        message: 'Research not found' 
      });
    }

    // Only show approved research to non-authenticated users
    if (research.status !== 'approved' && research.isActive === false) {
      return res.status(403).json({ 
        success: false,
        message: 'This research is not publicly available' 
      });
    }

    // Increment view count (do this asynchronously, don't wait)
    Research.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } }
    ).exec();

    // Log analytics (asynchronously)
    Analytics.create({
      type: 'research_view',
      research: research._id,
      metadata: { title: research.title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Analytics error:', err));

    // Convert URLs to viewable format
    if (research.pdfUrl) {
      research.pdfUrl = getViewableCloudinaryUrl(research.pdfUrl);
    }
    if (research.coverImage) {
      research.coverImage = getViewableCloudinaryUrl(research.coverImage);
    }

    // Increment view count in response
    research.viewCount = (research.viewCount || 0) + 1;

    res.json({ success: true, research });
  } catch (error) {
    console.error('Get research by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching research',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/research/:id/download
 * @desc    Track download and return download URL
 * @access  Public
 */
router.get('/:id/download', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid research ID' 
      });
    }

    const research = await Research.findById(req.params.id);
    
    if (!research) {
      return res.status(404).json({ 
        success: false,
        message: 'Research not found' 
      });
    }

    if (research.status !== 'approved' || !research.isActive) {
      return res.status(403).json({ 
        success: false,
        message: 'This research is not available for download' 
      });
    }

    // Increment download count (asynchronously)
    Research.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } }
    ).exec();

    // Log analytics (asynchronously)
    Analytics.create({
      type: 'download',
      research: research._id,
      metadata: { title: research.title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Analytics error:', err));

    // Return download URL with attachment flag
    const downloadUrl = getDownloadCloudinaryUrl(research.pdfUrl);

    res.json({ 
      success: true, 
      downloadUrl,
      filename: `${research.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
    });
  } catch (error) {
    console.error('Download tracking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while tracking download',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================================
// PROTECTED ROUTES (Requires login)
// ====================================

/**
 * @route   POST /api/research/submit
 * @desc    Submit new research for review
 * @access  Private (authenticated users only)
 */
router.post('/submit', 
  protect,
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // Validation
      const errors = [];

      // Title validation
      if (!req.body.title || !req.body.title.trim()) {
        errors.push({ field: 'title', message: 'Title is required' });
      } else if (req.body.title.trim().length < 10) {
        errors.push({ field: 'title', message: 'Title must be at least 10 characters' });
      }

      // Abstract validation
      if (!req.body.abstract || !req.body.abstract.trim()) {
        errors.push({ field: 'abstract', message: 'Abstract is required' });
      } else if (req.body.abstract.trim().length < 50) {
        errors.push({ field: 'abstract', message: 'Abstract must be at least 50 characters' });
      }

      // Subject area validation
      if (!req.body.subjectArea || !req.body.subjectArea.trim()) {
        errors.push({ field: 'subjectArea', message: 'Subject area is required' });
      } else if (!mongoose.Types.ObjectId.isValid(req.body.subjectArea)) {
        errors.push({ field: 'subjectArea', message: 'Invalid subject area ID' });
      } else {
        // Check if subject area exists
        const subjectExists = await SubjectArea.findById(req.body.subjectArea);
        if (!subjectExists) {
          errors.push({ field: 'subjectArea', message: 'Subject area not found' });
        }
      }

      // Year validation
      if (!req.body.yearPublished) {
        errors.push({ field: 'yearPublished', message: 'Year published is required' });
      } else {
        const year = parseInt(req.body.yearPublished);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1900 || year > currentYear + 1) {
          errors.push({ field: 'yearPublished', message: `Invalid year (must be between 1900 and ${currentYear + 1})` });
        }
      }

      // Authors validation
      let authors;
      try {
        authors = typeof req.body.authors === 'string' 
          ? JSON.parse(req.body.authors) 
          : req.body.authors;
        
        if (!Array.isArray(authors) || authors.length === 0) {
          errors.push({ field: 'authors', message: 'At least one author is required' });
        } else {
          const validAuthors = authors.filter(a => a.name && a.name.trim());
          if (validAuthors.length === 0) {
            errors.push({ field: 'authors', message: 'At least one author with a name is required' });
          }
        }
      } catch (e) {
        errors.push({ field: 'authors', message: 'Invalid authors format (must be valid JSON array)' });
      }

      // Keywords validation
      let keywords;
      try {
        keywords = typeof req.body.keywords === 'string' 
          ? JSON.parse(req.body.keywords) 
          : req.body.keywords;
        
        if (!Array.isArray(keywords) || keywords.length === 0) {
          errors.push({ field: 'keywords', message: 'At least one keyword is required' });
        } else {
          const validKeywords = keywords.filter(k => k && k.trim());
          if (validKeywords.length === 0) {
            errors.push({ field: 'keywords', message: 'At least one valid keyword is required' });
          }
        }
      } catch (e) {
        errors.push({ field: 'keywords', message: 'Invalid keywords format (must be valid JSON array)' });
      }

      // PDF file validation
      if (!req.files || !req.files.pdf || !req.files.pdf[0]) {
        errors.push({ field: 'pdf', message: 'PDF file is required' });
      } else {
        const pdfFile = req.files.pdf[0];
        if (pdfFile.mimetype !== 'application/pdf') {
          errors.push({ field: 'pdf', message: 'File must be a PDF' });
        }
        if (pdfFile.size > 10 * 1024 * 1024) {
          errors.push({ field: 'pdf', message: 'PDF file must be less than 10MB' });
        }
      }

      // If validation errors, return them
      if (errors.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: errors 
        });
      }

      // Clean data
      const { title, abstract, subjectArea, yearPublished } = req.body;
      const cleanAuthors = authors.filter(a => a.name && a.name.trim());
      const cleanKeywords = keywords.filter(k => k && k.trim());

      // Create research
      const research = await Research.create({
        title: title.trim(),
        abstract: abstract.trim(),
        authors: cleanAuthors.map(a => ({
          name: a.name.trim(),
          email: a.email ? a.email.trim() : undefined
        })),
        keywords: cleanKeywords.map(k => k.trim()),
        subjectArea: subjectArea,
        yearPublished: parseInt(yearPublished),
        pdfUrl: req.files.pdf[0].path, // Cloudinary URL
        coverImage: req.files.coverImage ? req.files.coverImage[0].path : null,
        submittedBy: req.user.id,
        status: 'pending',
        submittedAt: new Date()
      });

      console.log('✅ Research submitted:', {
        id: research._id,
        title: research.title,
        pdfUrl: research.pdfUrl
      });

      res.status(201).json({
        success: true,
        message: 'Research submitted successfully and is pending approval',
        research: {
          _id: research._id,
          title: research.title,
          status: research.status,
          pdfUrl: getViewableCloudinaryUrl(research.pdfUrl),
          coverImage: research.coverImage ? getViewableCloudinaryUrl(research.coverImage) : null
        }
      });

    } catch (error) {
      console.error('Submit research error:', error);
      
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      // Handle duplicate key errors
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'A research with this title already exists',
          errors: [{ field: 'title', message: 'Title must be unique' }]
        });
      }

      res.status(500).json({ 
        success: false,
        message: 'Server error while submitting research',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   POST /api/research/:id/bookmark
 * @desc    Bookmark or unbookmark research
 * @access  Private
 */
router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid research ID' 
      });
    }

    // Check if research exists
    const research = await Research.findById(req.params.id);
    if (!research) {
      return res.status(404).json({ 
        success: false,
        message: 'Research not found' 
      });
    }

    // Get user
    const user = await User.findById(req.user.id);
    const bookmarkIndex = user.bookmarks.indexOf(research._id);

    if (bookmarkIndex > -1) {
      // Remove bookmark
      user.bookmarks.splice(bookmarkIndex, 1);
      research.bookmarkCount = Math.max(0, research.bookmarkCount - 1);
      
      await Promise.all([user.save(), research.save()]);

      res.json({ 
        success: true, 
        message: 'Bookmark removed',
        bookmarked: false,
        bookmarkCount: research.bookmarkCount
      });
    } else {
      // Add bookmark
      user.bookmarks.push(research._id);
      research.bookmarkCount += 1;
      
      await Promise.all([user.save(), research.save()]);

      res.json({ 
        success: true, 
        message: 'Research bookmarked',
        bookmarked: true,
        bookmarkCount: research.bookmarkCount
      });
    }
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating bookmark',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/research/user/bookmarks
 * @desc    Get user's bookmarked research
 * @access  Private
 */
router.get('/user/bookmarks', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'bookmarks',
        match: { isActive: true, status: 'approved' },
        populate: { path: 'subjectArea', select: 'name' },
        options: { sort: { approvedAt: -1 } }
      });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Convert URLs to viewable format
    const bookmarks = user.bookmarks.map(b => {
      const obj = b.toObject();
      if (obj.pdfUrl) {
        obj.pdfUrl = getViewableCloudinaryUrl(obj.pdfUrl);
      }
      if (obj.coverImage) {
        obj.coverImage = getViewableCloudinaryUrl(obj.coverImage);
      }
      return obj;
    });

    res.json({ 
      success: true, 
      bookmarks,
      count: bookmarks.length
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching bookmarks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/research/user/submissions
 * @desc    Get user's submitted research
 * @access  Private
 */
router.get('/user/submissions', protect, async (req, res) => {
  try {
    const researches = await Research.find({ 
      submittedBy: req.user.id,
      isActive: true
    })
      .populate('subjectArea', 'name')
      .sort({ submittedAt: -1 })
      .lean();

    // Convert URLs
    const submissions = researches.map(r => {
      if (r.pdfUrl) {
        r.pdfUrl = getViewableCloudinaryUrl(r.pdfUrl);
      }
      if (r.coverImage) {
        r.coverImage = getViewableCloudinaryUrl(r.coverImage);
      }
      return r;
    });

    res.json({ 
      success: true, 
      submissions,
      count: submissions.length
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;