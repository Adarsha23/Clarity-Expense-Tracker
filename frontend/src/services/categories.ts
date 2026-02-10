import { api } from './api';

export interface Category {
    id: string;
    user_id: string | null;
    name: string;
    type: 'income' | 'expense';
    created_at: string;
}

export const categoryService = {
    async getAll(): Promise<Category[]> {
        const response = await api.get('/api/categories');
        return response.data;
    },

    async create(name: string, type: 'income' | 'expense'): Promise<Category> {
        const response = await api.post('/api/categories', { name, type });
        return response.data;
    },

    async update(id: string, name: string, type: 'income' | 'expense'): Promise<Category> {
        const response = await api.put(`/api/categories/${id}`, { name, type });
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/api/categories/${id}`);
    }
};
