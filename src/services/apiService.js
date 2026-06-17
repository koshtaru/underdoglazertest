// API Service Layer for Analytics Data
class ApiService {
  constructor() {
    this.baseUrl = '/.netlify/functions';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Generic fetch with error handling and caching
  async fetchWithCache(endpoint, options = {}) {
    const cacheKey = `${endpoint}?${new URLSearchParams(options.params || {})}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`Cache hit for ${cacheKey}`);
        return cached.data;
      }
      // Remove expired cache entry
      this.cache.delete(cacheKey);
    }

    try {
      const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
      
      // Add query parameters
      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      console.log(`Fetching analytics data from: ${url.pathname}${url.search}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      // Cache successful response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;

    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      
      // Return fallback data structure on error
      return this.getFallbackData(endpoint);
    }
  }

  // Get fallback data when API fails
  getFallbackData(endpoint) {
    const now = new Date().toISOString();
    
    switch (endpoint) {
      case '/analytics-overview-v2':
        return {
          success: false,
          fallback: true,
          period: '7d',
          dateRange: { startDate: '7daysAgo', endDate: 'today' },
          metrics: {
            activeUsers: { value: 0, change: '0%', trend: 'neutral' },
            sessions: { value: 0, change: '0%', trend: 'neutral' },
            pageviews: { value: 0, change: '0%', trend: 'neutral' },
            bounceRate: { value: 0, suffix: '%', change: '0%', trend: 'neutral' },
            avgSessionDuration: { value: 0, suffix: 's', change: '0%', trend: 'neutral' },
            conversions: { value: 0, change: '0%', trend: 'neutral' },
          },
          lastUpdated: now,
        };

      case '/analytics-traffic-sources':
        return {
          success: false,
          fallback: true,
          period: '7d',
          dateRange: { startDate: '7daysAgo', endDate: 'today' },
          trafficSources: [
            { name: 'Direct', sessions: 0, users: 0, sources: [] },
            { name: 'Organic Search', sessions: 0, users: 0, sources: [] },
            { name: 'Social', sessions: 0, users: 0, sources: [] },
          ],
          lastUpdated: now,
        };

      case '/analytics-top-pages':
        return {
          success: false,
          fallback: true,
          period: '7d',
          dateRange: { startDate: '7daysAgo', endDate: 'today' },
          topPages: [
            { path: '/', title: 'Home', pageviews: 0, users: 0, avgDuration: 0, bounceRate: 0 },
            { path: '/gallery', title: 'Gallery', pageviews: 0, users: 0, avgDuration: 0, bounceRate: 0 },
            { path: '/about', title: 'About', pageviews: 0, users: 0, avgDuration: 0, bounceRate: 0 },
            { path: '/contact', title: 'Contact', pageviews: 0, users: 0, avgDuration: 0, bounceRate: 0 },
          ],
          lastUpdated: now,
        };

      default:
        return {
          success: false,
          fallback: true,
          error: 'Unknown endpoint',
          lastUpdated: now,
        };
    }
  }

  // Clear cache manually
  clearCache() {
    this.cache.clear();
    console.log('Analytics cache cleared');
  }

  // Analytics API methods

  async getOverview(period = '7d') {
    console.log('Fetching analytics overview data from overview-v2 endpoint');
    return this.fetchWithCache('/analytics-overview-v2', {
      params: { period }
    });
  }

  async getTrafficSources(period = '7d') {
    return this.fetchWithCache('/analytics-traffic-sources', {
      params: { period }
    });
  }

  async getTopPages(period = '7d') {
    return this.fetchWithCache('/analytics-top-pages', {
      params: { period }
    });
  }

  // Batch fetch all analytics data
  async getAllAnalyticsData(period = '7d') {
    try {
      const [overview, trafficSources, topPages] = await Promise.allSettled([
        this.getOverview(period),
        this.getTrafficSources(period),
        this.getTopPages(period),
      ]);

      return {
        overview: overview.status === 'fulfilled' ? overview.value : this.getFallbackData('/analytics-overview-v2'),
        trafficSources: trafficSources.status === 'fulfilled' ? trafficSources.value : this.getFallbackData('/analytics-traffic-sources'),
        topPages: topPages.status === 'fulfilled' ? topPages.value : this.getFallbackData('/analytics-top-pages'),
      };
    } catch (error) {
      console.error('Batch analytics fetch error:', error);
      throw error;
    }
  }

  // Health check for API endpoints
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/analytics-overview-v2?period=1d`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return {
        status: response.ok ? 'healthy' : 'error',
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;