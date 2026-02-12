import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// --- AUTHENTICATION ROUTES ---

// Signup endpoint
// Registers a new user with Supabase Auth
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    // Call Supabase API to sign up
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }

    res.status(201).json(data);
});

// Login endpoint
// Authenticates user and returns a session token
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    // Call Supabase API to sign in
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        res.status(401).json({ error: error.message });
        return;
    }

    res.status(200).json(data);
});

// Logout endpoint
// Signs out the user (invalidates the session on Supabase side)
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;

    // Ensure request is authenticated before logging out
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
