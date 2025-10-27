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

// ✅ IMPROVED: Better Cloudinary URL modification for viewing
function getViewableCloudinaryUrl(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  // Remove any existing fl_attachment parameters (including fl_attachment:false)
  let modifiedUrl = url.replace(/\/fl_attachment[^\/]*\//g, '/');
  
  // For viewing in browser, we need to add fl_attachment=false as a query parameter
  // or use inline transformation parameter
  if (modifiedUrl.includes('cloudinary.com')) {
    // Add inline display flag
    if (modifiedUrl.includes('/upload/')) {
      // Add flags parameter to force inline display
      modifiedUrl = modifiedUrl.replace('/upload/', '/upload/fl_inline/');
    }
  }
  
  return modifiedUrl;
}

// ====================================
// PUBLIC ROUTES (No authentication)
// ====================================

// Get all approved research with filters and pagination
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

    let query = { status: 'approved', isActive: true };

    if (subjectArea) query.subjectArea = subjectArea;
    if (year) query.yearPublished = parseInt(year);
    if (author) {
      query['authors.name'] = { $regex: author, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { viewCount: -1 };
        break;
      case 'recent':
        sortOption = { approvedAt: -1 };
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
      .limit(parseInt(limit));

    if (search && search.trim()) {
      researches = fuzzySearch(search, researches);
    }

    // ✅ Convert URLs to viewable format
    researches = researches.map(r => {
      const obj = r.toObject();
      if (obj.pdfUrl) {
        obj.pdfUrl = getViewableCloudinaryUrl(obj.pdfUrl);
      }
      return obj;
    });

    const total = await Research.countDocuments(query);

    res.json({
      success: true,
      researches,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get research error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching research' 
    });
  }
});

// Get popular research
router.get('/popular', async (req, res) => {
  try {
    let researches = await Research.find({ 
      status: 'approved', 
      isActive: true 
    })
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName')
      .sort({ viewCount: -1 })
      .limit(6);

    // ✅ Convert URLs
    researches = researches.map(r => {
      const obj = r.toObject();
      if (obj.pdfUrl) {
        obj.pdfUrl = getViewableCloudinaryUrl(obj.pdfUrl);
      }
      return obj;
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

// Get recent research
router.get('/recent', async (req, res) => {
  try {
    let researches = await Research.find({ 
      status: 'approved', 
      isActive: true 
    })
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName')
      .sort({ approvedAt: -1 })
      .limit(6);

    // ✅ Convert URLs
    researches = researches.map(r => {
      const obj = r.toObject();
      if (obj.pdfUrl) {
        obj.pdfUrl = getViewableCloudinaryUrl(obj.pdfUrl);
      }
      return obj;
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

// ✅ FIXED: Get single research by ID
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
      .populate('reviewedBy', 'firstName lastName');

    if (!research) {
      return res.status(404).json({ 
        success: false,
        message: 'Research not found' 
      });
    }

    // Increment view count
    research.viewCount += 1;
    await research.save();

    // Log analytics
    await Analytics.create({
      type: 'research_view',
      research: research._id,
      metadata: { title: research.title }
    });

    // ✅ Convert PDF URL to viewable format
    const researchData = research.toObject();
    if (researchData.pdfUrl) {
      researchData.pdfUrl = getViewableCloudinaryUrl(researchData.pdfUrl);
    }

    res.json({ success: true, research: researchData });
  } catch (error) {
    console.error('Get research by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// ====================================
// PROTECTED ROUTES (Requires login)
// ====================================

// Submit new research
router.post('/submit', 
  protect,
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const errors = [];

      if (!req.body.title || !req.body.title.trim()) {
        errors.push({ field: 'title', message: 'Title is required' });
      }

      if (!req.body.abstract || !req.body.abstract.trim()) {
        errors.push({ field: 'abstract', message: 'Abstract is required' });
      }

      if (!req.body.subjectArea || !req.body.subjectArea.trim()) {
        errors.push({ field: 'subjectArea', message: 'Subject area is required' });
      } else if (!mongoose.Types.ObjectId.isValid(req.body.subjectArea)) {
        errors.push({ field: 'subjectArea', message: 'Invalid subject area ID' });
      }

      if (!req.body.yearPublished) {
        errors.push({ field: 'yearPublished', message: 'Year published is required' });
      } else {
        const year = parseInt(req.body.yearPublished);
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
          errors.push({ field: 'yearPublished', message: 'Invalid year' });
        }
      }

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
        errors.push({ field: 'authors', message: 'Invalid authors format' });
      }

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
            errors.push({ field: 'keywords', message: 'At least one keyword is required' });
          }
        }
      } catch (e) {
        errors.push({ field: 'keywords', message: 'Invalid keywords format' });
      }

      if (!req.files || !req.files.pdf || !req.files.pdf[0]) {
        errors.push({ field: 'pdf', message: 'PDF file is required' });
      }

      if (errors.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: errors 
        });
      }

      const { title, abstract, subjectArea, yearPublished } = req.body;

      const cleanAuthors = authors.filter(a => a.name && a.name.trim());
      const cleanKeywords = keywords.filter(k => k && k.trim());

      const research = await Research.create({
        title: title.trim(),
        abstract: abstract.trim(),
        authors: cleanAuthors,
        keywords: cleanKeywords,
        subjectArea: subjectArea,
        yearPublished: parseInt(yearPublished),
        pdfUrl: req.files.pdf[0].path,
        coverImage: req.files.coverImage ? req.files.coverImage[0].path : null,
        submittedBy: req.user.id,
        status: 'pending'
      });

      res.status(201).json({
        success: true,
        message: 'Research submitted successfully and is pending approval',
        research: {
          _id: research._id,
          title: research.title,
          status: research.status,
          pdfUrl: research.pdfUrl,
          coverImage: research.coverImage
        }
      });

    } catch (error) {
      console.error('Submit research error:', error);
      
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

      res.status(500).json({ 
        success: false,
        message: 'Server error while submitting research',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Bookmark/unbookmark research
router.post('/:id/bookmark', protect, async (req, res) => {
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

    const user = await User.findById(req.user.id);
    const bookmarkIndex = user.bookmarks.indexOf(research._id);

    if (bookmarkIndex > -1) {
      user.bookmarks.splice(bookmarkIndex, 1);
      research.bookmarkCount = Math.max(0, research.bookmarkCount - 1);
      await user.save();
      await research.save();

      res.json({ 
        success: true, 
        message: 'Bookmark removed',
        bookmarked: false 
      });
    } else {
      user.bookmarks.push(research._id);
      research.bookmarkCount += 1;
      await user.save();
      await research.save();

      res.json({ 
        success: true, 
        message: 'Research bookmarked',
        bookmarked: true 
      });
    }
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Track download and return PDF URL
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

    research.downloadCount += 1;
    await research.save();

    await Analytics.create({
      type: 'download',
      research: research._id
    });

    res.json({ 
      success: true, 
      downloadUrl: research.pdfUrl
    });
  } catch (error) {
    console.error('Download tracking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get user's bookmarks
router.get('/user/bookmarks', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'bookmarks',
        match: { isActive: true },
        populate: { path: 'subjectArea', select: 'name' }
      });

    // ✅ Convert URLs
    const bookmarks = user.bookmarks.map(b => {
      const obj = b.toObject();
      if (obj.pdfUrl) {
        obj.pdfUrl = getViewableCloudinaryUrl(obj.pdfUrl);
      }
      return obj;
    });

    res.json({ 
      success: true, 
      bookmarks 
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;
