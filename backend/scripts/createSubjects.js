// scripts/createSubjects.js
require('dotenv').config();
const mongoose = require('mongoose');
const SubjectArea = require('../models/SubjectArea');

const subjects = [
  {
    name: 'Geriatric Nursing',
    description: 'Nursing care for elderly patients and age-related health issues'
  },
  {
    name: 'Pediatric Nursing',
    description: 'Nursing care for children, infants, and adolescents'
  },
  {
    name: 'Community Health Nursing',
    description: 'Public health and community-based healthcare'
  },
  {
    name: 'Medical-Surgical Nursing',
    description: 'Care for patients with medical and surgical conditions'
  },
  {
    name: 'Maternal and Child Health Nursing',
    description: 'Care for mothers, infants, and children'
  },
  {
    name: 'Psychiatric Nursing',
    description: 'Mental health and psychiatric care'
  },
  {
    name: 'Emergency Nursing',
    description: 'Emergency and trauma care nursing'
  },
  {
    name: 'Critical Care Nursing',
    description: 'Intensive care unit nursing'
  },
  {
    name: 'Nursing Education',
    description: 'Teaching and educational research in nursing'
  },
  {
    name: 'Nursing Administration',
    description: 'Healthcare management and administration'
  }
];

const createSubjects = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing subjects
    await SubjectArea.deleteMany({});
    console.log('🗑️  Cleared existing subjects');

    // Create new subjects
    const created = await SubjectArea.insertMany(subjects);
    console.log('✅ Created subject areas');
    console.log(`📚 Total subjects: ${created.length}`);
    
    created.forEach((subject, index) => {
      console.log(`   ${index + 1}. ${subject.name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createSubjects();