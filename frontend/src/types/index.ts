export interface User {
    id: string;
    email: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description?: string;
    date: string;
    created_at: string;
    updated_at: string;
}

export interface DashboardStats {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    categoryBreakdown: {
        category: string;
        amount: number;
    }[];
}
