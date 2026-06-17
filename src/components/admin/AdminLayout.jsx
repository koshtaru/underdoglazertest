import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Menu,
  X,
  Home,
  BarChart3,
  Images,
  Users,
  Settings,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import '../../styles/admin.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: Home
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3
    },
    {
      name: 'Gallery Management',
      href: '/admin/gallery',
      icon: Images
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings
    }
  ];

  // All authenticated users have access to all navigation items
  const filteredNavigation = navigation;

  // Debug logging
  console.log('AdminLayout Debug:', {
    currentUser: currentUser?.email,
    userRole,
    totalNavItems: navigation.length
  });

  return (
    <div className="admin-layout" style={{ 
      height: '100vh', 
      display: 'flex',
      backgroundColor: 'var(--clr-bg)' 
    }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="admin-mobile-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            maxWidth: '20rem', 
            width: '100%', 
            height: '100%',
            backgroundColor: 'var(--clr-bg-light)' 
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, marginRight: '-3rem', paddingTop: '0.5rem' }}>
              <button
                style={{
                  marginLeft: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '2.5rem',
                  width: '2.5rem',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--clr-white)'
                }}
                onClick={() => setSidebarOpen(false)}
              >
                <X style={{ height: '1.5rem', width: '1.5rem' }} />
              </button>
            </div>
            <SidebarContent navigation={filteredNavigation} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="admin-sidebar-desktop" style={{ backgroundColor: 'var(--clr-bg-light)', borderRight: '1px solid var(--clr-border)' }}>
        <SidebarContent navigation={filteredNavigation} />
      </div>

      {/* Main content wrapper */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', minWidth: '0' }}>
        {/* Top navigation */}
        <div style={{ 
          display: 'flex', 
          height: '4rem', 
          flexShrink: '0', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 1.5rem', 
          borderBottom: '1px solid var(--clr-border)',
          backgroundColor: 'var(--clr-bg-light)' 
        }}>
          {/* Mobile menu button */}
          <button
            type="button"
            className="admin-mobile-menu-btn"
            style={{ 
              padding: '0.5rem', 
              borderRadius: '0.375rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--clr-text)' 
            }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu style={{ height: '1.5rem', width: '1.5rem' }} />
          </button>
          
          {/* Page title */}
          <div style={{ flex: '1' }}>
            <h1 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600',
              margin: '0',
              color: 'var(--clr-white)', 
              fontFamily: 'var(--font-family)' 
            }}>
              Admin Dashboard
            </h1>
          </div>
          
          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--clr-bg)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <div style={{ 
                height: '2rem', 
                width: '2rem', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'var(--clr-accent)' 
              }}>
                <User style={{ height: '1.25rem', width: '1.25rem', color: 'var(--clr-bg)' }} />
              </div>
              <div className="admin-user-info" style={{ display: 'none', textAlign: 'left' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--clr-white)' }}>
                  {currentUser?.email}
                </div>
                <div style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: 'var(--clr-text-muted)' }}>
                  {userRole}
                </div>
              </div>
              <ChevronDown style={{ height: '1rem', width: '1rem', color: 'var(--clr-text-muted)' }} />
            </button>

            {userMenuOpen && (
              <div style={{
                position: 'absolute',
                right: '0',
                zIndex: '50',
                marginTop: '0.5rem',
                width: '12rem',
                borderRadius: '0.375rem',
                padding: '0.25rem 0',
                backgroundColor: 'var(--clr-bg-light)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--clr-border)'
              }}>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--clr-text)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--clr-bg)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <LogOut style={{ marginRight: '0.75rem', height: '1rem', width: '1rem' }} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <main style={{ 
          flex: '1', 
          overflowY: 'auto',
          backgroundColor: 'var(--clr-bg)' 
        }}>
          <div style={{ 
            padding: '2rem',
            minHeight: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            width: '100%'
          }} className="admin-main-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    {/* Brand section */}
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '1.25rem 1rem', 
      borderBottom: '1px solid var(--clr-border)' 
    }}>
      <div style={{ 
        height: '2.25rem', 
        width: '2.25rem', 
        borderRadius: '0.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--clr-accent)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)' 
      }}>
        <span style={{ 
          fontWeight: 'bold', 
          fontSize: '1.125rem',
          color: 'var(--clr-bg)' 
        }}>⚡</span>
      </div>
      <div style={{ marginLeft: '0.75rem' }}>
        <p style={{ 
          fontSize: '1.125rem', 
          fontWeight: 'bold', 
          letterSpacing: '-0.025em',
          margin: '0',
          color: 'var(--clr-white)', 
          fontFamily: 'var(--font-family)' 
        }}>Underdog Lazer</p>
        <p style={{ 
          fontSize: '0.75rem', 
          fontWeight: '500', 
          opacity: '0.8',
          margin: '0',
          color: 'var(--clr-accent)' 
        }}>Admin Portal</p>
      </div>
    </div>

    {/* Navigation */}
    <nav style={{ flex: '1', padding: '1.5rem 1rem' }}>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', listStyle: 'none', padding: 0, margin: 0 }}>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className="admin-nav-link group flex items-center"
                style={({ isActive }) => ({
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? 'var(--clr-bg)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--clr-accent)' : '3px solid transparent',
                  color: isActive ? 'var(--clr-white)' : 'var(--clr-text-muted)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center'
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'var(--clr-bg-light)';
                    e.currentTarget.style.color = 'var(--clr-white)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--clr-text-muted)';
                  }
                }}
              >
                <Icon style={{ marginRight: '0.75rem', height: '1.25rem', width: '1.25rem', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  </div>
);

export default AdminLayout;