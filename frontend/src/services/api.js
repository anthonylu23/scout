import axios from 'axios';

const API_URL = axios.create({
    baseURL: 'http://localhost:8000',
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
    
    return API_URL.post('/upload-screenshot', formData, {
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
    return API_URL.get('/uploaded-files');
};

export const deleteUploadedFile = async (fileId) => {
    return API_URL.delete(`/uploaded-files/${fileId}`);
};