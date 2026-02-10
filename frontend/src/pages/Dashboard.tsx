import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import '../styles/dashboard.css';

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <h2>Clarity</h2>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <a href="#" className="nav-item active">
                        <span>Home</span>
                    </a>
                    <a href="#" className="nav-item">
                        <span>Expenses</span>
                    </a>
                    <a href="#" className="nav-item">
                        <span>Trips</span>
                    </a>
                    <a href="#" className="nav-item">
                        <span>Approvals</span>
                    </a>
                    <a href="#" className="nav-item">
                        <span>Settings</span>
                    </a>
                    <button onClick={handleLogout} className="nav-item">
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            <main className="main-content">
                <div className="content-header">
                    <h1>Welcome to Clarity</h1>
                    <p className="user-email">{user?.email}</p>
                </div>

                <div className="dashboard-grid">
                    <div className="stat-card">
                        <div className="stat-header">
                            <h3>Total Income</h3>
                        </div>
                        <p className="stat-value">$0.00</p>
                        <p className="stat-change positive">+0% from last month</p>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <h3>Total Expenses</h3>
                        </div>
                        <p className="stat-value">$0.00</p>
                        <p className="stat-change negative">+0% from last month</p>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <h3>Balance</h3>
                        </div>
                        <p className="stat-value">$0.00</p>
                        <p className="stat-change neutral">No change</p>
                    </div>
                </div>

                <div className="welcome-message">
                    <h2>Your expense tracker is ready!</h2>
                    <p>Start by adding your first transaction. We'll build the full dashboard in Phase 2.</p>
                </div>
            </main>
        </div>
    );
}
