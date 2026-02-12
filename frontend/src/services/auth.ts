import { api } from './api';

// Interface defining the structure of the authentication response
export interface AuthResponse {
    user: {
        id: string;
        email: string;
    };
    session: {
        access_token: string;
    };
}

// Authentication Service
// Handles all auth-related API calls (signup, login, logout)
export const authService = {
    // Registers a new user
    signup: async (email: string, password: string): Promise<AuthResponse> => {
        const { data } = await api.post('/api/auth/signup', { email, password });
        return data; // Returns user and session data
    },

    // Logs in an existing user
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const { data } = await api.post('/api/auth/login', { email, password });
        return data; // Returns user and session data
    },

    // Logs out the current user and clears local storage
    logout: async (): Promise<void> => {
        await api.post('/api/auth/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};
