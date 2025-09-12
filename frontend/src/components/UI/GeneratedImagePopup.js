import React from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';
import { createFilename } from '../../utils/formatting';

const GeneratedImagePopup = ({ isOpen, onClose, imageUrl, description, imageId }) => {
  if (!isOpen) return null;

  // Debug logging
  console.log('GeneratedImagePopup props:', { imageUrl, description, imageId });


  // Download image function
  const downloadImage = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = createFilename(description);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      borderRadius: '12px',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '500px',
        maxHeight: '400px',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header with download and close buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 8px 0 8px'
        }}>
          <button
            onClick={downloadImage}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#666',
              padding: '4px',
              lineHeight: '1'
            }}
            title="Download image"
          >
            <FaDownload />
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#666',
              padding: '4px',
              lineHeight: '1'
            }}
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Image */}
        <div style={{
          padding: '0 16px 16px 16px',
          textAlign: 'center'
        }}>
          {imageUrl ? (
            <img 
              src={imageUrl}
              alt="Generated result"
              style={{
                maxWidth: '100%',
                maxHeight: '250px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              onError={(e) => {
                console.error('Failed to load generated image:', imageUrl);
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div style={{
              width: '300px',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              color: '#666'
            }}>
              Loading image...
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <div style={{
            padding: '0 16px 16px',
            borderTop: '1px solid #f0f0f0',
            marginTop: '8px'
          }}>
            <p style={{
              color: '#555',
              lineHeight: '1.4',
              fontSize: '13px',
              margin: '12px 0 0 0'
            }}>
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedImagePopup;