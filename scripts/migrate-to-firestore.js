#!/usr/bin/env node

/**
 * Migration script to upload gallery data to Firestore
 * Run this once to migrate from gallery-data.json to Firestore database
 */

const fs = require('fs');
const path = require('path');

async function migrateGalleryToFirestore() {
  try {
    console.log('🚀 Starting gallery migration to Firestore...');
    
    // Read the existing gallery data
    const galleryDataPath = path.resolve(__dirname, '..', 'data', 'gallery-data.json');
    
    if (!fs.existsSync(galleryDataPath)) {
      throw new Error('Gallery data file not found at: ' + galleryDataPath);
    }
    
    const galleryData = JSON.parse(fs.readFileSync(galleryDataPath, 'utf8'));
    console.log(`📊 Found ${galleryData.images?.length || 0} images to migrate`);
    
    // Call the Netlify function to upload the data
    const netlifyUrl = process.env.NETLIFY_URL || 'https://underdoglazer.com';
    const endpoint = `${netlifyUrl}/.netlify/functions/gallery-migrate`;
    
    console.log(`🌐 Uploading to: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'migrate',
        data: galleryData
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Migration completed successfully!');
      console.log(`📸 Migrated ${result.count || galleryData.images.length} images to Firestore`);
      console.log('🎉 Your gallery should now show all images');
    } else {
      throw new Error(result.error || 'Migration failed');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Alternative: Use the admin interface at /admin/gallery to manually upload images');
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  migrateGalleryToFirestore();
}

module.exports = { migrateGalleryToFirestore };