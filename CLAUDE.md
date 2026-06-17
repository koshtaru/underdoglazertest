# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Branch Structure

- **main** - Production-ready code
- **drag-n-dropdashboard** - Individual card drag & drop implementation
- **feature/admin-dashboard-tasks-11-21** - Previous admin dashboard development

### Testing Individual Card Dragging
Current branch: `drag-n-dropdashboard`

**Quick Testing (No Firebase Setup Required):**
1. Set `TESTING_MODE = true` in `src/contexts/AuthContext.jsx`
2. Use direct admin routes in `src/App.jsx` (bypasses authentication)
3. Access: `http://localhost:5178/admin/analytics`
4. Test arrange mode toggle and individual card dragging

**Production Testing (With Firebase):**
1. Set `TESTING_MODE = false` in `src/contexts/AuthContext.jsx`
2. Restore protected routes in `src/App.jsx`
3. Configure Firebase credentials in `.env`
4. Access via proper authentication flow

## Architecture Overview

This is a React + Vite single-page application using React Router for navigation. The project follows a clean component-based architecture:

### Key Structure
- **App.jsx** - Main application component with routing and lazy loading
- **components/** - Reusable UI components (Header with responsive navigation)
  - **admin/** - Admin-specific components (ProtectedRoute, AdminLayout, LoginForm)
- **pages/** - Route-specific page components (Home, About, Gallery, Contact)
  - **admin/** - Protected admin pages (Dashboard, Analytics)
- **contexts/** - React context providers (AuthContext for Firebase authentication)
- **styles/** - CSS files (global.css for app-wide styles, admin.css for admin dashboard)

### Technical Stack
- **React 19** with hooks (useState, lazy loading with Suspense)
- **React Router DOM** for client-side routing
- **Vite** for build tooling and development server
- **ESLint** with React-specific rules and custom configuration
- **@dnd-kit** for drag & drop functionality (core, sortable, utilities)
- **Firebase** for authentication and user management
- **Google Analytics 4** integration with live data API
- **Stagewise** development tools integration (toolbar only in dev mode)

### Navigation Pattern
The app uses a responsive navigation system with:
- Desktop navigation in Header component
- Mobile hamburger menu with toggle state
- Active route highlighting using `useLocation` hook
- Automatic menu closure on mobile navigation

### Development Features
- Lazy loading for all page components to improve initial load performance
- Stagewise toolbar for development assistance (dev mode only)
- Custom ESLint rules including unused variable patterns
- Hot module replacement via Vite

## Admin Dashboard Features

### Individual Card Drag & Drop System
The analytics dashboard (`/admin/analytics`) includes advanced drag & drop functionality:

#### Core Components
- **SortableCard** - Section-level dragging for entire dashboard sections
- **SortableIndividualCard** - Individual card dragging within sections with glow effects
- **DndContext** - Nested contexts for section and individual card dragging
- **@dnd-kit/sortable** with `rectSortingStrategy` for grid-based layouts

#### Supported Sections
1. **Overview Metrics** (7 individual cards):
   - Total Visitors, Page Views, Contact Forms, Bounce Rate
   - Session Duration, Conversion Rate, Performance Score
2. **Top Pages** (dynamic cards from Google Analytics API)
3. **Core Web Vitals** (5 performance metrics):
   - LCP, INP, CLS, FCP, TTFB

#### User Experience Features
- **Arrange Mode Toggle** - Click to enable/disable individual card dragging
- **Blue Glow Effects** - Cards glow and lift on hover when arrange mode is active
- **Drag Handles** - Small circular handles appear in top-right corner of each card
- **Section Boundaries** - Cards can only be moved within their respective sections
- **localStorage Persistence** - All arrangements persist across page refreshes
- **Visibility Controls** - Individual sections can be shown/hidden via Settings dropdown

#### State Management
- Individual card orders stored separately for each section
- Dynamic `topPagesOrder` population from Google Analytics API data
- Comprehensive localStorage integration for user preferences
- Mock authentication support for testing (TESTING_MODE flag)

### Authentication System
- **Firebase Authentication** with email/password
- **Role-based access control** (admin, content-manager, viewer)
- **Protected routes** with ProtectedRoute component
- **AuthContext** provides authentication state throughout app

### Analytics Integration
- **Google Analytics 4** live data integration
- **Real-time metrics** for traffic, performance, and user behavior
- **Serverless functions** for secure API access via Netlify
- **Error handling** and fallback states for API failures

## Project Conventions

- Components use default exports
- Functional components with hooks
- CSS class naming follows BEM-like patterns
- Mobile-first responsive design approach
- Accessibility attributes (aria-label, role, aria-expanded)
- Individual drag & drop helper functions for maintainability
- Nested DndContext patterns for complex interactions