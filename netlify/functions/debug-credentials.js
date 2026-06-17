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

  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    
    const privateKeyStart = credentials.private_key ? credentials.private_key.substring(0, 50) : 'No private key';
    const privateKeyEnd = credentials.private_key ? credentials.private_key.substring(credentials.private_key.length - 50) : 'No private key';
    const hasProperStart = credentials.private_key && credentials.private_key.startsWith('-----BEGIN PRIVATE KEY-----');
    const hasProperEnd = credentials.private_key && credentials.private_key.endsWith('-----END PRIVATE KEY-----');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        debug: {
          privateKeyStart,
          privateKeyEnd,
          hasProperStart,
          hasProperEnd,
          privateKeyLength: credentials.private_key ? credentials.private_key.length : 0,
          newlineCount: credentials.private_key ? (credentials.private_key.match(/\n/g) || []).length : 0,
          escapedNewlineCount: credentials.private_key ? (credentials.private_key.match(/\\n/g) || []).length : 0
        }
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};