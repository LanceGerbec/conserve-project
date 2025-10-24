// routes/research.js - COMPLETE FIX
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Research = require('../models/Research');
const SubjectArea = require('../models/SubjectArea');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { fuzzySearch } = require('../utils/fuzzySearch');
const mongoose = require('mongoose');

// Get all approved research
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Get popular research
router.get('/popular', async (req, res) => {
  try {
    const researches = await Research.find({ 
      status: 'approved', 
      isActive: true 
    })
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName')
      .sort({ viewCount: -1 })
      .limit(6);

    res.json({ success: true, researches });
  } catch (error) {
    console.error('Get popular research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent research
router.get('/recent', async (req, res) => {
  try {
    const researches = await Research.find({ 
      status: 'approved', 
      isActive: true 
    })
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName')
      .sort({ approvedAt: -1 })
      .limit(6);

    res.json({ success: true, researches });
  } catch (error) {
    console.error('Get recent research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single research by ID
router.get('/:id', async (req, res) => {
  try {
    const research = await Research.findById(req.params.id)
      .populate('subjectArea', 'name description')
      .populate('submittedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName');

    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    research.viewCount += 1;
    await research.save();

    await Analytics.create({
      type: 'research_view',
      research: research._id,
      metadata: { title: research.title }
    });

    res.json({ success: true, research });
  } catch (error) {
    console.error('Get research by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit new research - FIXED VERSION
router.post('/submit', 
  protect,
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('📥 Received submission request');
      console.log('Body:', req.body);
      console.log('Files:', req.files);
      
      // Manual validation with better error messages
      const errors = [];

      if (!req.body.title || !req.body.title.trim()) {
        errors.push({ field: 'title', message: 'Title is required' });
      }

      if (!req.body.abstract || !req.body.abstract.trim()) {
        errors.push({ field: 'abstract', message: 'Abstract is required' });
      }

      if (!req.body.subjectArea || !req.body.subjectArea.trim()) {
        errors.push({ field: 'subjectArea', message: 'Subject area is required' });
      } else {
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.body.subjectArea)) {
          errors.push({ field: 'subjectArea', message: 'Invalid subject area ID' });
        }
      }

      if (!req.body.yearPublished) {
        errors.push({ field: 'yearPublished', message: 'Year published is required' });
      } else {
        const year = parseInt(req.body.yearPublished);
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
          errors.push({ field: 'yearPublished', message: 'Invalid year' });
        }
      }

      // Parse and validate authors
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

      // Parse and validate keywords
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

      // Check PDF file
      if (!req.files || !req.files.pdf || !req.files.pdf[0]) {
        errors.push({ field: 'pdf', message: 'PDF file is required' });
      }

      // If there are validation errors, return them
      if (errors.length > 0) {
        console.log('❌ Validation errors:', errors);
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: errors 
        });
      }

      // All validations passed, create research
      const { title, abstract, subjectArea, yearPublished } = req.body;

      // Clean authors and keywords
      const cleanAuthors = authors.filter(a => a.name && a.name.trim());
      const cleanKeywords = keywords.filter(k => k && k.trim());

      console.log('✅ Creating research document...');

      const research = await Research.create({
        title: title.trim(),
        abstract: abstract.trim(),
        authors: cleanAuthors,
        keywords: cleanKeywords,
        subjectArea: subjectArea,
        yearPublished: parseInt(yearPublished),
        pdfUrl: `/uploads/${req.files.pdf[0].filename}`,
        coverImage: req.files.coverImage ? `/uploads/${req.files.coverImage[0].filename}` : null,
        submittedBy: req.user.id,
        status: 'pending'
      });

      console.log('✅ Research created successfully:', research._id);

      res.status(201).json({
        success: true,
        message: 'Research submitted successfully and is pending approval',
        research
      });

    } catch (error) {
      console.error('❌ Submit research error:', error);
      
      // Handle specific MongoDB errors
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
        error: error.message 
      });
    }
  }
);

// Bookmark research
router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    const user = await User.findById(req.user.id);
    const bookmarkIndex = user.bookmarks.indexOf(research._id);

    if (bookmarkIndex > -1) {
      user.bookmarks.splice(bookmarkIndex, 1);
      research.bookmarkCount -= 1;
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Track download
router.get('/:id/download', async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user bookmarks
router.get('/user/bookmarks', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'bookmarks',
        populate: { path: 'subjectArea', select: 'name' }
      });

    res.json({ 
      success: true, 
      bookmarks: user.bookmarks 
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;