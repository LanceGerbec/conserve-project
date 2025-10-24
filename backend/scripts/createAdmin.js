// scripts/createAdmin.js
// Purpose: Create initial admin account (run once)

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin account already exists');
      process.exit(0);
    }

    // Create admin account
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'ConServe',
      email: 'admin@conserve.com',
      password: 'Admin@123', // Change this password after first login!
      role: 'admin',
      department: 'College of Nursing'
    });

    console.log('✅ Admin account created successfully');
    console.log('📧 Email: admin@conserve.com');
    console.log('🔑 Password: Admin@123');
    console.log('⚠️ IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();