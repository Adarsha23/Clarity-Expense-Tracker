import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';
import '../../styles/dashboard.css'; // Reusing layout styles

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <h2>Clarity</h2>
                </div>
            </div>
            <nav className="sidebar-nav">
                <button
                    className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={() => navigate('/dashboard')}
                >
                    <span>Overview</span>
                </button>
                <button
                    className={`nav-item ${location.pathname === '/transactions' ? 'active' : ''}`}
                    onClick={() => navigate('/transactions')}
                >
                    <span>Transactions</span>
                </button>
                <button onClick={handleLogout} className="nav-item logout-nav">
                    <span>Logout</span>
                </button>
            </nav>
        </aside>
    );
}
