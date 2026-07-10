import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// Local fallback for `npm run dev` (Netlify functions are not available without `netlify dev`)
import localGalleryData from '../../data/gallery-data.json';
import ProductsHero from '../components/products/ProductsHero';

function Gallery() {
  console.log('🎨 FIRESTORE Gallery component mounting at:', window.location.pathname);

  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9;

  const visibleFrom = (list) => (list || []).filter((img) => img.visible !== false);

  // Load gallery data from API (Firestore); fall back to local JSON in dev
  useEffect(() => {
    console.log('🎨 Gallery component mounted - loading from Firestore API');
    
    const loadGalleryFromAPI = async () => {
      try {
        setLoading(true);
        
        // Determine API endpoint based on environment
        const apiEndpoint = import.meta.env.DEV 
          ? '/api/gallery-get'  // Development (only works with netlify dev / proxy)
          : '/.netlify/functions/gallery-get';  // Production
        
        console.log(`🌐 Fetching gallery data from: ${apiEndpoint}`);
        
        const response = await fetch(apiEndpoint);
        const contentType = response.headers.get('content-type') || '';

        // Vite SPA returns HTML for unknown /api routes — treat as missing API
        if (!response.ok || !contentType.includes('application/json')) {
          throw new Error(
            !response.ok
              ? `API request failed: ${response.status} ${response.statusText}`
              : 'API returned non-JSON (Netlify functions not running in plain Vite dev)'
          );
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'API returned error');
        }
        
        const visibleImages = visibleFrom(data.images);
        
        setImages(visibleImages);
        setError(null);
        console.log(`🎨 Gallery loaded ${visibleImages.length} visible images from Firestore`);
        
      } catch (err) {
        console.error('Failed to load gallery from API:', err);

        // Local preview: use checked-in gallery data so the Products page is usable
        if (import.meta.env.DEV && localGalleryData?.images?.length) {
          const visibleImages = visibleFrom(localGalleryData.images);
          console.warn(`🔧 Dev fallback: using local gallery-data.json (${visibleImages.length} images)`);
          setImages(visibleImages);
          setError(null);
        } else {
          setError(err.message);
          setImages([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadGalleryFromAPI();
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  // Handle loading and error states
  if (loading) {
    return (
      <>
        <ProductsHero />
        <main className="main">
          <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p style={{ marginTop: '1rem' }}>Loading products...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ProductsHero />
        <main className="main">
          <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--clr-error, #ef4444)', marginBottom: '1rem' }}>
              <h2>Products Unavailable</h2>
              <p>Unable to load products: {error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: 'var(--clr-accent)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </main>
      </>
    );
  }

  // Generate categories with counts from visible images
  const categories = [
    { id: 'all', name: 'All Work', count: images.length },
    { id: 'corporate', name: 'Corporate', count: images.filter(img => img.category === 'corporate').length },
    { id: 'apparel', name: 'Apparel', count: images.filter(img => img.category === 'apparel').length },
    { id: 'promotional', name: 'Promotional', count: images.filter(img => img.category === 'promotional').length },
    { id: 'gifts', name: 'Gifts', count: images.filter(img => img.category === 'gifts').length }
  ];

  // Filter images by category
  const filteredImages = activeCategory === 'all'
    ? images
    : images.filter(img => img.category === activeCategory);

  // Pagination calculations
  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedImages = filteredImages.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when category changes
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show subset with ellipsis
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      <Helmet>
        <title>Products — Underdog Lazer</title>
        <meta name="description" content="Browse laser engraving and cutting projects — custom gifts, leather patches, metal business cards, drinkware, and more." />
        <meta property="og:title" content="Products — Underdog Lazer" />
        <meta property="og:description" content="Browse laser engraving and cutting projects — gifts, patches, metal cards, drinkware, and more." />
      </Helmet>

      <ProductsHero />

      <main className="main">
        {/* Products Section */}
        <section className="gallery" aria-labelledby="gallery-section-title">
        <div className="container">
          <h2 className="sr-only" id="gallery-section-title">Products</h2>
          
          {/* Category Filter */}
          <div className="gallery__categories" role="tablist" aria-label="Filter products by category">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`gallery__category ${activeCategory === category.id ? 'active' : ''}`}
                role="tab"
                aria-selected={activeCategory === category.id}
                aria-controls="gallery-grid"
                aria-label={`Show ${category.name} items (${category.count})`}
              >
                <span className="category-name">{category.name}</span>
                <span className="category-count">({category.count})</span>
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div
            className="gallery__grid"
            id="gallery-grid"
            role="tabpanel"
            aria-label={`Showing ${paginatedImages.length} of ${filteredImages.length} items`}
          >
            {paginatedImages.map((image) => (
              <article
                key={image.id ?? image.filename ?? image.src}
                className="gallery__item"
                onClick={() => setSelectedImage(image)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedImage(image);
                  }
                }}
                aria-label={`View ${image.title} - ${image.technique}`}
              >
                <div className="gallery__item-image">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                  />
                  <div className="gallery__item-overlay">
                    <span className="overlay-icon" aria-hidden="true">+</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="gallery__empty" role="status">
              <p>No items found in this category.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination" role="navigation" aria-label="Pagination Navigation">
              <button
                className="pagination__button pagination__button--prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                Previous
              </button>

              <div className="pagination__numbers">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="pagination__ellipsis">...</span>
                  ) : (
                    <button
                      key={page}
                      className={`pagination__number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                      aria-label={`Page ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              <button
                className="pagination__button pagination__button--next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modal for selected image */}
      {selectedImage && (
        <div 
          className="modal" 
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal__content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal__close" 
              onClick={() => setSelectedImage(null)}
              aria-label="Close modal"
            >
              ×
            </button>
            <div className="modal__image">
              <img src={selectedImage.src} alt={selectedImage.alt} />
            </div>
            <div className="modal__info">
              <h3 className="modal__title" id="modal-title">{selectedImage.title}</h3>
              <p className="modal__description">{selectedImage.description}</p>
              
              <dl className="modal__details">
                <div className="detail-group">
                  <dt>Materials:</dt>
                  <dd>{selectedImage.materials}</dd>
                </div>
                <div className="detail-group">
                  <dt>Technique:</dt>
                  <dd>{selectedImage.technique}</dd>
                </div>
                <div className="detail-group">
                  <dt>Category:</dt>
                  <dd>{selectedImage.category}</dd>
                </div>
              </dl>

              <p className="modal__quote-note">
                Interested in something like this?
              </p>
              <Link to="/contact" className="btn btn-primary modal__quote-btn">
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      )}
      </main>
    </>    
  );
}

export default Gallery;