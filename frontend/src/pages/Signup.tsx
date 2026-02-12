import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import Button from '../components/common/Button';
import '../styles/auth.css';

// Signup Page Component
// Handles new user registration
const Signup: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Navigation hook
    const navigate = useNavigate();

    // --- FORM SUBMISSION HANDLER ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic Validation: Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Basic Validation: Check password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // Attempt to create a new account
            const data = await authService.signup(email, password);

            // Check if email confirmation is required (Supabase specific)
            if (!data.session) {
                setError('success:Sign up successful! Please check your email to verify your account.');
                return;
            }

            // If auto-logged in, store tokens and redirect
            localStorage.setItem('token', data.session.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');
        } catch (err: any) {
            // Display error message
            setError(err.response?.data?.error || err.message || 'Sign up failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Clarity</h1>
                    <span className="subtitle">Join us</span>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Conditional rendering for Success (Green) vs Error (Red) messages */}
                    {error && (
                        <div className={error.startsWith('success:') ? 'success-message' : 'error-message'}>
                            {error.replace('success:', '')}
                        </div>
                    )}

                    <Button type="submit" fullWidth loading={loading}>
                        Create Account
                    </Button>
                </form>

                <div className="auth-footer">
                    <span>Already have an account? </span>
                    <Link to="/login">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
