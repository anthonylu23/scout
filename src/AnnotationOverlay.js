import React, { useState, useRef, useEffect } from 'react';

const AnnotationOverlay = ({ 
  width, 
  height, 
  selectedTool, 
  selectedColor, 
  selectedSize, 
  annotations, 
  onAnnotationsChange 
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState([]);

  useEffect(() => {
    redrawCanvas();
  }, [annotations, width, height]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach(annotation => {
      drawAnnotation(ctx, annotation);
    });
  };

  const drawAnnotation = (ctx, annotation) => {
    ctx.strokeStyle = annotation.color;
    ctx.fillStyle = annotation.color;
    ctx.lineWidth = annotation.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (annotation.type) {
      case 'pen':
        if (annotation.path && annotation.path.length > 1) {
          ctx.beginPath();
          ctx.moveTo(annotation.path[0].x, annotation.path[0].y);
          annotation.path.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;

      case 'marker':
        ctx.beginPath();
        ctx.arc(annotation.x, annotation.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        // Add marker text
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📍', annotation.x, annotation.y + 4);
        break;

      case 'circle':
        ctx.beginPath();
        const radius = Math.sqrt(
          Math.pow(annotation.endX - annotation.x, 2) + 
          Math.pow(annotation.endY - annotation.y, 2)
        );
        ctx.arc(annotation.x, annotation.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case 'rectangle':
        const width = annotation.endX - annotation.x;
        const height = annotation.endY - annotation.y;
        ctx.strokeRect(annotation.x, annotation.y, width, height);
        break;

      case 'text':
        ctx.fillStyle = annotation.color;
        ctx.font = `${annotation.size * 4}px Arial`;
        ctx.fillText(annotation.text || 'Text', annotation.x, annotation.y);
        break;
    }
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    if (!selectedTool) return;

    const pos = getMousePos(e);
    setStartPos(pos);
    setIsDrawing(true);

    if (selectedTool === 'pen') {
      setCurrentPath([pos]);
    } else if (selectedTool === 'marker') {
      // Add marker immediately
      const newAnnotation = {
        id: Date.now(),
        type: 'marker',
        x: pos.x,
        y: pos.y,
        color: selectedColor,
        size: selectedSize
      };
      onAnnotationsChange([...annotations, newAnnotation]);
      setIsDrawing(false);
    } else if (selectedTool === 'text') {
      // Add text annotation
      const text = prompt('Enter text:');
      if (text) {
        const newAnnotation = {
          id: Date.now(),
          type: 'text',
          x: pos.x,
          y: pos.y,
          text: text,
          color: selectedColor,
          size: selectedSize
        };
        onAnnotationsChange([...annotations, newAnnotation]);
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !selectedTool) return;

    const pos = getMousePos(e);

    if (selectedTool === 'pen') {
      const newPath = [...currentPath, pos];
      setCurrentPath(newPath);
      
      // Draw current path in real-time
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      redrawCanvas();
      
      // Draw current path
      if (newPath.length > 1) {
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = selectedSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(newPath[0].x, newPath[0].y);
        newPath.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
    } else if (selectedTool === 'circle' || selectedTool === 'rectangle') {
      // Preview shape
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      redrawCanvas();
      
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = selectedSize;
      
      if (selectedTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(pos.x - startPos.x, 2) + 
          Math.pow(pos.y - startPos.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (selectedTool === 'rectangle') {
        const width = pos.x - startPos.x;
        const height = pos.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      }
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !selectedTool) return;

    const pos = getMousePos(e);

    if (selectedTool === 'pen' && currentPath.length > 1) {
      const newAnnotation = {
        id: Date.now(),
        type: 'pen',
        path: currentPath,
        color: selectedColor,
        size: selectedSize
      };
      onAnnotationsChange([...annotations, newAnnotation]);
    } else if (selectedTool === 'circle') {
      const newAnnotation = {
        id: Date.now(),
        type: 'circle',
        x: startPos.x,
        y: startPos.y,
        endX: pos.x,
        endY: pos.y,
        color: selectedColor,
        size: selectedSize
      };
      onAnnotationsChange([...annotations, newAnnotation]);
    } else if (selectedTool === 'rectangle') {
      const newAnnotation = {
        id: Date.now(),
        type: 'rectangle',
        x: startPos.x,
        y: startPos.y,
        endX: pos.x,
        endY: pos.y,
        color: selectedColor,
        size: selectedSize
      };
      onAnnotationsChange([...annotations, newAnnotation]);
    }

    setIsDrawing(false);
    setCurrentPath([]);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: selectedTool ? 'crosshair' : 'default',
        pointerEvents: selectedTool ? 'auto' : 'none',
        zIndex: 10
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDrawing(false);
        setCurrentPath([]);
      }}
    />
  );
};

export default AnnotationOverlay;