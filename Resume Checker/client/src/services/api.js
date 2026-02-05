import axios from 'axios';

/**
 * API Service
 * Axios instance configured for backend communication
 */

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle token expiration
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Optionally redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

/**
 * API Methods
 */

// Analysis endpoints
export const analyzeResume = async (formData) => {
    const response = await api.post('/analysis/analyze', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// History endpoints
export const getHistory = async () => {
    const response = await api.get('/history');
    return response.data;
};

export const getAnalysis = async (id) => {
    const response = await api.get(`/history/${id}`);
    return response.data;
};

export const deleteAnalysis = async (id) => {
    const response = await api.delete(`/history/${id}`);
    return response.data;
};

export default api;
