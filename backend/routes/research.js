// routes/research.js - COMPLETE FIXED VERSION
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
// ✅ FIX: URL TRANSFORMATION FUNCTIONS
// ====================================

/**
 * Convert Cloudinary URL to viewable format (inline viewing)
 */
function getViewableCloudinaryUrl(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  let modifiedUrl = url;
  
  // Remove fl_attachment if present
  modifiedUrl = modifiedUrl.replace(/fl_attachment[,/]/g, '');
  
  // Ensure we have fl_inline for browser viewing
  if (!modifiedUrl.includes('fl_inline')) {
    if (modifiedUrl.includes('/upload/')) {
      modifiedUrl = modifiedUrl.replace('/upload/', '/upload/fl_inline/');
    } else {
      // Add as query parameter if path modification doesn't work
      const separator = modifiedUrl.includes('?') ? '&' : '?';
      modifiedUrl = `${modifiedUrl}${separator}fl=inline`;
    }
  }
  
  console.log('🔄 URL Conversion:', {
    original: url,
    modified: modifiedUrl
  });
  
  return modifiedUrl;
}

/**
 * Convert Cloudinary URL to download format
 */
function getDownloadCloudinaryUrl(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  let modifiedUrl = url;
  
  // Remove fl_inline if present
  modifiedUrl = modifiedUrl.replace(/fl_inline[,/]/g, '');
  
  // Add fl_attachment for forced download
  if (!modifiedUrl.includes('fl_attachment')) {
    if (modifiedUrl.includes('/upload/')) {
      modifiedUrl = modifiedUrl.replace('/upload/', '/upload/fl_attachment/');
    } else {
      const separator = modifiedUrl.includes('?') ? '&' : '?';
      modifiedUrl = `${modifiedUrl}${separator}fl=attachment`;
    }
  }
  
  return modifiedUrl;
}

// ====================================
// PUBLIC ROUTES
// ====================================

/**
 * @route   GET /api/research
 * @desc    Get all approved research
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

    // ✅ UPDATED: Only show published research on homepage
    let query = { 
      status: 'approved', 
      isActive: true,
      publicationStatus: 'published' // NEW: Only published research
    };

    if (subjectArea && mongoose.Types.ObjectId.isValid(subjectArea)) {
      query.subjectArea = subjectArea;
    }

    if (year) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        query.yearPublished = yearNum;
      }
    }

    if (author) {
      query['authors.name'] = { $regex: author, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

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
      default:
        sortOption = { approvedAt: -1 };
    }

    let researches = await Research.find(query)
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    if (search && search.trim()) {
      researches = fuzzySearch(search, researches);
    }

    // ✅ Convert URLs to viewable format
    researches = researches.map(r => {
      if (r.pdfUrl) {
        r.pdfUrl = getViewableCloudinaryUrl(r.pdfUrl);
      }
      if (r.coverImage) {
        r.coverImage = getViewableCloudinaryUrl(r.coverImage);
      }
      return r;
    });

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
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/research/popular
 * @desc    Get popular research
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
    console.error('Get popular error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/research/recent
 * @desc    Get recent research
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
    console.error('Get recent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/research/:id
 * @desc    Get single research
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid research ID' 
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

    if (research.status !== 'approved' && research.isActive === false) {
      return res.status(403).json({ 
        success: false,
        message: 'Research not available' 
      });
    }

    // Increment view count
    Research.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } }
    ).exec();

    // Log analytics
    Analytics.create({
      type: 'research_view',
      research: research._id,
      metadata: { title: research.title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Analytics error:', err));

    // ✅ Convert URLs
    if (research.pdfUrl) {
      research.pdfUrl = getViewableCloudinaryUrl(research.pdfUrl);
      console.log('✅ PDF URL for viewing:', research.pdfUrl);
    }
    if (research.coverImage) {
      research.coverImage = getViewableCloudinaryUrl(research.coverImage);
    }

    research.viewCount = (research.viewCount || 0) + 1;

    res.json({ success: true, research });
  } catch (error) {
    console.error('Get research error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/research/:id/download
 * @desc    Track and download
 * @access  Public
 */
