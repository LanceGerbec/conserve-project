// server.js - ADD THIS LINE
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const researchRoutes = require('./routes/research');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const teamRoutes = require('./routes/team'); // ADD THIS LINE

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// CORS Configuration - FIXED
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL,
      'https://conserve-frontend.vercel.app',
      'https://conserve-backend.vercel.app'
    ].filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:3001'];

console.log('🌐 Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// Security
app.use(helmet({ 
  crossOriginResourcePolicy: false 
}));

// Body parsing
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' })); 

// Logging
app.use(morgan('dev')); 

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Create uploads directory
//const uploadsDir = path.join(__dirname, 'uploads');
//if (!fs.existsSync(uploadsDir)) {
//  fs.mkdirSync(uploadsDir, { recursive: true });
 console.log('📁 Created uploads directory');
//}

// Serve uploaded files
//app.use('/uploads', express.static(uploadsDir));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/team', teamRoutes); // ADD THIS LINE

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ConServe API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      research: '/api/research',
      admin: '/api/admin',
      analytics: '/api/analytics',
      team: '/api/team'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasEmailUser: !!process.env.EMAIL_USER,
      hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 ConServe Backend Server');
  console.log('='.repeat(50));
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`💾 Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '⏳ Connecting...'}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});