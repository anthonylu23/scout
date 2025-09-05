import React, { useState } from 'react';

const GoogleMap = () => {
  const [searchLocation, setSearchLocation] = useState('New York, NY');
  const [zoom, setZoom] = useState(13);

  const handleLocationSearch = (e) => {
    setSearchLocation(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setSearchLocation(e.target.value);
    }
  };

  const handleZoomChange = (e) => {
    setZoom(parseInt(e.target.value));
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        Map Scout
      </h1>
      
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Search Location: </label>
          <input
            type="text"
            value={searchLocation}
            onChange={handleLocationSearch}
            onKeyDown={handleSearchSubmit}
            placeholder="Enter a location (e.g., Paris, France)"
            style={{ 
              padding: '8px 12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              fontSize: '14px',
              width: '300px'
            }}
          />
        </div>
        
        <div>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Zoom Level: </label>
          <input 
            type="range" 
            min="10" 
            max="18" 
            value={zoom} 
            onChange={handleZoomChange}
            style={{ marginRight: '10px' }}
          />
          <span style={{ fontSize: '14px', color: '#666' }}>{zoom}</span>
        </div>
      </div>

      <div style={{ 
        width: '100%', 
        height: '500px', 
        border: '2px solid #ddd', 
        borderRadius: '8px', 
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/search?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(searchLocation)}&zoom=${zoom}`}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Interactive Google Map"
        />
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
        Currently showing: <strong>{searchLocation}</strong> at zoom level <strong>{zoom}</strong>
      </div>
    </div>
  );
};

export default GoogleMap;