router.get('/:id/download', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid ID' 
      });
    }

    const research = await Research.findById(req.params.id);
    
    if (!research) {
      return res.status(404).json({ 
        success: false,
        message: 'Not found' 
      });
    }

    if (research.status !== 'approved' || !research.isActive) {
      return res.status(403).json({ 
        success: false,
        message: 'Not available' 
      });
    }

    // Increment download count
    Research.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } }
    ).exec();

    // Log analytics
    Analytics.create({
      type: 'download',
      research: research._id,
      metadata: { title: research.title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Analytics error:', err));

    // ✅ Return download URL
    const downloadUrl = getDownloadCloudinaryUrl(research.pdfUrl);

    res.json({ 
      success: true, 
      downloadUrl,
      filename: `${research.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ====================================
// PROTECTED ROUTES
// ====================================

/**
 * @route   POST /api/research/submit
 * @desc    Submit research
 * @access  Private
 */
router.post('/submit', 
  protect,
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const errors = [];

      if (!req.body.title || req.body.title.trim().length < 10) {
        errors.push({ field: 'title', message: 'Title required (min 10 chars)' });
      }

      if (!req.body.abstract || req.body.abstract.trim().length < 50) {
        errors.push({ field: 'abstract', message: 'Abstract required (min 50 chars)' });
      }

      if (!req.body.subjectArea || !mongoose.Types.ObjectId.isValid(req.body.subjectArea)) {
        errors.push({ field: 'subjectArea', message: 'Valid subject area required' });
      }

      const year = parseInt(req.body.yearPublished);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        errors.push({ field: 'yearPublished', message: `Year must be 1900-${currentYear + 1}` });
      }

      let authors, keywords;
      try {
        authors = typeof req.body.authors === 'string' ? JSON.parse(req.body.authors) : req.body.authors;
        keywords = typeof req.body.keywords === 'string' ? JSON.parse(req.body.keywords) : req.body.keywords;
        
        if (!Array.isArray(authors) || authors.filter(a => a.name?.trim()).length === 0) {
          errors.push({ field: 'authors', message: 'At least one author required' });
        }
        
        if (!Array.isArray(keywords) || keywords.filter(k => k?.trim()).length === 0) {
          errors.push({ field: 'keywords', message: 'At least one keyword required' });
        }
      } catch (e) {
        errors.push({ field: 'data', message: 'Invalid JSON format' });
      }

      if (!req.files?.pdf?.[0]) {
        errors.push({ field: 'pdf', message: 'PDF file required' });
      } else {
        const pdfFile = req.files.pdf[0];
        if (pdfFile.mimetype !== 'application/pdf') {
          errors.push({ field: 'pdf', message: 'Must be PDF' });
        }
        if (pdfFile.size > 10 * 1024 * 1024) {
          errors.push({ field: 'pdf', message: 'Max 10MB' });
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors 
        });
      }

      const research = await Research.create({
        title: req.body.title.trim(),
        abstract: req.body.abstract.trim(),
        authors: authors.filter(a => a.name?.trim()).map(a => ({
          name: a.name.trim(),
          email: a.email?.trim()
        })),
        keywords: keywords.filter(k => k?.trim()).map(k => k.trim()),
        subjectArea: req.body.subjectArea,
        yearPublished: year,
        pdfUrl: req.files.pdf[0].path,
        coverImage: req.files.coverImage?.[0]?.path || null,
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
        message: 'Submitted successfully',
        research: {
          _id: research._id,
          title: research.title,
          status: research.status,
          pdfUrl: getViewableCloudinaryUrl(research.pdfUrl),
          coverImage: research.coverImage ? getViewableCloudinaryUrl(research.coverImage) : null
        }
      });

    } catch (error) {
      console.error('Submit error:', error);
      
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

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Title must be unique',
          errors: [{ field: 'title', message: 'Already exists' }]
        });
      }

      res.status(500).json({ 
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   POST /api/research/:id/bookmark
 * @desc    Bookmark toggle
 * @access  Private
 */
router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const research = await Research.findById(req.params.id);
    if (!research) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const user = await User.findById(req.user.id);
    const bookmarkIndex = user.bookmarks.indexOf(research._id);

    if (bookmarkIndex > -1) {
      user.bookmarks.splice(bookmarkIndex, 1);
      research.bookmarkCount = Math.max(0, research.bookmarkCount - 1);
      await Promise.all([user.save(), research.save()]);
      res.json({ success: true, message: 'Removed', bookmarked: false, bookmarkCount: research.bookmarkCount });
    } else {
      user.bookmarks.push(research._id);
      research.bookmarkCount += 1;
      await Promise.all([user.save(), research.save()]);
      res.json({ success: true, message: 'Bookmarked', bookmarked: true, bookmarkCount: research.bookmarkCount });
    }
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/research/user/bookmarks
 * @desc    Get bookmarks
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
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const bookmarks = user.bookmarks.map(b => {
      const obj = b.toObject();
      if (obj.pdfUrl) obj.pdfUrl = getViewableCloudinaryUrl(obj.pdfUrl);
      if (obj.coverImage) obj.coverImage = getViewableCloudinaryUrl(obj.coverImage);
      return obj;
    });

    res.json({ success: true, bookmarks, count: bookmarks.length });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/research/user/submissions
 * @desc    Get user submissions
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

    const submissions = researches.map(r => {
      if (r.pdfUrl) r.pdfUrl = getViewableCloudinaryUrl(r.pdfUrl);
      if (r.coverImage) r.coverImage = getViewableCloudinaryUrl(r.coverImage);
      return r;
    });

    res.json({ success: true, submissions, count: submissions.length });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;