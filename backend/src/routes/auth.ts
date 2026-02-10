import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Signup endpoint
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }

    res.status(201).json(data);
});

// Login endpoint
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        res.status(401).json({ error: error.message });
        return;
    }

    res.status(200).json(data);
});

// Logout endpoint
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing authorization header' });
        return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
        res.status(500).json({ error: error.message });
        return;
    }

    res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
