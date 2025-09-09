import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerStyles.css';
import { postPreviewRequest } from './api';
import html2canvas from 'html2canvas';

const CameraControls = ({ onControlsChange }) => {
  const [timeOfDay, setTimeOfDay] = useState(12); // 24-hour format
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [focalLength, setFocalLength] = useState(50);
  const [weather, setWeather] = useState('clear');
  const [isWeatherDropdownOpen, setIsWeatherDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef(null);

  const weatherOptions = [
    { value: 'clear', label: 'Clear' },
    { value: 'partly-cloudy', label: 'Partly Cloudy' },
    { value: 'overcast', label: 'Overcast' },
    { value: 'rainy', label: 'Rainy' },
    { value: 'stormy', label: 'Stormy' },
    { value: 'snowy', label: 'Snowy' },
    { value: 'foggy', label: 'Foggy' }
  ];

  const handleTimeChange = (newTime) => {
    setTimeOfDay(newTime);
    notifyChange('timeOfDay', newTime);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    notifyChange('date', {
      month: date.getMonth() + 1,
      day: date.getDate(),
      year: date.getFullYear(),
      dateString: date.toISOString().split('T')[0]
    });
  };

  const handleFocalLengthChange = (newFocalLength) => {
    setFocalLength(newFocalLength);
    notifyChange('focalLength', newFocalLength);
  };

  const handleWeatherChange = (newWeather) => {
    setWeather(newWeather);
    notifyChange('weather', newWeather);
  };

  const notifyChange = (controlName, value) => {
    if (onControlsChange) {
      onControlsChange({
        timeOfDay,
        date: {
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
          year: selectedDate.getFullYear(),
          dateString: selectedDate.toISOString().split('T')[0]
        },
        focalLength,
        weather,
        [controlName]: value
      });
    }
  };

  const formatTime = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsWeatherDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{
      padding: '16px 24px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #ddd'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '20px',
        alignItems: 'center'
      }}>
        {/* Date Control */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#333'
          }}>
            Date
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            minDate={new Date('2020-01-01')}
            maxDate={new Date('2030-12-31')}
            dateFormat="MMM d, yyyy"
            showPopperArrow={false}
            wrapperClassName="date-picker-wrapper"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '13px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Time of Day */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#333'
          }}>
            Time: {formatTime(timeOfDay)}
          </label>
          <input
            type="range"
            min="0"
            max="23"
            value={timeOfDay}
            onChange={(e) => handleTimeChange(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: `linear-gradient(to right, 
                #1a1a2e 0%, #16213e 20%, #0f3460 40%, 
                #e94560 60%, #f39c12 80%, #1a1a2e 100%)`,
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Weather Conditions */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#333'
          }}>
            Weather
          </label>
          <div
            onClick={() => setIsWeatherDropdownOpen(!isWeatherDropdownOpen)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '13px',
              backgroundColor: 'white',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}
          >
            <span>{weatherOptions.find(option => option.value === weather)?.label}</span>
            <span style={{ transform: isWeatherDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
          </div>
          {isWeatherDropdownOpen && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '0',
              right: '0',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              marginBottom: '2px'
            }}>
              {weatherOptions.map(option => (
                <div
                  key={option.value}
                  onClick={() => {
                    handleWeatherChange(option.value);
                    setIsWeatherDropdownOpen(false);
                  }}
                  style={{
                    padding: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    backgroundColor: weather === option.value ? '#e3f2fd' : 'transparent',
                    borderBottom: option.value === weatherOptions[weatherOptions.length - 1].value ? 'none' : '1px solid #eee'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = weather === option.value ? '#e3f2fd' : 'transparent'}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Focal Length */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#333'
          }}>
            Focal Length: {focalLength}mm
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="range"
              min="15"
              max="85"
              value={focalLength}
              onChange={(e) => handleFocalLengthChange(parseInt(e.target.value))}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: '#ddd',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <button
              onClick={async () => {
                try {
                  setIsSubmitting(true);
                  let screenshot = null;
                  try {
                    const container = document.getElementById('map-root');
                    const mapContainer = container ? container.querySelector('.mapboxgl-map') : null;
                    const mapCanvas = mapContainer ? mapContainer.querySelector('canvas') : null;

                    // Prefer cloning the whole map-root so annotations overlay are included.
                    if (container) {
                      let mapDataUrl = null;
                      try {
                        if (mapCanvas) {
                          mapDataUrl = mapCanvas.toDataURL('image/png');
                        }
                      } catch (_) {}

                      const canvas = await html2canvas(container, {
                        useCORS: true,
                        backgroundColor: '#ffffff',
                        scale: window.devicePixelRatio || 1,
                        onclone: (clonedDoc) => {
                          // Hide UI panels in cloned DOM
                          clonedDoc.querySelectorAll('[data-ui]').forEach((el) => {
                            el.style.display = 'none';
                          });
                          // Replace cloned map canvas with image to ensure serialization
                          try {
                            if (!mapDataUrl) return;
                            const clonedContainer = clonedDoc.getElementById('map-root');
                            const clonedMapCanvas = clonedContainer ? clonedContainer.querySelector('.mapboxgl-map canvas') : null;
                            if (!clonedMapCanvas) return;
                            const img = clonedDoc.createElement('img');
                            img.src = mapDataUrl;
                            img.style.width = clonedMapCanvas.style.width || `${clonedMapCanvas.width}px`;
                            img.style.height = clonedMapCanvas.style.height || `${clonedMapCanvas.height}px`;
                            img.style.position = clonedMapCanvas.style.position || 'absolute';
                            img.style.top = clonedMapCanvas.style.top || '0px';
                            img.style.left = clonedMapCanvas.style.left || '0px';
                            clonedMapCanvas.replaceWith(img);
                          } catch (_) {}
                        }
                      });
                      screenshot = canvas.toDataURL('image/png');
                    }
                  } catch (sErr) {
                    console.error('Screenshot capture failed:', sErr);
                  }

                  const payload = {
                    screenshot,
                    cameraSettings: {
                      date: selectedDate.toISOString().split('T')[0],
                      timeOfDay: String(timeOfDay),
                      focalLength: focalLength,
                      weather: weather
                    }
                  };
                  const response = await postPreviewRequest(payload);
                  console.log('Preview request sent:', response.data);
                  if (screenshot) {
                    try {
                      const a = document.createElement('a');
                      a.href = screenshot;
                      a.download = `scout-preview-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    } catch (dErr) {
                      console.warn('Screenshot download failed:', dErr);
                    }
                  }
                } catch (error) {
                  console.error('Failed to send preview request:', error);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: isSubmitting ? '#6c757d' : '#28a745',
                color: 'white',
                border: `1px solid ${isSubmitting ? '#6c757d' : '#28a745'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (isSubmitting) return;
                e.target.style.backgroundColor = '#218838';
                e.target.style.borderColor = '#218838';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                if (isSubmitting) return;
                e.target.style.backgroundColor = '#28a745';
                e.target.style.borderColor = '#28a745';
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Preview'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CameraControls;