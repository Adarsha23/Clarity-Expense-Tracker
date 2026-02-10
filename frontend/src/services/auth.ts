import { api } from './api';

export interface AuthResponse {
    user: {
        id: string;
        email: string;
    };
    session: {
        access_token: string;
    };
}

export const authService = {
    signup: async (email: string, password: string): Promise<AuthResponse> => {
        const { data } = await api.post('/api/auth/signup', { email, password });
        return data;
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const { data } = await api.post('/api/auth/login', { email, password });
        return data;
    },

    logout: async (): Promise<void> => {
        await api.post('/api/auth/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};
