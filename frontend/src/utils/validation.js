// Validate file type for image uploads
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (!file.type || !file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  return { valid: true };
};

// Validate camera settings
export const validateCameraSettings = (settings) => {
  const errors = {};
  
  if (!settings.date) {
    errors.date = 'Date is required';
  }
  
  if (!settings.timeOfDay) {
    errors.timeOfDay = 'Time of day is required';
  }
  
  if (settings.focalLength === null || settings.focalLength === undefined) {
    errors.focalLength = 'Focal length is required';
  } else if (settings.focalLength < 10 || settings.focalLength > 500) {
    errors.focalLength = 'Focal length must be between 10 and 500mm';
  }
  
  if (!settings.weather) {
    errors.weather = 'Weather is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate coordinates
export const validateCoordinates = (longitude, latitude) => {
  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  return { valid: true };
};