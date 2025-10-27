// middleware/cloudinaryUpload.js - FIXED VERSION
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test Cloudinary connection
cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary connected successfully'))
  .catch(err => console.error('❌ Cloudinary connection failed:', err.message));

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder and resource type based on file type
    let folder = 'conserve-uploads';
    let resourceType = 'auto'; // Let Cloudinary auto-detect
    let allowedFormats = ['pdf', 'jpg', 'jpeg', 'png'];

    // PDF files
    if (file.mimetype === 'application/pdf') {
      folder = 'conserve-uploads/pdfs';
      resourceType = 'raw'; // PDFs are stored as 'raw' type
      allowedFormats = ['pdf'];
    }
    // Image files
    else if (file.mimetype.startsWith('image/')) {
      folder = 'conserve-uploads/images';
      resourceType = 'image';
      allowedFormats = ['jpg', 'jpeg', 'png', 'gif'];
    }

    return {
      folder: folder,
      resource_type: resourceType,
      allowed_formats: allowedFormats,
      // Generate unique filename with timestamp
      public_id: `${file.fieldname}_${Date.now()}`
    };
  }
});

// Configure multer with Cloudinary storage
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDFs and images
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF and image files are allowed.`), false);
    }
  }
});

// Export both upload middleware and cloudinary instance
module.exports = upload;
module.exports.cloudinary = cloudinary;