import React, { memo } from 'react';

const PinAnnotation = memo(({ annotation, screenPos, onRemove }) => {
  if (!screenPos) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 999,
        pointerEvents: 'auto'
      }}
      data-annotation="pin"
    >
      <div
        style={{
          width: `${annotation.size}px`,
          height: `${annotation.size}px`,
          borderRadius: '50%',
          backgroundColor: annotation.color,
          border: '3px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          cursor: 'pointer'
        }}
        onClick={() => onRemove(annotation.id)}
        title="Click to remove"
      />
    </div>
  );
});

const PathAnnotation = memo(({ annotation, pathPoints, onRemove }) => {
  if (pathPoints.length < 2) return null;

  const pathData = pathPoints.reduce((path, point, index) => {
    return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
  }, '');

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 998
      }}
      data-annotation="path"
    >
      <path
        d={pathData}
        stroke={annotation.color}
        strokeWidth={annotation.size}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
        onClick={() => onRemove(annotation.id)}
      />
    </svg>
  );
});

const CurrentPathPreview = memo(({ pathPoints, color, size }) => {
  if (pathPoints.length < 2) return null;

  const pathData = pathPoints.reduce((path, point, index) => {
    return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
  }, '');

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999
      }}
      data-annotation="path-preview"
    >
      <path
        d={pathData}
        stroke={color}
        strokeWidth={Math.max(2, size / 4)}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
});

const SearchMarker = memo(({ screenPos }) => {
  if (!screenPos) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 999,
        pointerEvents: 'auto'
      }}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          border: '4px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}
      />
    </div>
  );
});

PinAnnotation.displayName = 'PinAnnotation';
PathAnnotation.displayName = 'PathAnnotation';
CurrentPathPreview.displayName = 'CurrentPathPreview';
SearchMarker.displayName = 'SearchMarker';

export { PinAnnotation, PathAnnotation, CurrentPathPreview, SearchMarker };