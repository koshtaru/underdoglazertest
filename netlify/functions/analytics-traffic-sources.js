export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://underdoglazer.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { period = '7d' } = event.queryStringParameters || {};
    
    // Calculate date range
    const endDate = 'today';
    let startDate;
    
    switch (period) {
      case '1d':
        startDate = 'today';
        break;
      case '7d':
        startDate = '7daysAgo';
        break;
      case '30d':
        startDate = '30daysAgo';
        break;
      case '90d':
        startDate = '90daysAgo';
        break;
      default:
        startDate = '7daysAgo';
    }

    const propertyId = process.env.GA_PROPERTY_ID;
    
    if (!propertyId) {
      throw new Error('GA Property ID not configured');
    }

    // Parse credentials with better error handling
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      
      // Fix private key that gets corrupted in environment variables
      if (credentials.private_key) {
        // Handle different ways the key might be corrupted
        credentials.private_key = credentials.private_key
          .replace(/\\n/g, '\n')              // Handle escaped newlines
          .replace(/\\\\/g, '\\')             // Handle double-escaped backslashes
          .replace(/\s+/g, ' ')               // Normalize all whitespace to single spaces
          .replace(/ /g, '')                  // Remove all spaces
          .replace('-----BEGINPRIVATEKEY-----', '-----BEGIN PRIVATE KEY-----')  // Fix header
          .replace('-----ENDPRIVATEKEY-----', '-----END PRIVATE KEY-----')      // Fix footer
          .trim();                            // Remove extra whitespace
        
        // Add proper line breaks for PEM format
        if (credentials.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
          // Reconstruct the private key with proper formatting
          const keyContent = credentials.private_key
            .replace('-----BEGIN PRIVATE KEY-----', '')
            .replace('-----END PRIVATE KEY-----', '')
            .replace(/\s/g, '');  // Remove all whitespace from key content
          
          // Split into 64-character lines (standard PEM format)
          const lines = [];
          for (let i = 0; i < keyContent.length; i += 64) {
            lines.push(keyContent.substring(i, i + 64));
          }
          
          credentials.private_key = '-----BEGIN PRIVATE KEY-----\n' + 
                                  lines.join('\n') + 
                                  '\n-----END PRIVATE KEY-----';
        }
        
        // Final validation
        if (!credentials.private_key.startsWith('-----BEGIN PRIVATE KEY-----')) {
          throw new Error('Private key format is invalid after cleanup');
        }
      }
    } catch (err) {
      console.error('Credentials parsing error:', err);
      throw new Error(`Invalid credentials format: ${err.message}`);
    }

    // Use direct fetch to Google OAuth2 for authentication
    let accessToken;
    try {
      // Create JWT assertion for service account
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: credentials.client_email,
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600
      };

      // Create the JWT header
      const header = {
        alg: 'RS256',
        typ: 'JWT'
      };

      // Base64url encode header and payload
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

      // Import crypto for signing (Node.js built-in)
      const crypto = require('crypto');
      
      // Sign the JWT
      const signatureInput = `${encodedHeader}.${encodedPayload}`;
      const signature = crypto
        .createSign('RSA-SHA256')
        .update(signatureInput)
        .sign(credentials.private_key, 'base64url');

      const jwt = `${signatureInput}.${signature}`;

      // Exchange JWT for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;

      if (!accessToken) {
        throw new Error('No access token received');
      }
    } catch (authError) {
      console.error('Authentication error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    // Make direct API call to Google Analytics Data API
    const requestBody = {
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
      ],
      dimensions: [
        { name: 'sessionDefaultChannelGrouping' },
        { name: 'sessionSource' },
      ],
      orderBys: [
        {
          metric: {
            metricName: 'sessions',
          },
          desc: true,
        },
      ],
      limit: 10,
    };

    const apiUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GA API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Transform data for chart consumption
    const trafficSources = [];
    const sourceBreakdown = {};

    if (data.rows && data.rows.length > 0) {
      data.rows.forEach(row => {
        const channelGroup = row.dimensionValues[0].value;
        const source = row.dimensionValues[1].value;
        const sessions = parseInt(row.metricValues[0].value) || 0;
        const users = parseInt(row.metricValues[1].value) || 0;

        // Aggregate by channel group for main chart
        if (!sourceBreakdown[channelGroup]) {
          sourceBreakdown[channelGroup] = {
            sessions: 0,
            users: 0,
            sources: []
          };
        }
        
        sourceBreakdown[channelGroup].sessions += sessions;
        sourceBreakdown[channelGroup].users += users;
        sourceBreakdown[channelGroup].sources.push({
          source,
          sessions,
          users
        });
      });

      // Convert to array format for chart
      Object.entries(sourceBreakdown).forEach(([channel, data]) => {
        trafficSources.push({
          name: channel,
          sessions: data.sessions,
          users: data.users,
          sources: data.sources.slice(0, 3) // Top 3 sources per channel
        });
      });
    } else {
      // Fallback data if no results
      trafficSources.push(
        { name: 'Direct', sessions: 0, users: 0, sources: [] },
        { name: 'Organic Search', sessions: 0, users: 0, sources: [] },
        { name: 'Social', sessions: 0, users: 0, sources: [] }
      );
    }

    // Sort by sessions descending
    trafficSources.sort((a, b) => b.sessions - a.sessions);

    // Add cache headers
    headers['Cache-Control'] = 'public, max-age=300, s-maxage=300';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        period,
        dateRange: { startDate, endDate },
        trafficSources: trafficSources.slice(0, 8), // Top 8 channels
        lastUpdated: new Date().toISOString(),
      }),
    };

  } catch (error) {
    console.error('Traffic sources error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch traffic sources data',
      }),
    };
  }
};