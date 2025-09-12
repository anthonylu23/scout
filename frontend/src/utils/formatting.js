// Format file size in bytes to human readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Create filename from description
export const createFilename = (description, extension = 'png') => {
  if (!description) return `generated-image.${extension}`;
  
  // Clean and compress the description
  const cleaned = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .substring(0, 50) // Limit length
    .replace(/-+$/, ''); // Remove trailing dashes
  
  return `${cleaned || 'generated-image'}.${extension}`;
};

// Format coordinates for display
export const formatCoordinates = (longitude, latitude) => {
  return `(${parseFloat(latitude).toFixed(6)}, ${parseFloat(longitude).toFixed(6)})`;
};

// Format timestamp to readable date
export const formatTimestamp = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};