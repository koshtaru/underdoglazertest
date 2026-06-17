import { auth } from '../config/firebase';

export async function handleDevImageUpload(imageData, originalName, metadata = {}) {
  try {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch('/api/image-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
    
    return await response.json();
  } catch (error) {
    console.error('Dev image upload error:', error);
    throw error;
  }
}