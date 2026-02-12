import { supabase } from './config/supabase';

const USER_ID = '4338b738-124d-4a02-aead-a14eef42a487';

const categories = {
    income: ['Salary', 'Freelance', 'Investment'],
    expense: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Rent', 'Utilities', 'Fitness', 'Groceries']
};

// Main function to populate the database with dummy data
async function seed() {
    const transactions = [];
    const today = new Date();

    // Loop through the last 4 months to generate data per month
    for (let i = 0; i < 4; i++) {
        const monthDate = new Date();
        monthDate.setMonth(today.getMonth() - i);

        // --- INCOME GENERATION ---

        // Add a fixed monthly salary entry
        transactions.push({
            user_id: USER_ID,
            type: 'income',
            amount: 80000 + Math.floor(Math.random() * 5000), // Random variance
            category: 'Salary',
            description: 'Monthly Salary',
            date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split('T')[0]
        });

        // 30% chance to add freelance income
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

        // --- EXPENSE GENERATION ---

        // Add fixed rent expense
        transactions.push({
            user_id: USER_ID,
            type: 'expense',
            amount: 25000,
            category: 'Rent',
            description: 'Monthly Rent',
            date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 5).toISOString().split('T')[0] // 5th of the month
        });

        // Add utility bills
        transactions.push({
            user_id: USER_ID,
            type: 'expense',
            amount: 4000 + Math.floor(Math.random() * 2000),
            category: 'Utilities',
            description: 'Electricity & Water',
            date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 10).toISOString().split('T')[0]
        });

        // Add multiple small recurring food expenses (5 times a month)
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

        // Add weekly grocery runs (3 times a month)
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

        // Add random one-off expenses (2 times a month)
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

    // Batch insert all generated transactions into Supabase
    const { error } = await supabase.from('transactions').insert(transactions);

    if (error) {
        console.error('Error seeding data:', error.message);
    } else {
        console.log('Successfully seeded dummy data!');
    }
}

seed();
