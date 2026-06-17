#!/usr/bin/env node

/**
 * Script to initialize Firestore with gallery data from the local JSON file
 * Run this once to migrate existing data to Firestore
 */

const fs = require('fs');
const path = require('path');

// This script simulates the Netlify environment setup
// In practice, you would run this with proper Firebase Admin credentials

async function initializeFirestore() {
  try {
    // Read the existing gallery data
    const galleryDataPath = path.resolve(__dirname, '..', 'data', 'gallery-data.json');
    
    if (!fs.existsSync(galleryDataPath)) {
      console.error('Gallery data file not found at:', galleryDataPath);
      console.log('Please ensure data/gallery-data.json exists');
      process.exit(1);
    }
    
    const galleryData = JSON.parse(fs.readFileSync(galleryDataPath, 'utf8'));
    console.log(`Found ${galleryData.images?.length || 0} images in gallery data`);
    
    // For now, just show what would be uploaded
    console.log('\nData that would be uploaded to Firestore:');
    console.log('Collection: gallery');
    console.log('Document: data');
    console.log('Structure:');
    console.log({
      images: `Array of ${galleryData.images?.length || 0} images`,
      metadata: galleryData.metadata
    });
    
    console.log('\nTo actually initialize Firestore:');
    console.log('1. Set up Firebase Admin credentials in Netlify environment');
    console.log('2. Add GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable');
    console.log('3. Deploy the functions and they will auto-initialize with fallback data');
    console.log('4. Use the admin interface to add/edit images');
    
    console.log('\nFirestore structure will be:');
    console.log('gallery/data -> { images: [...], metadata: {...} }');
    
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeFirestore();
}

module.exports = { initializeFirestore };