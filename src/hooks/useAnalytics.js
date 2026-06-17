import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import performanceService from '../services/performanceService';

// Custom hook for analytics data fetching and management
export const useAnalytics = (period = '7d', autoRefresh = false) => {
  const [data, setData] = useState({
    overview: null,
    trafficSources: null,
    topPages: null,
    performance: null,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch all analytics data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiService.getAllAnalyticsData(period);
      
      // Get performance data
      const performanceData = performanceService.getPerformanceSummary();
      
      setData({
        ...result,
        performance: performanceData
      });
      setLastUpdated(new Date());

      // Temporarily disable fallback error checking
      // const hasFallback = Object.values(result).some(item => item.fallback);
      // if (hasFallback) {
      //   setError('Some analytics data unavailable - showing cached/fallback data');
      // }

    } catch (err) {
      setError(err.message || 'Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Refresh data manually
  const refresh = useCallback(() => {
    apiService.clearCache();
    fetchData();
  }, [fetchData]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 45 * 1000); // Refresh every 45 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    isStale: lastUpdated && Date.now() - lastUpdated.getTime() > 60 * 1000, // Mark stale after 1 minute
  };
};

// Hook for specific analytics endpoint
export const useAnalyticsEndpoint = (endpoint, period = '7d') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      switch (endpoint) {
        case 'overview':
          result = await apiService.getOverview(period);
          break;
        case 'traffic-sources':
          result = await apiService.getTrafficSources(period);
          break;
        case 'top-pages':
          result = await apiService.getTopPages(period);
          break;
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }

      setData(result);

      if (result.fallback) {
        setError('Analytics data unavailable - showing fallback data');
      }

    } catch (err) {
      setError(err.message || `Failed to fetch ${endpoint} data`);
      console.error(`${endpoint} fetch error:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
};

// Hook for real-time analytics status
export const useAnalyticsHealth = () => {
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    try {
      const result = await apiService.healthCheck();
      setHealth(result);
    } catch (error) {
      setHealth({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    health,
    checking,
    checkHealth,
    isHealthy: health?.status === 'healthy',
  };
};

// Hook for real-time performance monitoring
export const usePerformance = () => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize performance data
    const updatePerformance = () => {
      const performanceData = performanceService.getPerformanceSummary();
      setPerformance(performanceData);
      setLoading(false);
    };

    // Get initial data
    updatePerformance();

    // Listen for performance metric updates
    const unsubscribe = performanceService.addListener(updatePerformance);

    // Set up periodic updates for load times
    const interval = setInterval(updatePerformance, 10000); // Update every 10 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const refresh = useCallback(() => {
    const performanceData = performanceService.getPerformanceSummary();
    setPerformance(performanceData);
  }, []);

  return {
    performance,
    loading,
    refresh,
    isSupported: performanceService.isSupported(),
    reset: () => performanceService.reset(),
  };
};