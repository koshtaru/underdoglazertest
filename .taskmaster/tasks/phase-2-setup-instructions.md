# Phase 2: Live Data API Setup Instructions

## Overview
Phase 2 implements Google Analytics Data API v1 integration using Netlify Functions to fetch real GA4 data for your analytics dashboard.

## Required Dependencies

### 1. Install Google Analytics Data API Package

```bash
npm install @google-analytics/data
```

**Note**: If you encounter permission issues with npm cache, run:
```bash
sudo chown -R $(whoami) ~/.npm
npm install @google-analytics/data
```

## Google Cloud Setup

### 2. Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Enable Google Analytics Data API:
   - Go to "APIs & Services" > "Library"
   - Search "Google Analytics Data API"
   - Click "Enable"

4. Create Service Account:
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Name: `analytics-reader`
   - Role: `Viewer` (basic access)
   - Create and download JSON key file

### 3. Grant GA4 Property Access

1. Go to [Google Analytics](https://analytics.google.com/)
2. Admin > Property > Property User Management
3. Add the service account email (from step 2)
4. Grant "Viewer" role
5. Save changes

### 4. Get Property ID

1. In Google Analytics: Admin > Property Settings
2. Copy the **Property ID** (numeric, e.g., `123456789`)
3. This is different from the Measurement ID (G-XXXXXXXXX)

## Environment Configuration

### 5. Update Environment Variables

Add to your `.env` file:

```bash
# Existing GA4 tracking
VITE_GA_MEASUREMENT_ID=G-2NXYTQTGJX

# New API access
GA_PROPERTY_ID=YOUR_NUMERIC_PROPERTY_ID

# Service account credentials (stringify the JSON file)
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project",...}
```

### 6. Netlify Environment Setup

For production deployment:

1. Netlify Dashboard > Site Settings > Environment Variables
2. Add these variables:
   - `GA_PROPERTY_ID`: Your numeric property ID
   - `GOOGLE_APPLICATION_CREDENTIALS_JSON`: Stringified service account JSON

**Security Note**: Never commit service account credentials to git.

## Testing the Implementation

### 7. Local Testing

1. Ensure all environment variables are set
2. Start development server: `npm run dev`
3. Test API endpoints:
   - `http://localhost:8888/.netlify/functions/analytics-overview`
   - `http://localhost:8888/.netlify/functions/analytics-traffic-sources`
   - `http://localhost:8888/.netlify/functions/analytics-top-pages`

### 8. Verify Data Flow

1. Check browser console for API calls
2. Visit your analytics dashboard (`/admin/analytics`)
3. Data should transition from mock to live data
4. Check for any error messages or fallback data

## API Endpoints Created

- **`/.netlify/functions/analytics-overview`**
  - Returns: users, sessions, pageviews, bounce rate, conversions
  - Params: `period` (1d, 7d, 30d, 90d)

- **`/.netlify/functions/analytics-traffic-sources`**
  - Returns: traffic sources breakdown by channel
  - Params: `period` (1d, 7d, 30d, 90d)

- **`/.netlify/functions/analytics-top-pages`**
  - Returns: top performing pages with metrics
  - Params: `period` (1d, 7d, 30d, 90d)

## Features Implemented

✅ **Serverless API Layer**: Netlify Functions for GA4 data fetching
✅ **Data Transformation**: Raw GA4 data formatted for dashboard consumption
✅ **Error Handling**: Graceful fallbacks when API fails
✅ **Caching**: 5-minute cache to reduce API calls and improve performance
✅ **CORS Support**: Proper headers for frontend integration
✅ **Multiple Date Ranges**: Support for 1d, 7d, 30d, 90d periods

## Next Steps (Phase 3)

1. Update Analytics component to use live data
2. Implement real-time data refresh
3. Add loading states and error handling UI
4. Test with various date ranges

## Troubleshooting

### Common Issues:

1. **"GA Property ID not configured"**
   - Ensure `GA_PROPERTY_ID` environment variable is set
   - Use numeric ID, not measurement ID

2. **"Analytics client not initialized"**
   - Verify service account JSON is properly formatted
   - Check Google Cloud API is enabled

3. **"403 Forbidden"**
   - Service account needs Viewer access to GA4 property
   - Check property user management settings

4. **"Cache permission errors"**
   - Run: `sudo chown -R $(whoami) ~/.npm`
   - Clear npm cache: `npm cache clean --force`

## Security Best Practices

- Service account credentials are server-side only
- API functions include CORS protection
- 5-minute caching reduces API quota usage
- No sensitive data exposed to client-side
- Environment variables properly isolated