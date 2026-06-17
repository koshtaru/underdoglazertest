#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the existing gallery data
const galleryDataPath = path.join(__dirname, '..', 'data', 'gallery-data.json');
const galleryData = JSON.parse(fs.readFileSync(galleryDataPath, 'utf8'));

// Target directory for metadata files
const metadataDir = path.join(__dirname, '..', 'public', 'img', 'gallery');

// Ensure the directory exists
if (!fs.existsSync(metadataDir)) {
  console.error('Gallery directory does not exist:', metadataDir);
  process.exit(1);
}

// Process each image
galleryData.images.forEach(image => {
  // Extract filename from src path
  const filename = path.basename(image.src, '.jpg');
  const jsonFilename = `${filename}.json`;
  const jsonPath = path.join(metadataDir, jsonFilename);
  
  // Create metadata object (exclude src and id as they're redundant)
  const metadata = {
    title: image.title,
    alt: image.alt,
    description: image.description,
    materials: image.materials,
    technique: image.technique,
    category: image.category,
    uploadDate: image.uploadDate,
    fileSize: image.fileSize,
    dimensions: image.dimensions,
    visible: image.visible
  };
  
  // Write JSON file
  fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));
  console.log(`Created ${jsonFilename}`);
});

console.log(`\nSuccessfully created metadata files for ${galleryData.images.length} images`);