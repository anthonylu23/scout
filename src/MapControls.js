import React from 'react';

const MapControls = ({ onResetToolbar, onToggleToolbar, isToolbarVisible }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      display: 'flex',
      gap: '8px',
      zIndex: 1001
    }}>
      <button
        onClick={onResetToolbar}
        style={{
          padding: '8px 12px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        title="Reset annotation toolbar to center"
      >
        <span>🎯</span>
        Reset
      </button>
      
      <button
        onClick={onToggleToolbar}
        style={{
          padding: '8px 12px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        title={isToolbarVisible ? "Hide annotation toolbar" : "Show annotation toolbar"}
      >
        <span>{isToolbarVisible ? '👁️' : '👁️‍🗨️'}</span>
        {isToolbarVisible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
};

export default MapControls;