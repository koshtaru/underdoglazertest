import fs from 'fs/promises';
import path from 'path';

export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow PUT requests
  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { filename, metadata } = JSON.parse(event.body);
    
    if (!filename || !metadata) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing filename or metadata' })
      };
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename, '.json') + '.json';
    
    // In development, update the public directory
    // In production, this would need to update the correct location
    const metadataPath = path.join(process.cwd(), 'public', 'img', 'gallery', sanitizedFilename);
    
    // Write the updated metadata
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: `Updated metadata for ${sanitizedFilename}` 
      })
    };
  } catch (error) {
    console.error('Error updating metadata:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to update metadata',
        details: error.message 
      })
    };
  }
};