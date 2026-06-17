import { createContext, useContext, useMemo, useCallback } from 'react';
import { useGalleryStorage } from '../hooks/useGalleryStorage';

// Initial gallery data moved to useGalleryStorage hook

// Create the context
const GalleryContext = createContext();

// Gallery provider component
export const GalleryProvider = ({ children }) => {
  // Use the custom storage hook for all data management
  const {
    galleryImages,
    isLoaded,
    isLoading,
    error,
    updateImage,
    addImage,
    deleteImage,
    toggleImageVisibility,
    uploadImage,
    resetToDefaults: resetGalleryData
  } = useGalleryStorage();

  // Computed values that will re-render components when galleryImages changes
  // Only compute if data is loaded to prevent stale data from being used
  const allImages = useMemo(() => {
    return isLoaded ? galleryImages : [];
  }, [isLoaded, galleryImages]);
  
  const visibleImages = useMemo(() => {
    return isLoaded ? galleryImages.filter(img => img.visible) : [];
  }, [isLoaded, galleryImages]);

  // Helper functions for backwards compatibility (memoized to prevent re-creation)
  const getAllImages = useCallback(() => allImages, [allImages]);
  const getVisibleImages = useCallback(() => visibleImages, [visibleImages]);
  const getImagesByCategory = useCallback((category, visibleOnly = false) => {
    const images = visibleOnly ? visibleImages : allImages;
    return category === 'all' ? images : images.filter(img => img.category === category);
  }, [visibleImages, allImages]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // Raw data
    galleryImages,
    allImages,
    visibleImages,
    isLoaded,
    isLoading,
    error,
    
    // Functions
    updateImage,
    addImage,
    deleteImage,
    toggleImageVisibility,
    uploadImage,
    getAllImages,
    getVisibleImages,
    getImagesByCategory,
    resetGalleryData
  }), [
    galleryImages,
    allImages,
    visibleImages,
    isLoaded,
    isLoading,
    error,
    updateImage,
    addImage,
    deleteImage,
    toggleImageVisibility,
    uploadImage,
    getAllImages,
    getVisibleImages,
    getImagesByCategory,
    resetGalleryData
  ]);

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
};

// Custom hook to use gallery context
export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};

export default GalleryContext;