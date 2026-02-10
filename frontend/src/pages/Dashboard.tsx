import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as ChartTooltip,
    LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
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

    // Filtering State
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

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

    // Filter Logic
    const filteredTransactions = transactions.filter(t => {
        const matchesCategory = !filterCategory || t.category === filterCategory;
        const matchesStartDate = !filterStartDate || new Date(t.date) >= new Date(filterStartDate);
        const matchesEndDate = !filterEndDate || new Date(t.date) <= new Date(filterEndDate);
        return matchesCategory && matchesStartDate && matchesEndDate;
    });

    const clearFilters = () => {
        setFilterCategory('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    // Filter categories based on current transaction type
    const filteredCats = categories.filter(c => c.type === formData.type);

    // --- Analytics Data ---
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    // Category Pie Data (Expenses only)
    const categoryData = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc: any[], t) => {
            const existing = acc.find(item => item.name === t.category);
            if (existing) {
                existing.value += Number(t.amount);
            } else {
                acc.push({ name: t.category, value: Number(t.amount) });
            }
            return acc;
        }, [])
        .sort((a, b) => b.value - a.value);

    // Savings Trend (Last 6 Months)
    const trendData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const month = d.getMonth();
        const year = d.getFullYear();

        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === month && tDate.getFullYear() === year;
        });

        const mIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        const mExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

        return {
            name: d.toLocaleString('default', { month: 'short' }),
            savings: mIncome - mExpense
        };
    });

    // --- Smart Projection (Trailing 30-Day Burn Rate) ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30DaysExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // Find how many days of data we actually have in the last 30 days to avoid distortion
    const relevantDates = transactions
        .filter(t => new Date(t.date) >= thirtyDaysAgo)
        .map(t => new Date(t.date).getTime());

    const oldestDateInRange = relevantDates.length > 0 ? Math.min(...relevantDates) : thirtyDaysAgo.getTime();
    const daysDiff = Math.max(1, (new Date().getTime() - oldestDateInRange) / (1000 * 60 * 60 * 24));

    const dailyBurnRate = last30DaysExpenses / daysDiff;
    const monthlyBurnRate = dailyBurnRate * 30;

    const runway = monthlyBurnRate > 0 ? (balance / monthlyBurnRate).toFixed(1) : '∞';

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

                <section className="analysis-section">
                    <div className="analysis-grid">
                        <div className="analysis-card chart-card">
                            <h3>Expense Distribution</h3>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip
                                            contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="analysis-card chart-card">
                            <h3>Savings Trend (6M)</h3>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                        <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                                        <ChartTooltip
                                            contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="savings"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#10b981' }}
                                            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="analysis-card projection-card">
                            <div className="projection-content">
                                <h3>Zero-Income Runway</h3>
                                <div className="runway-stat">
                                    <span className="runway-value">{runway}</span>
                                    <span className="runway-label">Months Remaining</span>
                                </div>
                                <p className="projection-desc">
                                    Based on your trailing 30-day burn rate, your current balance can cover expenses for {runway} months if all income stopped today.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

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
                    <div className="list-header">
                        <h3>Recent Transactions</h3>
                        <div className="filter-bar">
                            <select
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <div className="date-filters">
                                <span>FROM</span>
                                <input
                                    type="date"
                                    value={filterStartDate}
                                    onChange={e => setFilterStartDate(e.target.value)}
                                    placeholder="Start Date"
                                />
                                <span>TO</span>
                                <input
                                    type="date"
                                    value={filterEndDate}
                                    onChange={e => setFilterEndDate(e.target.value)}
                                    placeholder="End Date"
                                />
                            </div>
                            {(filterCategory || filterStartDate || filterEndDate) && (
                                <button onClick={clearFilters} className="btn-clear-filters">Clear</button>
                            )}
                        </div>
                    </div>
                    <div className="transaction-list">
                        {filteredTransactions.length === 0 ? (
                            <p className="empty-state">
                                {transactions.length === 0
                                    ? "No transactions yet. Add your first one above!"
                                    : "No transactions match your filters."}
                            </p>
                        ) : (
                            filteredTransactions.map(t => (
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
