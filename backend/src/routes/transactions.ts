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
 * Log all requests for debugging
 */
router.use((req: AuthRequest, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path} - User: ${req.user?.id}`);
    next();
});

/**
 * GET /api/transactions
 */
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
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
 */
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { type, amount, category, description, date } = req.body;

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
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

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
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { type, amount, category, description, date } = req.body;

        const { data, error } = await supabase
            .from('transactions')
            .update({ type, amount, category, description, date, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error: any) {
        console.error('PUT /api/transactions error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
