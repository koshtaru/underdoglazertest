# Underdog Lazer - Design Structure Guide

This guide provides AI assistants with comprehensive information about the design structure, styling patterns, and architectural conventions used in the Underdog Lazer website. Use this guide to build new pages that maintain consistency with the existing design system.

## Table of Contents
- [Design System Overview](#design-system-overview)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Layout Structure](#layout-structure)
- [Component Architecture](#component-architecture)
- [Styling Patterns](#styling-patterns)
- [Page Templates](#page-templates)
- [Responsive Design](#responsive-design)
- [Best Practices](#best-practices)

## Design System Overview

The Underdog Lazer website uses a **dark theme** with **lime green accents** and a **modern, clean aesthetic**. The design emphasizes:

- **Professional laser engraving business branding**
- **Dark background with high contrast text**
- **Lime green (#32CD32) as primary accent color**
- **Clean typography with Inter font family**
- **Card-based layouts for content organization**
- **Responsive grid systems**
- **Subtle animations and hover effects**

## Color Palette

### Primary Colors
```css
:root {
  --clr-bg: #121212;              /* Main background - dark gray */
  --clr-bg-light: #1e1e1e;        /* Lighter background for cards/sections */
  --clr-accent: #32CD32;          /* Primary accent - lime green */
  --clr-accent-hover: #28A428;    /* Darker green for hover states */
  --clr-text: #f1f1f1;           /* Primary text - light gray */
  --clr-text-muted: #a0a0a0;     /* Secondary text - muted gray */
  --clr-white: #ffffff;          /* Pure white for headings */
  --clr-border: #333333;         /* Border color - medium gray */
}
```

### Usage Guidelines
- **Backgrounds**: Use `--clr-bg` for main areas, `--clr-bg-light` for cards/elevated content
- **Text**: `--clr-white` for headings, `--clr-text` for body text, `--clr-text-muted` for secondary info
- **Accents**: `--clr-accent` for CTAs, links, active states; `--clr-accent-hover` for hover effects
- **Borders**: `--clr-border` for subtle separations and card outlines

## Typography

### Font System
```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Scale (Responsive)
```css
--font-size-xs: clamp(0.75rem, 2vw, 0.875rem);
--font-size-sm: clamp(0.875rem, 2.5vw, 1rem);
--font-size-base: clamp(1rem, 3vw, 1.125rem);
--font-size-lg: clamp(1.125rem, 3.5vw, 1.25rem);
--font-size-xl: clamp(1.25rem, 4vw, 1.5rem);
--font-size-2xl: clamp(1.5rem, 5vw, 2rem);
--font-size-3xl: clamp(2rem, 6vw, 3rem);
```

### Typography Classes
- `h1`: `font-size: var(--font-size-3xl)` - Page titles
- `h2`: `font-size: var(--font-size-2xl)` - Section headings
- `h3`: `font-size: var(--font-size-xl)` - Subsection headings
- `h4`: `font-size: var(--font-size-lg)` - Card titles

### Typography Patterns
```jsx
// Page Hero Title
<h1 className="hero__title">
  Main Title<br />
  <span className="text-accent">Accent Text</span>
</h1>

// Section Title
<h2 className="section-title">Section Heading</h2>

// Section Subtitle
<p className="section-subtitle">Descriptive subtitle text</p>

// Card Title
<h3 className="card__title">Card Heading</h3>
```

## Layout Structure

### Spacing System
```css
--space-xs: 0.5rem;    /* 8px */
--space-sm: 1rem;      /* 16px */
--space-md: 1.5rem;    /* 24px */
--space-lg: 2rem;      /* 32px */
--space-xl: 3rem;      /* 48px */
--space-2xl: 4rem;     /* 64px */
```

### Container System
```css
.container {
  max-width: var(--max-width); /* 1200px */
  margin: 0 auto;
  padding: 0 var(--space-sm);
}

@media (min-width: 768px) {
  .container {
    padding: 0 var(--space-lg);
  }
}
```

### Grid System
```css
.grid {
  display: grid;
  gap: var(--space-lg);
}

.grid-2 {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

.grid-3 {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Component Architecture

### Page Structure
```jsx
function PageName() {
  return (
    <>
      {/* Hero Section */}
      <section className="page-hero" aria-labelledby="hero-title">
        <div className="container">
          <div className="page-hero__content">
            <h1 className="hero__title" id="hero-title">Page Title</h1>
            <p className="hero__subtitle">Page description</p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="section" aria-labelledby="section-title">
        <div className="container">
          <h2 className="section-title" id="section-title">Section Title</h2>
          <p className="section-subtitle">Section description</p>
          {/* Section content */}
        </div>
      </section>
    </>
  );
}
```

### Header Component
- Fixed positioning with `position: fixed`
- Contains logo, desktop nav, and mobile menu toggle
- Uses conditional navigation display based on screen size
- Includes active state highlighting for current page

### Navigation Patterns
```jsx
// Desktop Navigation
<nav className="nav">
  <ul className="nav__list">
    <li><Link to="/" className={`nav__link ${isActive('/')}`}>Home</Link></li>
    <li><Link to="/about" className={`nav__link ${isActive('/about')}`}>About</Link></li>
  </ul>
</nav>

// Mobile Navigation
<nav className={`nav-mobile ${isMobileMenuOpen ? 'open' : ''}`}>
  <ul className="nav-mobile__list">
    <li className="nav-mobile__item">
      <Link 
        to="/" 
        className={`nav-mobile__link ${isActive('/')}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        Home
      </Link>
    </li>
  </ul>
</nav>
```

## Styling Patterns

### Hero Sections
```css
.hero {
  display: flex;
  align-items: center;
  min-height: calc(100vh - var(--header-height));
  background: 
    linear-gradient(rgba(18, 18, 18, 0.75), rgba(30, 30, 30, 0.85)),
    url('/img/hero-background.jpg') center/cover no-repeat;
  position: relative;
  overflow: hidden;
}

/* Page-specific hero variations */
.gallery-hero { min-height: 60vh; }
.about-hero { min-height: 50vh; }
.contact-hero { min-height: 45vh; }
```

### Cards
```css
.card {
  background-color: var(--clr-bg-light);
  border: 1px solid var(--clr-border);
  border-radius: var(--border-radius);
  padding: var(--space-lg);
  transition: var(--transition);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--clr-accent);
}
```

### Buttons
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--font-size-base);
  font-weight: 600;
  text-decoration: none;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  min-height: 48px;
}

.btn-primary {
  background-color: var(--clr-accent);
  color: var(--clr-white);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background-color: transparent;
  color: var(--clr-text);
  border: 2px solid var(--clr-border);
}
```

### Forms
```css
.form__input,
.form__textarea {
  width: 100%;
  padding: var(--space-sm);
  font-size: var(--font-size-base);
  font-family: var(--font-family);
  background-color: var(--clr-bg-light);
  border: 2px solid var(--clr-border);
  border-radius: var(--border-radius);
  color: var(--clr-text);
  transition: var(--transition);
}

.form__input:focus,
.form__textarea:focus {
  outline: none;
  border-color: var(--clr-accent);
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
}
```

## Page Templates

### 1. Hero + Content Sections Pattern
```jsx
function TemplatePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <div className="page-hero__content">
            <h1 className="hero__title">Page Title</h1>
            <p className="hero__subtitle">Page description</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Section Title</h2>
          <div className="grid grid-3">
            {/* Grid content */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="section-title">Call to Action</h2>
            <p className="section-subtitle">Compelling message</p>
            <Link to="/contact" className="btn btn-primary">
              Take Action
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
```

### 2. Gallery/Grid Pattern
```jsx
// For image galleries or card grids
<section className="section">
  <div className="container">
    <h2 className="section-title">Gallery Title</h2>
    
    {/* Optional Filter Buttons */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      gap: 'var(--space-sm)', 
      marginBottom: 'var(--space-xl)',
      flexWrap: 'wrap'
    }}>
      {categories.map((category) => (
        <button
          key={category.id}
          style={{
            padding: 'var(--space-sm) var(--space-md)',
            backgroundColor: activeCategory === category.id ? 'var(--clr-accent)' : 'transparent',
            color: activeCategory === category.id ? 'var(--clr-bg)' : 'var(--clr-text)',
            border: `2px solid ${activeCategory === category.id ? 'var(--clr-accent)' : 'var(--clr-text-muted)'}`,
            borderRadius: 'var(--border-radius)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {category.name}
        </button>
      ))}
    </div>

    {/* Grid Content */}
    <div className="grid grid-3">
      {items.map((item) => (
        <div key={item.id} className="card">
          {/* Card content */}
        </div>
      ))}
    </div>
  </div>
</section>
```

### 3. Form Page Pattern
```jsx
function ContactForm() {
  return (
    <>
      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero__content">
            <h1 className="hero__title">Get In Touch</h1>
            <p className="hero__subtitle">Let's discuss your project</p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="section">
        <div className="container">
          <form className="form">
            <div className="form__group">
              <label className="form__label">Name</label>
              <input type="text" className="form__input" />
            </div>
            <div className="form__group">
              <label className="form__label">Email</label>
              <input type="email" className="form__input" />
            </div>
            <div className="form__group">
              <label className="form__label">Message</label>
              <textarea className="form__textarea"></textarea>
            </div>
            <button type="submit" className="btn btn-primary">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
```

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px  
- **Desktop**: >= 1024px

### Mobile-First Approach
```css
/* Mobile default */
.element {
  property: mobile-value;
}

/* Tablet and up */
@media (min-width: 768px) {
  .element {
    property: tablet-value;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .element {
    property: desktop-value;
  }
}
```

### Navigation Responsive Pattern
- **Desktop**: Horizontal navigation in header
- **Mobile**: Hamburger menu with overlay navigation
- **Header height**: `--header-height: 70px`
- **Main content**: `margin-top: var(--header-height)` on public pages

## Best Practices

### 1. Consistent Styling
- Always use CSS custom properties for colors, spacing, and typography
- Follow the established card hover patterns with `transform: translateY(-4px)`
- Use `var(--transition)` for consistent animation timing
- Apply `border-radius: var(--border-radius)` to maintain consistent corner radius

### 2. Accessibility
- Include `aria-labelledby` attributes for sections
- Use semantic HTML elements (`section`, `nav`, `main`, `header`)
- Provide proper `alt` text for images
- Include `aria-label` for interactive elements without text

### 3. Performance
- Use lazy loading for page components: `const PageName = lazy(() => import('./pages/PageName'))`
- Optimize images and use appropriate formats
- Implement proper loading states

### 4. Component Structure
- Keep components focused and single-purpose
- Use descriptive class names following BEM-like conventions
- Separate layout logic from styling logic
- Export components as default exports

### 5. State Management
- Use React hooks for local component state
- Implement proper cleanup in useEffect hooks
- Handle keyboard navigation (escape key, focus management)
- Manage mobile menu state properly

### 6. Code Organization
```
src/
├── components/
│   ├── Header.jsx
│   └── admin/
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   └── admin/
├── styles/
│   └── global.css
└── contexts/
    └── AuthContext.jsx
```

## Admin vs Public Site

### Public Site Features
- Fixed header with main navigation
- Hero sections with background images/videos
- Card-based layouts
- Responsive grid systems
- Mobile hamburger menu

### Admin Site Features  
- Separate admin layout with sidebar navigation
- No main site header on admin routes
- Admin-specific styling and components
- Protected routes with authentication
- Different color scheme and layout patterns

### Route Structure
```jsx
// Public routes - include Header
<Route path="/" element={<Home />} />
<Route path="/about" element={<About />} />
<Route path="/gallery" element={<Gallery />} />
<Route path="/contact" element={<Contact />} />

// Admin routes - use AdminLayout (no Header)
<Route path="/admin" element={<AdminLayout />}>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="analytics" element={<Analytics />} />
</Route>
```

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

---

## Quick Reference

### Common Patterns
```jsx
// Section with title and grid
<section className="section">
  <div className="container">
    <h2 className="section-title">Title</h2>
    <p className="section-subtitle">Subtitle</p>
    <div className="grid grid-3">
      {/* Content */}
    </div>
  </div>
</section>

// Card with hover effect
<div className="card">
  <h3 className="card__title">Title</h3>
  <p className="card__text">Content</p>
</div>

// Button group
<div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
  <Link to="/primary" className="btn btn-primary">Primary Action</Link>
  <Link to="/secondary" className="btn btn-secondary">Secondary Action</Link>
</div>
```

Use this guide as your reference when building new pages or components to ensure consistency with the existing Underdog Lazer design system.