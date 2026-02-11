import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { transactionService } from '../services/transactions';
import { categoryService, Category } from '../services/categories';
import { Transaction } from '../types';
import Sidebar from '../components/layout/Sidebar';
import '../styles/dashboard.css';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Month Selection
    const [viewDate, setViewDate] = useState(new Date());

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'expense' as 'income' | 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
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
        } catch (error) {
            console.error('Failed to fetch categories:', error);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, amount: parseFloat(formData.amount) };
            await transactionService.create(payload);
            setIsFormOpen(false);
            fetchTransactions();
            toast.success('Transaction added! View in the Transactions page');
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setViewDate(newDate);
    };

    // Filter Logic
    const filteredTransactions = transactions
        .filter(t => {
            const tDate = new Date(t.date);
            // Fix: Ensure we are comparing correctly regardless of time zones
            const isSameMonth = tDate.getMonth() === viewDate.getMonth() && tDate.getFullYear() === viewDate.getFullYear();

            const matchesCategory = !filterCategory || t.category === filterCategory;

            // Fix: Parse filter dates correctly
            let matchesStartDate = true;
            if (filterStartDate) {
                const startDate = new Date(filterStartDate);
                matchesStartDate = tDate >= startDate;
            }

            let matchesEndDate = true;
            if (filterEndDate) {
                const endDate = new Date(filterEndDate);
                matchesEndDate = tDate <= endDate;
            }

            // Priorities: 
            // 1. If Date Range (From/To) is set, use that AND ignore month view
            // 2. If no Date Range, use Month View
            const hasDateRange = filterStartDate || filterEndDate;

            if (hasDateRange) {
                return matchesCategory && matchesStartDate && matchesEndDate;
            } else {
                return isSameMonth && matchesCategory;
            }
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first

    const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Calculate totals based on the filtered view
    const statsTotalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const statsTotalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const monthTotal = statsTotalIncome - statsTotalExpense;

    const filteredCats = categories.filter(c => c.type === formData.type);

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="main-content">
                <div className="content-header">
                    <h1 className="bold-header">Transaction <span className="accent-name">History</span></h1>
                </div>

                {/* Only show Month Nav if NO date range filter is active */}
                {(!filterStartDate && !filterEndDate) && (
                    <div className="transactions-month-nav">
                        <button onClick={() => changeMonth(-1)} className="month-nav-btn" title="Previous Month">{"<"}</button>
                        <h2>{monthName}</h2>
                        <button onClick={() => changeMonth(1)} className="month-nav-btn" title="Next Month">{">"}</button>
                    </div>
                )}

                <div className="transactions-summary-bar">
                    <div className="tx-stats">
                        <span className="tx-count"><strong>{filteredTransactions.length}</strong> Transactions</span>
                        <div className="tx-pills">
                            <span className="pill pill-income">↑ Rs {statsTotalIncome.toLocaleString()}</span>
                            <span className="pill pill-expense">↓ Rs {statsTotalExpense.toLocaleString()}</span>
                        </div>
                    </div>
                    <span className={`tx-total ${monthTotal >= 0 ? 'text-success' : 'text-error'}`}>
                        {monthTotal >= 0 ? 'Savings' : 'Deficit'}: <strong>Rs {Math.abs(monthTotal).toLocaleString()}</strong>
                    </span>
                </div>

                <section className="list-section no-margin">
                    <div className="list-header">
                        <div className="filter-bar full-width-bar">
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
                                <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
                                <span>TO</span>
                                <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
                            </div>
                            {(filterCategory || filterStartDate || filterEndDate) && (
                                <button onClick={() => { setFilterCategory(''); setFilterStartDate(''); setFilterEndDate(''); }} className="btn-clear-filters">Clear All Filters</button>
                            )}
                        </div>
                    </div>

                    <div className="transaction-list transactions-page-list">
                        {filteredTransactions.length === 0 ? (
                            <div className="empty-state-card">
                                <p>No transactions found for this period.</p>
                            </div>
                        ) : (
                            filteredTransactions.map(t => (
                                <div key={t.id} className="transaction-item compact">
                                    <div className="t-info">
                                        <div className="t-icon-placeholder">
                                            {t.category.charAt(0)}
                                        </div>
                                        <div className="t-desc-wrapper">
                                            <span className="t-desc">{t.description || t.category}</span>
                                            <span className="t-category-label">{t.category}</span>
                                        </div>
                                    </div>
                                    <div className="t-amount-actions">
                                        <div className="t-amount-wrapper">
                                            <span className="t-date-small">{t.date}</span>
                                            <span className={`t-amount ${t.type === 'income' ? 'text-success' : 'text-error'}`}>
                                                {t.type === 'income' ? '+' : '-'}Rs {Number(t.amount).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="action-buttons">
                                            <button onClick={() => handleDelete(t.id)} className="btn-delete">×</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <div className="fab-container">
                    <button className="fab-btn fab-income" onClick={() => openAddModal('income')}>+</button>
                    <button className="fab-btn fab-expense" onClick={() => openAddModal('expense')}>-</button>
                </div>
            </main>

            {isFormOpen && (
                <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ textTransform: 'uppercase' }}>New {formData.type}</h3>
                            <button onClick={() => setIsFormOpen(false)} className="btn-close">&times;</button>
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
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setIsFormOpen(false)} className="btn-inline-cat" style={{ textDecoration: 'none', color: '#666', border: 'none', background: 'none' }}>CANCEL</button>
                                    <button type="submit" className="btn btn-success" disabled={loading}>
                                        {loading ? 'SAVING...' : 'SAVE'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
