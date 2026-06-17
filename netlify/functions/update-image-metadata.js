import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { verifyAuthToken } = require('./firebase-admin');

export const handler = async (event, context) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://underdoglazer.com';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    await verifyAuthToken(event.headers.authorization);

    const { filename, metadata } = JSON.parse(event.body);

    if (!filename || !metadata) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing filename or metadata' })
      };
    }

    const sanitizedFilename = path.basename(filename, '.json') + '.json';
    const metadataPath = path.join(process.cwd(), 'public', 'img', 'gallery', sanitizedFilename);

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: `Updated metadata for ${sanitizedFilename}` })
    };
  } catch (error) {
    console.error('Error updating metadata:', error);
    const statusCode = error.statusCode || 500;
    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: statusCode === 401 ? 'Unauthorized' : 'Failed to update metadata'
      })
    };
  }
};