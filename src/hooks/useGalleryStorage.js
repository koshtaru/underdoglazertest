import { useState, useEffect, useRef, useCallback } from 'react';
import { auth } from '../config/firebase';

// API endpoints - with development fallback
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment ? '/api' : '/.netlify/functions';
const GALLERY_GET_ENDPOINT = `${API_BASE_URL}/gallery-get`;
const GALLERY_UPDATE_ENDPOINT = `${API_BASE_URL}/gallery-update`;

// Global instance tracking - improved for Strict Mode compatibility
let globalInstanceCount = 0;
let activeInstanceId = null;

// Global synchronization for same-tab updates
const globalSyncCallbacks = new Set();

// Function to trigger all instances to sync
const triggerGlobalSync = (newData, sourceInstanceId) => {
  console.log(`🔄 Global sync triggered by instance ${sourceInstanceId}, notifying ${globalSyncCallbacks.size} instances`);
  globalSyncCallbacks.forEach(callback => {
    try {
      callback(newData, sourceInstanceId);
    } catch (error) {
      console.warn('Global sync callback failed:', error);
      // Remove failed callbacks to prevent memory leaks
      globalSyncCallbacks.delete(callback);
    }
  });
};

// Development fallback data - mirrors production gallery-data.json
const developmentFallback = async () => {
  console.log('🔧 Development mode: Using complete fallback gallery data');
  // Return complete gallery data structure matching the API
  return {
    success: true,
    images: [
      {
        id: 1,
        src: "/img/gallery/corporate-underdog-business-card.jpg",
        title: "Underdog Lazer Business Card",
        alt: "Underdog Lazer business card with logo engraving",
        description: "Professional business card featuring precision laser-engraved logo and contact information. Clean, modern design with excellent contrast and readability.",
        materials: "Black Anodized Metal",
        technique: "Precision Laser Engraving",
        category: "corporate",
        uploadDate: "2024-01-15",
        fileSize: "2.4 MB",
        dimensions: "1920x1080",
        visible: true
      },
      {
        id: 2,
        src: "/img/gallery/corporate-logo-01.jpg",
        title: "Corporate Logo Design",
        alt: "Corporate logo laser engraving",
        description: "Custom corporate logo engraving with precise detail work. Professional branding solution for business applications.",
        materials: "Various Materials",
        technique: "Logo Engraving",
        category: "corporate",
        uploadDate: "2024-01-14",
        fileSize: "1.9 MB",
        dimensions: "1600x1200",
        visible: true
      },
      {
        id: 3,
        src: "/img/gallery/corporate-logo-02.jpg",
        title: "Business Branding",
        alt: "Business branding laser work",
        description: "Professional business branding with laser precision. Clean lines and consistent quality for corporate identity.",
        materials: "Metal & Acrylic",
        technique: "Corporate Branding",
        category: "corporate",
        uploadDate: "2024-01-13",
        fileSize: "2.1 MB",
        dimensions: "1800x1200",
        visible: true
      },
      {
        id: 4,
        src: "/img/gallery/corporate-logo-03.jpg",
        title: "Company Identification",
        alt: "Company identification engraving",
        description: "Durable company identification marking with professional finish. Perfect for corporate environments and professional applications.",
        materials: "Stainless Steel",
        technique: "Industrial Marking",
        category: "corporate",
        uploadDate: "2024-01-12",
        fileSize: "2.3 MB",
        dimensions: "1920x1280",
        visible: true
      },
      {
        id: 5,
        src: "/img/gallery/apparel-degrave-electric-hat.jpg",
        title: "Degrave Electric Branded Hat",
        alt: "Custom branded trucker hat with laser-cut patch",
        description: "Professional trucker hat featuring custom laser-cut leather patch with company branding. High-quality construction with durable materials.",
        materials: "Leather Patch on Canvas",
        technique: "Laser Cutting & Engraving",
        category: "apparel",
        uploadDate: "2024-01-11",
        fileSize: "1.8 MB",
        dimensions: "1600x1200",
        visible: true
      },
      {
        id: 6,
        src: "/img/gallery/apparel-blank-hats.jpg",
        title: "Custom Hat Collection",
        alt: "Collection of custom branded hats",
        description: "Various styles of custom hats ready for personalization. Quality blanks prepared for logo application and custom branding.",
        materials: "Cotton & Mesh",
        technique: "Custom Branding Prep",
        category: "apparel",
        uploadDate: "2024-01-10",
        fileSize: "2.5 MB",
        dimensions: "1920x1080",
        visible: true
      },
      {
        id: 7,
        src: "/img/gallery/apparel-hat-02.jpg",
        title: "Custom Embroidered Cap",
        alt: "Custom embroidered baseball cap",
        description: "Professional embroidered cap with precision stitching and quality materials. Perfect for corporate uniforms and promotional wear.",
        materials: "Cotton Twill",
        technique: "Embroidery & Finishing",
        category: "apparel",
        uploadDate: "2024-01-09",
        fileSize: "1.7 MB",
        dimensions: "1600x1080",
        visible: true
      },
      {
        id: 8,
        src: "/img/gallery/apparel-hat-03.jpg",
        title: "Branded Trucker Hat",
        alt: "Branded trucker hat with mesh back",
        description: "Classic trucker style with custom branding. Comfortable fit with breathable mesh backing and professional logo placement.",
        materials: "Cotton & Mesh",
        technique: "Logo Application",
        category: "apparel",
        uploadDate: "2024-01-08",
        fileSize: "2.0 MB",
        dimensions: "1800x1200",
        visible: true
      },
      {
        id: 9,
        src: "/img/gallery/apparel-hat-04.jpg",
        title: "Professional Work Cap",
        alt: "Professional work cap with logo",
        description: "Durable work cap designed for professional environments. Features reinforced construction and clear logo visibility.",
        materials: "Heavy Cotton",
        technique: "Industrial Embroidery",
        category: "apparel",
        uploadDate: "2024-01-07",
        fileSize: "1.9 MB",
        dimensions: "1600x1200",
        visible: true
      },
      {
        id: 10,
        src: "/img/gallery/apparel-hat-05.jpg",
        title: "Custom Team Hat",
        alt: "Custom team or group hat",
        description: "Team or group identification hat with custom design elements. Perfect for uniforms, teams, or company events.",
        materials: "Polyester Blend",
        technique: "Custom Design Application",
        category: "apparel",
        uploadDate: "2024-01-06",
        fileSize: "2.2 MB",
        dimensions: "1920x1280",
        visible: true
      },
      {
        id: 11,
        src: "/img/gallery/promotional-woodville-water-bottle.jpg",
        title: "Woodville Construction Water Bottle",
        alt: "Custom laser-engraved water bottle for Woodville Construction",
        description: "High-quality insulated water bottle with precision laser engraving. Features company logo and contact information with excellent durability.",
        materials: "Stainless Steel",
        technique: "Laser Engraving",
        category: "promotional",
        uploadDate: "2024-01-05",
        fileSize: "3.1 MB",
        dimensions: "1800x1200",
        visible: true
      },
      {
        id: 12,
        src: "/img/gallery/promotional-woodville-koozie.jpg",
        title: "Woodville Construction Koozie",
        alt: "Custom branded koozie with Woodville Construction logo",
        description: "Custom insulated beverage holder featuring laser-engraved company branding. Perfect for outdoor events and promotional giveaways.",
        materials: "Neoprene",
        technique: "Laser Engraving",
        category: "promotional",
        uploadDate: "2024-01-04",
        fileSize: "2.4 MB",
        dimensions: "1920x1440",
        visible: true
      },
      {
        id: 13,
        src: "/img/gallery/promotional-drinkware-01.jpg",
        title: "Custom Drinkware Collection",
        alt: "Custom promotional drinkware",
        description: "Professional promotional drinkware with custom branding. Durable construction suitable for corporate gifts and marketing campaigns.",
        materials: "Various Materials",
        technique: "Multi-Surface Engraving",
        category: "promotional",
        uploadDate: "2024-01-03",
        fileSize: "2.8 MB",
        dimensions: "1600x1200",
        visible: true
      },
      {
        id: 14,
        src: "/img/gallery/promotional-drinkware-02.jpg",
        title: "Branded Travel Mug",
        alt: "Custom branded travel mug",
        description: "Insulated travel mug with precision laser engraving. Perfect for corporate gifts, employee recognition, or promotional campaigns.",
        materials: "Stainless Steel",
        technique: "Precision Engraving",
        category: "promotional",
        uploadDate: "2024-01-02",
        fileSize: "2.6 MB",
        dimensions: "1920x1080",
        visible: true
      },
      {
        id: 15,
        src: "/img/gallery/promotional-drinkware-03.jpg",
        title: "Professional Tumbler",
        alt: "Professional custom tumbler",
        description: "High-quality tumbler with professional engraving. Excellent for corporate branding and premium promotional items.",
        materials: "Insulated Steel",
        technique: "Corporate Engraving",
        category: "promotional",
        uploadDate: "2024-01-01",
        fileSize: "2.3 MB",
        dimensions: "1800x1350",
        visible: true
      },
      {
        id: 16,
        src: "/img/gallery/gifts-happier-with-you-koozie.jpg",
        title: "Personal Photo Koozie",
        alt: "Custom photo engraved koozie with personal message",
        description: "Personalized koozie featuring custom photo engraving and heartfelt message. Perfect for anniversaries, gifts, and special memories.",
        materials: "Wood-finish Neoprene",
        technique: "Photo Engraving",
        category: "gifts",
        uploadDate: "2023-12-31",
        fileSize: "2.7 MB",
        dimensions: "1920x1440",
        visible: true
      },
      {
        id: 17,
        src: "/img/gallery/gifts-custom-item-01.jpg",
        title: "Custom Memorial Piece",
        alt: "Custom memorial or keepsake item",
        description: "Thoughtful memorial or keepsake item with personalized engraving. Crafted with care for lasting memories and special occasions.",
        materials: "Premium Materials",
        technique: "Memorial Engraving",
        category: "gifts",
        uploadDate: "2023-12-30",
        fileSize: "1.8 MB",
        dimensions: "1600x1200",
        visible: false
      },
      {
        id: 18,
        src: "/img/gallery/gifts-custom-item-02.jpg",
        title: "Personalized Gift Item",
        alt: "Personalized custom gift",
        description: "Unique personalized gift with custom engraving. Perfect for special occasions, holidays, and meaningful presents.",
        materials: "Mixed Materials",
        technique: "Personalization",
        category: "gifts",
        uploadDate: "2023-12-29",
        fileSize: "2.2 MB",
        dimensions: "1800x1200",
        visible: true
      },
      {
        id: 19,
        src: "/img/gallery/gifts-custom-item-03.jpg",
        title: "Special Occasion Gift",
        alt: "Special occasion custom gift",
        description: "Custom gift designed for special occasions. Features personalized elements and quality craftsmanship for memorable presents.",
        materials: "Quality Materials",
        technique: "Custom Engraving",
        category: "gifts",
        uploadDate: "2023-12-28",
        fileSize: "2.1 MB",
        dimensions: "1920x1280",
        visible: true
      },
      {
        id: 20,
        src: "/img/gallery/gifts-photoroom-item.jpg",
        title: "Custom Photo Item",
        alt: "Custom item with photo engraving",
        description: "Unique item featuring custom photo engraving with professional finish. Perfect for preserving memories and creating lasting keepsakes.",
        materials: "Specialty Materials",
        technique: "Photo Transfer Engraving",
        category: "gifts",
        uploadDate: "2023-12-27",
        fileSize: "3.2 MB",
        dimensions: "1920x1440",
        visible: false
      }
    ],
    metadata: {
      lastModified: Date.now(),
      version: "1.0.0"
    }
  };
};

