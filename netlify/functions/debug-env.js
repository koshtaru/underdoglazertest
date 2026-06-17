export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
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
    const debug = {
      hasPropertyId: !!process.env.GA_PROPERTY_ID,
      propertyId: process.env.GA_PROPERTY_ID ? 'Set' : 'Missing',
      hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      credentialsLength: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? 
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.length : 0,
      credentialsStart: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? 
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.substring(0, 50) + '...' : 'Missing',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        debug,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};