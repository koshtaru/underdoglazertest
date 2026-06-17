const { getFirestore } = require('./firebase-admin');

// Firestore collection and document references
const GALLERY_COLLECTION = 'gallery';
const GALLERY_DOC = 'data';
const IMAGES_COLLECTION = 'images';
const METADATA_DOC = 'metadata';

exports.handler = async (event, context) => {
  console.log('Gallery MIGRATE V2 function called - migrating to individual documents');

  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const db = getFirestore();

    // Step 1: Read existing data from single document
    console.log('Reading existing gallery data from single document...');
    const galleryDoc = await db.collection(GALLERY_COLLECTION).doc(GALLERY_DOC).get();

    if (!galleryDoc.exists) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No existing gallery data found to migrate' })
      };
    }

    const existingData = galleryDoc.data();
    const images = existingData.images || [];

    console.log(`Found ${images.length} images to migrate`);

    // Step 2: Create metadata document
    const metadata = {
      totalImages: images.length,
      lastModified: Date.now(),
      migratedAt: new Date().toISOString(),
      version: "2.0.0",
      migrationSource: "single-document-v1"
    };

    await db.collection(GALLERY_COLLECTION).doc(METADATA_DOC).set(metadata);
    console.log('Metadata document created');

    // Step 3: Create individual image documents (as separate docs in gallery collection)
    const batch = db.batch();

    for (const image of images) {
      const imageDoc = db.collection(GALLERY_COLLECTION).doc(`image-${image.id}`);
      batch.set(imageDoc, {
        ...image,
        migratedAt: new Date().toISOString(),
        documentType: 'image' // Mark as image document
      });
    }

    // Execute batch write
    await batch.commit();
    console.log(`Successfully migrated ${images.length} images to individual documents`);

    // Step 4: Create backup of old document before deletion
    const backupDoc = db.collection(GALLERY_COLLECTION).doc('data-backup-v1');
    await backupDoc.set({
      ...existingData,
      backedUpAt: new Date().toISOString(),
      note: 'Backup of original single document before migration to v2'
    });
    console.log('Backup of original document created');

    // Step 5: Delete old document (commented out for safety - can be done manually)
    // await db.collection(GALLERY_COLLECTION).doc(GALLERY_DOC).delete();
    // console.log('Original single document deleted');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Gallery data migrated to individual documents successfully',
        migrated: {
          images: images.length,
          structure: 'individual-documents',
          metadataPath: `${GALLERY_COLLECTION}/${METADATA_DOC}`,
          imagesPath: `${GALLERY_COLLECTION}/image-*`
        },
        note: 'Original document backed up as data-backup-v1',
        migratedAt: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Gallery MIGRATE V2 error:', error);

    let errorMessage = 'Failed to migrate gallery data to individual documents';
    let statusCode = 500;

    if (error.message.includes('Firebase Admin credentials not configured')) {
      errorMessage = 'Firebase Admin SDK not configured properly.';
      statusCode = 503;
    } else if (error.message.includes('PERMISSION_DENIED')) {
      errorMessage = 'Firestore write permission denied.';
      statusCode = 403;
    } else if (error.message.includes('exceeds the maximum allowed size')) {
      errorMessage = 'Document size exceeds Firestore limit. Migration is required.';
      statusCode = 413;
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        message: error.message,
        details: 'Check Netlify function logs for more information'
      })
    };
  }
};