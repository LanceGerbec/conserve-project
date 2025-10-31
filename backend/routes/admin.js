// routes/admin.js - COMPLETE FILE WITH PDF FIX
const express = require('express');
const router = express.Router();
const Research = require('../models/Research');
const SubjectArea = require('../models/SubjectArea');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/email');

function getViewableCloudinaryUrl(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  let modifiedUrl = url;
  modifiedUrl = modifiedUrl.replace(/fl_attachment[,/]/g, '');
  
  if (!modifiedUrl.includes('fl_inline')) {
    if (modifiedUrl.includes('/upload/')) {
      modifiedUrl = modifiedUrl.replace('/upload/', '/upload/fl_inline/');
    } else {
      const separator = modifiedUrl.includes('?') ? '&' : '?';
      modifiedUrl = `${modifiedUrl}${separator}fl=inline`;
    }
  }
  
  return modifiedUrl;
}

// Public route - no auth required
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await SubjectArea.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add authentication for other routes
router.use(protect);
router.use(adminOnly);

// ✅ UPDATE: Get all research
router.get('/research/all', async (req, res) => {
  try {
    let researches = await Research.find({ isActive: true })
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName email')
      .sort({ submittedAt: -1 });

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
    console.error('Get all research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ UPDATE: Get pending research
router.get('/research/pending', async (req, res) => {
  try {
    let researches = await Research.find({ status: 'pending' })
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName email')
      .sort({ submittedAt: -1 });

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
    console.error('Get pending research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ⭐ UPDATED: Get pending research
router.get('/research/pending', async (req, res) => {
  try {
    let researches = await Research.find({ status: 'pending' })
      .populate('subjectArea', 'name')
      .populate('submittedBy', 'firstName lastName email')
      .sort({ submittedAt: -1 });

    // ✅ Convert URLs to viewable format
    researches = researches.map(r => {
      const obj = r.toObject();
      if (obj.pdfUrl) {
        obj.pdfUrl = getViewableCloudinaryUrl(obj.pdfUrl);
      }
      return obj;
    });

    res.json({ success: true, researches });
  } catch (error) {
    console.error('Get pending research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update research details
router.put('/research/:id', async (req, res) => {
  try {
    const { title, subjectArea, yearPublished } = req.body;

    const research = await Research.findById(req.params.id);
    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    // Update fields
    if (title) research.title = title;
    if (subjectArea) research.subjectArea = subjectArea;
    if (yearPublished) research.yearPublished = yearPublished;
    research.updatedAt = Date.now();

    await research.save();

    res.json({ 
      success: true, 
      message: 'Research updated successfully',
      research 
    });
  } catch (error) {
    console.error('Update research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve research
router.put('/research/:id/approve', async (req, res) => {
  try {
    const research = await Research.findById(req.params.id)
      .populate('submittedBy', 'email firstName lastName');

    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    research.status = 'approved';
    research.approvedAt = new Date();
    research.reviewedBy = req.user.id;
    await research.save();

    await SubjectArea.findByIdAndUpdate(
      research.subjectArea,
      { $inc: { researchCount: 1 } }
    );

    sendApprovalEmail(research.submittedBy.email, research.title);

    res.json({ 
      success: true, 
      message: 'Research approved',
      research 
    });
  } catch (error) {
    console.error('Approve research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject research
router.put('/research/:id/reject', async (req, res) => {
  try {
    const { reviewNotes } = req.body;

    const research = await Research.findById(req.params.id)
      .populate('submittedBy', 'email firstName lastName');

    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    research.status = 'rejected';
    research.reviewNotes = reviewNotes;
    research.reviewedBy = req.user.id;
    await research.save();

    sendRejectionEmail(
      research.submittedBy.email,
      research.title,
      reviewNotes || 'Please review and resubmit'
    );

    res.json({ 
      success: true, 
      message: 'Research rejected',
      research 
    });
  } catch (error) {
    console.error('Reject research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete research
router.delete('/research/:id', async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);

    if (!research) {
      return res.status(404).json({ message: 'Research not found' });
    }

    research.isActive = false;
    await research.save();

    if (research.status === 'approved') {
      await SubjectArea.findByIdAndUpdate(
        research.subjectArea,
        { $inc: { researchCount: -1 } }
      );
    }

    res.json({ 
      success: true, 
      message: 'Research deleted' 
    });
  } catch (error) {
    console.error('Delete research error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create subject
router.post('/subjects', async (req, res) => {
  try {
    const { name, description } = req.body;

    const existing = await SubjectArea.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Subject already exists' });
    }

    const subject = await SubjectArea.create({
      name,
      description,
      createdBy: req.user.id
    });

    res.status(201).json({ 
      success: true, 
      subject 
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subject
router.put('/subjects/:id', async (req, res) => {
  try {
    const { name, description } = req.body;

    const subject = await SubjectArea.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ success: true, subject });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete subject
router.delete('/subjects/:id', async (req, res) => {
  try {
    const subject = await SubjectArea.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const researchCount = await Research.countDocuments({ 
      subjectArea: req.params.id,
      isActive: true 
    });

    if (researchCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete. ${researchCount} research papers use this subject.` 
      });
    }

    await subject.deleteOne();

    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user status
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      success: true, 
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      user 
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// AUTHORIZED NUMBERS MANAGEMENT
// ==========================================

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const AuthorizedNumber = require('../models/AuthorizedNumber');

const uploadCSV = multer({ dest: 'uploads/temp/' });

// @route   POST /api/admin/authorized-numbers/bulk-upload
// @desc    Bulk upload authorized student numbers via CSV
// @access  Admin only
router.post('/authorized-numbers/bulk-upload', 
  protect, 
  adminOnly, 
  uploadCSV.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'No file uploaded' 
        });
      }

      const results = [];
      const errors = [];

      // Read CSV file
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          // Expected CSV format: studentNumber, type, firstName, lastName, program, yearLevel
          if (row.studentNumber && row.studentNumber.trim()) {
            results.push({
              studentNumber: row.studentNumber.trim().toUpperCase(),
              type: row.type || 'student',
              firstName: row.firstName || '',
              lastName: row.lastName || '',
              program: row.program || '',
              yearLevel: row.yearLevel || '',
              addedBy: req.user.id
            });
          }
        })
        .on('end', async () => {
          try {
            // Bulk insert with error handling
            const inserted = [];
            for (const record of results) {
              try {
                const existing = await AuthorizedNumber.findOne({ 
                  studentNumber: record.studentNumber 
                });

                if (!existing) {
                  const created = await AuthorizedNumber.create(record);
                  inserted.push(created);
                } else {
                  errors.push({
                    studentNumber: record.studentNumber,
                    reason: 'Already exists'
                  });
                }
              } catch (err) {
                errors.push({
                  studentNumber: record.studentNumber,
                  reason: err.message
                });
              }
            }

            // Clean up temp file
            fs.unlinkSync(req.file.path);

            res.json({
              success: true,
              message: `Uploaded ${inserted.length} authorized numbers`,
              data: {
                inserted: inserted.length,
                errors: errors.length,
                errorDetails: errors
              }
            });
          } catch (error) {
            console.error('Bulk insert error:', error);
            fs.unlinkSync(req.file.path);
            res.status(500).json({ 
              success: false,
              message: 'Error inserting records' 
            });
          }
        })
        .on('error', (error) => {
          console.error('CSV parsing error:', error);
          fs.unlinkSync(req.file.path);
          res.status(500).json({ 
            success: false,
            message: 'Error parsing CSV file' 
          });
        });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error during upload' 
      });
    }
  }
);

// @route   GET /api/admin/authorized-numbers
// @desc    Get all authorized numbers
// @access  Admin only
router.get('/authorized-numbers', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { studentNumber: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'used') {
      query.isUsed = true;
    } else if (status === 'unused') {
      query.isUsed = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [numbers, total] = await Promise.all([
      AuthorizedNumber.find(query)
        .populate('usedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuthorizedNumber.countDocuments(query)
    ]);

    res.json({
      success: true,
      numbers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get authorized numbers error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   POST /api/admin/authorized-numbers
// @desc    Add single authorized number
// @access  Admin only
router.post('/authorized-numbers', protect, adminOnly, async (req, res) => {
  try {
    const { studentNumber, type, firstName, lastName, program, yearLevel } = req.body;

    if (!studentNumber || !studentNumber.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Student number is required' 
      });
    }

    const normalized = studentNumber.trim().toUpperCase();

    const existing = await AuthorizedNumber.findOne({ 
      studentNumber: normalized 
    });

    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'This student number already exists' 
      });
    }

    const authorized = await AuthorizedNumber.create({
      studentNumber: normalized,
      type: type || 'student',
      firstName,
      lastName,
      program,
      yearLevel,
      addedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Authorized number added successfully',
      number: authorized
    });
  } catch (error) {
    console.error('Add authorized number error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/admin/authorized-numbers/:id
// @desc    Delete authorized number
// @access  Admin only
router.delete('/authorized-numbers/:id', protect, adminOnly, async (req, res) => {
  try {
    const authorized = await AuthorizedNumber.findById(req.params.id);

    if (!authorized) {
      return res.status(404).json({ 
        success: false,
        message: 'Authorized number not found' 
      });
    }

    if (authorized.isUsed) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete a number that has been used' 
      });
    }

    await authorized.deleteOne();

    res.json({
      success: true,
      message: 'Authorized number deleted successfully'
    });
  } catch (error) {
    console.error('Delete authorized number error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/admin/authorized-numbers/stats
// @desc    Get statistics
// @access  Admin only
router.get('/authorized-numbers/stats', protect, adminOnly, async (req, res) => {
  try {
    const [total, used, unused, byType] = await Promise.all([
      AuthorizedNumber.countDocuments(),
      AuthorizedNumber.countDocuments({ isUsed: true }),
      AuthorizedNumber.countDocuments({ isUsed: false }),
      AuthorizedNumber.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        total,
        used,
        unused,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;