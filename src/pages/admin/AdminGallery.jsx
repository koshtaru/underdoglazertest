import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, GripVertical } from 'lucide-react';
import { useGallery } from '../../contexts/GalleryContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import '../../styles/admin.css';

// Sortable Gallery Card Component
function SortableGalleryCard({ image, arrangeMode, onEdit, onDelete, activeId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: arrangeMode ? 'move' : 'default'
  };

  const hasEdits = false; // Simplified for production

  // Show drop placeholder on the target (where hovering), not the source (what's being dragged)
  const showDropPlaceholder = isOver && activeId !== null && activeId !== image.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`gallery-card ${!image.visible ? 'gallery-card--hidden' : ''} ${hasEdits ? 'gallery-card--edited' : ''} ${arrangeMode ? 'gallery-card--draggable' : ''} ${isDragging ? 'gallery-card--dragging' : ''} ${showDropPlaceholder ? 'gallery-card--drop-target' : ''}`}
    >
      {arrangeMode && (
        <div className="gallery-card__drag-handle" {...attributes} {...listeners}>
          <GripVertical size={20} />
        </div>
      )}
      {showDropPlaceholder && (
        <div className="gallery-card__drop-placeholder">
          <div className="drop-placeholder__icon">↓</div>
          <div className="drop-placeholder__text">Drop here</div>
        </div>
      )}
      <div className="gallery-card__image">
        <img src={image.src} alt={image.alt} />
        {!image.visible && (
          <div className="gallery-card__badge gallery-card__badge--hidden">Hidden</div>
        )}
        {hasEdits && (
          <div className="gallery-card__badge gallery-card__badge--edited">Edited</div>
        )}
      </div>
      <div className="gallery-card__content">
        <h3 className="gallery-card__title">{image.title}</h3>
        <p className="gallery-card__category">{image.category}</p>
        {!arrangeMode && (
          <div className="gallery-card__actions">
            <button
              className="btn btn-primary btn--small"
              onClick={() => onEdit(image)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger btn--small"
              onClick={() => onDelete(image)}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminGallery() {
  // Use the gallery context (single source of truth)
  const {
    galleryImages: images,
    isLoading: loading,
    error: apiError,
    updateImage,
    deleteImage,
    uploadImage: apiUploadImage
  } = useGallery();

  const [editingImage, setEditingImage] = useState(null);
  const [deletingImage, setDeletingImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [arrangeMode, setArrangeMode] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [sortedImages, setSortedImages] = useState([]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Set error state from API
  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);

  // Initialize sorted images when images load
  useEffect(() => {
    if (images.length > 0) {
      setSortedImages([...images]);
    }
  }, [images]);


  const handleEdit = (image) => {
    console.log('Edit clicked for:', image.title);
    setEditingImage({...image});
    setSuccessMessage('');
  };

  const handleSave = async () => {
    try {
      console.log('🔧 Admin saving edit via API for:', editingImage.filename);
      console.log('🔧 Image being edited:', editingImage);
      
      // Use the API hook to update the image
      const success = await updateImage(editingImage.id, {
        title: editingImage.title,
        alt: editingImage.alt,
        description: editingImage.description,
        materials: editingImage.materials,
        technique: editingImage.technique,
        category: editingImage.category,
        visible: editingImage.visible
      });
      
      if (success) {
        setSuccessMessage(`Updated "${editingImage.title}" successfully.`);
        setEditingImage(null);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to save changes');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      setError('Failed to save changes');
    }
  };

  const handleCancel = () => {
    setEditingImage(null);
    setSuccessMessage('');
  };

  const handleDelete = (image) => {
    console.log('Delete clicked for:', image.title);
    setDeletingImage(image);
    setError('');
  };

  const confirmDelete = async () => {
    if (!deletingImage) return;
    
    try {
      console.log('🗑 Deleting image via API:', deletingImage.filename);
      
      // Use the API hook to delete the image
      const success = await deleteImage(deletingImage.id);
      
      if (success) {
        setSuccessMessage(`Deleted "${deletingImage.title}" successfully.`);
        setDeletingImage(null);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to delete image');
        setDeletingImage(null);
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('Failed to delete image');
      setDeletingImage(null);
    }
  };

  const cancelDelete = () => {
    setDeletingImage(null);
  };

  const handleFieldChange = useCallback((field, value) => {
    setEditingImage(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // File validation function
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: `${file.name}: Invalid file type. Please upload JPEG, PNG, WebP, or GIF.` };
    }

    if (file.size > maxSize) {
      return { valid: false, error: `${file.name}: File too large. Maximum size is 10MB.` };
    }

    return { valid: true };
  };

  // Process image with Canvas for optimization and thumbnail
  const processImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for processing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (max width: 1920px for main image)
          const maxWidth = 1920;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          // Set canvas dimensions and draw image
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Compress image to stay under Firestore field limit (1MB)
          const compressImage = (quality = 0.7) => {
            const imageData = canvas.toDataURL('image/jpeg', quality);

            // Calculate approximate size (base64 size * 0.75 for bytes)
            const sizeInBytes = imageData.length * 0.75;
            const maxSizeBytes = 800 * 1024; // 800KB target (safety margin under 1MB)

            // If still too large, reduce quality and try again
            if (sizeInBytes > maxSizeBytes && quality > 0.3) {
              console.log(`Image too large (${Math.round(sizeInBytes/1024)}KB), reducing quality from ${quality} to ${quality - 0.1}`);
              return compressImage(quality - 0.1);
            }

            console.log(`Final image size: ${Math.round(sizeInBytes/1024)}KB at quality ${quality}`);
            return imageData;
          };

          const finalImageData = compressImage();

          resolve({
            imageData: finalImageData,
            dimensions: `${width}x${height}`,
            originalDimensions: `${img.width}x${img.height}`
          });
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };


  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles) => {
    const newErrors = [];
    const validFiles = [];

    // Validate files
    acceptedFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors.push(validation.error);
      }
    });

    if (newErrors.length > 0) {
      setError(newErrors.join(', '));
      return;
    }

    // Process and upload valid files
    if (validFiles.length > 0) {
      setUploadLoading(true);
      setSuccessMessage('');
      setError('');
      
      try {
        let successCount = 0;
        const uploadErrors = [];
        
        for (const file of validFiles) {
          try {
            setSuccessMessage(`Processing ${file.name}...`);
            
            // Process image
            const processedData = await processImage(file);
            
            // Upload via API hook
            const result = await apiUploadImage(
              processedData.imageData,
              file.name,
              {
                dimensions: processedData.dimensions,
                category: 'uncategorized'
              }
            );
            
            if (result.success) {
              successCount++;
            }
          } catch (error) {
            uploadErrors.push(`${file.name}: ${error.message}`);
          }
        }
        
        // Show results
        if (successCount > 0) {
          setSuccessMessage(`Successfully uploaded ${successCount} image(s)`);
          // Images will automatically appear via the useGalleryStorage hook
        }
        
        if (uploadErrors.length > 0) {
          setError(uploadErrors.join(', '));
        }
        
      } catch (error) {
        setError(`Upload failed: ${error.message}`);
      } finally {
        setUploadLoading(false);
        // Clear success message after delay
        if (!error) {
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      }
    }
  }, [apiUploadImage, error]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true,
    disabled: uploadLoading
  });

  // Drag & drop handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedImages.findIndex(img => img.id === active.id);
    const newIndex = sortedImages.findIndex(img => img.id === over.id);

    const newOrder = arrayMove(sortedImages, oldIndex, newIndex);
    setSortedImages(newOrder);

    // Save to Firestore
    try {
      const newOrderIds = newOrder.map(img => img.id);
      const response = await fetch('/.netlify/functions/gallery-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          updatedData: { newOrder: newOrderIds }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }

      setSuccessMessage('Gallery order updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save order:', error);
      setError('Failed to save new order');
      // Revert on error
      setSortedImages([...images]);
    }
  };

  if (loading || uploadLoading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>{uploadLoading ? 'Uploading images...' : 'Loading gallery data...'}</p>
      </div>
    );
  }

  return (
    <div className="admin-gallery">
      <div className="admin-gallery__header">
        <div className="admin-gallery__title-section">
          <h1 className="admin-gallery__title">Gallery Management</h1>
          <p className="admin-gallery__subtitle">Manage and edit your gallery images and metadata</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="admin-gallery__upload">
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone--active' : ''} ${uploadLoading ? 'dropzone--uploading' : ''}`}>
          <input {...getInputProps()} />
          <Upload className="dropzone__icon" />
          <h3 className="dropzone__title">Drop images here or click to browse</h3>
          <p className="dropzone__subtitle">Supports JPEG, PNG, WebP, and GIF up to 10MB</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-gallery__filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-filter"
          >
            <option value="all">All Categories ({images.length})</option>
            <option value="corporate">Corporate ({images.filter(img => img.category === 'corporate').length})</option>
            <option value="apparel">Apparel ({images.filter(img => img.category === 'apparel').length})</option>
            <option value="promotional">Promotional ({images.filter(img => img.category === 'promotional').length})</option>
            <option value="gifts">Gifts ({images.filter(img => img.category === 'gifts').length})</option>
          </select>
        </div>
        <div className="filter-group">
          <button
            className={`btn ${arrangeMode ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => setArrangeMode(!arrangeMode)}
          >
            {arrangeMode ? 'Done Arranging' : 'Arrange Order'}
          </button>
        </div>
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedImages.map(img => img.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="admin-gallery__grid">
            {sortedImages.filter(image => {
              const matchesCategory = filterCategory === 'all' || image.category === filterCategory;
              const matchesSearch = !searchTerm ||
                image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                image.description?.toLowerCase().includes(searchTerm.toLowerCase());
              return matchesCategory && matchesSearch;
            }).map((image) => (
              <SortableGalleryCard
                key={image.id}
                image={image}
                arrangeMode={arrangeMode}
                activeId={activeId}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div className="gallery-card gallery-card--drag-overlay">
              <div className="gallery-card__image">
                <img
                  src={sortedImages.find(img => img.id === activeId)?.src}
                  alt="Dragging"
                />
              </div>
              <div className="gallery-card__content">
                <h3 className="gallery-card__title">
                  {sortedImages.find(img => img.id === activeId)?.title}
                </h3>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit Modal */}
      {editingImage && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content modal-content--dark" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal__title">Edit Image Metadata</h3>
            
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={editingImage.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alt Text</label>
              <input
                type="text"
                className="form-input"
                value={editingImage.alt}
                onChange={(e) => handleFieldChange('alt', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={editingImage.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Materials</label>
              <input
                type="text"
                className="form-input"
                value={editingImage.materials}
                onChange={(e) => handleFieldChange('materials', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Technique</label>
              <input
                type="text"
                className="form-input"
                value={editingImage.technique}
                onChange={(e) => handleFieldChange('technique', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
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
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={editingImage.visible}
                  onChange={(e) => handleFieldChange('visible', e.target.checked)}
                />
                <span className="checkbox-text">Visible in Gallery</span>
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

      {/* Delete Confirmation Modal */}
      {deletingImage && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content modal-content--dark modal-content--small" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal__title">Confirm Delete</h3>
            
            <div className="delete-confirmation">
              <div className="delete-confirmation__image">
                <img 
                  src={deletingImage.src} 
                  alt={deletingImage.alt} 
                  style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', borderRadius: '4px' }}
                />
              </div>
              <div className="delete-confirmation__text">
                <p>Are you sure you want to delete this image?</p>
                <p><strong>"{deletingImage.title}"</strong></p>
                <p className="delete-warning">
                  {deletingImage.src && deletingImage.src.startsWith('data:image/') 
                    ? 'This uploaded image will be permanently removed.'
                    : 'This image will be hidden from the gallery.'
                  }
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete Image
              </button>
              <button className="btn btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGallery;