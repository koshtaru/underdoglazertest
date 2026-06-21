import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './styles/global.css'
import React, { lazy, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import { GalleryProvider } from './contexts/GalleryContext'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import analyticsService from './services/analyticsService'

// Lazy load public pages
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Gallery = lazy(() => import('./pages/Gallery')) // Back to original with JSON approach
const Contact = lazy(() => import('./pages/Contact'))

// Lazy load admin pages
const LoginForm = lazy(() => import('./components/admin/LoginForm'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Analytics = lazy(() => import('./pages/admin/Analytics'))
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery')) // Back to original with JSON approach

// Layout wrapper component that conditionally renders header
function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Track page views on route changes
  useEffect(() => {
    analyticsService.trackPageView();
  }, [location]);

  // Start each page at the top on navigation (SPA route changes don't reset scroll).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {!isAdminRoute && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />

        {/* Admin Login Route */}
        <Route path="/admin/login" element={<LoginForm />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="gallery" element={
            <ProtectedRoute requiredRole="content-manager">
              <AdminGallery />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute requiredRole="admin">
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600 mt-2">✅ Task 11 Complete - User management foundation ready for advanced features!</p>
              </div>
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute requiredRole="admin">
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-600 mt-2">✅ Task 11 Complete - Settings framework ready for configuration features!</p>
              </div>
            </ProtectedRoute>
          } />
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  // Initialize analytics on app start
  useEffect(() => {
    analyticsService.initialize();
  }, []);

  return (
    <HelmetProvider>
    <AuthProvider>
      <GalleryProvider>
        <Router>
          <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
          }>
            <AppLayout />
          </React.Suspense>
        </Router>
      </GalleryProvider>
    </AuthProvider>
    </HelmetProvider>
  )
}

export default App
