const { getFirestore } = require('./firebase-admin');

// Read gallery data from Firestore (v2: individual documents)
async function readGalleryData() {
  try {
    console.log('Reading gallery data from Firestore v2 (individual documents)...');
    const db = getFirestore();

    // Try new structure first (individual documents in same collection)
    try {
      const metadataDoc = await db.collection('gallery').doc('metadata').get();

      if (metadataDoc.exists) {
        console.log('Using new structure: individual documents');

        // Get all documents that start with 'image-'
        const gallerySnapshot = await db.collection('gallery').get();
        const images = [];

        gallerySnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Only include documents that are image documents
          if (doc.id.startsWith('image-') && data.documentType === 'image') {
            images.push(data);
          }
        });

        // Sort by displayOrder if exists, otherwise by ID
        images.sort((a, b) => {
          const orderA = a.displayOrder !== undefined ? a.displayOrder : a.id || 999;
          const orderB = b.displayOrder !== undefined ? b.displayOrder : b.id || 999;
          return orderA - orderB;
        });

        const metadata = metadataDoc.data();

        console.log(`Successfully loaded ${images.length} images from individual documents`);
        return { images, metadata };
      }
    } catch (newStructureError) {
      console.log('New structure not available, falling back to old structure');
    }

    // Fallback to old structure (single document)
    console.log('Attempting to read from legacy single document...');
    const galleryDoc = await db.collection('gallery').doc('data').get();

    if (!galleryDoc.exists) {
      console.log('No gallery data found, returning default data');
      return getDefaultGalleryData();
    }

    const data = galleryDoc.data();
    console.log(`Successfully loaded ${data.images?.length || 0} images from legacy single document`);
    return data;

  } catch (error) {
    console.error('Error reading gallery data from Firestore:', error);
    console.log('Falling back to default data');
    return getDefaultGalleryData();
  }
}

// Default gallery data fallback
function getDefaultGalleryData() {
  return {
    images: [
      {
        id: 1,
        src: "/img/gallery/corporate-underdog-business-card.jpg",
        title: "Underdog Lazer Business Card",
        alt: "Underdog Lazer business card with logo engraving",
        description: "Professional business card featuring precision laser-engraved logo and contact information. Clean, modern design with excellent contrast and readability.",
        materials: "Black Anodized Metal",
        technique: "Precision Laser Engraving",
        category: "corporate",
        uploadDate: "2024-01-15",
        fileSize: "2.4 MB",
        dimensions: "1920x1080",
        visible: true,
        filename: "corporate-underdog-business-card"
      },
      {
        id: 2,
        src: "/img/gallery/corporate-logo-01.jpg",
        title: "Corporate Logo Design",
        alt: "Corporate logo laser engraving",
        description: "Custom corporate logo engraving with precise detail work. Professional branding solution for business applications.",
        materials: "Various Materials",
        technique: "Logo Engraving",
        category: "corporate",
        uploadDate: "2024-01-14",
        fileSize: "1.9 MB",
        dimensions: "1600x1200",
        visible: true,
        filename: "corporate-logo-01"
      }
      // More images will be loaded from Firestore in production
    ],
    metadata: {
      lastModified: Date.now(),
      version: "1.0.0"
    }
  };
}

exports.handler = async (event, context) => {
  console.log('Gallery GET function called');
  
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Fetching gallery data...');
    const galleryData = await readGalleryData();
    
    console.log(`Returning ${galleryData.images?.length || 0} images`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        ...galleryData,
        lastFetched: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Gallery GET error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch gallery data',
        message: error.message
      })
    };
  }
};