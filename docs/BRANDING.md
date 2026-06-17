# Branding Customization Guide

This guide explains how to customize the branding elements of your Underdog Lazer website to match your company's identity.

## 🎨 Color Scheme

The site uses CSS custom properties for consistent theming. All color values are defined in:

**File:** `src/styles/global.css` (lines 5-14)

```css
:root {
  /* Color Palette */
  --clr-bg: #121212;           /* Main background - dark gray */
  --clr-bg-light: #1e1e1e;     /* Lighter background for cards */
  --clr-accent: #32CD32;       /* Primary accent - lime green */
  --clr-accent-hover: #28A428; /* Hover state for accent color */
  --clr-text: #f1f1f1;        /* Primary text color */
  --clr-text-muted: #a0a0a0;  /* Muted text for descriptions */
  --clr-white: #ffffff;       /* Pure white for headings */
  --clr-border: #333333;      /* Border color for elements */
}
```

### To Change Colors:
1. Open `src/styles/global.css`
2. Modify the color values in the `:root` section
3. Save the file - changes will apply site-wide automatically

**Popular Color Combinations:**
- **Blue Theme:** `--clr-accent: #007bff;` and `--clr-accent-hover: #0056b3;`
- **Orange Theme:** `--clr-accent: #fd7e14;` and `--clr-accent-hover: #e8590c;`
- **Purple Theme:** `--clr-accent: #6f42c1;` and `--clr-accent-hover: #5a2d91;`

## 🏢 Company Name & Logo

### Site Title
**Files to update:**
- `index.html` (line 7): `<title>Underdog Lazer</title>`
- `src/components/Header.jsx` (line 16): Logo text

### Header Logo
**File:** `src/components/Header.jsx`

**Current logo implementation:**
```jsx
<Link to="/" className="logo" aria-label="Underdog Lazer Home">
  Underdog Lazer
</Link>
```

**To add an image logo:**
```jsx
<Link to="/" className="logo" aria-label="Your Company Home">
  <img src="/img/your-logo.png" alt="Your Company" height="40" />
</Link>
```

**Logo styling:** The logo emoji (⚡) is added via CSS in `src/styles/global.css` (lines 168-171):
```css
.header .logo::before {
  content: "⚡";
  color: var(--clr-text);
}
```

## 📱 Site Metadata

**File:** `index.html`

Update these lines for SEO and social sharing:

```html
<title>Your Company Name</title>
<meta name="description" content="Your company description for search engines" />
<meta property="og:title" content="Your Company Name" />
<meta property="og:description" content="Your company description" />
<meta property="og:image" content="/img/your-social-preview.jpg" />
```

## 🎥 Hero Video & Background Images

### Hero Video
**File:** `src/pages/Home.jsx` (lines 15-18)

**Current video setup:**
```jsx
<video className="hero__video" autoPlay muted loop playsInline poster="/img/hero-background.jpg">
  <source src="/img/hero-background.mp4" type="video/mp4" />
  <source src="/img/hero-background.webm" type="video/webm" />
</video>
```

**To replace:**
1. Add your video files to `public/img/`
2. Update the `src` attributes
3. Update the `poster` image path

### Page Background Images
**File:** `src/styles/global.css`

**Background images are set for each page:**
- **Home Hero:** Line 300 - `url('/img/hero-background.jpg')`
- **Gallery Hero:** Line 354 - `url('/img/gallery-1.png')`
- **About Hero:** Line 387 - `url('/img/gallery-2.jpg')`
- **Contact Hero:** Line 420 - `url('/img/gallery-3.jpg')`

**To change:** Replace the image files in `public/img/` or update the CSS paths.

## 📝 Text Content

### Main Tagline
**File:** `src/pages/Home.jsx` (lines 28-35)

```jsx
<h1 className="hero__title" id="hero-title">
  Precision Laser Engraving<br />
  <span className="text-accent">Made Simple</span>
</h1>
<p className="hero__subtitle">
  Transform your ideas into reality with our state-of-the-art laser engraving services. 
  From custom designs to corporate branding, we deliver exceptional quality with precision you can trust.
</p>
```

### Navigation Menu
**File:** `src/components/Header.jsx` (lines 22-25)

The navigation menu items can be updated by modifying the Link text and paths.

## 🎨 Typography

**File:** `src/styles/global.css` (lines 16-24)

The site uses Inter font with responsive sizing:

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**To change the font:**
1. Update the Google Fonts import (line 2)
2. Update the `--font-family` variable
3. All text will automatically use the new font

## 🛠 Common Customization Tasks

### 1. Quick Company Rebrand Checklist
- [ ] Update company name in `index.html` title
- [ ] Update logo in `src/components/Header.jsx`
- [ ] Update hero tagline in `src/pages/Home.jsx`
- [ ] Replace hero video/background images
- [ ] Update color scheme in `src/styles/global.css`
- [ ] Update meta tags for SEO

### 2. Changing from Laser Engraving to Another Service
- [ ] Update all text references to your service type
- [ ] Replace gallery images with your work examples
- [ ] Update service descriptions in `src/pages/Home.jsx`
- [ ] Update About page company story
- [ ] Update contact form project types

### 3. Testing Your Changes
1. Run `npm run dev` to start development server
2. Check all pages for visual consistency
3. Test responsive design on mobile
4. Verify all colors and fonts look correct
5. Test navigation and functionality

## 🚀 Deployment Notes

After making branding changes:
1. Test locally with `npm run dev`
2. Build with `npm run build`
3. Deploy using your preferred method (Netlify/Vercel)
4. Clear browser cache to see changes

---

💡 **Tip:** Keep a backup of your original files before making changes. Git version control is recommended for tracking modifications.