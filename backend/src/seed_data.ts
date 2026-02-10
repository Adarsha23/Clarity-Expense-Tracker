import { supabase } from './config/supabase';

const USER_ID = '4338b738-124d-4a02-aead-a14eef42a487';

const categories = {
    income: ['Salary', 'Freelance', 'Investment'],
    expense: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Rent', 'Utilities', 'Fitness', 'Groceries']
};

async function seed() {
    const transactions = [];
    const today = new Date();

    for (let i = 0; i < 4; i++) {
        const monthDate = new Date();
        monthDate.setMonth(today.getMonth() - i);

        // Income
        transactions.push({
            user_id: USER_ID,
            type: 'income',
            amount: 80000 + Math.floor(Math.random() * 5000),
            category: 'Salary',
            description: 'Monthly Salary',
            date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split('T')[0]
        });

        if (Math.random() > 0.3) {
            transactions.push({
                user_id: USER_ID,
                type: 'income',
                amount: 15000 + Math.floor(Math.random() * 10000),
                category: 'Freelance',
                description: 'Project Payment',
                date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15).toISOString().split('T')[0]
            });
        }

        // Major Expenses
        transactions.push({
            user_id: USER_ID,
            type: 'expense',
            amount: 25000,
            category: 'Rent',
            description: 'Monthly Rent',
            date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5).toISOString().split('T')[0]
        });

        transactions.push({
            user_id: USER_ID,
            type: 'expense',
            amount: 4000 + Math.floor(Math.random() * 2000),
            category: 'Utilities',
            description: 'Electricity & Water',
            date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 10).toISOString().split('T')[0]
        });

        // Recurring smaller expenses
        for (let j = 0; j < 5; j++) {
            const day = Math.floor(Math.random() * 28) + 1;
            transactions.push({
                user_id: USER_ID,
                type: 'expense',
                amount: 500 + Math.floor(Math.random() * 2000),
                category: 'Food',
                description: 'Dinner/Lunch',
                date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day).toISOString().split('T')[0]
            });
        }

        for (let j = 0; j < 3; j++) {
            const day = Math.floor(Math.random() * 28) + 1;
            transactions.push({
                user_id: USER_ID,
                type: 'expense',
                amount: 1000 + Math.floor(Math.random() * 3000),
                category: 'Groceries',
                description: 'Weekly Groceries',
                date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day).toISOString().split('T')[0]
            });
        }

        // Random one-offs
        for (let k = 0; k < 2; k++) {
            const randomCat = categories.expense[Math.floor(Math.random() * categories.expense.length)];
            transactions.push({
                user_id: USER_ID,
                type: 'expense',
                amount: 2000 + Math.floor(Math.random() * 5000),
                category: randomCat,
                description: 'Miscellaneous',
                date: new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
            });
        }
    }

    console.log(`Seeding ${transactions.length} transactions...`);

    const { error } = await supabase.from('transactions').insert(transactions);

    if (error) {
        console.error('Error seeding data:', error.message);
    } else {
        console.log('Successfully seeded dummy data!');
    }
}

seed();
