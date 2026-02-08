import axios from 'axios';

/**
 * API Service
 * Axios instance configured for backend communication
 */

// Environment-based API URL configuration
const API_URL = import.meta.env.VITE_API_URL;

// Validate API URL - warn in development, error in production
if (!API_URL) {
    const message = 'VITE_API_URL is not defined. Please set it in your .env file.';
    if (import.meta.env.PROD) {
        console.error(`❌ ${message}`);
        throw new Error(message);
    } else {
        console.warn(`⚠️ ${message} Using fallback: http://localhost:5000/api`);
    }
}

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL || 'http://localhost:5000/api',
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
