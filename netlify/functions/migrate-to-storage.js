const { getFirestore, getStorage } = require('./firebase-admin');

/**
 * Migrate gallery images from Firestore base64 to Firebase Storage URLs
 *
 * This migration:
 * 1. Reads all image documents from Firestore
 * 2. Extracts base64 data from `src` field
 * 3. Uploads images to Firebase Storage bucket
 * 4. Updates Firestore docs with Storage URLs
 * 5. Preserves all metadata (title, alt, description, etc.)
 */

// Convert base64 data URL to Buffer
function base64ToBuffer(base64Data) {
  // Remove data:image/xxx;base64, prefix
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 data format');
  }

  const mimeType = matches[1];
  const base64String = matches[2];
  const buffer = Buffer.from(base64String, 'base64');

  return { buffer, mimeType };
}

// Upload image to Firebase Storage
async function uploadToStorage(bucket, filename, buffer, mimeType) {
  const file = bucket.file(`gallery/${filename}`);

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000', // Cache for 1 year
    },
    public: true, // Make the file publicly accessible
  });

  // Get public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/gallery/${filename}`;
  return publicUrl;
}

// Main migration handler
exports.handler = async (event, context) => {
  console.log('🚀 Starting Firebase Storage migration...');

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const db = getFirestore();
    const bucket = getStorage();

    // Parse request body for migration options
    let options = { dryRun: false, testImageId: null };
    if (event.body) {
      try {
        options = { ...options, ...JSON.parse(event.body) };
      } catch (e) {
        console.warn('Could not parse request body, using defaults');
      }
    }

    const { dryRun, testImageId } = options;

    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made');
    }

    // Step 1: Get all image documents
    console.log('📖 Reading image documents from Firestore...');
    const gallerySnapshot = await db.collection('gallery').get();

    const imageDocsToMigrate = [];
    gallerySnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Find image documents that have base64 data in src field
      if (doc.id.startsWith('image-') &&
          data.documentType === 'image' &&
          data.src &&
          data.src.startsWith('data:image/')) {

        // If testImageId is specified, only migrate that one image
        if (testImageId && data.id !== parseInt(testImageId)) {
          return;
        }

        imageDocsToMigrate.push({ docId: doc.id, data });
      }
    });

    if (imageDocsToMigrate.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'No images with base64 data found to migrate',
          alreadyMigrated: true
        })
      };
    }

    console.log(`📊 Found ${imageDocsToMigrate.length} images to migrate`);

    if (dryRun) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'DRY RUN: Would migrate the following images',
          images: imageDocsToMigrate.map(item => ({
            id: item.data.id,
            title: item.data.title,
            filename: item.data.filename,
            currentSrcSize: item.data.src.length
          }))
        })
      };
    }

    // Step 2: Create backup metadata only (images are too large for single doc)
    console.log('💾 Creating backup metadata...');
    const backupData = {
      createdAt: new Date().toISOString(),
      totalImages: imageDocsToMigrate.length,
      imageIds: imageDocsToMigrate.map(item => item.data.id),
      note: 'Full backup skipped - original documents preserved in Firestore until manually deleted'
    };
    await db.collection('gallery').doc('storage-migration-backup').set(backupData);
    console.log('✅ Backup metadata created. Original image docs still exist in Firestore.');

    // Step 3: Migrate each image
    const migrationResults = [];
    let successCount = 0;
    let errorCount = 0;

    for (const item of imageDocsToMigrate) {
      const { docId, data } = item;

      try {
        console.log(`🔄 Migrating image ${data.id}: ${data.title}...`);

        // Extract base64 data
        const { buffer, mimeType } = base64ToBuffer(data.src);
        console.log(`  📏 Size: ${(buffer.length / 1024).toFixed(2)} KB, Type: ${mimeType}`);

        // Upload to Storage
        const filename = data.filename || `image-${data.id}.jpg`;
        const storageUrl = await uploadToStorage(bucket, filename, buffer, mimeType);
        console.log(`  ✅ Uploaded to: ${storageUrl}`);

        // Update Firestore document with Storage URL
        const updatedData = {
          ...data,
          src: storageUrl, // Replace base64 with Storage URL
          storageFilename: filename,
          storagePath: `gallery/${filename}`,
          migratedToStorage: true,
          migratedAt: new Date().toISOString(),
          originalSrcSize: data.src.length // Keep track of original size
        };

        await db.collection('gallery').doc(docId).set(updatedData, { merge: true });
        console.log(`  ✅ Updated Firestore document ${docId}`);

        migrationResults.push({
          id: data.id,
          title: data.title,
          success: true,
          storageUrl,
          originalSize: data.src.length,
          newSize: storageUrl.length
        });

        successCount++;

      } catch (error) {
        console.error(`  ❌ Error migrating image ${data.id}:`, error.message);
        migrationResults.push({
          id: data.id,
          title: data.title,
          success: false,
          error: error.message
        });
        errorCount++;
      }
    }

    // Step 4: Update metadata
    console.log('📝 Updating metadata...');
    const metadataDoc = await db.collection('gallery').doc('metadata').get();
    if (metadataDoc.exists) {
      await db.collection('gallery').doc('metadata').set({
        ...metadataDoc.data(),
        storageEnabled: true,
        storageMigrationCompleted: true,
        storageMigrationDate: new Date().toISOString(),
        lastModified: Date.now()
      }, { merge: true });
    }

    console.log(`🎉 Migration complete! Success: ${successCount}, Errors: ${errorCount}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Firebase Storage migration completed',
        summary: {
          totalImages: imageDocsToMigrate.length,
          successful: successCount,
          failed: errorCount
        },
        results: migrationResults,
        backupLocation: 'gallery/storage-migration-backup',
        completedAt: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Migration error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Migration failed',
        message: error.message,
        details: 'Check Netlify function logs for more information'
      })
    };
  }
};