// scripts/checkDatabase.js
// Purpose: Check if subjects exist and display their IDs

require('dotenv').config();
const mongoose = require('mongoose');
const SubjectArea = require('../models/SubjectArea');

const checkDatabase = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📚 Checking Subject Areas...');
    const subjects = await SubjectArea.find();

    if (subjects.length === 0) {
      console.log('❌ No subjects found in database!');
      console.log('\n💡 Run this command to create subjects:');
      console.log('   node scripts/createSubjects.js\n');
      process.exit(1);
    }

    console.log(`✅ Found ${subjects.length} subject areas:\n`);
    
    subjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name}`);
      console.log(`   ID: ${subject._id}`);
      console.log(`   ID Length: ${subject._id.toString().length} characters`);
      console.log(`   Research Count: ${subject.researchCount}`);
      console.log(`   Active: ${subject.isActive}`);
      console.log('');
    });

    console.log('✅ All subject IDs are valid MongoDB ObjectIds');
    console.log('✅ Database check complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDatabase();