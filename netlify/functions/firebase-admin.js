const admin = require('firebase-admin');

// Initialize Firebase Admin SDK only once
let app;

function initializeFirebase() {
  if (admin.apps.length === 0) {
    console.log('Initializing Firebase Admin SDK...');
    
    // Get credentials from environment variable
    const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    if (!serviceAccountJson) {
      console.error('Firebase Admin Error: GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set');
      console.error('Please add your Firebase service account JSON to Netlify environment variables');
      throw new Error('Firebase Admin credentials not configured. Please set GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.');
    }
    
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
      console.log(`Firebase service account loaded: ${serviceAccount.client_email}`);
    } catch (error) {
      console.error('Firebase Admin Error: Invalid JSON in GOOGLE_APPLICATION_CREDENTIALS_JSON');
      console.error('Error details:', error.message);
      throw new Error('Invalid Firebase service account JSON: ' + error.message);
    }
    
    // Verify required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      console.error('Firebase Admin Error: Service account JSON missing required fields');
      console.error('Required fields: project_id, private_key, client_email');
      throw new Error('Firebase service account JSON is missing required fields');
    }
    
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
        storageBucket: 'lazerengraving-deb21.firebasestorage.app'
      });

      console.log(`Firebase Admin SDK initialized successfully for project: ${serviceAccount.project_id}`);
      console.log(`Service account: ${serviceAccount.client_email}`);
      console.log(`Storage bucket: lazerengraving-deb21.firebasestorage.app`);
    } catch (error) {
      console.error('Firebase Admin Error: Failed to initialize Firebase Admin SDK');
      console.error('Error details:', error.message);
      throw new Error(`Firebase Admin initialization failed: ${error.message}`);
    }
  } else {
    app = admin.app();
  }
  
  return app;
}

function getFirestore() {
  try {
    if (!app) {
      initializeFirebase();
    }
    const firestore = admin.firestore();
    return firestore;
  } catch (error) {
    console.error('Firestore Error: Failed to initialize Firestore client');
    console.error('This could be due to:');
    console.error('1. Invalid Firebase service account credentials');
    console.error('2. Missing Firestore write permissions for the service account');
    console.error('3. Firestore database not enabled in the Firebase project');
    console.error('Error details:', error.message);
    throw new Error(`Firestore initialization failed: ${error.message}`);
  }
}

function getStorage() {
  try {
    if (!app) {
      initializeFirebase();
    }
    const storage = admin.storage();
    const bucket = storage.bucket();
    return bucket;
  } catch (error) {
    console.error('Storage Error: Failed to initialize Firebase Storage');
    console.error('This could be due to:');
    console.error('1. Invalid Firebase service account credentials');
    console.error('2. Missing Storage permissions for the service account');
    console.error('3. Storage not enabled in the Firebase project');
    console.error('Error details:', error.message);
    throw new Error(`Storage initialization failed: ${error.message}`);
  }
}

module.exports = {
  initializeFirebase,
  getFirestore,
  getStorage,
  admin
};