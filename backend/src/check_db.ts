import { supabase } from './config/supabase';

// Utility script to verify database connection and user existence
async function check() {
    // Attempt to list all users (requires service role key usually)
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.error('Error fetching users:', userError.message);
        // Fallback: search by email if admin is restricted
        // This checks the public 'profiles' table if it exists
        const { data: authUser, error: authError } = await supabase
            .from('profiles') // Assuming there's a profiles table
            .select('*')
            .eq('email', 'adarshaprasai@gmail.com')
            .single();

        console.log('User Profile:', authUser || authError);
    } else {
        // Find specific user to verify seeding
        const user = users.users.find(u => u.email === 'adarshaprasai@gmail.com');
        console.log('User ID for adarshaprasai@gmail.com:', user?.id);
    }

    // Verify access to categories table
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');

    console.log('Categories:', categories || catError);
}

check();