// API service functions
const galleryAPI = {
  async fetchGallery() {
    console.log('📡 Fetching gallery data from API...');
    
    // Always use API for consistency between dev and production
    const apiEndpoint = isDevelopment ? '/api/gallery-get' : GALLERY_GET_ENDPOINT;
    console.log(`🌐 Calling API endpoint: ${apiEndpoint}`);
    
    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn(`API call failed (${response.status}), falling back to development data`);
      return await developmentFallback();
    }
    
    const data = await response.json();
    if (!data.success) {
      console.warn(`API returned error, falling back to development data:`, data.error);
      return await developmentFallback();
    }
    
    console.log('✅ Gallery data fetched successfully');
    return data;
  },
  
  async updateGallery(action, imageId = null, updatedData = null) {
    const apiEndpoint = isDevelopment ? '/api/gallery-update' : GALLERY_UPDATE_ENDPOINT;

    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(apiEndpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        action,
        imageId,
        updatedData
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'API update failed');
    }
    
    console.log('✅ Gallery data updated successfully');
    return data;
  }
};


// Fallback data in case API is unavailable
const fallbackGalleryImages = [];

/**
 * Custom hook for managing gallery data with API persistence
 * and cross-instance synchronization
 */
export const useGalleryStorage = () => {
  console.log('🚀 useGalleryStorage hook called! Location:', window.location.pathname);
  
  // Using Firestore API for all data persistence - no localStorage needed
  
  // Refs for instance management
  const isInitializedRef = useRef(false);
  const instanceIdRef = useRef(++globalInstanceCount);
  
  // Set this instance as active if no active instance exists
  const wasFirstInstance = activeInstanceId === null;
  if (wasFirstInstance) {
    activeInstanceId = instanceIdRef.current;
  }
  
  const isActiveInstance = instanceIdRef.current === activeInstanceId;
  
  console.log(`📋 API Storage: Hook instance ${instanceIdRef.current} initialized (active: ${isActiveInstance}) at ${window.location.pathname}`);

  // Register this instance for global sync callbacks
  const handleGlobalSync = useCallback((newData, sourceInstanceId) => {
    console.log(`🔄 Instance ${instanceIdRef.current} handleGlobalSync called, source: ${sourceInstanceId}`);
    if (sourceInstanceId !== instanceIdRef.current) {
      console.log(`✅ Instance ${instanceIdRef.current} received global sync from instance ${sourceInstanceId}:`, newData[0]?.title);
      setGalleryImages(newData);
      setIsLoaded(true);
    } else {
      console.log(`⏭ Instance ${instanceIdRef.current} ignoring own sync`);
    }
  }, []);

  useEffect(() => {
    const instanceId = instanceIdRef.current;
    console.log(`🔄 Instance ${instanceId} registering for global sync, total callbacks: ${globalSyncCallbacks.size}`);
    globalSyncCallbacks.add(handleGlobalSync);
    console.log(`✅ Instance ${instanceId} registered, new total callbacks: ${globalSyncCallbacks.size}`);
    return () => {
      console.log(`🚫 Instance ${instanceId} unregistering from global sync`);
      globalSyncCallbacks.delete(handleGlobalSync);
    };
  }, [handleGlobalSync]);


  // State for gallery images and loading
  const [galleryImages, setGalleryImages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API data loading effect - improved for Strict Mode
  useEffect(() => {
    console.log(`🚀 API Load: Instance ${instanceIdRef.current} starting data fetch from API at ${window.location.pathname}`);
    
    const loadGalleryData = async () => {
      // Only load if not already initialized (prevents double execution in Strict Mode)
      if (isInitializedRef.current) {
        console.log(`⏭ Instance ${instanceIdRef.current} already initialized, skipping load`);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`📡 Instance ${instanceIdRef.current} fetching from API...`);
        const response = await galleryAPI.fetchGallery();
        
        console.log(`✅ Instance ${instanceIdRef.current} API fetch successful, setting data:`, response.images[0]?.title);
        console.log(`✅ Loaded ${response.images?.length} images with ${response.images?.filter(img => img.visible).length} visible`);
        
        setGalleryImages(response.images || []);
        setIsLoaded(true);
        setError(null);
        
        // Mark as initialized after successful load
        isInitializedRef.current = true;
        
      } catch (err) {
        console.error(`❌ Instance ${instanceIdRef.current} API fetch failed:`, err);
        setError(err.message);
        setGalleryImages(fallbackGalleryImages); // Fallback to empty array
        setIsLoaded(true); // Still mark as loaded to prevent loading state
        isInitializedRef.current = true; // Mark as initialized even on error
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add slight delay to prevent race conditions in Strict Mode
    const timeoutId = setTimeout(loadGalleryData, 0);
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array to run only on mount

  // Gallery page refresh effect - use existing data, don't re-fetch
  useEffect(() => {
    const refreshGalleryData = () => {
      if (window.location.pathname === '/gallery' && isInitializedRef.current) {
        console.log(`🔄 Instance ${instanceIdRef.current} Gallery page detected - using existing data (no re-fetch)`);
        // Don't re-fetch, just use the already loaded data to preserve admin edits
        console.log(`✅ Gallery using existing data:`, galleryImages[0]?.title);
      }
    };

    // Check immediately on mount for gallery page
    refreshGalleryData();
  }, [galleryImages]); // Depend on galleryImages to log current data

  // API save function - only admin pages should trigger API updates
  const saveToAPI = useCallback(async (action, imageId = null, updatedData = null) => {
    const isAdminPage = window.location.pathname.startsWith('/admin');
    const isGalleryPage = window.location.pathname === '/gallery';
    
    if (!isAdminPage || isGalleryPage) {
      console.log(`🚫 API SAVE BLOCKED - Instance ${instanceIdRef.current}: isAdmin=${isAdminPage}, isGallery=${isGalleryPage}`);
      return false;
    }
    
    // Allow any admin instance to save - remove active instance restriction for saves
    console.log(`✅ Instance ${instanceIdRef.current} proceeding with API save: ${action}`);

    try {
      console.log(`📡 Instance ${instanceIdRef.current} saving to API: ${action}`);
      const result = await galleryAPI.updateGallery(action, imageId, updatedData);
      
      console.log(`✅ API save successful:`, result.data.images[0]?.title);
      
      // Update local state with fresh data from API
      setGalleryImages([...result.data.images]);
      
      // Trigger global sync to notify other instances
      triggerGlobalSync(result.data.images, instanceIdRef.current);
      
      return true;
    } catch (error) {
      console.error(`❌ API save failed:`, error);
      setError(error.message);
      return false;
    }
  }, []);

  // No localStorage handling needed - API handles persistence
  // Gallery data changes are handled through API calls only

  // Gallery management functions - all use API
  const updateImage = useCallback(async (imageId, updatedData) => {
    console.log(`🔄 Instance ${instanceIdRef.current} updateImage called for ID:`, imageId);
    const success = await saveToAPI('update', imageId, updatedData);
    return success;
  }, [saveToAPI]);

  const addImage = useCallback(async (newImage) => {
    console.log(`➕ Instance ${instanceIdRef.current} addImage called`);
    const success = await saveToAPI('add', null, newImage);
    return success;
  }, [saveToAPI]);

  const deleteImage = useCallback(async (imageId) => {
    console.log(`🗑 Instance ${instanceIdRef.current} deleteImage called for ID:`, imageId);
    const success = await saveToAPI('delete', imageId, null);
    return success;
  }, [saveToAPI]);

  const toggleImageVisibility = useCallback(async (imageId) => {
    console.log(`👁 Instance ${instanceIdRef.current} toggleImageVisibility called for ID:`, imageId);
    const success = await saveToAPI('toggle-visibility', imageId, null);
    return success;
  }, [saveToAPI]);

  // Upload new image
  const uploadImage = useCallback(async (imageData, originalName, metadata = {}) => {
    console.log(`📤 Instance ${instanceIdRef.current} uploadImage called for:`, originalName);
    
    try {
      let result;
      
      // In development, use the local handler
      if (isDevelopment) {
        const { handleDevImageUpload } = await import('../api/dev-image-upload');
        result = await handleDevImageUpload(imageData, originalName, metadata);
      } else {
        // In production, use Netlify function
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch('/.netlify/functions/image-upload', {
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
        
        result = await response.json();
      }
      
      if (result.success) {
        // Add the new image to our local state and sync
        const currentImages = galleryImages || [];
        const newImage = {
          ...result.data,
          id: Math.max(...currentImages.map(img => img.id || 0), 0) + 1
        };
        
        // Update local state
        const updatedImages = [...currentImages, newImage];
        setGalleryImages(updatedImages);
        
        // Data is automatically saved to Firestore via the upload function
        // No localStorage needed
        
        // Trigger global sync
        triggerGlobalSync(updatedImages, instanceIdRef.current);
        
        return { success: true, data: newImage };
      }
      
      throw new Error(result.error || 'Upload failed');
    } catch (error) {
      console.error(`❌ Instance ${instanceIdRef.current} uploadImage error:`, error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, [galleryImages]);

  const resetToDefaults = useCallback(async () => {
    console.log(`🔄 Instance ${instanceIdRef.current} resetting to defaults`);
    try {
      const response = await galleryAPI.fetchGallery();
      setGalleryImages(response.images || fallbackGalleryImages);
      return true;
    } catch (error) {
      console.error('Reset to defaults failed:', error);
      setGalleryImages(fallbackGalleryImages);
      return false;
    }
  }, []);

  return {
    galleryImages: galleryImages || [], // Return empty array while loading
    isLoaded,
    isLoading,
    error,
    updateImage,
    addImage,
    deleteImage,
    toggleImageVisibility,
    uploadImage,
    resetToDefaults
  };
};