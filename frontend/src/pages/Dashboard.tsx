import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as ChartTooltip,
    LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { transactionService } from '../services/transactions';
import { categoryService, Category } from '../services/categories';
import { Transaction } from '../types';
import Button from '../components/common/Button';
import Sidebar from '../components/layout/Sidebar';
import '../styles/dashboard.css';

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Category Modal State
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [catName, setCatName] = useState('');
    const [catType, setCatType] = useState<'income' | 'expense'>('expense');

    const [formData, setFormData] = useState({
        type: 'expense' as 'income' | 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        fetchTransactions();
        fetchCategories();
    }, []);

    const changeMonth = (delta: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setViewDate(newDate);
    };

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
            if (data.length > 0 && !formData.category) {
                const firstExp = data.find(c => c.type === 'expense');
                if (firstExp) setFormData(prev => ({ ...prev, category: firstExp.name }));
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const openAddModal = (type: 'income' | 'expense') => {
        const firstCat = categories.find(c => c.type === type);
        setFormData({
            type,
            amount: '',
            category: firstCat ? firstCat.name : '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, amount: parseFloat(formData.amount) };
            if (editingId) {
                await transactionService.update(editingId, payload);
            } else {
                await transactionService.create(payload);
            }
            setIsFormOpen(false);
            setEditingId(null);
            fetchTransactions();
            toast.success(editingId ? 'Updated' : 'Transaction added! View in the Transactions page');
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setLoading(false);
        }
    };

    // --- Stats & Analytics Logic ---
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const DOUGHNUT_COLORS = ['#10b981', '#ef4444']; // Green, Red

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const balance = totalIncome - totalExpense;

    const getMonthStats = (date: Date) => {
        const m = date.getMonth();
        const y = date.getFullYear();
        const filtered = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === m && d.getFullYear() === y;
        });
        const inc = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        const exp = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
        return { income: inc, expense: exp, total: inc - exp };
    };

    const now = new Date();
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(now.getMonth() - 1);

    const currentMonthStats = getMonthStats(now);
    const lastMonthStats = getMonthStats(lastMonthDate);

    // FIX: Use viewDate instead of now to allow chart to update when user toggles month
    const pieData = transactions
        .filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
        })
        .reduce((acc: any[], t) => {
            const existing = acc.find(item => item.name === t.category);
            if (existing) existing.value += Number(t.amount);
            else acc.push({ name: t.category, value: Number(t.amount) });
            return acc;
        }, [])
        .sort((a, b) => b.value - a.value);

    const trendData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const { income, expense } = getMonthStats(d);
        return {
            name: d.toLocaleString('default', { month: 'short' }),
            savings: income - expense
        };
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const burnExpenses = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo).reduce((s, t) => s + Number(t.amount), 0);
    const monthlyBurn = (burnExpenses / 30) * 30;
    const runway = monthlyBurn > 0 ? (balance / monthlyBurn).toFixed(1) : '∞';

    const renderDonut = (income: number, expense: number) => {
        const data = [
            { name: 'Income', value: income || 1 }, // padding to avoid empty chart
            { name: 'Expense', value: expense || 0 }
        ];
        return (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        innerRadius={35}
                        outerRadius={45}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell fill={DOUGHNUT_COLORS[0]} />
                        <Cell fill={DOUGHNUT_COLORS[1]} />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        );
    };

    const filteredCats = categories.filter(c => c.type === formData.type);

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <div className="content-header">
                    <h1 className="welcome-text">Welcome back, <span className="accent-name">{user?.email?.split('@')[0]}</span></h1>
                </div>

                <div className="transactions-month-nav">
                    <button onClick={() => changeMonth(-1)} className="month-nav-btn">{"<"}</button>
                    <h2>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                    <button onClick={() => changeMonth(1)} className="month-nav-btn">{">"}</button>
                </div>

                <div className="summary-grid">
                    <div className="summary-card">
                        <h3>Summary</h3>
                        <div className="summary-content">
                            <div className="summary-row">
                                <span className="summary-label">Balance:</span>
                                <span className="summary-value text-success">Rs {balance.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Total Expense:</span>
                                <span className="summary-value text-error">-Rs {totalExpense.toLocaleString()}</span>
                            </div>
                            <div className="cat-divider"></div>
                            <div className="summary-row">
                                <span className="summary-label text-bold">Net Total:</span>
                                <span className="summary-value">Rs {balance.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <h3>This Month</h3>
                        <div className="summary-comparison-grid">
                            <div className="donut-preview">
                                {renderDonut(currentMonthStats.income, currentMonthStats.expense)}
                            </div>
                            <div className="stats-column">
                                <div className="stat-mini-row">
                                    <span className="text-success">↑ Rs {currentMonthStats.income.toLocaleString()}</span>
                                </div>
                                <div className="stat-mini-row">
                                    <span className="text-error">↓ Rs {currentMonthStats.expense.toLocaleString()}</span>
                                </div>
                                <div className="cat-divider"></div>
                                <div className="stat-mini-row text-bold">
                                    <span>Rs {currentMonthStats.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <h3>Last Month</h3>
                        <div className="summary-comparison-grid">
                            <div className="donut-preview">
                                {renderDonut(lastMonthStats.income, lastMonthStats.expense)}
                            </div>
                            <div className="stats-column">
                                <div className="stat-mini-row">
                                    <span className="text-success">↑ Rs {lastMonthStats.income.toLocaleString()}</span>
                                </div>
                                <div className="stat-mini-row">
                                    <span className="text-error">↓ Rs {lastMonthStats.expense.toLocaleString()}</span>
                                </div>
                                <div className="cat-divider"></div>
                                <div className="stat-mini-row text-bold">
                                    <span>Rs {lastMonthStats.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="analysis-grid">
                    <div className="analysis-card chart-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>{viewDate.toLocaleString('default', { month: 'long' })} Expenses</h3>
                            <div className="chart-month-nav" style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => changeMonth(-1)} className="icon-btn" style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem 0.5rem' }}>{"<"}</button>
                                <button onClick={() => changeMonth(1)} className="icon-btn" style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem 0.5rem' }}>{">"}</button>
                            </div>
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <ChartTooltip
                                        contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: number | undefined) => value !== undefined ? [`Rs ${value.toFixed(2)}`, 'Amount'] : []}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="analysis-card chart-card">
                        <h3>Savings Trend</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                    <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                                    <ChartTooltip
                                        contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: number | undefined) => value !== undefined ? [`Rs ${value.toFixed(2)}`, 'Savings'] : []}
                                    />
                                    <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="analysis-card projection-card">
                        <div className="projection-content">
                            <h3>Runway</h3>
                            <div className="runway-stat">
                                <span className="runway-value">{runway}</span>
                                <span className="runway-label">Months</span>
                            </div>
                            <p className="projection-desc">Liquid runway: If all income stopped today, your current balance would last this long based on your average monthly spending.</p>
                        </div>
                    </div>
                </div>

                <div className="fab-container">
                    <button className="fab-btn fab-income" onClick={() => openAddModal('income')}>+</button>
                    <button className="fab-btn fab-expense" onClick={() => openAddModal('expense')}>-</button>
                </div>
            </main>

            {isFormOpen && (
                <div className="modal-overlay" onClick={closeForm}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ textTransform: 'uppercase' }}>New {formData.type}</h3>
                            <button onClick={closeForm} className="btn-close">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="modal-form-grid">
                                <div className="field">
                                    <label>Category</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                                        <option value="" disabled>Select category</option>
                                        {filteredCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Value (Rs)</label>
                                    <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required placeholder="0.00" />
                                </div>
                                <div className="field">
                                    <label>Date</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                                <div className="field">
                                    <label>Notes (Optional)</label>
                                    <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="What was this for?" />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button type="button" onClick={() => { setIsCatModalOpen(true); }} className="btn-inline-cat">Add Custom Category</button>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={closeForm} className="btn-inline-cat" style={{ textDecoration: 'none', color: '#666', border: 'none', background: 'none' }}>CANCEL</button>
                                    <Button type="submit" variant="success" loading={loading}>SAVE</Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CATEGORY MANAGEMENT MODAL */}
            {isCatModalOpen && (
                <div className="modal-overlay" onClick={() => setIsCatModalOpen(false)}>
                    <div className="modal-card wide-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Manage Categories</h3>
                            <button onClick={() => setIsCatModalOpen(false)} className="btn-close">&times;</button>
                        </div>
                        <form className="category-manager-form" onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                if (editingCatId) await categoryService.update(editingCatId, catName, catType);
                                else await categoryService.create(catName, catType);
                                setCatName('');
                                setEditingCatId(null);
                                fetchCategories();
                                toast.success('Category saved');
                            } catch (error) { toast.error('Failed'); }
                        }}>
                            <div className="field">
                                <label>Category Name</label>
                                <input type="text" value={catName} onChange={e => setCatName(e.target.value)} required />
                            </div>
                            <div className="field">
                                <label>Type</label>
                                <select value={catType} onChange={e => setCatType(e.target.value as any)}>
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>
                            <Button type="submit" variant="success">{editingCatId ? 'Update' : 'Add'}</Button>
                        </form>
                        <div className="category-list">
                            <div className="cat-group">
                                {['income', 'expense'].map(type => (
                                    <div key={type} className="cat-section">
                                        <h4 className={type === 'income' ? 'income-header' : 'expense-header'}>{type} Categories</h4>
                                        <div className="cat-grid">
                                            {categories.filter(c => c.type === type).map(c => (
                                                <div key={c.id} className="cat-item">
                                                    <span>{c.name} {!c.user_id && <span className="badge-default">Default</span>}</span>
                                                    {c.user_id && (
                                                        <div className="cat-actions">
                                                            <button onClick={() => { setEditingCatId(c.id); setCatName(c.name); setCatType(c.type); }} className="cat-btn-edit">Edit</button>
                                                            <button onClick={async () => { if (window.confirm('Delete?')) { await categoryService.delete(c.id); fetchCategories(); } }} className="cat-btn-delete">×</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
