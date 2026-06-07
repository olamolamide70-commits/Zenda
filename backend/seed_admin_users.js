require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const usersToCreate = [
  { email: 'superadminflex@gmail.com', name: 'Super Admin Flex', role: 'super_admin' },
  { email: 'adminflex@gmail.com', name: 'Admin Flex', role: 'admin' },
  { email: 'manager1@gadgetflex.com.ng', name: 'Manager Flex 1', role: 'manager' },
  { email: 'manager2@gadgetflex.com.ng', name: 'Manager Flex 2', role: 'manager' },
  { email: 'care1@gadgetflex.com.ng', name: 'Support Sarah', role: 'customer_care' },
  { email: 'care2@gadgetflex.com.ng', name: 'Support Ahmed', role: 'customer_care' },
  { email: 'staff1@gadgetflex.com.ng', name: 'Staff User 1', role: 'staff' },
];

async function seed() {
  console.log('Seeding Admin Users...');
  for (const u of usersToCreate) {
    try {
      console.log(`Checking if ${u.email} exists...`);
      // Try creating the user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: 'Password123@',
        email_confirm: true,
        user_metadata: { name: u.name }
      });

      let userId;

      if (authError) {
        if (authError.message.includes('already exists') || authError.message.includes('already registered')) {
          console.log(`User ${u.email} already exists in auth. Updating their password...`);
          
          // Find the user to get their ID
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existingUser = listData.users.find(x => x.email === u.email);
          
          if (existingUser) {
            userId = existingUser.id;
            await supabase.auth.admin.updateUserById(userId, {
              password: 'Password123@',
              user_metadata: { name: u.name }
            });
            console.log(`Password reset to Password123@ for ${u.email}`);
          }
        } else {
          throw authError;
        }
      } else {
        console.log(`Created new auth user for ${u.email}`);
        userId = authData.user.id;
      }

      if (userId) {
        // Upsert into public.users table
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: u.email,
            name: u.name,
            role: u.role,
            is_verified: true,
            kyc_status: 'Approved'
          });

        if (profileError) {
          console.error(`Failed to create public.users profile for ${u.email}:`, profileError.message);
        } else {
          console.log(`Successfully configured ${u.role} profile for ${u.email}!`);
        }
      }

    } catch (err) {
      console.error(`Error processing ${u.email}:`, err.message);
    }
  }
  console.log('Finished seeding users!');
}

seed();
