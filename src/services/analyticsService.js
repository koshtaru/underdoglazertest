import ReactGA from 'react-ga4';

// Analytics service for Google Analytics 4 integration
class AnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  }

  // Initialize Google Analytics 4
  initialize() {
    if (!this.measurementId || this.measurementId === 'G-XXXXXXXXX') {
      console.warn('GA4 Measurement ID not configured. Analytics tracking disabled.');
      return;
    }

    if (this.isInitialized) {
      console.warn('Analytics already initialized');
      return;
    }

    try {
      ReactGA.initialize(this.measurementId, {
        // Development vs Production configuration
        debug: import.meta.env.DEV,
        // Privacy-focused configuration
        gtagOptions: {
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
        },
      });

      this.isInitialized = true;
      console.log('Google Analytics 4 initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }

  // Track page views - called on route changes
  trackPageView(path = window.location.pathname + window.location.search) {
    if (!this.isInitialized) return;

    try {
      ReactGA.send({
        hitType: 'pageview',
        page: path,
        title: document.title,
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  // Track custom events for business metrics
  trackEvent(eventName, parameters = {}) {
    if (!this.isInitialized) return;

    try {
      ReactGA.event(eventName, parameters);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // Business-specific event tracking methods

  // Track contact form submissions with lead scoring
  trackContactFormSubmission(projectType, method = 'netlify') {
    const leadScore = this.calculateLeadScore(projectType);
    const projectValue = this.getProjectValue(projectType);
    
    this.trackEvent('contact_form_submit', {
      project_type: projectType,
      submission_method: method,
      lead_score: leadScore,
      estimated_value: projectValue,
      value: projectValue, // Conversion value for GA4
    });
  }

  // Calculate lead quality score based on project type
  calculateLeadScore(projectType) {
    const leadScores = {
      'awards-trophies': 85,        // High value, repeat business
      'business-signage': 90,       // High value, commercial
      'industrial-marking': 95,     // Highest value, B2B
      'promotional-products': 75,   // Medium-high, volume potential
      'memorial-commemorative': 70, // Medium, emotional value
      'personalized-gifts': 60,     // Medium, seasonal
      'custom-art': 65,            // Medium, creative projects
      'other': 50                  // Unknown potential
    };
    
    return leadScores[projectType] || 50;
  }

  // Get estimated project value based on type
  getProjectValue(projectType) {
    const projectValues = {
      'awards-trophies': 250,       // $250 average
      'business-signage': 400,      // $400 average
      'industrial-marking': 600,    // $600 average
      'promotional-products': 200,  // $200 average
      'memorial-commemorative': 300, // $300 average
      'personalized-gifts': 150,    // $150 average
      'custom-art': 350,           // $350 average
      'other': 200                 // $200 default
    };
    
    return projectValues[projectType] || 200;
  }

  // Track gallery interactions
  trackGalleryInteraction(action, imageName = null) {
    this.trackEvent('gallery_interaction', {
      action, // 'view', 'click', 'download'
      image_name: imageName,
    });
  }

  // Track navigation patterns
  trackNavigation(fromPage, toPage) {
    this.trackEvent('navigation', {
      from_page: fromPage,
      to_page: toPage,
    });
  }

  // Track business inquiries and lead scoring
  trackBusinessInquiry(inquiryType, leadScore = null) {
    this.trackEvent('business_inquiry', {
      inquiry_type: inquiryType,
      lead_score: leadScore,
    });
  }

  // Track performance metrics
  trackPerformance(metric, value, unit = 'ms') {
    this.trackEvent('performance_metric', {
      metric_name: metric,
      metric_value: value,
      unit,
    });
  }

  // Track errors for debugging
  trackError(errorMessage, errorLocation) {
    this.trackEvent('javascript_error', {
      error_message: errorMessage,
      error_location: errorLocation,
    });
  }

  // Track user engagement
  trackEngagement(action, category = 'general') {
    this.trackEvent('user_engagement', {
      engagement_action: action,
      engagement_category: category,
    });
  }

  // GDPR compliance methods
  
  // Get consent status
  getConsentStatus() {
    return localStorage.getItem('ga_consent') === 'granted';
  }

  // Set user consent
  setConsent(granted = true) {
    localStorage.setItem('ga_consent', granted ? 'granted' : 'denied');
    
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_storage: 'denied', // Always deny ad storage for privacy
      });
    }
  }

  // Opt out of tracking
  optOut() {
    this.setConsent(false);
    if (window.gtag) {
      window.gtag('config', this.measurementId, {
        send_page_view: false,
      });
    }
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;