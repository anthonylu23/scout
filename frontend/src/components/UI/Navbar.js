import React from 'react';

const Navbar = () => {
  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: 1001,
        pointerEvents: 'auto'
      }}
      onWheel={(e) => e.stopPropagation()}
    >
      <div style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#333'
      }}>
        scout
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
      </div>
    </div>
  );
};

export default Navbar;