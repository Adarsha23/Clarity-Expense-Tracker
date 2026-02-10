import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../types';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

/**
 * GET /api/categories
 * Fetch all categories (defaults + user created)
 */
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // Fetch categories where user_id is null (system defaults) or matches current user
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .or(`user_id.eq.${userId},user_id.is.null`)
            .order('name', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/categories
 * Create a new custom category
 */
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }

        const { data, error } = await supabase
            .from('categories')
            .insert([{ name, type, user_id: userId }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/categories/:id
 * Update a custom category
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { name, type } = req.body;

        const { data, error } = await supabase
            .from('categories')
            .update({ name, type })
            .eq('id', id)
            .eq('user_id', userId) // Security: only owner can update
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/categories/:id
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ message: 'Category deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
