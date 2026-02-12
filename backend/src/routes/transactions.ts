import { Router, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../types';
import { authenticateUser } from '../middleware/auth';

const router = Router();

/**
 * All transaction routes require authentication.
 */
router.use(authenticateUser);

/**
 * Middleware: Log all requests for debugging purposes
 */
router.use((req: AuthRequest, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path} - User: ${req.user?.id}`);
    next();
});

/**
 * GET /api/transactions
 * Fetch all transactions belonging to the authenticated user
 */
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId) // Filter by user_id to ensure privacy
            .order('date', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        console.error('GET /api/transactions error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/transactions
 * Create a new transaction
 */
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { type, amount, category, description, date } = req.body;

        // Validation
        if (!type || !amount || !category || !date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert([{ user_id: userId, type, amount, category, description, date }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error: any) {
        console.error('POST /api/transactions error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/transactions/:id
 * Delete a specific transaction
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Delete only if transaction belongs to the user
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error: any) {
        console.error('DELETE /api/transactions error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/transactions/:id
 * Update an existing transaction
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { type, amount, category, description, date } = req.body;

        // Update fields and refresh updated_at timestamp
        const { data, error } = await supabase
            .from('transactions')
            .update({ type, amount, category, description, date, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId) // Security: ensure ownership
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error: any) {
        console.error('PUT /api/transactions error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
