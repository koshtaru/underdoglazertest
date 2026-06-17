import { useState, useEffect } from 'react';
import '../../styles/admin.css';

// List of all gallery images
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

function AdminGallerySimple() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingImage, setEditingImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Load all image metadata
  useEffect(() => {
    loadGalleryData();
  }, []);

  const loadGalleryData = async () => {
    try {
      setLoading(true);
      const loadedImages = [];
      
      for (const imageName of GALLERY_IMAGES) {
        try {
          const response = await fetch(`/img/gallery/${imageName}.json`);
          if (response.ok) {
            let metadata = await response.json();
            
            // Check for any admin updates in localStorage (development only)
            const updates = JSON.parse(localStorage.getItem('gallery-updates') || '{}');
            if (updates[imageName]) {
              metadata = { ...metadata, ...updates[imageName] };
            }
            
            loadedImages.push({
              ...metadata,
              src: `/img/gallery/${imageName}.jpg`,
              filename: imageName
            });
          }
        } catch (err) {
          console.warn(`Failed to load metadata for ${imageName}:`, err);
        }
      }
      
      setImages(loadedImages);
      setError('');
    } catch (err) {
      console.error('Failed to load gallery:', err);
      setError('Failed to load gallery data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (image) => {
    console.log('Edit clicked for:', image.title);
    setEditingImage({...image});
    setSuccessMessage('');
  };

  const handleSave = async () => {
    try {
      // In development, we'll use localStorage to simulate the save
      // In production, this would call the Netlify function
      
      // For now, store the changes in localStorage
      const updates = JSON.parse(localStorage.getItem('gallery-updates') || '{}');
      updates[editingImage.filename] = {
        title: editingImage.title,
        alt: editingImage.alt,
        description: editingImage.description,
        materials: editingImage.materials,
        technique: editingImage.technique,
        category: editingImage.category,
        visible: editingImage.visible
      };
      localStorage.setItem('gallery-updates', JSON.stringify(updates));
      
      console.log('Saved updates for:', editingImage.filename, updates[editingImage.filename]);
      
      // Update local state immediately
      setImages(prevImages => 
        prevImages.map(img => 
          img.filename === editingImage.filename ? {...editingImage} : img
        )
      );
      
      setSuccessMessage(`Updated "${editingImage.title}" successfully. Note: In development, changes are stored locally.`);
      setEditingImage(null);
      
      // Refresh the gallery data to ensure consistency
      setTimeout(() => {
        loadGalleryData();
      }, 100);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
      setError('Failed to save changes');
    }
  };

  const handleCancel = () => {
    setEditingImage(null);
    setSuccessMessage('');
  };

  const handleFieldChange = (field, value) => {
    setEditingImage({
      ...editingImage,
      [field]: value
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading gallery data...</p>
      </div>
    );
  }

  return (
    <div className="admin-gallery-simple">
      <div className="admin-gallery-header">
        <h2>Gallery Management (Simplified)</h2>
        <p className="info-message">
          This simplified version reads metadata from JSON files. In production, 
          changes would be saved back to the server.
        </p>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="gallery-grid admin-gallery-grid">
        {images.map((image) => {
          // Check if this image has been edited
          const updates = JSON.parse(localStorage.getItem('gallery-updates') || '{}');
          const hasEdits = updates[image.filename] !== undefined;
          
          return (
            <div 
              key={image.filename} 
              className={`gallery-card ${!image.visible ? 'hidden-image' : ''} ${hasEdits ? 'has-edits' : ''}`}
            >
              <div className="image-preview">
                <img src={image.src} alt={image.alt} />
                {!image.visible && <div className="hidden-badge">Hidden</div>}
                {hasEdits && <div className="edited-badge" style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(0, 128, 0, 0.8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}>Edited</div>}
              </div>
              <div className="image-info">
                <h3>{image.title}</h3>
                <p className="category">{image.category}</p>
                <button 
                  className="btn btn-small btn-primary"
                  onClick={() => handleEdit(image)}
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingImage && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Image Metadata</h3>
            
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={editingImage.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Alt Text</label>
              <input
                type="text"
                value={editingImage.alt}
                onChange={(e) => handleFieldChange('alt', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editingImage.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Materials</label>
              <input
                type="text"
                value={editingImage.materials}
                onChange={(e) => handleFieldChange('materials', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Technique</label>
              <input
                type="text"
                value={editingImage.technique}
                onChange={(e) => handleFieldChange('technique', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={editingImage.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
              >
                <option value="corporate">Corporate</option>
                <option value="apparel">Apparel</option>
                <option value="promotional">Promotional</option>
                <option value="gifts">Gifts</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={editingImage.visible}
                  onChange={(e) => handleFieldChange('visible', e.target.checked)}
                />
                Visible in Gallery
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSave}>
                Save Changes
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGallerySimple;