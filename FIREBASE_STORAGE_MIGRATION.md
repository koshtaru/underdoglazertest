# Firebase Storage Migration Guide

## Overview

This migration moves gallery images from Firestore (base64 data) to Firebase Storage (URLs), reducing the gallery API response from 6MB+ to ~20KB and fixing the 502 error.

## Prerequisites

1. **Enable Firebase Storage** in your Firebase project:
   - Go to Firebase Console → Storage
   - Click "Get Started"
   - Choose production mode
   - Select default location (us-central1 recommended)

2. **Update Firebase Service Account Permissions**:
   - Go to Google Cloud Console → IAM & Admin
   - Find your service account: `analytics-reader@underdoglazer.iam.gserviceaccount.com`
   - Add role: **Storage Object Admin**

3. **Deploy to Netlify** (push to GitHub):
   ```bash
   git add .
   git commit -m "Add Firebase Storage migration support"
   git push
   ```

## Migration Steps

### Step 1: Test with One Image (DRY RUN)

Test the migration without making any changes:

```bash
curl -X POST https://lazerengraving.netlify.app/.netlify/functions/migrate-to-storage \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'
```

Expected response:
```json
{
  "success": true,
  "message": "DRY RUN: Would migrate the following images",
  "images": [...]
}
```

### Step 2: Test with One Image (REAL)

Migrate just one image to test (use an image ID from the dry run):

```bash
curl -X POST https://lazerengraving.netlify.app/.netlify/functions/migrate-to-storage \
  -H "Content-Type: application/json" \
  -d '{"testImageId": 1}'
```

Expected response:
```json
{
  "success": true,
  "message": "Firebase Storage migration completed",
  "summary": {
    "totalImages": 1,
    "successful": 1,
    "failed": 0
  },
  "results": [...]
}
```

**Verify the test:**
1. Check that the gallery page loads correctly
2. Verify the image displays properly
3. Check Netlify function logs for any errors

### Step 3: Migrate All Images

If test succeeded, migrate all remaining images:

```bash
curl -X POST https://lazerengraving.netlify.app/.netlify/functions/migrate-to-storage
```

Expected response:
```json
{
  "success": true,
  "message": "Firebase Storage migration completed",
  "summary": {
    "totalImages": 20,
    "successful": 20,
    "failed": 0
  },
  "backupLocation": "gallery/storage-migration-backup"
}
```

### Step 4: Verify

1. **Check the gallery page**: https://lazerengraving.netlify.app/gallery
2. **Test API directly**:
   ```bash
   curl https://lazerengraving.netlify.app/.netlify/functions/gallery-get
   ```
   - Response should be ~20KB (not 6MB)
   - Should return quickly with 200 status (not 502)

## What Changed

### Before Migration
```json
{
  "id": 1,
  "src": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...{300KB of data}",
  "title": "Business Card"
}
```

### After Migration
```json
{
  "id": 1,
  "src": "https://storage.googleapis.com/underdoglazer.appspot.com/gallery/uploaded-business-card-1234567890-abc123.jpg",
  "storageFilename": "uploaded-business-card-1234567890-abc123.jpg",
  "storagePath": "gallery/uploaded-business-card-1234567890-abc123.jpg",
  "storageEnabled": true,
  "migratedAt": "2025-09-30T15:30:00.000Z",
  "title": "Business Card"
}
```

## Rollback Plan

If something goes wrong, you can rollback:

1. **Restore from backup** (created automatically during migration):
   - The original data is backed up at: `gallery/storage-migration-backup`
   - Use Firebase Console to restore individual documents

2. **Manual rollback via Firebase Console**:
   - Go to Firestore → gallery collection
   - Find `storage-migration-backup` document
   - Copy image data back to individual `image-{id}` documents

## Future Uploads

All new images uploaded through the admin dashboard will automatically:
- Upload to Firebase Storage
- Store URLs (not base64) in Firestore
- Be under 1KB per document

## Troubleshooting

### Error: "Storage initialization failed"
- **Fix**: Enable Firebase Storage in Firebase Console
- **Check**: Storage permissions for service account

### Error: "PERMISSION_DENIED"
- **Fix**: Add "Storage Object Admin" role to service account
- **Where**: Google Cloud Console → IAM & Admin

### Images not displaying after migration
- **Check**: Firebase Storage security rules
- **Fix**: Ensure files are publicly readable:
  ```
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /gallery/{allPaths=**} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
  }
  ```

### 502 error persists
- **Check**: Netlify function logs for specific error
- **Verify**: All images have been migrated (no base64 data remaining)
- **Test**: API response size should be under 1MB

## Cost Estimate

Based on your usage (~20 images):

- **Storage**: 6MB / 5GB = 0.1% of free tier
- **Bandwidth**: Assuming 1000 visitors/month viewing 10 images each
  - 10,000 image loads × 300KB = 3GB / 10GB = 30% of free tier
- **Total cost**: $0 (well within free tier)

## Support

If you encounter issues:
1. Check Netlify function logs
2. Check Firebase Console for errors
3. Review the backup at `gallery/storage-migration-backup`