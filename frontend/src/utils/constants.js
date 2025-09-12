// API Configuration
export const API_BASE_URL = 'http://localhost:8000';

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 0.5,
  USER_LOCATION_ZOOM: 12,
  SEARCH_RESULT_ZOOM: 12,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 20
};

// Annotation Configuration
export const ANNOTATION_CONFIG = {
  DEFAULT_COLOR: '#007bff',
  DEFAULT_SIZE: 20,
  COLORS: [
    '#007bff', // Blue
    '#dc3545', // Red
    '#28a745', // Green
    '#ffc107', // Yellow
    '#6f42c1', // Purple
    '#fd7e14', // Orange
    '#20c997', // Teal
    '#333333'  // Black
  ],
  SIZE_RANGE: {
    MIN: 12,
    MAX: 32
  }
};

// Camera Settings
export const CAMERA_SETTINGS = {
  DEFAULT_VALUES: {
    date: '2024-12-15',
    timeOfDay: '12',
    focalLength: 50,
    weather: 'clear'
  },
  WEATHER_OPTIONS: [
    'clear',
    'cloudy',
    'rainy',
    'snowy',
    'foggy'
  ],
  TIME_OPTIONS: [
    'dawn',
    'morning',
    'noon',
    'afternoon',
    'evening',
    'night'
  ]
};