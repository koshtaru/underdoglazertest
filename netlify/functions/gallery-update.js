const { getFirestore } = require('./firebase-admin');

// Firestore collection and document references
const GALLERY_COLLECTION = 'gallery';
const GALLERY_DOC = 'data';

// Fallback data for serverless environment
function getFallbackData() {
  return {
    "images": [
      {
        "id": 1,
        "src": "/img/gallery/corporate-underdog-business-card.jpg",
        "title": "Underdog Lazer Business Card",
        "alt": "Underdog Lazer business card with logo engraving",
        "description": "Professional business card featuring precision laser-engraved logo and contact information. Clean, modern design with excellent contrast and readability.",
        "materials": "Black Anodized Metal",
        "technique": "Precision Laser Engraving",
        "category": "corporate",
        "uploadDate": "2024-01-15",
        "fileSize": "2.4 MB",
        "dimensions": "1920x1080",
        "visible": true,
        "filename": "corporate-underdog-business-card"
      }
    ],
    "metadata": {
      "lastModified": Date.now(),
      "version": "1.0.0"
    }
  };
}

// Read gallery data from Firestore (v2: individual documents)
async function readGalleryData() {
  try {
    console.log('Reading gallery data from Firestore v2 (individual documents)...');
    const db = getFirestore();

    // Try new structure first (individual documents in same collection)
    try {
      const metadataDoc = await db.collection(GALLERY_COLLECTION).doc('metadata').get();

      if (metadataDoc.exists) {
        console.log('Using new structure: individual documents');

        // Get all documents that start with 'image-'
        const gallerySnapshot = await db.collection(GALLERY_COLLECTION).get();
        const images = [];

        gallerySnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Only include documents that are image documents
          if (doc.id.startsWith('image-') && data.documentType === 'image') {
            images.push(data);
          }
        });

        // Sort by ID to maintain consistent order
        images.sort((a, b) => (a.id || 0) - (b.id || 0));

        const metadata = metadataDoc.data();

        console.log(`Successfully loaded ${images.length} images from individual documents`);
        return { images, metadata };
      }
    } catch (newStructureError) {
      console.log('New structure not available, falling back to old structure');
    }

    // Fallback to old structure (single document)
    console.log('Attempting to read from legacy single document...');
    const galleryDoc = await db.collection(GALLERY_COLLECTION).doc(GALLERY_DOC).get();

    if (!galleryDoc.exists) {
      console.warn('Gallery document not found in Firestore, using fallback data');
      return getFallbackData();
    }

    const data = galleryDoc.data();
    console.log(`Successfully loaded ${data.images?.length || 0} images from legacy single document`);
    return data;

  } catch (error) {
    console.error('Error reading gallery data from Firestore:', error);
    console.warn('Falling back to default data due to Firestore error');
    return getFallbackData();
  }
}

// Write gallery data to Firestore (v2: individual documents)
async function writeGalleryData(data) {
  try {
    const db = getFirestore();

    // Check if new structure exists
    const metadataDoc = await db.collection(GALLERY_COLLECTION).doc('metadata').get();
    const useNewStructure = metadataDoc.exists;

    if (useNewStructure) {
      console.log('Writing to new structure: individual documents');

      // Update metadata
      const metadata = {
        ...data.metadata,
        lastModified: Date.now(),
        totalImages: data.images?.length || 0,
        version: "2.0.0"
      };
      await db.collection(GALLERY_COLLECTION).doc('metadata').set(metadata, { merge: true });

      // For efficiency, we'll return the updated data without rewriting all individual documents
      // Individual document updates are handled in the specific action cases
      console.log('Metadata updated successfully');
      return data;

    } else {
      // Fallback to old structure
      console.log('Writing to legacy structure: single document');
      const dataWithMetadata = {
        ...data,
        metadata: {
          ...data.metadata,
          lastModified: Date.now(),
          version: data.metadata?.version || "1.0.0"
        }
      };

      await db.collection(GALLERY_COLLECTION).doc(GALLERY_DOC).set(dataWithMetadata, { merge: true });
      console.log('Gallery data written to legacy structure successfully');
      return dataWithMetadata;
    }

  } catch (error) {
    console.error('Error writing gallery data to Firestore:', error);
    throw error;
  }
}

// Update individual image document (v2)
async function updateIndividualImage(imageId, updatedData) {
  try {
    const db = getFirestore();
    const imageDoc = db.collection(GALLERY_COLLECTION).doc(`image-${imageId}`);

    const dataWithType = {
      ...updatedData,
      documentType: 'image'
    };

    await imageDoc.set(dataWithType, { merge: true });
    console.log(`Individual image ${imageId} updated successfully`);
    return dataWithType;
  } catch (error) {
    console.error(`Error updating individual image ${imageId}:`, error);
    throw error;
  }
}

// Add individual image document (v2)
async function addIndividualImage(newImage) {
  try {
    const db = getFirestore();
    const imageDoc = db.collection(GALLERY_COLLECTION).doc(`image-${newImage.id}`);

    const dataWithType = {
      ...newImage,
      documentType: 'image'
    };

    await imageDoc.set(dataWithType);
    console.log(`Individual image ${newImage.id} added successfully`);
    return dataWithType;
  } catch (error) {
    console.error(`Error adding individual image ${newImage.id}:`, error);
    throw error;
  }
}

