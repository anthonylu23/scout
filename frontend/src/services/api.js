import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_URL = axios.create({
    baseURL: API_BASE_URL,
});

export default API_URL;

export const postPreviewRequest = async (payload) => {
    return API_URL.post('/preview-requests', payload);
};

export const uploadScreenshot = async (file, cameraSettings = null) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add camera settings if provided
    if (cameraSettings) {
        formData.append('date', cameraSettings.date);
        formData.append('timeOfDay', cameraSettings.timeOfDay);
        formData.append('focalLength', cameraSettings.focalLength.toString());
        formData.append('weather', cameraSettings.weather);
    }
    
    return API_URL.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const generatePreview = async (fileId, cameraSettings, coordinates = null) => {
    return API_URL.post('/generate-preview', {
        file_id: fileId,
        cameraSettings: cameraSettings,
        coordinates: coordinates
    });
};

export const getUploadedFiles = async () => {
    return API_URL.get('/files');
};

export const deleteUploadedFile = async (fileId) => {
    return API_URL.delete(`/files/${fileId}`);
};

// Generated images API
export const getGeneratedImages = async () => {
    return API_URL.get('/generated-images');
};

export const getGeneratedImageDetails = async (generatedImageId) => {
    return API_URL.get(`/generated-images/${generatedImageId}/details`);
};

export const getGeneratedImageUrl = (generatedImageId) => {
    return `${API_BASE_URL}/generated-images/${generatedImageId}`;
};

// Preview requests API
export const getPreviewRequests = async () => {
    return API_URL.get('/preview-requests');
};