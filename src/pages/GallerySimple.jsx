import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// List of all gallery images - in production this could be dynamic
const GALLERY_IMAGES = [
  'corporate-underdog-business-card',
  'corporate-logo-01',
  'corporate-logo-02',
  'corporate-logo-03',
  'apparel-degrave-electric-hat',
  'apparel-blank-hats',
  'apparel-hat-02',
  'apparel-hat-03',
  'apparel-hat-04',
  'apparel-hat-05',
  'promotional-woodville-water-bottle',
  'promotional-woodville-koozie',
  'promotional-drinkware-01',
  'promotional-drinkware-02',
  'promotional-drinkware-03',
  'gifts-happier-with-you-koozie',
  'gifts-custom-item-01',
  'gifts-custom-item-02',
  'gifts-custom-item-03',
  'gifts-photoroom-item'
];

function GallerySimple() {
  console.log('🎨 GallerySimple component loaded - using JSON files!');
  
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all image metadata on mount
  useEffect(() => {
    const loadImageMetadata = async () => {
      try {
        setLoading(true);
        const loadedImages = [];
        
        for (const imageName of GALLERY_IMAGES) {
          try {
            // Fetch the JSON metadata file
            const response = await fetch(`/img/gallery/${imageName}.json`);
            if (response.ok) {
              let metadata = await response.json();
              
              // Check for any admin updates in localStorage (development only)
              const updates = JSON.parse(localStorage.getItem('gallery-updates') || '{}');
              console.log('Checking updates for:', imageName, 'Found:', updates[imageName]);
              if (updates[imageName]) {
                console.log('Applying update:', updates[imageName].title);
                metadata = { ...metadata, ...updates[imageName] };
              }
              
              // Only include visible images
              if (metadata.visible) {
                loadedImages.push({
                  ...metadata,
                  src: `/img/gallery/${imageName}.jpg`,
                  filename: imageName
                });
              }
            }
          } catch (err) {
            console.warn(`Failed to load metadata for ${imageName}:`, err);
          }
        }
        
        setImages(loadedImages);
        setError(null);
      } catch (err) {
        console.error('Failed to load gallery:', err);
        setError('Failed to load gallery images');
      } finally {
        setLoading(false);
      }
    };

    loadImageMetadata();
  }, []);

  // Get unique categories
  const categories = ['all', ...new Set(images.map(img => img.category))];
  
  // Filter images by category
  const filteredImages = activeCategory === 'all' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  if (loading) {
    return (
      <main className="main">
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p style={{ marginTop: '1rem' }}>Loading gallery...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="main">
        <section className="hero">
          <div className="container">
            <h1>Our Work Gallery</h1>
            <p>Explore our portfolio of custom laser engraving projects</p>
          </div>
        </section>

        <section className="gallery-section">
          <div className="container">
            {/* Category Filter */}
            <div className="gallery-filter">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="gallery-grid">
              {filteredImages.map((image, index) => (
                <div
                  key={index}
                  className="gallery-item"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                  />
                  <div className="gallery-overlay">
                    <h3>{image.title}</h3>
                    <p>{image.technique}</p>
                  </div>
                </div>
              ))}
            </div>

            {filteredImages.length === 0 && (
              <p style={{ textAlign: 'center', marginTop: '2rem' }}>
                No images found in this category.
              </p>
            )}
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <h2>Ready to Create Something Amazing?</h2>
            <p>Let's bring your ideas to life with precision laser engraving</p>
            <Link to="/contact" className="btn btn-primary">Get a Quote</Link>
          </div>
        </section>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div className="gallery-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setSelectedImage(null)}
              aria-label="Close modal"
            >
              &times;
            </button>
            <img src={selectedImage.src} alt={selectedImage.alt} />
            <div className="modal-info">
              <h3>{selectedImage.title}</h3>
              <p className="modal-description">{selectedImage.description}</p>
              <div className="modal-details">
                <div className="detail-item">
                  <strong>Materials:</strong> {selectedImage.materials}
                </div>
                <div className="detail-item">
                  <strong>Technique:</strong> {selectedImage.technique}
                </div>
                <div className="detail-item">
                  <strong>Category:</strong> {selectedImage.category}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GallerySimple;