import { api } from './api';
import { Transaction } from '../types';

/**
 * Transaction Service
 * 
 * This service handles all HTTP requests related to transactions.
 * It uses the 'api' axios instance we created earlier, which
 * automatically handles our tokens!
 */
export const transactionService = {
    /**
     * Fetch all transactions for the user
     */
    async getAll(): Promise<Transaction[]> {
        const response = await api.get('/api/transactions');
        return response.data;
    },

    /**
     * Create a new transaction
     */
    async create(data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
        const response = await api.post('/api/transactions', data);
        return response.data;
    },

    /**
     * Delete a transaction by ID
     */
    async delete(id: string): Promise<void> {
        await api.delete(`/api/transactions/${id}`);
    },

    /**
     * Update an existing transaction
     */
    async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
        const response = await api.put(`/api/transactions/${id}`, data);
        return response.data;
    }
};
