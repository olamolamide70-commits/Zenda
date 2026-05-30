const supabase = require('../config/supabase');

async function resetDb() {
  console.log('=== Resetting Demo Transactional Data and Products ===');
  
  // 1. Delete cart items
  try {
    const { error } = await supabase.from('cart_items').delete().neq('id', 0);
    if (error) console.error('❌ cart_items delete warning:', error.message);
    else console.log('✅ Cleared cart items.');
  } catch (err) {
    console.error('cart_items exception:', err.message);
  }

  // 2. Delete installments
  try {
    const { error } = await supabase.from('installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error('❌ installments delete warning:', error.message);
    else console.log('✅ Cleared installments.');
  } catch (err) {
    console.error('installments exception:', err.message);
  }

  // 3. Delete orders
  try {
    const { error } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error('❌ orders delete warning:', error.message);
    else console.log('✅ Cleared orders.');
  } catch (err) {
    console.error('orders exception:', err.message);
  }

  // 4. Delete products
  try {
    const { error } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error('❌ products delete warning:', error.message);
    else console.log('✅ Cleared products catalog.');
  } catch (err) {
    console.error('products exception:', err.message);
  }

  console.log('=== Database Reset Complete ===');
}

resetDb();
