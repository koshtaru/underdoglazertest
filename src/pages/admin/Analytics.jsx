import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MessageSquare,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  AlertCircle,
  Gauge,
  GripVertical,
  Smartphone,
  Monitor,
  Activity,
  Search,
  Zap,
  Timer,
  MousePointer,
  Layout,
  Wifi,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  File,
  Globe,
  Home,
  BarChart3,
  Star,
  Medal,
  Award,
  Settings,
  RotateCcw,
  EyeOff,
  ChevronDown
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import {
  CSS
} from '@dnd-kit/utilities';
import { useAnalytics } from '../../hooks/useAnalytics';

// Time period options
const PERIODS = [
  { value: '1d', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' }
];

// Sortable Card Wrapper Component
const SortableCard = ({ id, children, arrangeMode = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div style={{ 
        position: 'relative',
        border: arrangeMode ? '2px dashed var(--clr-accent)' : 'none',
        borderRadius: arrangeMode ? 'var(--border-radius)' : '0',
        transition: 'border 0.2s ease'
      }}>
        {/* Drag Handle - only show in arrange mode */}
        {arrangeMode && (
          <div
            {...listeners}
            style={{
              position: 'absolute',
              top: 'var(--space-sm)',
              right: 'var(--space-sm)',
              zIndex: 10,
              cursor: 'grab',
              padding: 'var(--space-xs)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--clr-accent)',
              opacity: 0.9,
              transition: 'opacity 0.2s ease, background-color 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.backgroundColor = 'var(--clr-accent-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.backgroundColor = 'var(--clr-accent)';
            }}
            title="Drag to reorder cards"
          >
            <GripVertical 
              style={{ 
                width: '1rem', 
                height: '1rem', 
                color: 'var(--clr-bg)' 
              }} 
            />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// Sortable Individual Card Component with Glow Effects
const SortableIndividualCard = ({ id, children, arrangeMode = false, group }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div style={{ 
        position: 'relative',
        border: arrangeMode ? '1px dashed var(--clr-accent)' : 'none',
        borderRadius: arrangeMode ? 'var(--border-radius)' : '0',
        transition: 'all 0.3s ease',
        cursor: arrangeMode ? 'grab' : 'default',
        // Glow effect on hover when in arrange mode
        boxShadow: arrangeMode ? '0 0 0 rgba(59, 130, 246, 0)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (arrangeMode) {
          e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.4)';
          e.currentTarget.style.borderColor = 'var(--clr-accent)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (arrangeMode) {
          e.currentTarget.style.boxShadow = '0 0 0 rgba(59, 130, 246, 0)';
          e.currentTarget.style.borderColor = 'var(--clr-accent)';
          e.currentTarget.style.transform = 'translateY(0px)';
        }
      }}
      {...(arrangeMode ? listeners : {})}
      >
        {/* Small drag handle indicator - only show in arrange mode */}
        {arrangeMode && (
          <div
            style={{
              position: 'absolute',
              top: 'var(--space-xs)',
              right: 'var(--space-xs)',
              zIndex: 10,
              padding: 'var(--space-xs)',
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderRadius: '50%',
              opacity: 0.8,
              transition: 'var(--transition)',
              cursor: 'grab'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.backgroundColor = 'var(--clr-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)';
            }}
            title={`Drag to reorder ${group} cards`}
          >
            <GripVertical 
              style={{ 
                width: '0.75rem', 
                height: '0.75rem', 
                color: 'white'
              }} 
            />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  
  // Card order state management
  const [cardOrder, setCardOrder] = useState(() => {
    const saved = localStorage.getItem('analytics-card-order');
    return saved ? JSON.parse(saved) : [
      'overview-metrics',
      'traffic-leads',
      'pages-vitals',
      'conversions',
      'performance'
    ];
  });
  const [activeCard, setActiveCard] = useState(null);
  
  // Individual card order state management for each group
  const [overviewCardOrder, setOverviewCardOrder] = useState(() => {
    const saved = localStorage.getItem('analytics-overview-card-order');
    return saved ? JSON.parse(saved) : [
      'total-visitors',
      'page-views', 
      'contact-forms',
      'bounce-rate',
      'session-duration',
      'conversion-rate',
      'performance-score'
    ];
  });
  
  const [topPagesOrder, setTopPagesOrder] = useState(() => {
    const saved = localStorage.getItem('analytics-top-pages-order');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [coreWebVitalsOrder, setCoreWebVitalsOrder] = useState(() => {
    const saved = localStorage.getItem('analytics-core-web-vitals-order');
    return saved ? JSON.parse(saved) : [
      'lcp',
      'inp', 
      'cls',
      'fcp',
      'ttfb'
    ];
  });
  
  const [performanceCardOrder, setPerformanceCardOrder] = useState(() => {
    const saved = localStorage.getItem('analytics-performance-card-order');
    return saved ? JSON.parse(saved) : [
      'mobile-load',
      'desktop-load',
      'uptime',
      'seo'
    ];
  });
  
  // Card visibility state management
  const [cardVisibility, setCardVisibility] = useState(() => {
    const saved = localStorage.getItem('analytics-card-visibility');
    return saved ? JSON.parse(saved) : {
      'overview-metrics': {
        enabled: true,
        cards: {
          'total-visitors': true,
          'page-views': true,
          'contact-forms': true,
          'bounce-rate': true,
          'session-duration': true,
          'conversion-rate': true,
          'performance-score': true
        }
      },
      'pages-vitals': {
        'top-pages': {
          enabled: true,
          cards: {} // Individual page cards will be populated dynamically
        },
        'core-web-vitals': {
          enabled: true,
          cards: {
            'lcp': true,
            'inp': true,
            'cls': true,
            'fcp': true,
            'ttfb': true
          }
        }
      },
      'traffic-leads': {
        'leads-by-type': {
          enabled: true,
          cards: {
            'corporate-awards': true,
            'personalized-gifts': true,
            'business-signage': true,
            'memorial-commemorative': true,
            'industrial-marking': true,
            'promotional-products': true
          }
        }
      }
      // Future sections can be added here
    };
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showCoreWebVitalsSettings, setShowCoreWebVitalsSettings] = useState(false);
  const [showLeadsSettings, setShowLeadsSettings] = useState(false);
  const [arrangeMode, setArrangeMode] = useState(false);

  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Save card order to localStorage
  useEffect(() => {
    localStorage.setItem('analytics-card-order', JSON.stringify(cardOrder));
  }, [cardOrder]);
  
  // Save card visibility to localStorage
  useEffect(() => {
    localStorage.setItem('analytics-card-visibility', JSON.stringify(cardVisibility));
  }, [cardVisibility]);
  
  // Save individual card orders to localStorage
  useEffect(() => {
    localStorage.setItem('analytics-overview-card-order', JSON.stringify(overviewCardOrder));
  }, [overviewCardOrder]);
  
  useEffect(() => {
    localStorage.setItem('analytics-top-pages-order', JSON.stringify(topPagesOrder));
  }, [topPagesOrder]);
  
  useEffect(() => {
    localStorage.setItem('analytics-core-web-vitals-order', JSON.stringify(coreWebVitalsOrder));
  }, [coreWebVitalsOrder]);
  
  useEffect(() => {
    localStorage.setItem('analytics-performance-card-order', JSON.stringify(performanceCardOrder));
  }, [performanceCardOrder]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click was inside a dropdown or button
      const periodDropdown = event.target.closest('[data-dropdown="period"]');
      const settingsDropdown = event.target.closest('[data-dropdown="settings"]');
      const coreWebVitalsDropdown = event.target.closest('[data-dropdown="core-web-vitals-settings"]');
      const leadsSettingsDropdown = event.target.closest('[data-dropdown="leads-settings"]');
      
      // Close period dropdown if clicking outside of it
      if (showPeriodDropdown && !periodDropdown) {
        setShowPeriodDropdown(false);
      }
      
      // Close settings dropdown if clicking outside of it  
      if (showSettings && !settingsDropdown) {
        setShowSettings(false);
      }
      
      // Close Core Web Vitals dropdown if clicking outside of it  
      if (showCoreWebVitalsSettings && !coreWebVitalsDropdown) {
        setShowCoreWebVitalsSettings(false);
      }
      
      // Close Leads Settings dropdown if clicking outside of it  
      if (showLeadsSettings && !leadsSettingsDropdown) {
        setShowLeadsSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPeriodDropdown, showSettings, showCoreWebVitalsSettings, showLeadsSettings]);
  
  // Use live analytics data
  const { data: analyticsData, loading, error, refresh, isStale } = useAnalytics(selectedPeriod, true);
  const [refreshing, setRefreshing] = useState(false);

  // Transform live analytics data to component format
  const transformAnalyticsData = (data) => {
    if (!data || !data.overview || !data.trafficSources || !data.topPages) {
      // Return fallback structure if data is not available
      return {
        overview: {
          totalVisitors: { value: 0, change: 0, trend: 'neutral' },
          pageViews: { value: 0, change: 0, trend: 'neutral' },
          contactForms: { value: 0, change: 0, trend: 'neutral' },
          bounceRate: { value: 0, change: 0, trend: 'neutral' },
          avgSessionDuration: { value: '0m 0s', change: 0, trend: 'neutral' },
          conversionRate: { value: 0, change: 0, trend: 'neutral' },
        performanceScore: { value: 0, change: 0, trend: 'neutral' }
        },
        traffic: {
          sources: [],
          topPages: []
        },
        performance: {
          coreWebVitals: {
            lcp: { displayValue: '0.0', status: 'unknown', unit: 'seconds' },
            inp: { displayValue: '0', status: 'unknown', unit: 'milliseconds' },
            cls: { displayValue: '0.000', status: 'unknown', unit: 'score' },
            fcp: { displayValue: '0.0', status: 'unknown', unit: 'seconds' },
            ttfb: { displayValue: '0', status: 'unknown', unit: 'milliseconds' }
          },
          loadTimes: {
            mobile: { value: 0, change: 0 },
            desktop: { value: 0, change: 0 }
          }
        },
        leads: {
          byType: [],
          recentConversions: []
        }
      };
    }

    // Extract metrics from API response
    const overview = data.overview.metrics || {};
    const trafficSources = data.trafficSources.trafficSources || [];
    const topPages = data.topPages.topPages || [];

    // Helper function to format duration
    const formatDuration = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    };

    // Calculate total sessions for percentages
    const totalSessions = trafficSources.reduce((sum, source) => sum + source.sessions, 0);

    return {
      overview: {
        totalVisitors: {
          value: overview.activeUsers?.value || 0,
          change: parseFloat(overview.activeUsers?.change?.replace('%', '')) || 0,
          trend: overview.activeUsers?.trend || 'neutral'
        },
        pageViews: {
          value: overview.pageviews?.value || 0,
          change: parseFloat(overview.pageviews?.change?.replace('%', '')) || 0,
          trend: overview.pageviews?.trend || 'neutral'
        },
        contactForms: {
          value: overview.conversions?.value || 0,
          change: parseFloat(overview.conversions?.change?.replace('%', '')) || 0,
          trend: overview.conversions?.trend || 'neutral'
        },
        bounceRate: {
          value: overview.bounceRate?.value || 0,
          change: parseFloat(overview.bounceRate?.change?.replace('%', '')) || 0,
          trend: overview.bounceRate?.trend || 'neutral'
        },
        avgSessionDuration: {
          value: formatDuration(overview.avgSessionDuration?.value || 0),
          change: parseFloat(overview.avgSessionDuration?.change?.replace('%', '')) || 0,
          trend: overview.avgSessionDuration?.trend || 'neutral'
        },
        conversionRate: {
          value: totalSessions > 0 ? ((overview.conversions?.value || 0) / totalSessions * 100).toFixed(1) : 0,
          change: 0, // Would need historical data to calculate
          trend: 'neutral'
        },
        performanceScore: {
          value: data.performance?.overall || 0,
          change: 0, // Would need historical data to calculate
          trend: 'neutral'
        }
      },
      traffic: {
        sources: trafficSources.map(source => ({
          name: source.name,
          value: totalSessions > 0 ? ((source.sessions / totalSessions) * 100).toFixed(1) : 0,
          visitors: source.users
        })),
        topPages: topPages.map((page) => {
          const totalPageviews = topPages.reduce((sum, p) => sum + p.pageviews, 0);
          return {
            page: page.path,
            views: page.pageviews,
            percentage: totalPageviews > 0 ? ((page.pageviews / totalPageviews) * 100).toFixed(1) : 0
          };
        })
      },
      performance: {
        coreWebVitals: data.performance?.coreWebVitals || {
          lcp: { displayValue: '0.0', status: 'unknown', unit: 'seconds' },
          inp: { displayValue: '0', status: 'unknown', unit: 'milliseconds' },
          cls: { displayValue: '0.000', status: 'unknown', unit: 'score' },
          fcp: { displayValue: '0.0', status: 'unknown', unit: 'seconds' },
          ttfb: { displayValue: '0', status: 'unknown', unit: 'milliseconds' }
        },
        loadTimes: data.performance?.loadTimes || {
          mobile: { value: 0, change: 0 },
          desktop: { value: 0, change: 0 }
        }
      },
      leads: {
        byType: [
          { type: 'Corporate Branding', count: Math.floor((overview.conversions?.value || 0) * 0.44), percentage: 44 },
          { type: 'Personal Gifts', count: Math.floor((overview.conversions?.value || 0) * 0.22), percentage: 22 },
          { type: 'Promotional Items', count: Math.floor((overview.conversions?.value || 0) * 0.18), percentage: 18 },
          { type: 'Industrial Marking', count: Math.floor((overview.conversions?.value || 0) * 0.16), percentage: 16 }
        ],
        recentConversions: [] // Would need additional API for recent conversions
      }
    };
  };

  // Transform live data to component format
  const transformedData = transformAnalyticsData(analyticsData);
  
  // Populate topPagesOrder when analytics data changes
  useEffect(() => {
    if (analyticsData && transformedData?.traffic?.topPages?.length > 0) {
      const apiPageIds = transformedData.traffic.topPages.map((_, index) => `page-${index}`);
      setTopPagesOrder(prev => {
        // Only update if different to prevent infinite loops
        if (prev.length !== apiPageIds.length || 
            !apiPageIds.every((id, index) => prev[index] === id)) {
          return apiPageIds;
        }
        return prev;
      });
    }
  }, [analyticsData, transformedData?.traffic?.topPages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event) => {
    setActiveCard(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      setCardOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveCard(null);
  };

  // Mini Performance Metric Card Component
  const PerformanceMetricCard = ({ 
    title, 
    value, 
    change, 
    icon: IconComponent, // eslint-disable-line no-unused-vars
    status = 'good',
    suffix = '',
    showProgress = false,
    progressValue = 0
  }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'excellent': return '#22c55e';
        case 'good': return '#84cc16';
        case 'warning': return '#f59e0b';
        case 'poor': return '#ef4444';
        default: return '#84cc16';
      }
    };

    const getChangeColor = (change) => {
      if (change > 0) return '#22c55e';
      if (change < 0) return '#ef4444';
      return '#6b7280';
    };

    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--space-md)',
        transition: 'all 0.2s ease',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <IconComponent style={{ 
              width: '1rem', 
              height: '1rem', 
              color: getStatusColor(status) 
            }} />
            <span style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--clr-text-muted)',
              fontWeight: '500'
            }}>
              {title}
            </span>
          </div>
          <div style={{
            width: '0.5rem',
            height: '0.5rem',
            borderRadius: '50%',
            backgroundColor: getStatusColor(status)
          }}></div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <span style={{ 
              fontSize: 'var(--font-size-xl)', 
              fontWeight: '700', 
              color: 'var(--clr-white)' 
            }}>
              {value}{suffix}
            </span>
            {change !== undefined && change !== 0 && (
              <div style={{ 
                fontSize: 'var(--font-size-xs)', 
                color: getChangeColor(change),
                marginTop: 'var(--space-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)'
              }}>
                {change > 0 ? (
                  <ArrowUpRight style={{ width: '0.75rem', height: '0.75rem' }} />
                ) : (
                  <ArrowDownRight style={{ width: '0.75rem', height: '0.75rem' }} />
                )}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
        </div>
        
        {showProgress && (
          <div style={{ marginTop: 'var(--space-sm)' }}>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressValue}%`,
                height: '100%',
                backgroundColor: getStatusColor(status),
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // eslint-disable-next-line no-unused-vars
  const MetricCard = ({ title, value, change, trend, icon: IconComponent, suffix = '' }) => (
    <div className="admin-card" style={{ borderRadius: 'var(--border-radius)', padding: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ 
            fontSize: 'var(--font-size-sm)', 
            fontWeight: '500', 
            color: 'var(--clr-text-muted)', 
            margin: 0 
          }}>{title}</p>
          <p style={{ 
            fontSize: 'var(--font-size-2xl)', 
            fontWeight: '700', 
            color: 'var(--clr-white)', 
            margin: 0 
          }}>{value}{suffix}</p>
        </div>
        <div style={{ 
          height: '3rem', 
          width: '3rem', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: 'var(--clr-accent)' 
        }}>
          <IconComponent style={{ height: '1.5rem', width: '1.5rem', color: 'var(--clr-bg)' }} />
        </div>
      </div>
      <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center' }}>
        {trend === 'up' ? (
          <ArrowUpRight style={{ height: '1rem', width: '1rem', color: '#22c55e', marginRight: 'var(--space-xs)' }} />
        ) : (
          <ArrowDownRight style={{ height: '1rem', width: '1rem', color: '#ef4444', marginRight: 'var(--space-xs)' }} />
        )}
        <span style={{ 
          fontSize: 'var(--font-size-sm)', 
          fontWeight: '500', 
          color: trend === 'up' ? '#22c55e' : '#ef4444' 
        }}>
          {Math.abs(change)}%
        </span>
        <span style={{ 
          fontSize: 'var(--font-size-sm)', 
          color: 'var(--clr-text-muted)', 
          marginLeft: 'var(--space-xs)' 
        }}>vs previous period</span>
      </div>
    </div>
  );

  const TrafficSourceChart = ({ sources }) => (
    <div className="admin-card" style={{ borderRadius: 'var(--border-radius)', padding: 'var(--space-lg)' }}>
      <h3 style={{ 
        fontSize: 'var(--font-size-xl)', 
        fontWeight: '500', 
        color: 'var(--clr-white)', 
        marginBottom: 'var(--space-lg)', 
        margin: '0 0 var(--space-lg) 0' 
      }}>Traffic Sources</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {sources.map((source, index) => (
          <div key={source.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                marginRight: 'var(--space-sm)',
                backgroundColor: 
                  index === 0 ? 'var(--clr-accent)' :
                  index === 1 ? '#3b82f6' :
                  index === 2 ? '#8b5cf6' : '#f97316'
              }}></div>
              <span style={{ 
                color: 'var(--clr-white)', 
                fontSize: 'var(--font-size-sm)' 
              }}>{source.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <span style={{ 
                color: 'var(--clr-text-muted)', 
                fontSize: 'var(--font-size-sm)' 
              }}>{source.visitors.toLocaleString()}</span>
              <span style={{ 
                color: 'var(--clr-white)', 
                fontWeight: '500' 
              }}>{source.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Card Toggle Button Component
  const CardToggleButton = ({ 
    isVisible, 
    onToggle, 
    position = 'top-right' 
  }) => {
    const Icon = isVisible ? Eye : EyeOff;
    
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        style={{
          position: 'absolute',
          top: position === 'top-right' ? 'var(--space-sm)' : undefined,
          right: position === 'top-right' ? 'var(--space-xl)' : undefined,
          zIndex: 5,
          cursor: 'pointer',
          padding: 'var(--space-xs)',
          borderRadius: 'var(--border-radius)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          opacity: 0.6,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.6';
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        }}
        title={isVisible ? 'Hide this card' : 'Show this card'}
      >
        <Icon 
          style={{ 
            width: '0.75rem', 
            height: '0.75rem', 
            color: isVisible ? 'var(--clr-white)' : 'var(--clr-text-muted)' 
          }} 
        />
      </button>
    );
  };

  // Enhanced Top Page Item Component
  const TopPageItem = ({ 
    page, 
    views, 
    percentage, 
    rank,
    isVisible = true
  }) => {
    // Icon mapping system for different page types
    const getPageIcon = (pagePath) => {
      if (pagePath === '/' || pagePath === '/home') return Home;
      if (pagePath.includes('/about')) return Users;
      if (pagePath.includes('/contact')) return MessageSquare;
      if (pagePath.includes('/gallery')) return Eye;
      if (pagePath.includes('/admin')) return Gauge;
      if (pagePath.includes('.pdf') || pagePath.includes('.doc')) return File;
      if (pagePath.startsWith('http')) return Globe;
      return File; // Default for other pages
    };

    // Performance tier system based on view percentage
    const getPerformanceTier = (percentage) => {
      if (percentage >= 30) return { tier: 'excellent', color: '#22c55e', icon: Medal };
      if (percentage >= 15) return { tier: 'high', color: '#3b82f6', icon: Award };
      if (percentage >= 5) return { tier: 'good', color: '#f59e0b', icon: Star };
      return { tier: 'average', color: '#6b7280', icon: null };
    };

    // Rank styling for visual hierarchy
    const getRankColor = (rank) => {
      if (rank === 1) return '#ffd700'; // Gold
      if (rank === 2) return '#c0c0c0'; // Silver
      if (rank === 3) return '#cd7f32'; // Bronze
      return 'var(--clr-text-muted)';
    };

    const PageIcon = getPageIcon(page);
    const performance = getPerformanceTier(percentage);
    const PerformanceIcon = performance.icon;

    // Don't render if card is hidden
    if (!isVisible) {
      return null;
    }

    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--space-md)',
        transition: 'all 0.2s ease',
        cursor: 'default',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.borderColor = performance.color + '40';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
      >
        {/* Header with rank, page icon, and performance badge */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: 'var(--space-sm)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            {/* Rank indicator */}
            <div style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: '700',
              color: getRankColor(rank),
              minWidth: '1.5rem',
              textAlign: 'center'
            }}>
              #{rank}
            </div>
            
            {/* Page icon */}
            <PageIcon style={{ 
              width: '1rem', 
              height: '1rem', 
              color: 'var(--clr-accent)' 
            }} />
          </div>
          
          {/* Performance badge */}
          {PerformanceIcon && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              padding: 'var(--space-xs)',
              borderRadius: 'var(--border-radius)',
              backgroundColor: performance.color + '20',
              border: `1px solid ${performance.color}40`
            }}>
              <PerformanceIcon style={{
                width: '0.75rem',
                height: '0.75rem',
                color: performance.color
              }} />
            </div>
          )}
        </div>

        {/* Page path */}
        <div style={{ marginBottom: 'var(--space-sm)' }}>
          <div style={{ 
            fontSize: 'var(--font-size-sm)', 
            fontWeight: '600',
            color: 'var(--clr-white)',
            marginBottom: 'var(--space-xs)',
            wordBreak: 'break-all',
            lineHeight: '1.3'
          }}>
            {page}
          </div>
        </div>

        {/* Metrics */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 'var(--space-sm)'
        }}>
          <div style={{ 
            fontSize: 'var(--font-size-xl)', 
            fontWeight: '700', 
            color: performance.color
          }}>
            {views.toLocaleString()}
          </div>
          <div style={{ 
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--clr-text-muted)',
            textAlign: 'right'
          }}>
            <div>{percentage}% of total</div>
            <div>views</div>
          </div>
        </div>

        {/* Engagement progress bar */}
        <div style={{ marginBottom: 'var(--space-xs)' }}>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, percentage * 2)}%`, // Scale percentage for better visual representation
              height: '100%',
              backgroundColor: performance.color,
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Performance tier label */}
        <div style={{ 
          fontSize: 'var(--font-size-xs)', 
          color: performance.color,
          textAlign: 'center',
          fontWeight: '500',
          textTransform: 'capitalize'
        }}>
          {performance.tier} Performance
        </div>
      </div>
    );
  };

  const TopPagesCard = ({ pages, cardVisibility, setCardVisibility }) => {
    const [showTopPagesSettings, setShowTopPagesSettings] = useState(false);
    
    // Rank styling for visual hierarchy
    const getRankColor = (rank) => {
      if (rank === 1) return '#ffd700'; // Gold
      if (rank === 2) return '#c0c0c0'; // Silver
      if (rank === 3) return '#cd7f32'; // Bronze
      return 'var(--clr-text-muted)';
    };
    
    // Initialize individual page visibility if not present
    const initializePageVisibility = (pages) => {
      const currentCards = cardVisibility['pages-vitals']?.['top-pages']?.cards || {};
      const newCards = { ...currentCards };
      
      pages.forEach((page, index) => {
        const pageId = `page-${index}`;
        if (!(pageId in newCards)) {
          newCards[pageId] = true; // Default to visible
        }
      });
      
      if (Object.keys(newCards).length !== Object.keys(currentCards).length) {
        setCardVisibility(prev => ({
          ...prev,
          'pages-vitals': {
            ...prev['pages-vitals'],
            'top-pages': {
              ...prev['pages-vitals']?.['top-pages'],
              cards: newCards
            }
          }
        }));
      }
      
      return newCards;
    };
    
    const pageVisibility = initializePageVisibility(pages);
    
    const handleTogglePageVisibility = (pageId) => {
      setCardVisibility(prev => ({
        ...prev,
        'pages-vitals': {
          ...prev['pages-vitals'],
          'top-pages': {
            ...prev['pages-vitals']?.['top-pages'],
            cards: {
              ...prev['pages-vitals']?.['top-pages']?.cards,
              [pageId]: !prev['pages-vitals']?.['top-pages']?.cards?.[pageId]
            }
          }
        }
      }));
    };

    // Show/hide all pages functionality
    const handleToggleAllPages = (visible) => {
      const allPagesState = {};
      pages.forEach((page, index) => {
        const pageId = `page-${index}`;
        allPagesState[pageId] = visible;
      });
      
      setCardVisibility(prev => ({
        ...prev,
        'pages-vitals': {
          ...prev['pages-vitals'],
          'top-pages': {
            ...prev['pages-vitals']?.['top-pages'],
            cards: allPagesState
          }
        }
      }));
    };

    // Reset to defaults functionality
    const handleResetPages = () => {
      const defaultState = {};
      pages.forEach((page, index) => {
        const pageId = `page-${index}`;
        defaultState[pageId] = true;
      });
      
      setCardVisibility(prev => ({
        ...prev,
        'pages-vitals': {
          ...prev['pages-vitals'],
          'top-pages': {
            ...prev['pages-vitals']?.['top-pages'],
            cards: defaultState
          }
        }
      }));
    };

    return (
      <div className="admin-card rounded-lg" style={{ padding: 'var(--space-lg)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 'var(--space-lg)' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-sm)'
          }}>
            <BarChart3 style={{ 
              width: '1.25rem', 
              height: '1.25rem', 
              color: 'var(--clr-accent)' 
            }} />
            <h3 style={{ 
              fontSize: 'var(--font-size-xl)', 
              fontWeight: '600', 
              color: 'var(--clr-white)',
              margin: 0
            }}>
              Top Pages ⭐
            </h3>
          </div>

          {/* Top Pages Settings Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTopPagesSettings(!showTopPagesSettings)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--space-sm)',
                backgroundColor: showTopPagesSettings ? 'var(--clr-accent)' : 'rgba(255, 255, 255, 0.1)',
                color: showTopPagesSettings ? 'var(--clr-bg)' : 'var(--clr-white)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                if (!showTopPagesSettings) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showTopPagesSettings) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              title="Top Pages Visibility Settings"
            >
              <Settings style={{ 
                height: '1rem', 
                width: '1rem'
              }} />
            </button>
            
            {/* Top Pages Settings Dropdown Menu */}
            {showTopPagesSettings && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                zIndex: 50,
                marginTop: 'var(--space-xs)',
                backgroundColor: 'var(--clr-bg-light)',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--border-radius)',
                padding: 'var(--space-md)',
                minWidth: '320px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-md)',
                  paddingBottom: 'var(--space-sm)',
                  borderBottom: '1px solid var(--clr-border)'
                }}>
                  <h4 style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    color: 'var(--clr-white)',
                    margin: 0
                  }}>
                    Top Pages Visibility
                  </h4>
                  <button
                    onClick={handleResetPages}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)',
                      padding: 'var(--space-xs)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--clr-border)',
                      borderRadius: 'var(--border-radius)',
                      color: 'var(--clr-text-muted)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-xs)',
                      transition: 'var(--transition)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = 'var(--clr-white)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--clr-text-muted)';
                    }}
                    title="Reset all pages to visible"
                  >
                    <RotateCcw style={{ width: '0.75rem', height: '0.75rem' }} />
                    Reset
                  </button>
                </div>

                {/* Show/Hide All Controls */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '500',
                    color: 'var(--clr-text-muted)',
                    marginBottom: 'var(--space-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Quick Actions
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-md)'
                  }}>
                    <button
                      onClick={() => handleToggleAllPages(true)}
                      style={{
                        flex: 1,
                        padding: 'var(--space-xs)',
                        backgroundColor: 'var(--clr-accent)',
                        color: 'var(--clr-bg)',
                        border: 'none',
                        borderRadius: 'var(--border-radius)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--clr-accent-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--clr-accent)';
                      }}
                    >
                      Show All
                    </button>
                    <button
                      onClick={() => handleToggleAllPages(false)}
                      style={{
                        flex: 1,
                        padding: 'var(--space-xs)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--clr-white)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 'var(--border-radius)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      Hide All
                    </button>
                  </div>
                </div>

                {/* Individual Page Controls */}
                <div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '500',
                    color: 'var(--clr-text-muted)',
                    marginBottom: 'var(--space-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Individual Pages
                  </div>
                  
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    paddingRight: 'var(--space-xs)'
                  }}>
                    {pages.map((page, index) => {
                      const pageId = `page-${index}`;
                      const isVisible = pageVisibility[pageId] !== false;
                      
                      return (
                        <div key={pageId} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 'var(--space-sm)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            flex: 1,
                            minWidth: 0
                          }}>
                            <span style={{
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: '500',
                              color: getRankColor(index + 1)
                            }}>
                              #{index + 1}
                            </span>
                            <span style={{
                              fontSize: 'var(--font-size-xs)',
                              color: 'var(--clr-white)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {page.page}
                            </span>
                          </div>
                          <label style={{
                            position: 'relative',
                            display: 'inline-block',
                            width: '2rem',
                            height: '1rem',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}>
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={() => handleTogglePageVisibility(pageId)}
                              style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: isVisible ? 'var(--clr-accent)' : '#374151',
                              borderRadius: '1rem',
                              transition: 'var(--transition)',
                              cursor: 'pointer'
                            }}>
                              <span style={{
                                position: 'absolute',
                                content: '""',
                                height: '0.75rem',
                                width: '0.75rem',
                                left: isVisible ? 'calc(100% - 1rem)' : '0.125rem',
                                bottom: '0.125rem',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                transition: 'var(--transition)'
                              }}></span>
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleTopPagesDragEnd}
        >
          <SortableContext
            items={topPagesOrder}
            strategy={rectSortingStrategy}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: 'var(--space-md)' 
            }}>
              {topPagesOrder.map((pageId) => {
                const pageIndex = parseInt(pageId.split('-')[1]);
                const pageData = pages[pageIndex];
                const isVisible = pageVisibility[pageId] !== false;
                
                if (!pageData || !isVisible) return null;
                
                return renderTopPageCard(pageId, {
                  ...pageData,
                  rank: pageIndex + 1
                });
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  };

  // Enhanced Core Web Vital Metric Card Component
  const CoreWebVitalMetric = ({ 
    metric, 
    value, 
    unit, 
    status, 
    icon: IconComponent, // eslint-disable-line no-unused-vars
    description,
    thresholds,
    isVisible = true,
    onToggleVisibility
  }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'good': return '#22c55e';
        case 'needs-improvement': return '#f59e0b';
        case 'poor': return '#ef4444';
        default: return '#6b7280';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'good': return CheckCircle;
        case 'needs-improvement': return AlertTriangle;
        case 'poor': return XCircle;
        default: return HelpCircle;
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'good': return 'Good';
        case 'needs-improvement': return 'Needs Improvement';
        case 'poor': return 'Poor';
        default: return 'Unknown';
      }
    };

    const getProgressValue = (metric, value, status) => {
      // Calculate progress based on thresholds
      const numValue = parseFloat(value);
      switch (metric) {
        case 'LCP':
          if (numValue <= 2.5) return Math.min(100, (2.5 - numValue) / 2.5 * 100 + 50);
          if (numValue <= 4.0) return Math.max(25, 50 - (numValue - 2.5) / 1.5 * 25);
          return Math.max(0, 25 - (numValue - 4.0) / 2 * 25);
        case 'INP':
          if (numValue <= 200) return Math.min(100, (200 - numValue) / 200 * 100 + 50);
          if (numValue <= 500) return Math.max(25, 50 - (numValue - 200) / 300 * 25);
          return Math.max(0, 25 - (numValue - 500) / 500 * 25);
        case 'CLS':
          if (numValue <= 0.1) return Math.min(100, (0.1 - numValue) / 0.1 * 100 + 50);
          if (numValue <= 0.25) return Math.max(25, 50 - (numValue - 0.1) / 0.15 * 25);
          return Math.max(0, 25 - (numValue - 0.25) / 0.25 * 25);
        case 'FCP':
          if (numValue <= 1.8) return Math.min(100, (1.8 - numValue) / 1.8 * 100 + 50);
          if (numValue <= 3.0) return Math.max(25, 50 - (numValue - 1.8) / 1.2 * 25);
          return Math.max(0, 25 - (numValue - 3.0) / 2 * 25);
        case 'TTFB':
          if (numValue <= 800) return Math.min(100, (800 - numValue) / 800 * 100 + 50);
          if (numValue <= 1800) return Math.max(25, 50 - (numValue - 800) / 1000 * 25);
          return Math.max(0, 25 - (numValue - 1800) / 1000 * 25);
        default:
          return status === 'good' ? 85 : status === 'needs-improvement' ? 50 : 25;
      }
    };

    const StatusIcon = getStatusIcon(status);
    const progressValue = getProgressValue(metric, value, status);

    // Don't render if card is hidden
    if (!isVisible) {
      return null;
    }

    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--space-md)',
        transition: 'all 0.2s ease',
        cursor: 'default',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.borderColor = getStatusColor(status) + '40';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
      title={description}
      >
        {/* Card Toggle Button */}
        {onToggleVisibility && (
          <CardToggleButton
            isVisible={isVisible}
            onToggle={() => onToggleVisibility(metric.toLowerCase())}
            position="top-right"
          />
        )}
        
        {/* Header with icon and status */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: 'var(--space-sm)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <IconComponent style={{ 
              width: '1rem', 
              height: '1rem', 
              color: getStatusColor(status) 
            }} />
            <span style={{ 
              fontSize: 'var(--font-size-sm)', 
              fontWeight: '600',
              color: 'var(--clr-white)' 
            }}>
              {metric}
            </span>
          </div>
          <StatusIcon style={{
            width: '1rem',
            height: '1rem',
            color: getStatusColor(status)
          }} />
        </div>

        {/* Value */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
          <div style={{ 
            fontSize: 'var(--font-size-2xl)', 
            fontWeight: '700', 
            color: getStatusColor(status),
            lineHeight: '1.2'
          }}>
            {value}{unit}
          </div>
        </div>

        {/* Status text */}
        <div style={{ 
          fontSize: 'var(--font-size-xs)', 
          color: getStatusColor(status),
          textAlign: 'center',
          marginBottom: 'var(--space-sm)',
          fontWeight: '500'
        }}>
          {getStatusText(status)}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 'var(--space-xs)' }}>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressValue}%`,
              height: '100%',
              backgroundColor: getStatusColor(status),
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Threshold info */}
        {thresholds && (
          <div style={{ 
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--clr-text-muted)',
            textAlign: 'center'
          }}>
            Good: {thresholds.good}
          </div>
        )}
      </div>
    );
  };

  const CoreWebVitalsCard = ({ vitals, cardVisibility, setCardVisibility, showCoreWebVitalsSettings, setShowCoreWebVitalsSettings }) => {
    
    // Initialize individual metric visibility if not present
    const initializeMetricVisibility = () => {
      const currentCards = cardVisibility['pages-vitals']?.['core-web-vitals']?.cards || {};
      const newCards = { ...currentCards };
      
      coreWebVitalsOrder.forEach((metricId) => {
        if (!(metricId in newCards)) {
          newCards[metricId] = true; // Default to visible
        }
      });
      
      if (Object.keys(newCards).length !== Object.keys(currentCards).length) {
        setCardVisibility(prev => ({
          ...prev,
          'pages-vitals': {
            ...prev['pages-vitals'],
            'core-web-vitals': {
              ...prev['pages-vitals']?.['core-web-vitals'],
              cards: newCards
            }
          }
        }));
      }
      
      return newCards;
    };
    
    initializeMetricVisibility();
    
    const handleToggleMetricVisibility = (metricId) => {
      setCardVisibility(prev => ({
        ...prev,
        'pages-vitals': {
          ...prev['pages-vitals'],
          'core-web-vitals': {
            ...prev['pages-vitals']?.['core-web-vitals'],
            cards: {
              ...prev['pages-vitals']?.['core-web-vitals']?.cards,
              [metricId]: !prev['pages-vitals']?.['core-web-vitals']?.cards?.[metricId]
            }
          }
        }
      }));
    };

    // Show/hide all metrics functionality
    const handleToggleAllCoreWebVitals = (visible) => {
      const allMetricsState = {};
      coreWebVitalsOrder.forEach((metricId) => {
        allMetricsState[metricId] = visible;
      });
      
      setCardVisibility(prev => ({
        ...prev,
        'pages-vitals': {
          ...prev['pages-vitals'],
          'core-web-vitals': {
            ...prev['pages-vitals']?.['core-web-vitals'],
            cards: allMetricsState
          }
        }
      }));
    };

    // Reset to defaults functionality
    const handleResetCoreWebVitals = () => {
      const defaultState = {};
      coreWebVitalsOrder.forEach((metricId) => {
        defaultState[metricId] = true;
      });
      
      setCardVisibility(prev => ({
        ...prev,
        'pages-vitals': {
          ...prev['pages-vitals'],
          'core-web-vitals': {
            ...prev['pages-vitals']?.['core-web-vitals'],
            cards: defaultState
          }
        }
      }));
    };

    return (
      <div className="admin-card rounded-lg" style={{ padding: 'var(--space-lg)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-lg)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            <Gauge style={{ 
              width: '1.25rem', 
              height: '1.25rem', 
              color: 'var(--clr-accent)' 
            }} />
            <h3 style={{ 
              fontSize: 'var(--font-size-xl)', 
              fontWeight: '600', 
              color: 'var(--clr-white)',
              margin: 0
            }}>
              Core Web Vitals ✨
            </h3>
          </div>

          {/* Core Web Vitals Settings Dropdown */}
          <div style={{ position: 'relative' }} data-dropdown="core-web-vitals-settings">
            <button
              onClick={() => setShowCoreWebVitalsSettings(!showCoreWebVitalsSettings)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--space-sm)',
                backgroundColor: showCoreWebVitalsSettings ? 'var(--clr-accent)' : 'rgba(255, 255, 255, 0.1)',
                color: showCoreWebVitalsSettings ? 'var(--clr-bg)' : 'var(--clr-white)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                if (!showCoreWebVitalsSettings) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showCoreWebVitalsSettings) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              title="Core Web Vitals Visibility Settings"
            >
              <Settings style={{ 
                height: '1rem', 
                width: '1rem'
              }} />
            </button>
            
            {/* Core Web Vitals Settings Dropdown Menu */}
            {showCoreWebVitalsSettings && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                zIndex: 50,
                marginTop: 'var(--space-xs)',
                backgroundColor: 'var(--clr-bg-light)',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--border-radius)',
                padding: 'var(--space-md)',
                minWidth: '320px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-md)',
                  paddingBottom: 'var(--space-sm)',
                  borderBottom: '1px solid var(--clr-border)'
                }}>
                  <h4 style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    color: 'var(--clr-white)',
                    margin: 0
                  }}>
                    Core Web Vitals Visibility
                  </h4>
                  <button
                    onClick={handleResetCoreWebVitals}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)',
                      padding: 'var(--space-xs)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--clr-border)',
                      borderRadius: 'var(--border-radius)',
                      color: 'var(--clr-text-muted)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-xs)',
                      transition: 'var(--transition)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = 'var(--clr-white)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--clr-text-muted)';
                    }}
                    title="Reset all metrics to visible"
                  >
                    <RotateCcw style={{ width: '0.75rem', height: '0.75rem' }} />
                    Reset
                  </button>
                </div>

                {/* Show/Hide All Controls */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '500',
                    color: 'var(--clr-text-muted)',
                    marginBottom: 'var(--space-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Quick Actions
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-md)'
                  }}>
                    <button
                      onClick={() => handleToggleAllCoreWebVitals(true)}
                      style={{
                        flex: 1,
                        padding: 'var(--space-xs)',
                        backgroundColor: 'var(--clr-accent)',
                        color: 'var(--clr-bg)',
                        border: 'none',
                        borderRadius: 'var(--border-radius)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--clr-accent-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--clr-accent)';
                      }}
                    >
                      Show All
                    </button>
                    <button
                      onClick={() => handleToggleAllCoreWebVitals(false)}
                      style={{
                        flex: 1,
                        padding: 'var(--space-xs)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--border-radius)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      }}
                    >
                      Hide All
                    </button>
                  </div>
                </div>
                
                {/* Individual Core Web Vitals Toggles */}
                <div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '500',
                    color: 'var(--clr-text-muted)',
                    marginBottom: 'var(--space-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Individual Metrics
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {coreWebVitalsOrder.map((metricId) => {
                      const vitalsMapping = {
                        'lcp': { metric: 'LCP', icon: Timer, description: 'Largest Contentful Paint' },
                        'inp': { metric: 'INP', icon: MousePointer, description: 'Interaction to Next Paint' },
                        'cls': { metric: 'CLS', icon: Layout, description: 'Cumulative Layout Shift' },
                        'fcp': { metric: 'FCP', icon: Zap, description: 'First Contentful Paint' },
                        'ttfb': { metric: 'TTFB', icon: Wifi, description: 'Time to First Byte' }
                      };
                      
                      const vitalData = vitalsMapping[metricId];
                      const isVisible = cardVisibility['pages-vitals']?.['core-web-vitals']?.cards?.[metricId] !== false;
                      
                      return (
                        <div key={metricId} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 'var(--space-xs)',
                          borderRadius: 'var(--border-radius)',
                          backgroundColor: isVisible ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.02)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)'
                          }}>
                            <vitalData.icon style={{
                              width: '1rem',
                              height: '1rem',
                              color: isVisible ? 'var(--clr-accent)' : 'var(--clr-text-muted)'
                            }} />
                            <div>
                              <span style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--clr-white)',
                                fontWeight: '500'
                              }}>
                                {vitalData.metric}
                              </span>
                              <div style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--clr-text-muted)'
                              }}>
                                {vitalData.description}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleMetricVisibility(metricId)}
                            style={{
                              width: '2.5rem',
                              height: '1.25rem',
                              borderRadius: '0.625rem',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'var(--transition)',
                              backgroundColor: isVisible ? '#22c55e' : 'rgba(255, 255, 255, 0.2)',
                              position: 'relative'
                            }}
                          >
                            <div style={{
                              position: 'absolute',
                              top: '0.125rem',
                              left: isVisible ? '1.375rem' : '0.125rem',
                              width: '1rem',
                              height: '1rem',
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              transition: 'var(--transition)',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                            }}></div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleCoreWebVitalsDragEnd}
        >
          <SortableContext
            items={coreWebVitalsOrder}
            strategy={rectSortingStrategy}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 'var(--space-md)' 
            }}>
              {coreWebVitalsOrder.map((metricId) => 
                renderCoreWebVitalCard(metricId, vitals, cardVisibility, setCardVisibility)
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  };

  const LeadsByTypeChart = () => {
    // Mock data for product types with icons and enhanced metrics
    const productTypeData = [
      {
        id: 'corporate-awards',
        type: 'Corporate Awards & Trophies',
        count: 18,
        percentage: 32,
        avgValue: 450,
        conversionRate: 18.5,
        trend: 'up',
        change: 12,
        icon: Award,
        color: 'var(--clr-accent)' // Lime green
      },
      {
        id: 'personalized-gifts',
        type: 'Personalized Gifts & Keepsakes', 
        count: 14,
        percentage: 25,
        avgValue: 275,
        conversionRate: 22.8,
        trend: 'up',
        change: 8,
        icon: Star,
        color: '#3b82f6' // Blue
      },
      {
        id: 'business-signage',
        type: 'Business Signage & Branding',
        count: 11,
        percentage: 20,
        avgValue: 380,
        conversionRate: 15.2,
        trend: 'neutral',
        change: 0,
        icon: Globe,
        color: '#8b5cf6' // Purple
      },
      {
        id: 'memorial-commemorative',
        type: 'Memorial & Commemorative',
        count: 7,
        percentage: 12,
        avgValue: 320,
        conversionRate: 25.0,
        trend: 'up',
        change: 5,
        icon: Medal,
        color: '#f59e0b' // Amber
      },
      {
        id: 'industrial-marking',
        type: 'Industrial Parts Marking',
        count: 4,
        percentage: 7,
        avgValue: 520,
        conversionRate: 12.5,
        trend: 'down',
        change: -3,
        icon: Settings,
        color: '#ef4444' // Red
      },
      {
        id: 'promotional-products',
        type: 'Promotional Products',
        count: 2,
        percentage: 4,
        avgValue: 195,
        conversionRate: 8.7,
        trend: 'neutral',
        change: 0,
        icon: MessageSquare,
        color: '#06b6d4' // Cyan
      }
    ];

    // Helper functions for lead type visibility management
    const handleToggleLeadType = (leadId) => {
      setCardVisibility(prev => ({
        ...prev,
        'traffic-leads': {
          ...prev['traffic-leads'],
          'leads-by-type': {
            ...prev['traffic-leads']?.['leads-by-type'],
            cards: {
              ...prev['traffic-leads']?.['leads-by-type']?.cards,
              [leadId]: !prev['traffic-leads']?.['leads-by-type']?.cards?.[leadId]
            }
          }
        }
      }));
    };

    const handleToggleAllLeads = (visible) => {
      const allLeadsState = {};
      productTypeData.forEach((lead) => {
        allLeadsState[lead.id] = visible;
      });
      
      setCardVisibility(prev => ({
        ...prev,
        'traffic-leads': {
          ...prev['traffic-leads'],
          'leads-by-type': {
            ...prev['traffic-leads']?.['leads-by-type'],
            cards: allLeadsState
          }
        }
      }));
    };

    const handleResetLeads = () => {
      const defaultState = {};
      productTypeData.forEach((lead) => {
        defaultState[lead.id] = true;
      });
      
      setCardVisibility(prev => ({
        ...prev,
        'traffic-leads': {
          ...prev['traffic-leads'],
          'leads-by-type': {
            ...prev['traffic-leads']?.['leads-by-type'],
            cards: defaultState
          }
        }
      }));
    };

    // Filter visible leads
    const visibleLeads = productTypeData.filter(lead => 
      cardVisibility['traffic-leads']?.['leads-by-type']?.cards?.[lead.id] !== false
    );

    return (
      <div className="admin-card" style={{ 
        borderRadius: 'var(--border-radius)', 
        padding: 'var(--space-lg)' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 'var(--space-lg)' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-sm)'
          }}>
            <Users style={{ 
              width: '1.25rem', 
              height: '1.25rem', 
              color: 'var(--clr-accent)' 
            }} />
            <h3 style={{ 
              fontSize: 'var(--font-size-xl)', 
              fontWeight: '600', 
              color: 'var(--clr-white)',
              margin: 0
            }}>
              Leads by Product Type
            </h3>
          </div>

          {/* Leads Settings Dropdown */}
          <div style={{ position: 'relative' }} data-dropdown="leads-settings">
            <button
              onClick={() => setShowLeadsSettings(!showLeadsSettings)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--space-sm)',
                backgroundColor: showLeadsSettings ? 'var(--clr-accent)' : 'rgba(255, 255, 255, 0.1)',
                color: showLeadsSettings ? 'var(--clr-bg)' : 'var(--clr-white)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                if (!showLeadsSettings) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showLeadsSettings) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              title="Lead Types Visibility Settings"
            >
              <Settings style={{ 
                height: '1rem', 
                width: '1rem'
              }} />
            </button>
            
            {/* Leads Settings Dropdown Menu */}
            {showLeadsSettings && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                zIndex: 50,
                marginTop: 'var(--space-xs)',
                backgroundColor: 'var(--clr-bg-light)',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--border-radius)',
                padding: 'var(--space-md)',
                minWidth: '320px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-md)',
                  paddingBottom: 'var(--space-sm)',
                  borderBottom: '1px solid var(--clr-border)'
                }}>
                  <h4 style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    color: 'var(--clr-white)',
                    margin: 0
                  }}>
                    Lead Types Visibility
                  </h4>
                  <button
                    onClick={handleResetLeads}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)',
                      padding: 'var(--space-xs)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--clr-border)',
                      borderRadius: 'var(--border-radius)',
                      color: 'var(--clr-text-muted)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-xs)',
                      transition: 'var(--transition)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = 'var(--clr-white)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--clr-text-muted)';
                    }}
                    title="Reset all lead types to visible"
                  >
                    <RotateCcw style={{ width: '0.75rem', height: '0.75rem' }} />
                    Reset
                  </button>
                </div>

                {/* Show/Hide All Controls */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '500',
                    color: 'var(--clr-text-muted)',
                    marginBottom: 'var(--space-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Quick Actions
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-md)'
                  }}>
                    <button
                      onClick={() => handleToggleAllLeads(true)}
                      style={{
                        flex: 1,
                        padding: 'var(--space-xs)',
                        backgroundColor: 'var(--clr-accent)',
                        color: 'var(--clr-bg)',
                        border: 'none',
                        borderRadius: 'var(--border-radius)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--clr-accent-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--clr-accent)';
                      }}
                    >
                      Show All
                    </button>
                    <button
                      onClick={() => handleToggleAllLeads(false)}
                      style={{
                        flex: 1,
                        padding: 'var(--space-xs)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--border-radius)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      }}
                    >
                      Hide All
                    </button>
                  </div>
                </div>
                
                {/* Individual Lead Type Controls */}
                <div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '500',
                    color: 'var(--clr-text-muted)',
                    marginBottom: 'var(--space-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Individual Lead Types
                  </div>
                  
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    paddingRight: 'var(--space-xs)'
                  }}>
                    {productTypeData.map((lead, index) => (
                      <div key={lead.type} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-xs) 0',
                        borderBottom: index < productTypeData.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-xs)'
                        }}>
                          <div style={{
                            width: '1rem',
                            height: '1rem',
                            borderRadius: '50%',
                            backgroundColor: lead.color,
                            flexShrink: 0
                          }}></div>
                          <span style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--clr-white)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {lead.type}
                          </span>
                        </div>
                        <label style={{
                          position: 'relative',
                          display: 'inline-block',
                          width: '2rem',
                          height: '1rem',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}>
                          <input
                            type="checkbox"
                            checked={cardVisibility['traffic-leads']?.['leads-by-type']?.cards?.[lead.id] !== false}
                            onChange={() => handleToggleLeadType(lead.id)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: cardVisibility['traffic-leads']?.['leads-by-type']?.cards?.[lead.id] !== false ? 'var(--clr-accent)' : '#374151',
                            borderRadius: '1rem',
                            transition: 'var(--transition)',
                            cursor: 'pointer'
                          }}>
                            <span style={{
                              position: 'absolute',
                              content: '',
                              height: '0.75rem',
                              width: '0.75rem',
                              left: cardVisibility['traffic-leads']?.['leads-by-type']?.cards?.[lead.id] !== false ? '1.125rem' : '0.125rem',
                              bottom: '0.125rem',
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              transition: 'var(--transition)'
                            }}></span>
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {visibleLeads.map((lead) => {
            const IconComponent = lead.icon;
            return (
              <div key={lead.type} style={{
                padding: 'var(--space-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--border-radius)',
                transition: 'var(--transition)',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}>
                {/* Header with icon and title */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-sm)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '50%',
                      backgroundColor: lead.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComponent style={{ 
                        width: '1rem', 
                        height: '1rem', 
                        color: 'var(--clr-bg)' 
                      }} />
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        fontWeight: '600',
                        color: 'var(--clr-white)',
                        marginBottom: '2px'
                      }}>
                        {lead.type}
                      </div>
                      <div style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: 'var(--clr-text-muted)'
                      }}>
                        Avg. Value: ${lead.avgValue} • Conv: {lead.conversionRate}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Count and trend */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: 'var(--font-size-lg)', 
                      fontWeight: '700',
                      color: 'var(--clr-white)',
                      marginBottom: '2px'
                    }}>
                      {lead.count}
                    </div>
                    {lead.change !== 0 && (
                      <div style={{ 
                        fontSize: 'var(--font-size-xs)', 
                        color: lead.trend === 'up' ? '#22c55e' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 'var(--space-xs)'
                      }}>
                        {lead.trend === 'up' ? (
                          <ArrowUpRight style={{ width: '0.75rem', height: '0.75rem' }} />
                        ) : (
                          <ArrowDownRight style={{ width: '0.75rem', height: '0.75rem' }} />
                        )}
                        <span>{Math.abs(lead.change)}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress bar */}
                <div style={{ marginTop: 'var(--space-sm)' }}>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${lead.percentage}%`,
                      height: '100%',
                      backgroundColor: lead.color,
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 'var(--space-xs)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--clr-text-muted)'
                  }}>
                    <span>{lead.percentage}% of total leads</span>
                    <span>{lead.count} leads</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary footer */}
        <div style={{
          marginTop: 'var(--space-lg)',
          padding: 'var(--space-md)',
          backgroundColor: 'rgba(50, 205, 50, 0.1)',
          border: '1px solid rgba(50, 205, 50, 0.3)',
          borderRadius: 'var(--border-radius)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--clr-white)',
            fontWeight: '500',
            marginBottom: 'var(--space-xs)'
          }}>
            Total Leads This Period: {visibleLeads.reduce((sum, lead) => sum + lead.count, 0)}
          </div>
          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--clr-text-muted)'
          }}>
            Average conversion rate: {visibleLeads.length > 0 ? (visibleLeads.reduce((sum, lead) => sum + lead.conversionRate, 0) / visibleLeads.length).toFixed(1) : 0}%
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '16rem' 
      }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          borderRadius: '50%',
          width: '2rem',
          height: '2rem',
          border: '2px solid transparent',
          borderBottom: '2px solid var(--clr-accent)'
        }}></div>
        <span style={{ 
          marginLeft: 'var(--space-sm)', 
          color: 'var(--clr-text-muted)' 
        }}>Loading analytics...</span>
      </div>
    );
  }

  // Show error state
  if (error && !loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <div className="admin-card" style={{ 
          borderRadius: 'var(--border-radius)', 
          padding: 'var(--space-lg)',
          textAlign: 'center'
        }}>
          <AlertCircle style={{ 
            width: '3rem', 
            height: '3rem', 
            color: '#ef4444', 
            margin: '0 auto var(--space-md)' 
          }} />
          <h3 style={{ 
            fontSize: 'var(--font-size-xl)', 
            fontWeight: '500', 
            color: 'var(--clr-white)', 
            marginBottom: 'var(--space-sm)' 
          }}>
            Analytics Error
          </h3>
          <p style={{ 
            color: 'var(--clr-text-muted)', 
            marginBottom: 'var(--space-lg)' 
          }}>
            {error}
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              backgroundColor: 'var(--clr-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              padding: 'var(--space-sm) var(--space-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              margin: '0 auto'
            }}
          >
            <RefreshCw style={{ 
              width: '1rem', 
              height: '1rem',
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }} />
            {refreshing ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  // Helper function to render individual metric cards  
  const renderOverviewMetricCard = (cardId) => {
    const metricProps = {
      'total-visitors': {
        title: "Total Visitors",
        value: transformedData.overview.totalVisitors.value.toLocaleString(),
        change: transformedData.overview.totalVisitors.change,
        trend: transformedData.overview.totalVisitors.trend,
        icon: Users
      },
      'page-views': {
        title: "Page Views",
        value: transformedData.overview.pageViews.value.toLocaleString(),
        change: transformedData.overview.pageViews.change,
        trend: transformedData.overview.pageViews.trend,
        icon: Eye
      },
      'contact-forms': {
        title: "Contact Forms",
        value: transformedData.overview.contactForms.value,
        change: transformedData.overview.contactForms.change,
        trend: transformedData.overview.contactForms.trend,
        icon: MessageSquare
      },
      'bounce-rate': {
        title: "Bounce Rate",
        value: transformedData.overview.bounceRate.value,
        change: transformedData.overview.bounceRate.change,
        trend: transformedData.overview.bounceRate.trend,
        icon: TrendingDown,
        suffix: "%"
      },
      'session-duration': {
        title: "Avg Session",
        value: transformedData.overview.avgSessionDuration.value,
        change: transformedData.overview.avgSessionDuration.change,
        trend: transformedData.overview.avgSessionDuration.trend,
        icon: Clock
      },
      'conversion-rate': {
        title: "Conversion Rate",
        value: transformedData.overview.conversionRate.value,
        change: transformedData.overview.conversionRate.change,
        trend: transformedData.overview.conversionRate.trend,
        icon: TrendingUp,
        suffix: "%"
      },
      'performance-score': {
        title: "Performance Score",
        value: transformedData.overview.performanceScore.value,
        change: transformedData.overview.performanceScore.change,
        trend: transformedData.overview.performanceScore.trend,
        icon: Gauge,
        suffix: "/100"
      }
    };

    const props = metricProps[cardId];
    if (!props) return null;

    return (
      <SortableIndividualCard key={cardId} id={cardId} arrangeMode={arrangeMode} group="Overview Metrics">
        <MetricCard {...props} />
      </SortableIndividualCard>
    );
  };

  // Handle individual card drag for overview metrics
  const handleOverviewDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      setOverviewCardOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Handle individual card drag for top pages
  const handleTopPagesDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      setTopPagesOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Helper function to render individual top page cards
  const renderTopPageCard = (pageId, pageData) => {
    if (!pageData) return null;
    
    return (
      <SortableIndividualCard key={pageId} id={pageId} arrangeMode={arrangeMode} group="Top Pages">
        <TopPageItem
          page={pageData.page}
          views={pageData.views}
          percentage={pageData.percentage}
          rank={pageData.rank}
          isVisible={true}
        />
      </SortableIndividualCard>
    );
  };

  // Handle individual card drag for core web vitals
  const handleCoreWebVitalsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      setCoreWebVitalsOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Handle individual card drag for performance metrics
  const handlePerformanceDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      setPerformanceCardOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Helper function to render individual core web vital cards
  const renderCoreWebVitalCard = (metricId, vitals, cardVisibility, setCardVisibility) => {
    const vitalsMapping = {
      'lcp': {
        metric: 'LCP',
        value: vitals.lcp.displayValue,
        unit: vitals.lcp.unit === 'seconds' ? 's' : '',
        status: vitals.lcp.status,
        icon: Timer,
        description: 'Largest Contentful Paint - measures loading performance. Good LCP times are 2.5s or less.',
        thresholds: { good: '≤2.5s', needsImprovement: '≤4.0s', poor: '>4.0s' }
      },
      'inp': {
        metric: 'INP',
        value: vitals.inp.displayValue,
        unit: vitals.inp.unit === 'milliseconds' ? 'ms' : '',
        status: vitals.inp.status,
        icon: MousePointer,
        description: 'Interaction to Next Paint - measures interaction responsiveness. Good INP times are 200ms or less.',
        thresholds: { good: '≤200ms', needsImprovement: '≤500ms', poor: '>500ms' }
      },
      'cls': {
        metric: 'CLS',
        value: vitals.cls.displayValue,
        unit: '',
        status: vitals.cls.status,
        icon: Layout,
        description: 'Cumulative Layout Shift - measures visual stability. Good CLS scores are 0.1 or less.',
        thresholds: { good: '≤0.1', needsImprovement: '≤0.25', poor: '>0.25' }
      },
      'fcp': {
        metric: 'FCP',
        value: vitals.fcp.displayValue,
        unit: vitals.fcp.unit === 'seconds' ? 's' : '',
        status: vitals.fcp.status,
        icon: Zap,
        description: 'First Contentful Paint - measures rendering speed. Good FCP times are 1.8s or less.',
        thresholds: { good: '≤1.8s', needsImprovement: '≤3.0s', poor: '>3.0s' }
      },
      'ttfb': {
        metric: 'TTFB',
        value: vitals.ttfb.displayValue,
        unit: vitals.ttfb.unit === 'milliseconds' ? 'ms' : '',
        status: vitals.ttfb.status,
        icon: Wifi,
        description: 'Time to First Byte - measures server responsiveness. Good TTFB times are 800ms or less.',
        thresholds: { good: '≤800ms', needsImprovement: '≤1800ms', poor: '>1800ms' }
      }
    };

    const vitalData = vitalsMapping[metricId];
    if (!vitalData) return null;

    const handleToggleMetricVisibility = (metricId) => {
      setCardVisibility(prev => ({
        ...prev,
        'pages-vitals': {
          ...prev['pages-vitals'],
          'core-web-vitals': {
            ...prev['pages-vitals']?.['core-web-vitals'],
            cards: {
              ...prev['pages-vitals']?.['core-web-vitals']?.cards,
              [metricId]: !prev['pages-vitals']?.['core-web-vitals']?.cards?.[metricId]
            }
          }
        }
      }));
    };

    const isVisible = cardVisibility['pages-vitals']?.['core-web-vitals']?.cards?.[metricId] !== false;
    if (!isVisible) return null;

    return (
      <SortableIndividualCard key={metricId} id={metricId} arrangeMode={arrangeMode} group="Core Web Vitals">
        <CoreWebVitalMetric
          metric={vitalData.metric}
          value={vitalData.value}
          unit={vitalData.unit}
          status={vitalData.status}
          icon={vitalData.icon}
          description={vitalData.description}
          thresholds={vitalData.thresholds}
          isVisible={isVisible}
          onToggleVisibility={handleToggleMetricVisibility}
        />
      </SortableIndividualCard>
    );
  };

  // Helper function to render individual performance metric cards
  const renderPerformanceMetricCard = (cardId) => {
    // Helper function to determine performance status based on values
    const getPerformanceStatus = (metric, value) => {
      switch (metric) {
        case 'mobile-load':
        case 'desktop-load':
          if (value <= 1.5) return 'excellent';
          if (value <= 2.5) return 'good';
          if (value <= 4.0) return 'warning';
          return 'poor';
        case 'uptime':
          if (value >= 99.9) return 'excellent';
          if (value >= 99.0) return 'good';
          if (value >= 95.0) return 'warning';
          return 'poor';
        case 'seo':
          if (value >= 90) return 'excellent';
          if (value >= 80) return 'good';
          if (value >= 70) return 'warning';
          return 'poor';
        default:
          return 'good';
      }
    };

    const performanceMapping = {
      'mobile-load': {
        title: "Mobile Load Time",
        value: transformedData.performance.loadTimes.mobile.value,
        change: transformedData.performance.loadTimes.mobile.change,
        icon: Smartphone,
        status: getPerformanceStatus('mobile-load', transformedData.performance.loadTimes.mobile.value),
        suffix: "s",
        showProgress: true,
        progressValue: Math.max(0, Math.min(100, (4.0 - transformedData.performance.loadTimes.mobile.value) / 4.0 * 100))
      },
      'desktop-load': {
        title: "Desktop Load Time",
        value: transformedData.performance.loadTimes.desktop.value,
        change: transformedData.performance.loadTimes.desktop.change,
        icon: Monitor,
        status: getPerformanceStatus('desktop-load', transformedData.performance.loadTimes.desktop.value),
        suffix: "s",
        showProgress: true,
        progressValue: Math.max(0, Math.min(100, (4.0 - transformedData.performance.loadTimes.desktop.value) / 4.0 * 100))
      },
      'uptime': {
        title: "Uptime",
        value: "99.9",
        icon: Activity,
        status: getPerformanceStatus('uptime', 99.9),
        suffix: "%",
        showProgress: true,
        progressValue: 99.9
      },
      'seo': {
        title: "SEO Score",
        value: "94",
        icon: Search,
        status: getPerformanceStatus('seo', 94),
        suffix: "/100",
        showProgress: true,
        progressValue: 94
      }
    };

    const perfData = performanceMapping[cardId];
    if (!perfData) return null;

    return (
      <SortableIndividualCard key={cardId} id={cardId} arrangeMode={arrangeMode} group="Performance Summary">
        <PerformanceMetricCard {...perfData} />
      </SortableIndividualCard>
    );
  };

  // Render card sections with proper ordering
  const renderCardSection = (sectionId) => {
    switch (sectionId) {
      case 'overview-metrics':
        if (!cardVisibility['overview-metrics']?.enabled) return null;
        
        return (
          <SortableCard key={sectionId} id={sectionId} arrangeMode={arrangeMode}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleOverviewDragEnd}
            >
              <SortableContext
                items={overviewCardOrder}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-3" style={{ gap: 'var(--space-lg)', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                  {overviewCardOrder.map((cardId) => renderOverviewMetricCard(cardId))}
                </div>
              </SortableContext>
            </DndContext>
          </SortableCard>
        );
        
      case 'traffic-leads':
        return (
          <SortableCard key={sectionId} id={sectionId} arrangeMode={arrangeMode}>
            <div className="grid grid-2" style={{ gap: 'var(--space-lg)' }}>
              <TrafficSourceChart sources={transformedData.traffic.sources} />
              <LeadsByTypeChart leads={transformedData.leads.byType} />
            </div>
          </SortableCard>
        );
        
      case 'pages-vitals': {
        // Filter visible cards based on visibility settings
        const visibleCards = [];
        
        if (cardVisibility['pages-vitals']?.['top-pages']?.enabled) {
          visibleCards.push(
            <TopPagesCard 
              key="top-pages"
              pages={transformedData.traffic.topPages}
              cardVisibility={cardVisibility}
              setCardVisibility={setCardVisibility}
            />
          );
        }
        
        if (cardVisibility['pages-vitals']?.['core-web-vitals']?.enabled) {
          visibleCards.push(
            <CoreWebVitalsCard 
              key="core-web-vitals"
              vitals={transformedData.performance.coreWebVitals}
              cardVisibility={cardVisibility}
              setCardVisibility={setCardVisibility}
              showCoreWebVitalsSettings={showCoreWebVitalsSettings}
              setShowCoreWebVitalsSettings={setShowCoreWebVitalsSettings}
            />
          );
        }
        
        // Don't render section if no cards are visible
        if (visibleCards.length === 0) {
          return null;
        }
        
        // Dynamic grid layout based on visible cards count
        const gridClass = visibleCards.length === 1 ? 'grid grid-1' : 'grid grid-2';
        
        return (
          <SortableCard key={sectionId} id={sectionId} arrangeMode={arrangeMode}>
            <div className={gridClass} style={{ gap: 'var(--space-lg)' }}>
              {visibleCards}
            </div>
          </SortableCard>
        );
      }
        
      case 'conversions':
        return (
          <SortableCard key={sectionId} id={sectionId} arrangeMode={arrangeMode}>
            <div className="admin-card rounded-lg">
              <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Recent Conversions</h3>
                <button className="flex items-center text-sm text-lime-400 hover:text-lime-300">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </button>
              </div>
              <div className="divide-y divide-gray-700">
                {transformedData.leads.recentConversions.map((conversion, index) => (
                  <div key={index} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                      <div>
                        <p className="text-white font-medium">{conversion.type}</p>
                        <p className="text-gray-400 text-sm">{conversion.date} • {conversion.source}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lime-400 font-bold">{conversion.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 text-center bg-gray-900">
                <button className="text-sm font-medium text-lime-400 hover:text-lime-300 transition-colors">
                  View all conversions →
                </button>
              </div>
            </div>
          </SortableCard>
        );
        
      case 'performance':
        return (
          <SortableCard key={sectionId} id={sectionId} arrangeMode={arrangeMode}>
            <div className="admin-card rounded-lg" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-lg)' 
              }}>
                <Zap style={{ 
                  width: '1.25rem', 
                  height: '1.25rem', 
                  color: 'var(--clr-accent)' 
                }} />
                <h3 style={{ 
                  fontSize: 'var(--font-size-xl)', 
                  fontWeight: '600', 
                  color: 'var(--clr-white)',
                  margin: 0
                }}>
                  Performance Summary
                </h3>
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePerformanceDragEnd}
              >
                <SortableContext
                  items={performanceCardOrder}
                  strategy={rectSortingStrategy}
                >
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: 'var(--space-md)' 
                  }}>
                    {performanceCardOrder.map((cardId) => renderPerformanceMetricCard(cardId))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </SortableCard>
        );
        
      default:
        return null;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          gap: 'var(--space-md)' 
        }} className="analytics-header">
          <div>
            <h1 style={{ 
              fontSize: 'var(--font-size-2xl)', 
              fontWeight: '700', 
              color: 'var(--clr-white)', 
              margin: 0 
            }}>Analytics Dashboard</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
              <p style={{ 
                color: 'var(--clr-text-muted)', 
                margin: 0 
              }}>Website performance and business insights</p>
              {/* Data status indicator */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-xs)',
                padding: 'var(--space-xs) var(--space-sm)',
                borderRadius: 'var(--border-radius)',
                backgroundColor: analyticsData ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${analyticsData ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: analyticsData ? '#22c55e' : '#ef4444'
                }}></div>
                <span style={{ 
                  fontSize: 'var(--font-size-xs)',
                  color: analyticsData ? '#22c55e' : '#ef4444',
                  fontWeight: '500'
                }}>
                  {analyticsData ? 'Live Data' : 'No Data'}
                </span>
              </div>
              {isStale && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-xs)',
                  padding: 'var(--space-xs) var(--space-sm)',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: '#f59e0b'
                  }}></div>
                  <span style={{ 
                    fontSize: 'var(--font-size-xs)',
                    color: '#f59e0b',
                    fontWeight: '500'
                  }}>
                    Stale
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            {/* Custom Period Dropdown */}
            <div style={{ position: 'relative' }} data-dropdown="period">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-sm)',
                  backgroundColor: 'var(--clr-bg-light)',
                  border: '1px solid var(--clr-border)',
                  color: 'var(--clr-white)',
                  borderRadius: 'var(--border-radius)',
                  padding: 'var(--space-xs) var(--space-sm)',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--clr-accent)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--clr-border)';
                  e.currentTarget.style.backgroundColor = 'var(--clr-bg-light)';
                }}
              >
                <span>{PERIODS.find(p => p.value === selectedPeriod)?.label}</span>
                <ChevronDown style={{
                  width: '1rem',
                  height: '1rem',
                  transform: showPeriodDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} />
              </button>
              
              {/* Dropdown Menu */}
              {showPeriodDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  zIndex: 50,
                  marginTop: 'var(--space-xs)',
                  backgroundColor: 'var(--clr-bg-light)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                  overflow: 'hidden'
                }}>
                  {PERIODS.map(period => (
                    <button
                      key={period.value}
                      onClick={() => {
                        setSelectedPeriod(period.value);
                        setShowPeriodDropdown(false);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: 'var(--space-xs) var(--space-sm)',
                        backgroundColor: selectedPeriod === period.value ? 'var(--clr-accent)' : 'transparent',
                        color: selectedPeriod === period.value ? 'var(--clr-bg)' : 'var(--clr-white)',
                        border: 'none',
                        fontSize: 'var(--font-size-sm)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPeriod !== period.value) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPeriod !== period.value) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-primary"
              title={refreshing ? "Refreshing..." : "Refresh Data"}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--space-sm)',
                backgroundColor: 'var(--clr-accent)',
                color: 'var(--clr-bg)',
                borderRadius: 'var(--border-radius)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition)',
                opacity: refreshing ? 0.5 : 1
              }}
              onMouseEnter={(e) => !refreshing && (e.currentTarget.style.backgroundColor = 'var(--clr-accent-hover)')}
              onMouseLeave={(e) => !refreshing && (e.currentTarget.style.backgroundColor = 'var(--clr-accent)')}
            >
              <RefreshCw style={{ 
                height: '1rem', 
                width: '1rem',
                animation: refreshing ? 'spin 1s linear infinite' : 'none'
              }} />
            </button>
            
            {/* Settings button container */}
            <div style={{ position: 'relative' }} data-dropdown="settings">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--space-sm)',
                  backgroundColor: showSettings ? 'var(--clr-accent)' : 'rgba(255, 255, 255, 0.1)',
                  color: showSettings ? 'var(--clr-bg)' : 'var(--clr-white)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  if (!showSettings) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showSettings) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                title="Card Visibility Settings"
              >
                <Settings style={{ 
                  height: '1rem', 
                  width: '1rem'
                }} />
              </button>
              
              {/* Visibility Settings Dropdown */}
              {showSettings && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                zIndex: 50,
                marginTop: 'var(--space-xs)',
                backgroundColor: 'var(--clr-bg-light)',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--border-radius)',
                padding: 'var(--space-md)',
                minWidth: '280px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-md)',
                  paddingBottom: 'var(--space-sm)',
                  borderBottom: '1px solid var(--clr-border)'
                }}>
                  <h4 style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    color: 'var(--clr-white)',
                    margin: 0
                  }}>
                    Card Visibility
                  </h4>
                  <button
                    onClick={() => {
                      setCardVisibility({
                        'pages-vitals': {
                          'top-pages': {
                            enabled: true,
                            cards: {}
                          },
                          'core-web-vitals': {
                            enabled: true,
                            cards: {
                              'lcp': true,
                              'inp': true,
                              'cls': true,
                              'fcp': true,
                              'ttfb': true
                            }
                          }
                        }
                      });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)',
                      padding: 'var(--space-xs)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--clr-border)',
                      borderRadius: 'var(--border-radius)',
                      color: 'var(--clr-text-muted)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-xs)',
                      transition: 'var(--transition)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = 'var(--clr-white)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--clr-text-muted)';
                    }}
                    title="Reset to defaults"
                  >
                    <RotateCcw style={{ width: '0.75rem', height: '0.75rem' }} />
                    Reset
                  </button>
                </div>
                
                {/* Card Arrangement Section */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '500',
                    color: 'var(--clr-text-muted)',
                    marginBottom: 'var(--space-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Dashboard Layout
                  </div>
                  
                  {/* Arrange Cards Toggle */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)'
                    }}>
                      <GripVertical style={{
                        width: '1rem',
                        height: '1rem',
                        color: 'var(--clr-accent)'
                      }} />
                      <span style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--clr-white)'
                      }}>
                        Arrange Cards
                      </span>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '2.5rem',
                      height: '1.25rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={arrangeMode}
                        onChange={(e) => setArrangeMode(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: arrangeMode ? 'var(--clr-accent)' : '#374151',
                        borderRadius: '1.25rem',
                        transition: 'var(--transition)',
                        cursor: 'pointer'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '1rem',
                          width: '1rem',
                          left: arrangeMode ? 'calc(100% - 1.125rem)' : '0.125rem',
                          bottom: '0.125rem',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'var(--transition)'
                        }}></span>
                      </span>
                    </label>
                  </div>
                  
                  {arrangeMode && (
                    <div style={{
                      padding: 'var(--space-sm)',
                      backgroundColor: 'rgba(50, 205, 50, 0.1)',
                      border: '1px solid rgba(50, 205, 50, 0.3)',
                      borderRadius: 'var(--border-radius)',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--clr-text-muted)'
                    }}>
                      💡 Drag handles are now visible on all cards. Drag any card to rearrange the dashboard layout.
                    </div>
                  )}
                </div>
                
                {/* Overview Metrics Section */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '500',
                    color: 'var(--clr-text-muted)',
                    marginBottom: 'var(--space-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Overview Metrics
                  </div>
                  
                  {/* Overview Metrics Toggle */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)'
                    }}>
                      <BarChart3 style={{
                        width: '1rem',
                        height: '1rem',
                        color: 'var(--clr-accent)'
                      }} />
                      <span style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--clr-white)'
                      }}>
                        Overview Metrics
                      </span>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '2.5rem',
                      height: '1.25rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={cardVisibility['overview-metrics']?.enabled}
                        onChange={(e) => setCardVisibility(prev => ({
                          ...prev,
                          'overview-metrics': {
                            ...prev['overview-metrics'],
                            enabled: e.target.checked
                          }
                        }))}
                        style={{ display: 'none' }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        backgroundColor: cardVisibility['overview-metrics']?.enabled ? 'var(--clr-accent)' : '#374151',
                        transition: 'var(--transition)',
                        borderRadius: '1.25rem'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: '1rem',
                          width: '1rem',
                          left: cardVisibility['overview-metrics']?.enabled ? '1.375rem' : '0.125rem',
                          bottom: '0.125rem',
                          backgroundColor: 'white',
                          transition: 'var(--transition)',
                          borderRadius: '50%'
                        }}></span>
                      </span>
                    </label>
                  </div>
                </div>
                
                {/* Pages & Vitals Section */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '500',
                    color: 'var(--clr-text-muted)',
                    marginBottom: 'var(--space-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Pages & Performance
                  </div>
                  
                  {/* Top Pages Toggle */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)'
                    }}>
                      <BarChart3 style={{
                        width: '1rem',
                        height: '1rem',
                        color: 'var(--clr-accent)'
                      }} />
                      <span style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--clr-white)'
                      }}>
                        Top Pages
                      </span>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '2.5rem',
                      height: '1.25rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={cardVisibility['pages-vitals']?.['top-pages']?.enabled || false}
                        onChange={(e) => {
                          setCardVisibility(prev => ({
                            ...prev,
                            'pages-vitals': {
                              ...prev['pages-vitals'],
                              'top-pages': {
                                ...prev['pages-vitals']?.['top-pages'],
                                enabled: e.target.checked
                              }
                            }
                          }));
                        }}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: cardVisibility['pages-vitals']?.['top-pages']?.enabled ? 'var(--clr-accent)' : '#374151',
                        borderRadius: '1.25rem',
                        transition: 'var(--transition)',
                        cursor: 'pointer'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: '1rem',
                          width: '1rem',
                          left: cardVisibility['pages-vitals']?.['top-pages']?.enabled ? '1.375rem' : '0.125rem',
                          bottom: '0.125rem',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'var(--transition)'
                        }}></span>
                      </span>
                    </label>
                  </div>
                  
                  {/* Core Web Vitals Toggle */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)'
                    }}>
                      <Gauge style={{
                        width: '1rem',
                        height: '1rem',
                        color: 'var(--clr-accent)'
                      }} />
                      <span style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--clr-white)'
                      }}>
                        Core Web Vitals
                      </span>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '2.5rem',
                      height: '1.25rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={cardVisibility['pages-vitals']?.['core-web-vitals']?.enabled || false}
                        onChange={(e) => {
                          setCardVisibility(prev => ({
                            ...prev,
                            'pages-vitals': {
                              ...prev['pages-vitals'],
                              'core-web-vitals': {
                                ...prev['pages-vitals']?.['core-web-vitals'],
                                enabled: e.target.checked
                              }
                            }
                          }));
                        }}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: cardVisibility['pages-vitals']?.['core-web-vitals']?.enabled ? 'var(--clr-accent)' : '#374151',
                        borderRadius: '1.25rem',
                        transition: 'var(--transition)',
                        cursor: 'pointer'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: '1rem',
                          width: '1rem',
                          left: cardVisibility['pages-vitals']?.['core-web-vitals']?.enabled ? '1.375rem' : '0.125rem',
                          bottom: '0.125rem',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'var(--transition)'
                        }}></span>
                      </span>
                    </label>
                  </div>
                </div>
                
                {/* Close button */}
                <div style={{
                  borderTop: '1px solid var(--clr-border)',
                  paddingTop: 'var(--space-sm)',
                  textAlign: 'center'
                }}>
                  <button
                    onClick={() => setShowSettings(false)}
                    style={{
                      padding: 'var(--space-xs) var(--space-md)',
                      backgroundColor: 'var(--clr-accent)',
                      color: 'var(--clr-bg)',
                      border: 'none',
                      borderRadius: 'var(--border-radius)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--clr-accent-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--clr-accent)'}
                  >
                    Done
                  </button>
                </div>
              </div>
              )}
            </div>
            
            {/* Last updated indicator */}
            {analyticsData?.overview?.lastUpdated && (
              <div style={{ 
                fontSize: 'var(--font-size-xs)',
                color: 'var(--clr-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)'
              }}>
                <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                Last updated: {new Date(analyticsData.overview.lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Sortable Dashboard Content */}
        <SortableContext 
          items={cardOrder} 
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {cardOrder.map(renderCardSection)}
          </div>
        </SortableContext>
        
        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? (
            <div style={{ 
              opacity: 0.8, 
              transform: 'rotate(5deg)',
              backgroundColor: 'var(--clr-bg-light)',
              borderRadius: 'var(--border-radius)',
              padding: 'var(--space-md)',
              border: '2px solid var(--clr-accent)'
            }}>
              <div style={{ 
                color: 'var(--clr-white)', 
                fontWeight: '500' 
              }}>
                Moving: {activeCard.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Analytics;