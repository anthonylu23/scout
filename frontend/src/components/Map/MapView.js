import React, { useState, useCallback, useRef, useEffect } from 'react';
import Map from 'react-map-gl';
import CameraControls from '../Camera/CameraControls';
import AnnotationToolbar from './AnnotationToolbar';

const MapView = () => {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 0.5
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [cameraSettings, setCameraSettings] = useState(null);
  const [mouseCoords, setMouseCoords] = useState(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedColor, setSelectedColor] = useState('#007bff');
  const [markerSize, setMarkerSize] = useState(20);
  const [annotations, setAnnotations] = useState(() => {
    const saved = localStorage.getItem('scout-annotations');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const mapRef = useRef();

  const searchLocation = useCallback(async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        const placeName = data.features[0].place_name;
        
        setViewState({
          longitude,
          latitude,
          zoom: 12
        });
        setSearchResult({
          longitude,
          latitude,
          placeName
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    searchLocation(searchQuery);
  }, [searchQuery, searchLocation]);

  const handleCameraControlsChange = useCallback((settings) => {
    setCameraSettings(settings);
    console.log('Camera Controls:', settings);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseCoords(null);
  }, []);

  const handleMapClick = useCallback((event) => {
    if (selectedTool === 'select') return;
    
    const { lng, lat } = event.lngLat;

    if (selectedTool === 'pin') {
      const newAnnotation = {
        id: Date.now().toString(),
        type: 'pin',
        longitude: lng,
        latitude: lat,
        color: selectedColor,
        size: markerSize
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  }, [selectedTool, selectedColor, markerSize]);

  const handleMouseDown = useCallback((event) => {
    if (selectedTool === 'pen') {
      setIsDrawing(true);
      const { lng, lat } = event.lngLat;
      setCurrentPath([{ lng, lat }]);
    }
  }, [selectedTool]);

  const handleMouseMove = useCallback((event) => {
    if (event.lngLat) {
      setMouseCoords({
        longitude: event.lngLat.lng.toFixed(6),
        latitude: event.lngLat.lat.toFixed(6)
      });
    }

    if (isDrawing && selectedTool === 'pen') {
      const { lng, lat } = event.lngLat;
      setCurrentPath(prev => [...prev, { lng, lat }]);
    }
  }, [isDrawing, selectedTool]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && selectedTool === 'pen' && currentPath.length > 1) {
      const newAnnotation = {
        id: Date.now().toString(),
        type: 'path',
        path: currentPath,
        color: selectedColor,
        size: Math.max(2, markerSize / 4) // Convert size to stroke width
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, selectedTool, currentPath, selectedColor, markerSize]);

  const handleToolChange = useCallback((tool) => {
    setSelectedTool(tool);
    setIsDrawing(false);
    setCurrentPath([]);
  }, []);

  const handleColorChange = useCallback((color) => {
    setSelectedColor(color);
  }, []);

  const handleMarkerSizeChange = useCallback((size) => {
    setMarkerSize(size);
  }, []);

  const handleClearAnnotations = useCallback(() => {
    setAnnotations([]);
    setIsDrawing(false);
    setCurrentPath([]);
  }, []);

  // Convert lat/lng to screen coordinates
  const getScreenPosition = useCallback((longitude, latitude) => {
    if (!mapRef.current) return null;
    
    const map = mapRef.current.getMap();
    if (!map) return null;
    
    const point = map.project([longitude, latitude]);
    return { x: point.x, y: point.y };
  }, []);

  // Handle annotation removal
  const handleRemoveAnnotation = useCallback((id) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
  }, []);

  // Force re-render of overlays when map moves
  const [, forceUpdate] = useState({});
  const updateOverlays = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      if (map) {
        map.on('move', updateOverlays);
        map.on('zoom', updateOverlays);
        map.on('resize', updateOverlays);

        return () => {
          map.off('move', updateOverlays);
          map.off('zoom', updateOverlays);
          map.off('resize', updateOverlays);
        };
      }
    }
  }, [updateOverlays]);

  // Save annotations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('scout-annotations', JSON.stringify(annotations));
  }, [annotations]);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewState({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            zoom: 12
          });
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          // Keep default max zoom out view if geolocation fails
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      );
    }
  }, []);

  return (
    <div id="map-root" style={{ width: '100%', height: '100vh', position: 'relative' }}>
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
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: mouseCoords ? '8px' : '0' }}>
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
            {isSearching ? '...' : '🔍'}
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
            ({mouseCoords.latitude}, {mouseCoords.longitude})
          </div>
        )}
      </div>

      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleMapClick}
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        preserveDrawingBuffer={true}
        dragRotate={false}
        pitchWithRotate={false}
        touchRotate={false}
        touchPitch={false}
        keyboard={false}
        cursor={selectedTool === 'select' ? 'grab' : 'pointer'}
        dragPan={selectedTool === 'select'}
        minZoom={0.5}
        maxZoom={20}
      >
      </Map>

      {/* Pin Annotations */}
      {annotations.filter(ann => ann.type === 'pin').map(annotation => {
        const screenPos = getScreenPosition(annotation.longitude, annotation.latitude);
        if (!screenPos) return null;

        return (
          <div
            key={annotation.id}
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
              onClick={() => handleRemoveAnnotation(annotation.id)}
              title="Click to remove"
            />
          </div>
        );
      })}

      {/* Path Annotations (Pen Tool) */}
      {annotations.filter(ann => ann.type === 'path').map(annotation => {
        const pathPoints = annotation.path.map(point => getScreenPosition(point.lng, point.lat)).filter(Boolean);
        if (pathPoints.length < 2) return null;

        const pathData = pathPoints.reduce((path, point, index) => {
          return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
        }, '');

        return (
          <svg
            key={annotation.id}
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
              onClick={() => handleRemoveAnnotation(annotation.id)}
            />
          </svg>
        );
      })}

      {/* Current Drawing Path Preview */}
      {isDrawing && currentPath.length > 1 && (() => {
        const pathPoints = currentPath.map(point => getScreenPosition(point.lng, point.lat)).filter(Boolean);
        if (pathPoints.length < 2) return null;

        const pathData = pathPoints.reduce((path, point, index) => {
          return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
        }, '');

        return (
          <svg
            key="current-path"
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
              stroke={selectedColor}
              strokeWidth={Math.max(2, markerSize / 4)}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />
          </svg>
        );
      })()}

      {/* Search Result Marker */}
      {searchResult && (() => {
        const screenPos = getScreenPosition(searchResult.longitude, searchResult.latitude);
        if (!screenPos) return null;

        return (
          <div
            key="search-result"
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
      })()}

      <div data-ui="camera-controls" style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        maxWidth: '800px',
        width: '90%'
      }}>
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid #e0e0e0',
            pointerEvents: 'auto'
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          <CameraControls onControlsChange={handleCameraControlsChange} />
        </div>
      </div>

      <AnnotationToolbar 
        selectedTool={selectedTool}
        onToolChange={handleToolChange}
        onClearAll={handleClearAnnotations}
        selectedColor={selectedColor}
        onColorChange={handleColorChange}
        markerSize={markerSize}
        onMarkerSizeChange={handleMarkerSizeChange}
      />


    </div>
  );
};

export default MapView;