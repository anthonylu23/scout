import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const API_URL = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
API_URL.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
API_URL.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            console.error('Network error - API server may be down:', error.message);
        } else if (error.response) {
            console.error(`API Error ${error.response.status}:`, error.response.data);
        }
        return Promise.reject(error);
    }
);

export default API_URL;

export const postPreviewRequest = async (payload) => {
    return API_URL.post('/preview-requests/', payload);
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
    return API_URL.get('/files/');
};

export const deleteUploadedFile = async (fileId) => {
    return API_URL.delete(`/files/${fileId}`);
};

// Generated images API
export const getGeneratedImages = async () => {
    return API_URL.get('/generated-images/');
};

export const getGeneratedImageDetails = async (generatedImageId) => {
    return API_URL.get(`/generated-images/${generatedImageId}/details`);
};

export const getGeneratedImageUrl = (generatedImageId) => {
    return `${API_BASE_URL}/generated-images/${generatedImageId}`;
};

// Preview requests API
export const getPreviewRequests = async () => {
    return API_URL.get('/preview-requests/');
};