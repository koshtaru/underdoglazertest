# Video Background Setup Instructions

## Required Video Files

To complete the video background implementation, you need to add the following video files to this directory:

### 1. Primary Video File
- **Filename**: `hero-background.mp4`
- **Format**: MP4 (H.264 codec recommended)
- **Recommended specs**:
  - Resolution: 1920x1080 (Full HD) or higher
  - Duration: 10-30 seconds (will loop)
  - Bitrate: 2-5 Mbps for good quality/size balance
  - Frame rate: 30fps

### 2. Alternative Format (Optional but recommended)
- **Filename**: `hero-background.webm`
- **Format**: WebM (VP9 codec recommended)
- **Same specs as MP4 version**

## Video Content Suggestions

The video should show:
- Laser engraving machine in action
- Close-up shots of the laser cutting/engraving process
- Similar aesthetic to the current `hero-background.jpg` image
- Dark background with bright laser light for good text contrast

## Optimization Tips

1. **Compress the video** to reduce file size (aim for under 5MB)
2. **Remove audio track** (video will be muted anyway)
3. **Test on mobile devices** to ensure smooth playback
4. **Consider creating a shorter loop** (10-15 seconds) to reduce file size

## Fallback Behavior

If video files are not present:
- The existing `hero-background.jpg` image will display as fallback
- No functionality will be broken
- Users with older browsers will see the static image

## Testing

After adding the video files:
1. Refresh the homepage
2. Verify video plays automatically
3. Check that text remains readable over the video
4. Test on mobile devices for performance