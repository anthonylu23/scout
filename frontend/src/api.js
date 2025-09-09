import axios from 'axios';

const API_URL = axios.create({
    baseURL: 'http://localhost:8000',
});

export default API_URL;

export const postPreviewRequest = async (payload) => {
    return API_URL.post('/preview-requests', payload);
};