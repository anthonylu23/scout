import React, { useState } from 'react';

const AnnotationToolbar = ({ 
  selectedTool, 
  onToolChange, 
  onClearAll, 
  selectedColor, 
  onColorChange, 
  markerSize, 
  onMarkerSizeChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const tools = [
    { id: 'select', name: 'Select', icon: '🤚' },
    { id: 'pin', name: 'Pin', icon: '📍' },
    { id: 'pen', name: 'Pen', icon: '✏️' }
  ];

  const colors = [
    '#007bff', // Blue
    '#dc3545', // Red
    '#28a745', // Green
    '#ffc107', // Yellow
    '#6f42c1', // Purple
    '#fd7e14', // Orange
    '#20c997', // Teal
    '#333333'  // Black
  ];

  const getSizeLabel = (value) => {
    if (value <= 16) return 'Small';
    if (value <= 20) return 'Medium';
    return 'Large';
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        onWheel={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          cursor: 'pointer',
          fontSize: '20px',
          transition: 'all 0.2s',
          pointerEvents: 'auto'
        }}
        title="Open Annotation Tools"
      >
        🎨
      </button>
    );
  }

  return (
    <div 
      style={{
        position: 'absolute',
        top: '80px',
        right: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '140px',
        border: '1px solid #e0e0e0',
        pointerEvents: 'auto'
      }}
      onWheel={(e) => e.stopPropagation()}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#333'
        }}>
          Annotations
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#666',
            padding: '0',
            lineHeight: '1'
          }}
          title="Collapse Toolbar"
        >
          ✕
        </button>
      </div>

      {/* Tools */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginBottom: '12px'
      }}>
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: selectedTool === tool.id ? '#007bff' : 'transparent',
              color: selectedTool === tool.id ? 'white' : '#333',
              border: '1px solid',
              borderColor: selectedTool === tool.id ? '#007bff' : '#e0e0e0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            <span>{tool.icon}</span>
            <span>{tool.name}</span>
          </button>
        ))}
      </div>

      {/* Color Selector */}
      <div style={{
        marginBottom: '12px',
        borderTop: '1px solid #e0e0e0',
        paddingTop: '12px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '6px'
        }}>
          Color
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px'
        }}>
          {colors.map(color => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: color,
                border: selectedColor === color ? '3px solid #333' : '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Size Selector */}
      <div style={{
        marginBottom: '12px',
        borderTop: '1px solid #e0e0e0',
        paddingTop: '12px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '6px'
        }}>
          Size: {getSizeLabel(markerSize)} ({markerSize}px)
        </div>
        <input
          type="range"
          min="12"
          max="32"
          value={markerSize}
          onChange={(e) => onMarkerSizeChange(parseInt(e.target.value))}
          style={{
            width: '100%',
            height: '4px',
            borderRadius: '2px',
            background: '#ddd',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#666',
          marginTop: '4px'
        }}>
          <span>12px</span>
          <span>32px</span>
        </div>
      </div>

      {/* Clear All */}
      <div style={{
        borderTop: '1px solid #e0e0e0',
        paddingTop: '12px'
      }}>
        <button
          onClick={onClearAll}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500'
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default AnnotationToolbar;