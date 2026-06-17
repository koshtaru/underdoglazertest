const { getFirestore, getStorage, verifyAuthToken } = require('./firebase-admin');

// Generate unique filename
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.includes('.') ? originalName.split('.').pop().toLowerCase() : 'jpg';
  const baseName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);

  return `uploaded-${baseName}-${timestamp}-${random}.${ext}`;
}

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
async function uploadImageToStorage(bucket, filename, base64Data) {
  const { buffer, mimeType } = base64ToBuffer(base64Data);
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

// Add image to Firestore gallery (v3: with Firebase Storage URLs)
async function addImageToGallery(imageData, storageUrl, filename) {
  try {
    console.log('Adding image to Firestore gallery with Storage URL...');
    const db = getFirestore();

    // Check if new structure exists (metadata document)
    const metadataDoc = await db.collection('gallery').doc('metadata').get();
    const useNewStructure = metadataDoc.exists;

    if (useNewStructure) {
      console.log('Using new structure: individual documents');

      // Get all existing image documents to find max ID
      const gallerySnapshot = await db.collection('gallery').get();
      let maxId = 0;

      gallerySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (doc.id.startsWith('image-') && data.documentType === 'image' && data.id) {
          maxId = Math.max(maxId, data.id);
        }
      });

      // Create new image with next ID and Storage URL
      const newImage = {
        ...imageData,
        id: maxId + 1,
        src: storageUrl, // Use Storage URL instead of base64
        storageFilename: filename,
        storagePath: `gallery/${filename}`,
        uploadDate: new Date().toISOString().split('T')[0],
        visible: true,
        documentType: 'image',
        storageEnabled: true
      };

      // Save as individual document
      await db.collection('gallery').doc(`image-${newImage.id}`).set(newImage);

      // Update metadata
      const metadata = metadataDoc.data();
      await db.collection('gallery').doc('metadata').set({
        ...metadata,
        totalImages: maxId + 1,
        lastModified: Date.now()
      }, { merge: true });

      console.log(`Successfully added image with ID ${newImage.id} as individual document`);
      return newImage;

    } else {
      console.log('Using legacy structure: single document');

      // Legacy structure: update single document
      const galleryDoc = await db.collection('gallery').doc('data').get();
      const currentData = galleryDoc.exists ? galleryDoc.data() : { images: [], metadata: {} };

      // Generate new ID
      const maxId = Math.max(...(currentData.images || []).map(img => img.id || 0), 0);
      const newImage = {
        ...imageData,
        id: maxId + 1,
        src: storageUrl, // Use Storage URL instead of base64
        storageFilename: filename,
        storagePath: `gallery/${filename}`,
        uploadDate: new Date().toISOString().split('T')[0],
        visible: true,
        storageEnabled: true
      };

      // Add to images array
      const updatedData = {
        ...currentData,
        images: [...(currentData.images || []), newImage],
        metadata: {
          ...currentData.metadata,
          lastModified: Date.now(),
          version: currentData.metadata?.version || "1.0.0"
        }
      };

      // Save to Firestore
      await db.collection('gallery').doc('data').set(updatedData, { merge: true });

      console.log(`Successfully added image with ID ${newImage.id} to legacy structure`);
      return newImage;
    }

  } catch (error) {
    console.error('Error adding image to Firestore:', error);
    throw error;
  }
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

exports.handler = async (event, context) => {
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

    const { imageData, originalName, metadata = {} } = requestBody;

    if (!imageData || !originalName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'imageData and originalName are required' })
      };
    }

    // Validate MIME type against allowlist
    const mimeMatch = imageData.match(/^data:([^;]+);base64,/);
    if (!mimeMatch || !ALLOWED_MIME_TYPES.includes(mimeMatch[1])) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid image type. Allowed: JPEG, PNG, WebP, GIF' })
      };
    }

    // Check image size for Firestore field limit
    const imageSizeBytes = imageData.length * 0.75; // Convert base64 to bytes
    const maxSizeBytes = 900 * 1024; // 900KB limit (safety margin under 1MB)

    if (imageSizeBytes > maxSizeBytes) {
      const sizeMB = (imageSizeBytes / 1024 / 1024).toFixed(2);
      return {
        statusCode: 413,
        headers,
        body: JSON.stringify({
          error: `Image too large (${sizeMB}MB). Please compress to under 900KB.`,
          maxSize: '900KB',
          currentSize: `${Math.round(imageSizeBytes / 1024)}KB`
        })
      };
    }

    console.log(`Processing upload for: ${originalName}`);

    // Generate unique filename
    const filename = generateUniqueFilename(originalName);

    // Upload image to Firebase Storage
    console.log('Uploading to Firebase Storage...');
    const bucket = getStorage();
    const storageUrl = await uploadImageToStorage(bucket, filename, imageData);
    console.log(`Image uploaded to: ${storageUrl}`);

    // Create image metadata (without base64 data)
    const imageMetadata = {
      title: metadata.title || originalName.replace(/\.[^/.]+$/, ''),
      alt: metadata.alt || `Uploaded image: ${originalName}`,
      description: metadata.description || `Uploaded image: ${originalName}`,
      materials: metadata.materials || 'Custom Material',
      technique: metadata.technique || 'Custom Upload',
      category: metadata.category || 'uncategorized',
      filename: filename,
      originalName: originalName,
      fileSize: Math.round(imageData.length * 0.75) + ' bytes', // Rough base64 size estimate
      dimensions: metadata.dimensions || 'Unknown'
    };

    // Add to Firestore gallery with Storage URL
    const savedImage = await addImageToGallery(imageMetadata, storageUrl, filename);

    console.log('Image upload completed successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Image uploaded successfully',
        data: savedImage
      })
    };

  } catch (error) {
    console.error('Image upload error:', error);
    const statusCode = error.statusCode || 500;
    return {
      statusCode,
      headers,
      body: JSON.stringify({
        success: false,
        error: statusCode === 401 ? 'Unauthorized' : 'Failed to upload image'
      })
    };
  }
};