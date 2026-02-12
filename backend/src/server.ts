import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import categoryRoutes from './routes/categories';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARE CONFIGURATION ---

// CORS (Cross-Origin Resource Sharing)
// Allows requests from the frontend development servers
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5175'],
    credentials: true, // Allow cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware to handle JSON payloads
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root, welcome endpoint
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Clarity API Server',
        version: '1.0.0',
        endpoints: { health: '/health', auth: '/api/auth' },
    });
});

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found', path: req.path });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        // Only show detailed error message in development mode
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
});
