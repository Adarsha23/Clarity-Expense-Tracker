import { api } from './api';
import { Transaction } from '../types';

/**
 * Transaction Service
 * 
 * This service handles all HTTP requests related to transactions.
 * It uses the 'api' axios instance which automatically handles authentication.
 */
export const transactionService = {
    /**
     * Fetch all transactions for the current user
     * GET /api/transactions
     */
    async getAll(): Promise<Transaction[]> {
        const response = await api.get('/api/transactions');
        return response.data;
    },

    /**
     * Create a new transaction
     * POST /api/transactions
     * @param data Transaction data (excluding system fields like id, timestamp)
     */
    async create(data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
        const response = await api.post('/api/transactions', data);
        return response.data;
    },

    /**
     * Delete a transaction by ID
     * DELETE /api/transactions/:id
     */
    async delete(id: string): Promise<void> {
        await api.delete(`/api/transactions/${id}`);
    },

    /**
     * Update an existing transaction
     * PUT /api/transactions/:id
     */
    async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
        const response = await api.put(`/api/transactions/${id}`, data);
        return response.data;
    }
};
