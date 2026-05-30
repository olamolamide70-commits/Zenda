const supabase = require('../config/supabase');

async function runDiagnostics() {
  console.log('=== live Supabase Database Diagnostics ===');
  
  // 1. Query users
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ users table error:', error.message);
    } else {
      console.log('✅ users table exists. Total count:', data || 0);
    }
  } catch (err) {
    console.error('❌ users query exception:', err.message);
  }

  // 2. Query cart_items
  try {
    const { error } = await supabase.from('cart_items').select('*').limit(1);
    if (error) {
      console.error('❌ cart_items table error:', error.message);
    } else {
      console.log('✅ cart_items table exists and is accessible.');
    }
  } catch (err) {
    console.error('❌ cart_items query exception:', err.message);
  }

  // 3. Query referrals
  try {
    const { error } = await supabase.from('referrals').select('*').limit(1);
    if (error) {
      console.error('❌ referrals table error:', error.message);
    } else {
      console.log('✅ referrals table exists and is accessible.');
    }
  } catch (err) {
    console.error('❌ referrals query exception:', err.message);
  }

  // 4. Query products
  try {
    const { error } = await supabase.from('products').select('*').limit(1);
    if (error) {
      console.error('❌ products table error:', error.message);
    } else {
      console.log('✅ products table exists and is accessible.');
    }
  } catch (err) {
    console.error('❌ products query exception:', err.message);
  }
}

runDiagnostics();
