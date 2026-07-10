import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import {
  Users,
  MessageSquare,
  Images,
  TrendingUp,
  Eye,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser, userRole } = useAuth();
  const { data: analyticsData, loading: analyticsLoading } = useAnalytics('7d');

  // Transform analytics data for dashboard display
  const stats = analyticsData?.overview?.metrics ? [
    {
      name: 'Total Visitors',
      value: analyticsData.overview.metrics.activeUsers?.value?.toLocaleString() || '0',
      change: analyticsData.overview.metrics.activeUsers?.change || '0%',
      changeType: analyticsData.overview.metrics.activeUsers?.trend === 'up' ? 'increase' : 'decrease',
      icon: Users
    },
    {
      name: 'Contact Forms',
      value: analyticsData.overview.metrics.conversions?.value?.toString() || '0',
      change: analyticsData.overview.metrics.conversions?.change || '0%',
      changeType: analyticsData.overview.metrics.conversions?.trend === 'up' ? 'increase' : 'decrease',
      icon: MessageSquare
    },
    {
      name: 'Page Views',
      value: analyticsData.overview.metrics.pageviews?.value?.toLocaleString() || '0',
      change: analyticsData.overview.metrics.pageviews?.change || '0%',
      changeType: analyticsData.overview.metrics.pageviews?.trend === 'up' ? 'increase' : 'decrease',
      icon: Eye
    },
    {
      name: 'Sessions',
      value: analyticsData.overview.metrics.sessions?.value?.toLocaleString() || '0',
      change: analyticsData.overview.metrics.sessions?.change || '0%',
      changeType: analyticsData.overview.metrics.sessions?.trend === 'up' ? 'increase' : 'decrease',
      icon: TrendingUp
    }
  ] : [
    // Fallback data when analytics is loading or unavailable
    {
      name: 'Total Visitors',
      value: analyticsLoading ? '...' : '0',
      change: '0%',
      changeType: 'neutral',
      icon: Users
    },
    {
      name: 'Contact Forms',
      value: analyticsLoading ? '...' : '0',
      change: '0%',
      changeType: 'neutral',
      icon: MessageSquare
    },
    {
      name: 'Page Views',
      value: analyticsLoading ? '...' : '0',
      change: '0%',
      changeType: 'neutral',
      icon: Eye
    },
    {
      name: 'Sessions',
      value: analyticsLoading ? '...' : '0',
      change: '0%',
      changeType: 'neutral',
      icon: TrendingUp
    }
  ];

  const recentContacts = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      projectType: 'Business Signage & Branding',
      date: '2 hours ago',
      status: 'new'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      phone: '(555) 987-6543',
      projectType: 'Corporate Awards & Trophies',
      date: '5 hours ago',
      status: 'contacted'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike@business.org',
      phone: '(555) 456-7890',
      projectType: 'Industrial Parts Marking',
      date: '1 day ago',
      status: 'quoted'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 'bold', 
          color: 'var(--clr-white)',
          margin: '0 0 0.5rem 0',
          fontFamily: 'var(--font-family)'
        }}>
          Welcome back, {currentUser?.email?.split('@')[0]}!
        </h1>
        <p style={{ 
          marginTop: '0.5rem',
          color: 'var(--clr-text-muted)',
          fontSize: '1rem'
        }}>
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }} className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="admin-card shadow rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-lime-500">
                  <Icon className="h-6 w-6 text-gray-900" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }} className="main-grid">
        {/* Recent Contact Forms */}
        <div className="admin-card shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Recent Contact Forms</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {recentContacts.map((contact) => (
              <div key={contact.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">
                        {contact.name}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          contact.status
                        )}`}
                      >
                        {contact.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {contact.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {contact.phone}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      Project: {contact.projectType}
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {contact.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 text-right bg-gray-900">
            <button className="text-sm font-medium text-lime-400 hover:text-lime-300 transition-colors">
              View all contacts →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <button 
                className="admin-button flex items-center p-4 rounded-lg transition-colors"
              >
                <Images className="h-8 w-8 mr-4 text-lime-400" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-white">
                    Upload New Images
                  </h4>
                  <p className="text-sm text-gray-400">
                    Add new portfolio items to products
                  </p>
                </div>
              </button>
              
              <button 
                className="admin-button flex items-center p-4 rounded-lg transition-colors"
              >
                <TrendingUp className="h-8 w-8 mr-4 text-lime-400" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-white">
                    View Analytics
                  </h4>
                  <p className="text-sm text-gray-400">
                    Check detailed performance metrics
                  </p>
                </div>
              </button>

              <button 
                className="admin-button flex items-center p-4 rounded-lg transition-colors"
              >
                <MessageSquare className="h-8 w-8 mr-4 text-lime-400" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-white">
                    Manage Contacts
                  </h4>
                  <p className="text-sm text-gray-400">
                    Review and respond to inquiries
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Role Info */}
      <div className="mt-8 admin-card rounded-lg p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-lime-500">
            <Users className="h-5 w-5 text-gray-900" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              Current Role: <span className="capitalize">{userRole}</span>
            </p>
            <p className="text-xs text-gray-400">
              You have access to features based on your role level.
            </p>
          </div>
        </div>
      </div>

      {/* TEST CONTENT - Additional sections to ensure scrolling */}
      <div className="mt-8 space-y-6">
        <div className="admin-card rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-lime-500"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">Activity item {i + 1}</p>
                  <p className="text-xs text-gray-400">{i + 1} hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded border border-gray-700">
                <span className="text-sm text-white">Service {i + 1}</span>
                <span className="text-xs text-green-400">Online</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-white">Metric {i + 1}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-2 bg-gray-700 rounded-full">
                    <div 
                      className="h-2 bg-lime-500 rounded-full" 
                      style={{ width: `${Math.random() * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400">{Math.floor(Math.random() * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Footer Test Content</h3>
          <p className="text-gray-400">
            This is additional content to ensure the page has enough height to require scrolling.
            If you can see this content and scroll smoothly to reach it, the scrolling fix is working correctly.
          </p>
          <div className="mt-4 text-center">
            <span className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-lime-500 text-gray-900">
              🎉 Scrolling Test - You Made It!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;