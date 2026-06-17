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
    const { period = '7d' } = event.queryStringParameters || {};
    
    const endDate = 'today';
    let startDate;
    switch (period) {
      case '1d': startDate = 'today'; break;
      case '7d': startDate = '7daysAgo'; break;
      case '30d': startDate = '30daysAgo'; break;
      case '90d': startDate = '90daysAgo'; break;
      default: startDate = '7daysAgo';
    }

    const metrics = {
      activeUsers: { value: 42, change: '+15.0%', trend: 'up' },
      sessions: { value: 58, change: '+10.0%', trend: 'up' },
      pageviews: { value: 125, change: '+20.0%', trend: 'up' },
      bounceRate: { value: 35, suffix: '%', change: '-5.0%', trend: 'down' },
      avgSessionDuration: { value: 180, suffix: 's', change: '+12.0%', trend: 'up' },
      conversions: { value: 3, change: '+25.0%', trend: 'up' }
    };

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
        deployTime: new Date().toISOString()
      }),
    };

  } catch (error) {
    console.error('Analytics test error:', error);
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