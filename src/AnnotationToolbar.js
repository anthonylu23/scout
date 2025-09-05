import React, { useState } from 'react';

const AnnotationToolbar = ({ onAnnotationChange, annotations, onClearAnnotations, mapWidth = 800, mapHeight = 500, resetPosition = null, isVisible = true }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [selectedSize, setSelectedSize] = useState(3);
  const [position, setPosition] = useState({ x: Math.max(0, mapWidth - 280), y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [toolbarDimensions, setToolbarDimensions] = useState({ width: 280, height: 400 });
  const toolbarRef = React.useRef(null);

  const tools = [
    { id: 'marker', name: 'Marker', icon: '📍' },
    { id: 'pen', name: 'Draw', icon: '✏️' },
    { id: 'text', name: 'Text', icon: '💬' },
    { id: 'circle', name: 'Circle', icon: '⭕' },
    { id: 'rectangle', name: 'Rectangle', icon: '⬛' }
  ];

  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000'];

  const handleToolSelect = (toolId) => {
    setSelectedTool(selectedTool === toolId ? null : toolId);
    onAnnotationChange({ type: 'tool-select', tool: toolId });
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    onAnnotationChange({ type: 'color-change', color });
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    onAnnotationChange({ type: 'size-change', size });
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.toolbar-header')) {
      const mapContainer = document.querySelector('.map-container');
      const mapRect = mapContainer ? mapContainer.getBoundingClientRect() : { left: 0, top: 0 };
      
      setIsDragging(true);
      setDragStart({
        x: e.clientX - mapRect.left - position.x,
        y: e.clientY - mapRect.top - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      // Get the map container's position
      const mapContainer = document.querySelector('.map-container');
      const mapRect = mapContainer ? mapContainer.getBoundingClientRect() : { left: 0, top: 0 };
      
      const newX = e.clientX - mapRect.left - dragStart.x;
      const newY = e.clientY - mapRect.top - dragStart.y;
      
      setPosition({
        x: newX,
        y: newY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, mapWidth, mapHeight, toolbarDimensions]);

  // Update toolbar dimensions when the component mounts or changes
  React.useEffect(() => {
    const updateDimensions = () => {
      if (toolbarRef.current) {
        const rect = toolbarRef.current.getBoundingClientRect();
        setToolbarDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    // Update dimensions after render
    setTimeout(updateDimensions, 0);
  }, [selectedTool, annotations.length]);

  // Handle reset position from parent
  React.useEffect(() => {
    if (resetPosition) {
      setPosition(resetPosition);
    }
  }, [resetPosition]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      ref={toolbarRef}
      className="annotation-toolbar"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '280px',
        border: '1px solid #ddd',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="toolbar-header"
        style={{ 
          marginBottom: '15px',
          cursor: 'grab',
          userSelect: 'none'
        }}
      >
        <h3 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '16px', 
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '12px', opacity: 0.6 }}>⋮⋮</span>
          Annotation Tools
        </h3>
      </div>

      {/* Tool Selection */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '8px' 
        }}>
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              style={{
                padding: '8px 4px',
                border: selectedTool === tool.id ? '2px solid #007bff' : '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: selectedTool === tool.id ? '#f0f8ff' : 'white',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '16px' }}>{tool.icon}</span>
              <span>{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>
          Color:
        </label>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {colors.map(color => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              style={{
                width: '25px',
                height: '25px',
                backgroundColor: color,
                border: selectedColor === color ? '3px solid #000' : '1px solid #ccc',
                borderRadius: '50%',
                cursor: 'pointer',
                padding: '0'
              }}
            />
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>
          Size: {selectedSize}px
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={selectedSize}
          onChange={(e) => handleSizeChange(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => {
            setSelectedTool(null);
            onAnnotationChange({ type: 'exit' });
          }}
          style={{
            flex: 1,
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Exit Annotate
        </button>
        <button
          onClick={() => {
            onClearAnnotations();
            setSelectedTool(null);
          }}
          style={{
            flex: 1,
            padding: '8px',
            border: '1px solid #dc3545',
            borderRadius: '4px',
            backgroundColor: '#dc3545',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Clear All
        </button>
      </div>

      {/* Current Tool Status */}
      {selectedTool && (
        <div style={{
          marginTop: '10px',
          padding: '8px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666'
        }}>
          Active: {tools.find(t => t.id === selectedTool)?.name} 
          <span style={{ color: selectedColor, marginLeft: '8px' }}>●</span>
        </div>
      )}

      {/* Annotations Count */}
      <div style={{
        marginTop: '8px',
        fontSize: '11px',
        color: '#999',
        textAlign: 'center'
      }}>
        Annotations: {annotations.length}
      </div>
    </div>
  );
};

export default AnnotationToolbar;