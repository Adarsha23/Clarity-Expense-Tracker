import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/Transactions';
import './styles/global.css';

// Protected route wrapper component
// Checks for a valid token in localStorage before allowing access to child components
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('token');
    // Redirect to login if unauthenticated
    return token ? <>{children}</> : <Navigate to="/login" replace />;
}

// Main Application Component
// Sets up routing, global toast notifications, and layout
function App() {
    return (
        // Router configuration with future flags enabled for smoother transitions
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes (require authentication) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/transactions"
                    element={
                        <ProtectedRoute>
                            <TransactionsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Default Redirect to Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            {/* Global Toast Notification Configuration */}
            <Toaster position="top-right" toastOptions={{
                duration: 3000,
                style: {
                    background: '#0a0a0a',
                    color: '#fff',
                    border: '1px solid #1a1a1a'
                }
            }} />
        </BrowserRouter>
    );
}

export default App;
