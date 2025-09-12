import React, { memo } from 'react';
import { FaSearch } from 'react-icons/fa';
import { formatCoordinates } from '../../utils/formatting';

const MapControls = memo(({ 
  searchQuery, 
  setSearchQuery, 
  onSearch, 
  isSearching, 
  mouseCoords 
}) => {
  return (
    <div 
      data-ui="search"
      style={{
        position: 'absolute',
        top: '80px',
        left: '20px',
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '300px',
        pointerEvents: 'auto'
      }}
      onWheel={(e) => e.stopPropagation()}
    >
      <form onSubmit={onSearch} style={{ 
        display: 'flex', 
        gap: '8px', 
        alignItems: 'center', 
        marginBottom: mouseCoords ? '8px' : '0' 
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search location..."
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            fontSize: '13px',
            outline: 'none',
            minWidth: '0'
          }}
          disabled={isSearching}
        />
        <button
          type="submit"
          disabled={isSearching || !searchQuery.trim()}
          style={{
            padding: '8px 12px',
            backgroundColor: isSearching ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isSearching ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}
        >
          {isSearching ? '...' : <FaSearch />}
        </button>
      </form>
      {mouseCoords && (
        <div style={{
          fontSize: '13px',
          fontFamily: 'monospace',
          color: '#333',
          lineHeight: '1.2',
          borderTop: '1px solid #e0e0e0',
          paddingTop: '8px'
        }}>
          {formatCoordinates(mouseCoords.longitude, mouseCoords.latitude)}
        </div>
      )}
    </div>
  );
});

MapControls.displayName = 'MapControls';

export default MapControls;