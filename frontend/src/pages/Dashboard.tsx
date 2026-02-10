import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { transactionService } from '../services/transactions';
import { Transaction } from '../types';
import Button from '../components/common/Button';
import '../styles/dashboard.css';

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        type: 'expense' as 'income' | 'expense',
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await transactionService.getAll();
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    };

    const handleEditClick = (transaction: Transaction) => {
        setEditingId(transaction.id);
        setFormData({
            type: transaction.type,
            amount: transaction.amount.toString(),
            category: transaction.category,
            description: transaction.description || '',
            date: transaction.date
        });
    };

    const closeEdit = () => {
        setEditingId(null);
        setFormData({
            type: 'expense',
            amount: '',
            category: 'Food',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount)
            };

            if (editingId) {
                await transactionService.update(editingId, payload);
                setEditingId(null);
            } else {
                await transactionService.create(payload);
            }

            setFormData({ ...formData, amount: '', description: '' });
            fetchTransactions();
        } catch (error) {
            alert(editingId ? 'Failed to update' : 'Failed to add');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        try {
            await transactionService.delete(id);
            fetchTransactions();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income - expenses;

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <h2>Clarity</h2>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <a href="#" className="nav-item active"><span>Overview</span></a>
                    <a href="#" className="nav-item"><span>History</span></a>
                    <a href="#" className="nav-item"><span>Insights</span></a>
                    <button onClick={() => authService.logout().then(() => navigate('/login'))} className="nav-item">
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            <main className="main-content">
                <div className="content-header">
                    <h1>Welcome back, <span className="accent-name">{user?.email?.split('@')[0]}</span></h1>
                </div>

                <div className="dashboard-grid">
                    <div className="stat-card income-border">
                        <h3>Total Income</h3>
                        <p className="stat-value text-success">Rs {income.toFixed(2)}</p>
                    </div>
                    <div className="stat-card expense-border">
                        <h3>Total Expenses</h3>
                        <p className="stat-value text-error">Rs {expenses.toFixed(2)}</p>
                    </div>
                    <div className="stat-card balance-border">
                        <h3>Balance</h3>
                        <p className="stat-value">Rs {balance.toFixed(2)}</p>
                    </div>
                </div>

                {!editingId && (
                    <section className="form-section">
                        <h3>Add New Transaction</h3>
                        <form onSubmit={handleSubmit} className="transaction-form">
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Amount"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Category"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                            <Button type="submit" loading={loading}>Add</Button>
                        </form>
                    </section>
                )}

                <section className="list-section">
                    <h3>Recent Transactions</h3>
                    <div className="transaction-list">
                        {transactions.length === 0 ? (
                            <p className="empty-state">No transactions yet. Add your first one above!</p>
                        ) : (
                            transactions.map(t => (
                                <div key={t.id} className="transaction-item">
                                    <div className="t-info">
                                        <span className="t-category">{t.category}</span>
                                        <span className="t-desc">{t.description}</span>
                                        <span className="t-date">{t.date}</span>
                                    </div>
                                    <div className="t-amount-actions">
                                        <span className={t.type === 'income' ? 'text-success' : 'text-error'}>
                                            {t.type === 'income' ? '+' : '-'}Rs {Number(t.amount).toFixed(2)}
                                        </span>
                                        <div className="action-buttons">
                                            <Button variant="secondary" size="sm" onClick={() => handleEditClick(t)}>Edit</Button>
                                            <button onClick={() => handleDelete(t.id)} className="btn-delete">×</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {editingId && (
                <div className="modal-overlay" onClick={closeEdit}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Transaction</h3>
                            <button onClick={closeEdit} className="btn-close">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="modal-form-grid">
                                <div className="field">
                                    <label>Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Amount (Rs)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="field full">
                                    <label>Description (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <Button type="button" variant="secondary" onClick={closeEdit}>Cancel</Button>
                                <Button type="submit" loading={loading}>Save Changes</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
