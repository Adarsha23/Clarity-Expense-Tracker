/// <reference types="vite/client" />
import axios from 'axios';

// Base API URL configuration
// Uses environment variable in production, defaults to localhost in development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create a configured Axios instance
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
// Automatically attaches the JWT token to every outgoing request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor
// Global error handling for 401 Unauthorized responses
api.interceptors.response.use(
    (response) => response, // Return successful responses as is
    (error) => {
        // If 401 (Unauthorized), clear local storage and redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
