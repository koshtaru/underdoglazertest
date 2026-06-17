import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Initialize the Analytics Data API client
let analyticsDataClient;

try {
  // For production, use environment variables for service account
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    } catch (parseError) {
      console.error('Failed to parse credentials JSON:', parseError);
      throw new Error('Invalid credentials format');
    }
    
    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials,
      // Force explicit auth type
      auth: {
        credentials,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
      }
    });
  } else {
    // For development, fallback to default auth (requires gcloud CLI setup)
    analyticsDataClient = new BetaAnalyticsDataClient();
  }
} catch (error) {
  console.error('Failed to initialize Analytics Data Client:', error);
}

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

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse query parameters
    const { period = '7d' } = event.queryStringParameters || {};
    
    // Calculate date range based on period
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

    // Property ID for your GA4 property
    const propertyId = process.env.VITE_GA_PROPERTY_ID || process.env.GA_PROPERTY_ID;
    
    if (!propertyId) {
      throw new Error('GA Property ID not configured');
    }

    if (!analyticsDataClient) {
      throw new Error('Analytics client not initialized');
    }

    // Prepare the request
    const request = {
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' }, // Use GA4 metric name
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' },
      ],
      dimensions: [],
    };

    console.log('Making GA4 API request:', JSON.stringify(request, null, 2));

    // Fetch overview metrics
    const [response] = await analyticsDataClient.runReport(request);

    // Transform the data for frontend consumption
    const metrics = {};
    
    if (response.rows && response.rows.length > 0) {
      const row = response.rows[0];
      
      metrics.activeUsers = {
        value: parseInt(row.metricValues[0].value) || 0,
        change: '+12.5%', // TODO: Calculate actual change
        trend: 'up'
      };
      
      metrics.sessions = {
        value: parseInt(row.metricValues[1].value) || 0,
        change: '+8.3%', // TODO: Calculate actual change
        trend: 'up'
      };
      
      metrics.pageviews = {
        value: parseInt(row.metricValues[2].value) || 0,
        change: '+15.2%', // TODO: Calculate actual change
        trend: 'up'
      };
      
      metrics.bounceRate = {
        value: Math.round((parseFloat(row.metricValues[3].value) || 0) * 100),
        suffix: '%',
        change: '-2.1%', // TODO: Calculate actual change
        trend: 'down'
      };
      
      metrics.avgSessionDuration = {
        value: Math.round(parseFloat(row.metricValues[4].value) || 0),
        suffix: 's',
        change: '+5.4%', // TODO: Calculate actual change
        trend: 'up'
      };
      
      metrics.conversions = {
        value: parseInt(row.metricValues[5].value) || 0,
        change: '+22.7%', // TODO: Calculate actual change
        trend: 'up'
      };
    } else {
      // Fallback to zero values if no data
      metrics.activeUsers = { value: 0, change: '0%', trend: 'neutral' };
      metrics.sessions = { value: 0, change: '0%', trend: 'neutral' };
      metrics.pageviews = { value: 0, change: '0%', trend: 'neutral' };
      metrics.bounceRate = { value: 0, suffix: '%', change: '0%', trend: 'neutral' };
      metrics.avgSessionDuration = { value: 0, suffix: 's', change: '0%', trend: 'neutral' };
      metrics.conversions = { value: 0, change: '0%', trend: 'neutral' };
    }

    // Add cache headers (cache for 5 minutes)
    headers['Cache-Control'] = 'public, max-age=300, s-maxage=300';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        period,
        dateRange: { startDate, endDate },
        metrics,
        lastUpdated: new Date().toISOString(),
      }),
    };

  } catch (error) {
    console.error('Analytics overview error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    });
    
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