// Delete individual image document (v2)
async function deleteIndividualImage(imageId) {
  try {
    const db = getFirestore();
    const imageDoc = db.collection(GALLERY_COLLECTION).doc(`image-${imageId}`);

    await imageDoc.delete();
    console.log(`Individual image ${imageId} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Error deleting individual image ${imageId}:`, error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  console.log('Gallery UPDATE function called');
  
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Request method:', event.httpMethod);
    console.log('Request body exists:', !!event.body);
    
    // Parse request body with validation
    if (!event.body) {
      console.error('No request body provided');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }
    
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
      console.log('Parsed request body:', { action: requestBody.action, imageId: requestBody.imageId });
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }
    const { imageId: rawImageId, updatedData, action = 'update' } = requestBody;
    
    // Ensure imageId is a number when provided
    const imageId = rawImageId ? parseInt(rawImageId, 10) : null;

    console.log(`Gallery update action: ${action}, imageId: ${imageId}`);

    // Read current gallery data
    console.log('Reading current gallery data...');
    const currentData = await readGalleryData();
    console.log(`Loaded ${currentData.images?.length || 0} images from gallery data`);

    let updatedGalleryData = { ...currentData };
    const db = getFirestore();
    const metadataDoc = await db.collection(GALLERY_COLLECTION).doc('metadata').get();
    const useNewStructure = metadataDoc.exists;

    switch (action) {
      case 'update':
        if (!imageId || !updatedData) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'imageId and updatedData are required for update' })
          };
        }

        if (useNewStructure) {
          // Update individual document
          const currentImage = currentData.images.find(img => img.id === imageId);
          if (!currentImage) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: `Image with ID ${imageId} not found` })
            };
          }

          const mergedImage = { ...currentImage, ...updatedData };
          await updateIndividualImage(imageId, mergedImage);

          // Update local data for response
          updatedGalleryData.images = currentData.images.map(img =>
            img.id === imageId ? mergedImage : img
          );
        } else {
          // Update specific image in legacy structure
          updatedGalleryData.images = currentData.images.map(img =>
            img.id === imageId ? { ...img, ...updatedData } : img
          );
        }
        break;

      case 'add':
        if (!updatedData) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'updatedData is required for add' })
          };
        }

        // Add new image
        const maxId = Math.max(...currentData.images.map(img => img.id), 0);
        const newImage = {
          ...updatedData,
          id: maxId + 1,
          uploadDate: new Date().toISOString().split('T')[0],
          visible: true
        };

        if (useNewStructure) {
          // Add individual document
          await addIndividualImage(newImage);
        }

        updatedGalleryData.images = [...currentData.images, newImage];
        break;

      case 'delete':
        if (!imageId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'imageId is required for delete' })
          };
        }

        if (useNewStructure) {
          // Delete individual document
          await deleteIndividualImage(imageId);
        }

        // Delete from local data
        updatedGalleryData.images = currentData.images.filter(img => img.id !== imageId);
        break;

      case 'toggle-visibility':
        if (!imageId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'imageId is required for toggle-visibility' })
          };
        }

        const targetImage = currentData.images.find(img => img.id === imageId);
        if (!targetImage) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: `Image with ID ${imageId} not found` })
          };
        }

        const toggledImage = { ...targetImage, visible: !targetImage.visible };

        if (useNewStructure) {
          // Update individual document
          await updateIndividualImage(imageId, toggledImage);
        }

        // Toggle image visibility in local data
        updatedGalleryData.images = currentData.images.map(img =>
          img.id === imageId ? toggledImage : img
        );
        break;

      case 'reorder':
        if (!updatedData || !updatedData.newOrder) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'newOrder array is required for reorder' })
          };
        }

        console.log(`Reordering ${updatedData.newOrder.length} images`);

        // Update displayOrder for each image
        if (useNewStructure) {
          for (let i = 0; i < updatedData.newOrder.length; i++) {
            const imageId = updatedData.newOrder[i];
            const image = currentData.images.find(img => img.id === imageId);
            if (image) {
              await updateIndividualImage(imageId, {
                ...image,
                displayOrder: i
              });
            }
          }
        }

        // Update local data for response
        updatedGalleryData.images = currentData.images.map(img => {
          const newIndex = updatedData.newOrder.indexOf(img.id);
          return {
            ...img,
            displayOrder: newIndex >= 0 ? newIndex : img.displayOrder || img.id
          };
        });

        // Sort by new display order
        updatedGalleryData.images.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        break;

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Unknown action: ${action}` })
        };
    }

    // Write updated data (metadata only for new structure, full data for legacy)
    const savedData = await writeGalleryData(updatedGalleryData);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Gallery ${action} completed successfully`,
        data: savedData,
        lastUpdated: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Gallery UPDATE error:', error);
    
    // Provide specific error messages for common Firebase issues
    let errorMessage = 'Failed to update gallery data';
    let statusCode = 500;
    
    if (error.message.includes('Firebase Admin credentials not configured')) {
      errorMessage = 'Firebase Admin SDK not configured properly. Please check Netlify environment variables.';
      statusCode = 503;
    } else if (error.message.includes('Missing or insufficient permissions')) {
      errorMessage = 'Firebase service account lacks Firestore write permissions. Please update service account roles.';
      statusCode = 403;
    } else if (error.message.includes('PERMISSION_DENIED')) {
      errorMessage = 'Firestore write permission denied. Please check service account roles and Firestore security rules.';
      statusCode = 403;
    } else if (error.message.includes('Firestore initialization failed')) {
      errorMessage = 'Firestore database connection failed. Please check Firebase project configuration.';
      statusCode = 503;
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