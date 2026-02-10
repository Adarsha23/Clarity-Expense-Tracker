import { supabase } from './config/supabase';

async function check() {
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.error('Error fetching users:', userError.message);
        // Fallback: search by email if admin is restricted
        const { data: authUser, error: authError } = await supabase
            .from('profiles') // Assuming there's a profiles table
            .select('*')
            .eq('email', 'adarshaprasai@gmail.com')
            .single();

        console.log('User Profile:', authUser || authError);
    } else {
        const user = users.users.find(u => u.email === 'adarshaprasai@gmail.com');
        console.log('User ID for adarshaprasai@gmail.com:', user?.id);
    }

    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');

    console.log('Categories:', categories || catError);
}

check();
