# Gallery Data Migration to Firestore

## Quick Migration Options

### Option 1: Browser Console Migration (Easiest)

1. **Go to your admin gallery**: `/admin/gallery`
2. **Open browser console** (F12 → Console tab)
3. **Paste and run this code**:

```javascript
async function migrateGalleryData() {
  try {
    console.log('🚀 Starting migration...');
    
    // Gallery data to migrate
    const galleryData = {
      "images": [
        {
          "id": 1,
          "src": "/img/gallery/corporate-underdog-business-card.jpg",
          "title": "Underdog Lazer Business Card",
          "alt": "Underdog Lazer business card with logo engraving",
          "description": "Professional business card featuring precision laser-engraved logo and contact information. Clean, modern design with excellent contrast and readability.",
          "materials": "Black Anodized Metal",
          "technique": "Precision Laser Engraving",
          "category": "corporate",
          "uploadDate": "2024-01-15",
          "fileSize": "2.4 MB",
          "dimensions": "1920x1080",
          "visible": true
        },
        {
          "id": 2,
          "src": "/img/gallery/corporate-logo-01.jpg",
          "title": "Corporate Logo Design",
          "alt": "Corporate logo laser engraving",
          "description": "Custom corporate logo engraving with precise detail work. Professional branding solution for business applications.",
          "materials": "Various Materials",
          "technique": "Logo Engraving",
          "category": "corporate",
          "uploadDate": "2024-01-14",
          "fileSize": "1.9 MB",
          "dimensions": "1600x1200",
          "visible": true
        }
        // ... (truncated for readability - full data would be here)
      ],
      "metadata": {
        "lastModified": Date.now(),
        "version": "1.0.0"
      }
    };
    
    const response = await fetch('/.netlify/functions/gallery-migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'migrate', data: galleryData })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Migration successful!');
      console.log(`📸 Migrated ${result.count} images`);
      console.log('🔄 Refresh the page to see all images');
    } else {
      console.error('❌ Migration failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

// Run the migration
migrateGalleryData();
```

### Option 2: Manual Upload (If Option 1 fails)

1. Go to `/admin/gallery`
2. Use the drag-and-drop interface to upload your gallery images
3. Edit each image's metadata (title, description, category, etc.)

### Option 3: Command Line Migration

1. **Commit and push** the new migration files
2. **Wait for Netlify deploy**
3. **Run**: `node scripts/migrate-to-firestore.js`

## Expected Result

After migration, you should see **20 gallery images** in both:
- Admin gallery (`/admin/gallery`)
- Public gallery (`/gallery`)

## What Gets Migrated

- ✅ **20 gallery images** with full metadata
- ✅ **Categories**: Corporate, Apparel, Promotional, Gifts  
- ✅ **Visibility settings** (some images are hidden)
- ✅ **All descriptions, materials, techniques**

## Troubleshooting

If migration fails:
1. Check browser console for errors
2. Verify you're logged in as admin
3. Try the manual upload option instead