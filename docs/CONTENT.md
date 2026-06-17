# Content & Gallery Update Guide

This guide explains how to update text content, gallery images, and other dynamic content on your website.

## 📝 Text Content Updates

### Home Page Content

**File:** `src/pages/Home.jsx`

#### Hero Section (Lines 28-35)
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

#### Service Cards (Lines 56-78)
Update the value proposition cards:
```jsx
<div className="card">
  <h3 className="card__title">⚡ Lightning Fast</h3>
  <p className="card__text">
    Quick turnaround times without compromising quality. Most projects completed within 24-48 hours.
  </p>
</div>
```

#### Services List (Lines 90-96)
Update the services offered:
```jsx
{[
  'Corporate logos and branding',
  'Personalized gifts and awards',
  'Signage and displays',
  'Industrial marking and labeling',
  'Artistic designs and custom projects'
].map((service, index) => (
  // ... rendered as list items
))}
```

#### Materials Section (Lines 119-130)
Update materials you work with:
```jsx
{[
  { icon: '🪵', name: 'Wood' },
  { icon: '🔧', name: 'Metal' },
  { icon: '💎', name: 'Acrylic' },
  { icon: '🧳', name: 'Leather' }
].map((material, index) => (
  // ... rendered as material cards
))}
```

### About Page Content

**File:** `src/pages/About.jsx`

#### Company Story (Lines 54-58)
```jsx
<h2>Our Story</h2>
<p>
  Founded with a passion for precision craftsmanship, Underdog Lazer has grown from a small workshop
  to a leading provider of laser engraving services. Our journey is built on continuous innovation
  and an unwavering commitment to quality.
</p>
```

#### Mission Statement (Lines 62-67)
```jsx
<h2>Our Mission</h2>
<p>
  To provide exceptional laser engraving services that bring our clients' visions to life,
  delivering precision, quality, and innovation in every project we undertake.
</p>
```

#### Team Members (Lines 7-32)
Update team member information:
```jsx
const teamMembers = [
  { 
    name: 'James', 
    role: 'Founder & Lead Engineer', 
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'A visionary engineer with 15+ years of experience in laser technology...'
  },
  // ... add more team members
];
```

### Contact Page Content

**File:** `src/pages/Contact.jsx`

#### Contact Information (Lines 301-312)
```jsx
<h3>Address</h3>
<p>123 Laser Lane<br />Engraving City, EC 12345</p>

<h3 style={{ marginTop: 'var(--space-md)' }}>Phone</h3>
<p>(555) 123-4567</p>

<h3 style={{ marginTop: 'var(--space-md)' }}>Email</h3>
<p>info@underdoglazer.com</p>

<h3 style={{ marginTop: 'var(--space-md)' }}>Business Hours</h3>
<p>Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
```

#### Project Types (Lines 227-232)
Update the dropdown options in the contact form:
```jsx
<option value="corporate">Corporate Branding</option>
<option value="personal">Personal Gift</option>
<option value="signage">Signage</option>
<option value="industrial">Industrial Marking</option>
<option value="other">Other</option>
```

## 🖼️ Gallery Management

**File:** `src/pages/Gallery.jsx`

The gallery system uses a structured data array starting at line 27.

### Gallery Data Structure

Each gallery item has this structure:
```jsx
{ 
  id: 1, 
  src: "/img/gallery/filename.jpg", 
  title: "Item Title",
  alt: "Alt text for accessibility",
  description: "Detailed description of the work",
  materials: "Materials used",
  technique: "Technique or process used",
  category: "category_name"
}
```

### Available Categories
- `corporate` - Corporate branding work
- `apparel` - Custom apparel and clothing
- `promotional` - Promotional items and drinkware
- `gifts` - Personal gifts and custom items

### Adding New Gallery Images

1. **Add the image file:**
   - Place your image in `public/img/gallery/`
   - Use descriptive filenames (e.g., `corporate-business-cards-01.jpg`)
   - Recommended size: 800px width minimum for good quality

2. **Add the data entry:**
   ```jsx
   { 
     id: 21, // Use next available ID
     src: "/img/gallery/your-new-image.jpg", 
     title: "Your Project Title",
     alt: "Descriptive alt text for screen readers",
     description: "Detailed description of the project, techniques used, and what makes it special.",
     materials: "Wood, Metal, Acrylic, etc.",
     technique: "Laser Engraving, Cutting, etc.",
     category: "corporate" // or apparel, promotional, gifts
   }
   ```

3. **Insert the new entry** in the `galleryImages` array (around line 235)

### Removing Gallery Images

1. Delete the image file from `public/img/gallery/`
2. Remove the corresponding object from the `galleryImages` array
3. Update any ID references if needed

### Adding New Categories

1. **Add to categories array** (lines 237-243):
   ```jsx
   { id: 'new_category', name: 'Display Name', count: 0 }
   ```

2. **Update the count** after adding images to the new category

3. **Add images** with `category: "new_category"`

### Image Naming Conventions

Use descriptive, consistent naming:
- `corporate-logo-company-name.jpg`
- `apparel-hat-custom-design.jpg`
- `promotional-water-bottle-engraved.jpg`
- `gifts-wedding-anniversary-item.jpg`

### Image Optimization Tips

- **Format:** Use JPG for photos, PNG for graphics with transparency
- **Size:** Aim for 800-1200px width, keep file size under 500KB
- **Quality:** Balance quality vs. file size for fast loading
- **Alt text:** Always provide descriptive alt text for accessibility

## 📋 Content Update Workflow

### 1. Planning Your Updates
- [ ] List all content that needs updating
- [ ] Gather new images and optimize them
- [ ] Write new text content
- [ ] Plan any structural changes

### 2. Making Updates
- [ ] Update text content in component files
- [ ] Add new images to `public/img/gallery/`
- [ ] Update gallery data array
- [ ] Test locally with `npm run dev`

### 3. Testing
- [ ] Check all pages load correctly
- [ ] Test gallery filtering works
- [ ] Verify new images display properly
- [ ] Test responsive design on mobile
- [ ] Check contact form still works

### 4. Deployment
- [ ] Build with `npm run build`
- [ ] Deploy to your hosting platform
- [ ] Clear browser cache to see changes
- [ ] Test live site functionality

## 🔧 Advanced Content Management

### Bulk Gallery Updates

For adding many images at once:

1. **Prepare a spreadsheet** with columns for each gallery field
2. **Use this template** to generate the JavaScript objects:
   ```
   Title: Project Name
   Filename: project-name.jpg
   Description: Project description
   Materials: Materials used
   Technique: Technique used
   Category: category_name
   ```
3. **Convert to JavaScript** objects and add to the array

### Content Backup

Before making major changes:
1. **Backup your files:** Copy the entire `src/` folder
2. **Use version control:** Git is recommended for tracking changes
3. **Document changes:** Keep notes on what you modified

### Troubleshooting

**Images not displaying:**
- Check file path and filename spelling
- Ensure image is in `public/img/gallery/`
- Check browser console for 404 errors

**Gallery filter not working:**
- Verify category names match exactly
- Check for typos in category strings
- Ensure categories array is updated

**Build errors:**
- Check for syntax errors in JavaScript
- Ensure all quotes and brackets are properly closed
- Review browser console for specific error messages

---

💡 **Need help?** Check the browser console (F12) for error messages, or refer to the React documentation for component syntax.