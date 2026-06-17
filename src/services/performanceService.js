import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

class PerformanceService {
  constructor() {
    this.metrics = {
      CLS: null,
      FCP: null,
      INP: null,
      LCP: null,
      TTFB: null
    };
    this.listeners = [];
    this.initialized = false;
  }

  // Initialize Web Vitals tracking
  init() {
    if (this.initialized) return;

    try {
      // Track Cumulative Layout Shift
      onCLS((metric) => {
        this.updateMetric('CLS', metric);
      });

      // Track First Contentful Paint
      onFCP((metric) => {
        this.updateMetric('FCP', metric);
      });

      // Track Interaction to Next Paint
      onINP((metric) => {
        this.updateMetric('INP', metric);
      });

      // Track Largest Contentful Paint
      onLCP((metric) => {
        this.updateMetric('LCP', metric);
      });

      // Track Time to First Byte
      onTTFB((metric) => {
        this.updateMetric('TTFB', metric);
      });

      this.initialized = true;
      console.log('Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  // Update metric and notify listeners
  updateMetric(name, metric) {
    this.metrics[name] = {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      timestamp: Date.now()
    };

    // Store in localStorage for persistence
    this.saveToStorage();

    // Notify all listeners
    this.notifyListeners();

    console.log(`Performance metric updated: ${name}`, this.metrics[name]);
  }

  // Get current metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Get Core Web Vitals specifically
  getCoreWebVitals() {
    return {
      lcp: this.formatMetric('LCP', 'seconds', 2.5, 4.0),
      inp: this.formatMetric('INP', 'milliseconds', 200, 500),
      cls: this.formatMetric('CLS', 'score', 0.1, 0.25),
      fcp: this.formatMetric('FCP', 'seconds', 1.8, 3.0),
      ttfb: this.formatMetric('TTFB', 'milliseconds', 800, 1800)
    };
  }

  // Format metric for display
  formatMetric(name, unit, goodThreshold) {
    const metric = this.metrics[name];
    
    if (!metric) {
      return {
        value: 0,
        displayValue: '0',
        unit,
        status: 'unknown',
        rating: 'unknown',
        threshold: goodThreshold
      };
    }

    let displayValue, status;
    
    switch (unit) {
      case 'seconds':
        displayValue = (metric.value / 1000).toFixed(1);
        break;
      case 'milliseconds':
        displayValue = Math.round(metric.value);
        break;
      case 'score':
        displayValue = metric.value.toFixed(3);
        break;
      default:
        displayValue = metric.value.toString();
    }

    // Determine status based on thresholds
    if (metric.rating === 'good') {
      status = 'good';
    } else if (metric.rating === 'needs-improvement') {
      status = 'needs-improvement';
    } else {
      status = 'poor';
    }

    return {
      value: metric.value,
      displayValue,
      unit,
      status,
      rating: metric.rating,
      threshold: goodThreshold,
      timestamp: metric.timestamp
    };
  }

  // Get performance summary
  getPerformanceSummary() {
    const vitals = this.getCoreWebVitals();
    const loadTimes = this.getLoadTimes();
    
    return {
      coreWebVitals: vitals,
      loadTimes,
      overall: this.calculateOverallScore(vitals),
      lastUpdated: this.getLastUpdated()
    };
  }

  // Calculate load times from Navigation API
  getLoadTimes() {
    if (!window.performance || !window.performance.navigation) {
      return {
        mobile: { value: 0, change: 0 },
        desktop: { value: 0, change: 0 }
      };
    }

    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) {
      return {
        mobile: { value: 0, change: 0 },
        desktop: { value: 0, change: 0 }
      };
    }

    const loadTime = (navigation.loadEventEnd - navigation.fetchStart) / 1000;
    
    // Simple estimation for mobile vs desktop (in real implementation, you'd detect device type)
    const isMobile = window.innerWidth <= 768;
    
    return {
      mobile: { 
        value: isMobile ? loadTime.toFixed(1) : (loadTime * 1.3).toFixed(1), 
        change: this.getLoadTimeChange('mobile') 
      },
      desktop: { 
        value: !isMobile ? loadTime.toFixed(1) : (loadTime * 0.8).toFixed(1), 
        change: this.getLoadTimeChange('desktop') 
      }
    };
  }

  // Get load time change (placeholder - would need historical data)
  getLoadTimeChange(device) {
    const stored = this.getStoredLoadTimes();
    if (!stored || !stored[device]) return 0;
    
    const current = parseFloat(this.getLoadTimes()[device].value);
    const previous = stored[device];
    
    return ((previous - current) / previous * 100).toFixed(1);
  }

  // Calculate overall performance score
  calculateOverallScore(vitals) {
    const scores = [];
    
    Object.values(vitals).forEach(metric => {
      if (metric.status === 'good') scores.push(100);
      else if (metric.status === 'needs-improvement') scores.push(70);
      else if (metric.status === 'poor') scores.push(30);
    });

    if (scores.length === 0) return 0;
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(average);
  }

  // Get last updated timestamp
  getLastUpdated() {
    const timestamps = Object.values(this.metrics)
      .filter(metric => metric && metric.timestamp)
      .map(metric => metric.timestamp);
    
    return timestamps.length > 0 ? Math.max(...timestamps) : Date.now();
  }

  // Add listener for metric updates
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.getPerformanceSummary());
      } catch (error) {
        console.error('Error in performance listener:', error);
      }
    });
  }

  // Save metrics to localStorage
  saveToStorage() {
    try {
      const data = {
        metrics: this.metrics,
        timestamp: Date.now()
      };
      localStorage.setItem('performance-metrics', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save performance metrics to storage:', error);
    }
  }

  // Load metrics from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('performance-metrics');
      if (stored) {
        const data = JSON.parse(stored);
        // Only load if data is less than 1 hour old
        if (Date.now() - data.timestamp < 60 * 60 * 1000) {
          this.metrics = { ...this.metrics, ...data.metrics };
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to load performance metrics from storage:', error);
    }
    return false;
  }

  // Get stored load times
  getStoredLoadTimes() {
    try {
      const stored = localStorage.getItem('load-times');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Reset all metrics
  reset() {
    this.metrics = {
      CLS: null,
      FCP: null,
      INP: null,
      LCP: null,
      TTFB: null
    };
    this.saveToStorage();
    this.notifyListeners();
  }

  // Check if performance monitoring is supported
  isSupported() {
    return typeof window !== 'undefined' && 
           'performance' in window && 
           'getEntriesByType' in window.performance;
  }
}

// Create singleton instance
const performanceService = new PerformanceService();

// Auto-initialize when module loads (in browser environment)
if (typeof window !== 'undefined') {
  // Load any existing data from storage
  performanceService.loadFromStorage();
  
  // Initialize tracking
  performanceService.init();
}

export default performanceService;