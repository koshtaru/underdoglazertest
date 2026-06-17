import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { verifyAuthToken } = require('./firebase-admin');

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://underdoglazer.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // This debug endpoint exposes configuration details, so it must require
    // an authenticated admin token.
    await verifyAuthToken(event.headers.authorization);

    // Debug info
    const debug = {
      hasPropertyId: !!process.env.GA_PROPERTY_ID,
      propertyId: process.env.GA_PROPERTY_ID,
      hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      credentialsLength: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.length || 0,
      nodeVersion: process.version,
      platform: process.platform
    };

    // Try to parse credentials
    let credentials;
    let parseError = null;
    try {
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
    } catch (err) {
      parseError = err.message;
    }

    // Try to initialize client with minimal config
    let clientError = null;
    let analyticsDataClient = null;
    try {
      if (credentials && credentials.type === 'service_account') {
        analyticsDataClient = new BetaAnalyticsDataClient({
          credentials: credentials,
          projectId: credentials.project_id
        });
      }
    } catch (err) {
      clientError = err.message;
    }

    // Try a simple API call
    let apiError = null;
    let apiSuccess = false;
    if (analyticsDataClient) {
      try {
        const propertyId = process.env.GA_PROPERTY_ID;
        if (propertyId) {
          const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            metrics: [{ name: 'activeUsers' }],
            dimensions: []
          });
          apiSuccess = true;
        }
      } catch (err) {
        apiError = err.message;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        debug,
        parseError,
        clientError,
        apiError,
        apiSuccess,
        credentialsValid: credentials && credentials.type === 'service_account',
        timestamp: new Date().toISOString()
      }),
    };

  } catch (error) {
    console.error('Analytics test error:', error);
    if (error.statusCode === 401) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: 'Unauthorized' }),
      };
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch analytics data',
      }),
    };
  }
};