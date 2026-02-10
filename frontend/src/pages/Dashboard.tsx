import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { transactionService } from '../services/transactions';
import { categoryService, Category } from '../services/categories';
import { Transaction } from '../types';
import Button from '../components/common/Button';
import '../styles/dashboard.css';

export default function Dashboard() {
    // Basic State
    const [user, setUser] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Category Modal State
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [catName, setCatName] = useState('');
    const [catType, setCatType] = useState<'income' | 'expense'>('expense');

    // Transaction Form State
    const [formData, setFormData] = useState({
        type: 'expense' as 'income' | 'expense',
        amount: '',
        category: '',
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
        fetchCategories();
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await transactionService.getAll();
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
            // Set default category if not set
            if (data.length > 0 && !formData.category) {
                const firstExp = data.find(c => c.type === 'expense');
                if (firstExp) setFormData(prev => ({ ...prev, category: firstExp.name }));
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    // --- Transaction Handlers ---
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
        resetForm();
    };

    const resetForm = () => {
        const firstExp = categories.find(c => c.type === 'expense');
        setFormData({
            type: 'expense',
            amount: '',
            category: firstExp ? firstExp.name : '',
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

            resetForm();
            fetchTransactions();
            toast.success(editingId ? 'Transaction updated' : 'Transaction added');
        } catch (error) {
            toast.error(editingId ? 'Failed to update' : 'Failed to add');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        try {
            await transactionService.delete(id);
            fetchTransactions();
            toast.success('Transaction deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    // --- Category Handlers ---
    const openCatModal = () => {
        setIsCatModalOpen(true);
    };

    const closeCatModal = () => {
        setIsCatModalOpen(false);
        setEditingCatId(null);
        setCatName('');
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCatId) {
                await categoryService.update(editingCatId, catName, catType);
            } else {
                await categoryService.create(catName, catType);
            }
            setCatName('');
            setEditingCatId(null);
            fetchCategories();
            toast.success(editingCatId ? 'Category updated' : 'Category added');
        } catch (error) {
            toast.error('Failed to save category');
        }
    };

    const handleEditCat = (cat: Category) => {
        setEditingCatId(cat.id);
        setCatName(cat.name);
        setCatType(cat.type);
    };

    const handleDeleteCat = async (id: string) => {
        if (!window.confirm('Delete this category? Transactions using it will be affected.')) return;
        try {
            await categoryService.delete(id);
            fetchCategories();
            toast.success('Category deleted');
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    // --- Stats ---
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income - expenses;

    // Filter categories based on current transaction type
    const filteredCats = categories.filter(c => c.type === formData.type);

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <h2>Clarity</h2>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <button className="nav-item active"><span>Overview</span></button>
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
                        <p className="stat-value text-success">Rs {income.toLocaleString()}</p>
                    </div>
                    <div className="stat-card expense-border">
                        <h3>Total Expenses</h3>
                        <p className="stat-value text-error">Rs {expenses.toLocaleString()}</p>
                    </div>
                    <div className="stat-card balance-border">
                        <h3>Balance</h3>
                        <p className="stat-value">Rs {balance.toLocaleString()}</p>
                    </div>
                </div>

                {!editingId && (
                    <section className="form-section">
                        <h3>Add New Transaction</h3>
                        <form onSubmit={handleSubmit} className="transaction-form">
                            <select
                                value={formData.type}
                                onChange={e => {
                                    const newType = e.target.value as any;
                                    const firstCat = categories.find(c => c.type === newType);
                                    setFormData({ ...formData, type: newType, category: firstCat ? firstCat.name : '' });
                                }}
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
                            <div className="category-select-wrapper">
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select Category</option>
                                    {filteredCats.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
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
                            <Button type="submit" variant="success" loading={loading}>Add</Button>
                        </form>
                        <p className="category-cta">
                            Don't have a category you're looking for?
                            <button type="button" onClick={openCatModal} className="btn-inline-cat">Add Custom</button>
                        </p>
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
                                        <div className="t-desc-wrapper">
                                            <span className="t-desc">{t.description}</span>
                                            <span className="t-date">{t.date}</span>
                                        </div>
                                    </div>
                                    <div className="t-amount-actions">
                                        <span className={`t-amount ${t.type === 'income' ? 'text-success' : 'text-error'}`}>
                                            {t.type === 'income' ? '+' : '-'}Rs {Number(t.amount).toLocaleString()}
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

            {/* EDIT TRANSACTION MODAL */}
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
                                        onChange={e => {
                                            const newType = e.target.value as any;
                                            const firstCat = categories.find(c => c.type === newType);
                                            setFormData({ ...formData, type: newType, category: firstCat ? firstCat.name : '' });
                                        }}
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
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        {filteredCats.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
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
                                <Button type="button" variant="danger" onClick={closeEdit}>Cancel</Button>
                                <Button type="submit" variant="success" loading={loading}>Save Changes</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CATEGORY MANAGEMENT MODAL */}
            {isCatModalOpen && (
                <div className="modal-overlay" onClick={closeCatModal}>
                    <div className="modal-card wide-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Manage Categories</h3>
                            <button onClick={closeCatModal} className="btn-close">&times;</button>
                        </div>

                        <form className="category-manager-form" onSubmit={handleSaveCategory}>
                            <div className="field">
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    value={catName}
                                    onChange={e => setCatName(e.target.value)}
                                    placeholder="Category Name"
                                    required
                                />
                            </div>
                            <div className="field">
                                <label>Type</label>
                                <select
                                    value={catType}
                                    onChange={e => setCatType(e.target.value as 'income' | 'expense')}
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>
                            <Button type="submit" variant="success">{editingCatId ? 'Update' : 'Add'}</Button>
                            {editingCatId && <Button variant="secondary" type="button" onClick={() => { setEditingCatId(null); setCatName(''); }}>Cancel</Button>}
                        </form>

                        <div className="category-list">
                            <div className="cat-group">
                                <div className="cat-section">
                                    <h4 className="income-header">Income Categories</h4>
                                    <div className="cat-grid">
                                        {categories.filter(c => c.type === 'income').map(c => (
                                            <div key={c.id} className="cat-item">
                                                <div className="cat-label">
                                                    <span className="cat-name">{c.name}</span>
                                                    {!c.user_id && <span className="badge-default">Default</span>}
                                                </div>
                                                {c.user_id && (
                                                    <div className="cat-actions">
                                                        <button onClick={() => handleEditCat(c)} className="cat-btn-edit">Edit</button>
                                                        <button onClick={() => handleDeleteCat(c.id)} className="cat-btn-delete">×</button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="cat-divider"></div>

                                <div className="cat-section">
                                    <h4 className="expense-header">Expense Categories</h4>
                                    <div className="cat-grid">
                                        {categories.filter(c => c.type === 'expense').map(c => (
                                            <div key={c.id} className="cat-item">
                                                <div className="cat-label">
                                                    <span className="cat-name">{c.name}</span>
                                                    {!c.user_id && <span className="badge-default">Default</span>}
                                                </div>
                                                {c.user_id && (
                                                    <div className="cat-actions">
                                                        <button onClick={() => handleEditCat(c)} className="cat-btn-edit">Edit</button>
                                                        <button onClick={() => handleDeleteCat(c.id)} className="cat-btn-delete">×</button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
