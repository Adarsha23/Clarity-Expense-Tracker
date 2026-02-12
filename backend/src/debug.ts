import { supabase } from './config/supabase';

// Debug script to test database write permissions and RLS policies
async function debug() {
    console.log('--- Database Debug ---');

    // 1. Get a valid user ID first (if any) to check admin access
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.log("Auth error (skipping user fetch):", userError.message);
    }

    const testId = "00000000-0000-0000-0000-000000000000"; // Dummy ID for RLS check

    console.log('2. Attempting Test Insert...');
    // Attempt to insert a dummy transaction to verify write access
    const { data, error } = await supabase
        .from('transactions')
        .insert([{
            user_id: testId,
            type: 'expense',
            amount: 100,
            category: 'Testing',
            description: 'Debug Insert',
            date: new Date().toISOString().split('T')[0]
        }])
        .select();

    if (error) {
        console.error('INSERT ERROR:', error);
    } else {
        console.log('INSERT SUCCESS:', data);
    }
}

debug();
