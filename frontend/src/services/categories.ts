import { api } from './api';

// Category Interface representing a user's transaction category
export interface Category {
    id: string;
    user_id: string | null; // Null for default system categories
    name: string;
    type: 'income' | 'expense';
    created_at: string;
}

// Category Service
// Handles CRUD operations for transaction categories
export const categoryService = {
    // Fetches all categories (both default and user-specific)
    async getAll(): Promise<Category[]> {
        const response = await api.get('/api/categories');
        return response.data;
    },

    // Creates a new custom category
    async create(name: string, type: 'income' | 'expense'): Promise<Category> {
        const response = await api.post('/api/categories', { name, type });
        return response.data;
    },

    // Updates an existing category
    async update(id: string, name: string, type: 'income' | 'expense'): Promise<Category> {
        const response = await api.put(`/api/categories/${id}`, { name, type });
        return response.data;
    },

    // Deletes a custom category
    async delete(id: string): Promise<void> {
        await api.delete(`/api/categories/${id}`);
    }
};
