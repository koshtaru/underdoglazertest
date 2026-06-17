const { getFirestore, verifyAuthToken } = require('./firebase-admin');

const GALLERY_COLLECTION = 'gallery';
const GALLERY_DOC = 'data';
const METADATA_DOC = 'metadata';
const IMAGES_COLLECTION = 'images';

exports.handler = async (event, context) => {
  console.log('🚀 Starting Firestore migration from single document to individual documents...');
  
  // Set CORS headers
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://underdoglazer.com';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Require a valid admin Firebase ID token. This endpoint writes to Firestore
    // via the Admin SDK (which bypasses security rules), so it must enforce
    // authentication itself.
    await verifyAuthToken(event.headers.authorization);

    const db = getFirestore();
    
    // Step 1: Check if migration is already done
    const metadataDoc = await db.collection(GALLERY_COLLECTION).doc(METADATA_DOC).get();
    if (metadataDoc.exists) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Migration already completed',
          structure: 'individual-documents',
          migratedAt: metadataDoc.data().migratedAt
        })
      };
    }

    // Step 2: Read the large single document
    console.log('📖 Reading gallery data from single document...');
    const galleryDoc = await db.collection(GALLERY_COLLECTION).doc(GALLERY_DOC).get();
    
    if (!galleryDoc.exists) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No gallery data found to migrate'
        })
      };
    }

    const data = galleryDoc.data();
    const images = data.images || [];
    
    console.log(`📊 Found ${images.length} images to migrate`);

    // Step 3: Create backup of original document
    console.log('💾 Creating backup of original document...');
    await db.collection(GALLERY_COLLECTION).doc('data-backup-v1').set(data);
    console.log('✅ Backup created as data-backup-v1');

    // Step 4: Create metadata document
    console.log('📝 Creating metadata document...');
    const metadata = {
      lastModified: Date.now(),
      totalImages: images.length,
      version: "2.0.0",
      migratedAt: new Date().toISOString(),
      originalDocumentSize: JSON.stringify(data).length
    };
    await db.collection(GALLERY_COLLECTION).doc(METADATA_DOC).set(metadata);

    // Step 5: Migrate each image to individual documents
    console.log('🔄 Migrating images to individual documents...');
    const batch = db.batch();
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const imageRef = db.collection(GALLERY_COLLECTION).collection(IMAGES_COLLECTION).doc(`image-${image.id || i}`);
      batch.set(imageRef, {
        ...image,
        migratedAt: new Date().toISOString(),
        documentId: `image-${image.id || i}`
      });
      
      if (i % 100 === 0) {
        console.log(`📤 Processed ${i + 1}/${images.length} images...`);
      }
    }
    
    await batch.commit();
    console.log(`✅ Successfully migrated ${images.length} images to individual documents`);

    // Step 6: Delete the original large document (optional - commented for safety)
    // await db.collection(GALLERY_COLLECTION).doc(GALLERY_DOC).delete();
    // console.log('🗑️ Original document deleted');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Gallery data migrated successfully to individual documents',
        migrated: {
          images: images.length,
          structure: 'individual-documents',
          metadataPath: `${GALLERY_COLLECTION}/${METADATA_DOC}`,
          imagesPath: `${GALLERY_COLLECTION}/${IMAGES_COLLECTION}/*`,
          originalSize: JSON.stringify(data).length,
          backupCreated: 'data-backup-v1'
        },
        note: 'Original document backed up as data-backup-v1. You can delete it after verifying the migration works.',
        migratedAt: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Migration error:', error);
    
    let errorMessage = 'Failed to migrate gallery data';
    let statusCode = 500;

    if (error.statusCode === 401) {
      errorMessage = 'Unauthorized';
      statusCode = 401;
    } else if (error.message.includes('Firebase Admin credentials not configured')) {
      errorMessage = 'Firebase Admin SDK not configured properly';
      statusCode = 503;
    } else if (error.message.includes('PERMISSION_DENIED')) {
      errorMessage = 'Firestore write permission denied';
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

