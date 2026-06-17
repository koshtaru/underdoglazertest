# Firebase Setup Instructions

## Issue Summary
The current Firebase service account (`analytics-reader@underdoglazer.iam.gserviceaccount.com`) only has **Google Analytics read permissions** but needs **Firestore write permissions** for the gallery management system to work.

## Required Fixes

### 1. Update Service Account Permissions

**Current Service Account**: `analytics-reader@underdoglazer.iam.gserviceaccount.com`

**Method 1: Add Firestore permissions to existing service account**
1. Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam)
2. Find the `analytics-reader@underdoglazer.iam.gserviceaccount.com` service account
3. Click "Edit" (pencil icon)
4. Add one of these roles (in order of preference):
   - **Cloud Datastore Owner** (full read/write access)
   - **Cloud Datastore User** (read/write access to data)  
   - **Firestore Database Admin** (if available)
   
   ⚠️ **Note**: Avoid "Service Agent" roles - they're only for Google-managed service accounts

**Method 2: Create new service account with proper permissions**
1. Go to [Google Cloud Console Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Name: `gallery-admin` (or similar)
4. Add roles:
   - **Cloud Datastore Owner** (recommended)
   - **Firebase Admin** (optional, for broader Firebase access)
5. Create and download the JSON key file
6. Update the `GOOGLE_APPLICATION_CREDENTIALS_JSON` in Netlify environment

### 2. Deploy Firestore Security Rules

The `firestore.rules` file has been created. Deploy it to Firebase:

```bash
firebase deploy --only firestore:rules
```

### 3. Configure Environment Variables

**Netlify Environment Variables** (for serverless functions):
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`: Complete JSON service account key (as a single line)

**Local Development** (.env file):
- Copy `.env.example` to `.env`
- Fill in the Firebase configuration values

## Testing the Fix

1. After updating service account permissions, test in admin gallery:
   - Go to `/admin/gallery`
   - Try editing an image title
   - Click "Save Changes"
   - Should save successfully without 500 errors

2. Verify no more hook re-initialization spam:
   - Open browser console
   - Type in any input field
   - Should not see repeated "useGalleryStorage hook called" messages

## Troubleshooting

### "IAM policy update failed - Only service accounts can be granted ServiceAgent roles"

This error means you tried to assign a "Service Agent" role to a user-created service account. **Solution**:
- Use **"Cloud Datastore Owner"** instead of "Cloud Firestore Service Agent"
- Service Agent roles are only for Google-managed service accounts

### Common Role Names to Look For:
- ✅ **Cloud Datastore Owner** - Best option (full access)
- ✅ **Cloud Datastore User** - Good option (read/write access)
- ✅ **Firestore Database Admin** - Alternative if available
- ❌ **Cloud Firestore Service Agent** - Won't work (Google-managed only)

### Alternative: Firebase Console Method
If IAM roles are complex, you can also manage permissions through Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Generate a new admin SDK key with proper permissions

## Files Modified

- `firestore.rules` - Security rules for Firestore
- `src/pages/admin/AdminGallery.jsx` - Removed duplicate useGalleryStorage hook
- `src/contexts/GalleryContext.jsx` - Optimized re-render prevention
- `netlify/functions/firebase-admin.js` - Enhanced error reporting
- `netlify/functions/gallery-update.js` - Better Firebase error handling
- `.env.example` - Environment variable documentation