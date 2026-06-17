const { getFirestore, verifyAuthToken } = require('./firebase-admin');

// Firestore collection and document references
const GALLERY_COLLECTION = 'gallery';
const GALLERY_DOC = 'data';

exports.handler = async (event, context) => {
  console.log('Gallery MIGRATE function called');
  
  // Handle CORS
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Require a valid admin Firebase ID token. This endpoint writes to
    // Firestore via the Admin SDK, which bypasses security rules, so it must
    // enforce authentication itself.
    await verifyAuthToken(event.headers.authorization);

    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { action, data } = requestBody;

    if (action !== 'migrate' || !data) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid migration request. Expected action=migrate and data object.' })
      };
    }

    console.log(`Migrating ${data.images?.length || 0} images to Firestore...`);

    // Prepare data for Firestore
    const firestoreData = {
      images: data.images || [],
      metadata: {
        ...data.metadata,
        lastModified: Date.now(),
        migratedAt: new Date().toISOString(),
        version: data.metadata?.version || "1.0.0"
      }
    };

    // Write to Firestore
    const db = getFirestore();
    await db.collection(GALLERY_COLLECTION).doc(GALLERY_DOC).set(firestoreData, { merge: false });

    console.log(`Successfully migrated ${data.images.length} images to Firestore`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Gallery data migrated successfully',
        count: data.images.length,
        migratedAt: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Gallery MIGRATE error:', error);
    
    // Provide specific error messages for common Firebase issues
    let errorMessage = 'Failed to migrate gallery data';
    let statusCode = 500;

    if (error.statusCode === 401) {
      errorMessage = 'Unauthorized';
      statusCode = 401;
    } else if (error.message.includes('Firebase Admin credentials not configured')) {
      errorMessage = 'Firebase Admin SDK not configured properly.';
      statusCode = 503;
    } else if (error.message.includes('PERMISSION_DENIED')) {
      errorMessage = 'Firestore write permission denied.';
      statusCode = 403;
    }
    
    return {
      statusCode,
      headers,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        message: error.message
      })
    };
  }
};