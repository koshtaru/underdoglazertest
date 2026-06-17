// Development-only image upload handler
// This calls the local Netlify function for consistency with production

export async function handleDevImageUpload(imageData, originalName, metadata = {}) {
  console.log('Dev image upload handler - calling local Netlify function');
  
  try {
    // Call the same API endpoint that production uses, but via proxy
    const response = await fetch('/api/image-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageData,
        originalName,
        metadata
      })
    });
    
    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        throw new Error(`Upload failed with status ${response.status}`);
      }
      throw new Error(error.error || 'Upload failed');
    }
    
    const result = await response.json();
    console.log('✅ Dev upload completed via API:', result.data?.filename);
    
    return result;
    
  } catch (error) {
    console.error('Dev image upload error:', error);
    throw error;
  }
}