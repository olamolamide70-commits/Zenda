/**
 * seed_admin_users.js
 * 
 * STEP 1: Run this SQL first in Supabase SQL Editor to clear broken records:
 * 
 *   DELETE FROM public.users WHERE email IN (
 *     'makindeolasubomi5@gmail.com','olamide@gmail.com',
 *     'tunde.admin@gadgetflex.com.ng','john.admin@zenda.co','grace.admin@zenda.co',
 *     'sarah.cs@gadgetflex.com.ng','ahmed.cs@gadgetflex.com.ng',
 *     'uche.cs@gadgetflex.com.ng','tosin.cs@gadgetflex.com.ng','miracle.cs@gadgetflex.com.ng'
 *   );
 *   DELETE FROM auth.users WHERE email IN (
 *     'makindeolasubomi5@gmail.com','olamide@gmail.com',
 *     'tunde.admin@gadgetflex.com.ng','john.admin@zenda.co','grace.admin@zenda.co',
 *     'sarah.cs@gadgetflex.com.ng','ahmed.cs@gadgetflex.com.ng',
 *     'uche.cs@gadgetflex.com.ng','tosin.cs@gadgetflex.com.ng','miracle.cs@gadgetflex.com.ng'
 *   );
 * 
 * STEP 2: Then run this script:
 *   node scripts/seed_admin_users.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const TEST_PASSWORD = 'Password123@';

const USERS = [
  { email: 'makindeolasubomi5@gmail.com',   name: 'Olasubomi Makinde', role: 'super_admin' },
  { email: 'olamide@gmail.com',             name: 'Olamide Admin',     role: 'super_admin' },
  { email: 'tunde.admin@gadgetflex.com.ng', name: 'Tunde Afolayan',   role: 'admin' },
  { email: 'john.admin@zenda.co',           name: 'John Olamide',     role: 'admin' },
  { email: 'grace.admin@zenda.co',          name: 'Grace Bello',      role: 'admin' },
  { email: 'sarah.cs@gadgetflex.com.ng',    name: 'Sarah Ifeanyi',    role: 'customer_care' },
  { email: 'ahmed.cs@gadgetflex.com.ng',    name: 'Ahmed Lawal',      role: 'customer_care' },
  { email: 'uche.cs@gadgetflex.com.ng',     name: 'Uche Okafor',      role: 'customer_care' },
  { email: 'tosin.cs@gadgetflex.com.ng',    name: 'Tosin Balogun',    role: 'customer_care' },
  { email: 'miracle.cs@gadgetflex.com.ng',  name: 'Miracle Ebube',    role: 'customer_care' },
];

async function deleteAllExistingUsers() {
  console.log('🗑️  Cleaning up old/broken user records via Admin API...');
  try {
    let page = 1;
    const emailSet = new Set(USERS.map(u => u.email));
    let found = 0;

    // List all users in pages of 1000
    while (true) {
      const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error || !users || users.length === 0) break;

      for (const authUser of users) {
        if (emailSet.has(authUser.email)) {
          const { error: delErr } = await supabase.auth.admin.deleteUser(authUser.id);
          if (delErr) {
            console.log(`   ⚠️  Could not delete via API: ${authUser.email} — ${delErr.message}`);
          } else {
            console.log(`   🗑️  Deleted: ${authUser.email}`);
            found++;
          }
        }
      }

      if (users.length < 1000) break;
      page++;
    }

    if (found === 0) {
      console.log('   (No existing records found via API — if DB still has them, run the cleanup SQL above first)\n');
    } else {
      console.log(`   Removed ${found} old records.\n`);
    }
  } catch (err) {
    console.error('   Cleanup error:', err.message, '\n');
  }
}

async function seedUsers() {
  console.log('\n🌱 Zenda — Admin User Seeder');
  console.log('════════════════════════════\n');

  await deleteAllExistingUsers();

  let created = 0;
  let failed = 0;

  for (const u of USERS) {
    try {
      // Create via Supabase Admin Auth API — this is the ONLY correct way
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: { name: u.name }
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      // Upsert profile in public.users
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          name: u.name,
          email: u.email,
          role: u.role,
          is_verified: true,
          kyc_status: 'verified',
          credit_limit: u.role === 'super_admin' ? 999999999 : 10000000,
          wallet_balance: 100000
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      console.log(`  ✅ ${u.role.padEnd(14)} | ${u.name.padEnd(22)} | ${u.email}`);
      created++;

    } catch (err) {
      console.error(`  ❌ FAILED   | ${u.name.padEnd(22)} | ${u.email}`);
      console.error(`              Error: ${err.message}`);
      failed++;
    }
  }

  console.log('\n════════════════════════════');
  console.log(`✅ Created: ${created}  |  ❌ Failed: ${failed}`);

  if (created > 0) {
    console.log('\n📋 All accounts use password: ' + TEST_PASSWORD);
    console.log('\nSuper Admins: makindeolasubomi5@gmail.com | olamide@gmail.com');
    console.log('Admins: tunde.admin@gadgetflex.com.ng | john.admin@zenda.co | grace.admin@zenda.co');
    console.log('CS: sarah/ahmed/uche/tosin/miracle.cs@gadgetflex.com.ng\n');
  }

  if (failed > 0) {
    console.log('\n⚠️  Some users failed. This usually means their email still exists');
    console.log('   in auth.users from the old SQL seed. Run this in Supabase SQL Editor:\n');
    console.log('   DELETE FROM public.users WHERE email IN (');
    USERS.forEach(u => console.log(`     '${u.email}',`));
    console.log('   );');
    console.log('   DELETE FROM auth.users WHERE email IN (');
    USERS.forEach(u => console.log(`     '${u.email}',`));
    console.log('   );\n');
    console.log('   Then run this script again.\n');
  }
}

seedUsers().catch(console.error);
