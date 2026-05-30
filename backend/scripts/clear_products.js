const supabase = require('../config/supabase');

async function clearProducts() {
  console.log('=== Clearing all products from Supabase database ===');
  try {
    const { data: before, error: selectError } = await supabase.from('products').select('id, name');
    if (selectError) {
      console.error('❌ Error selecting products:', selectError.message);
      return;
    }
    console.log(`Found ${before.length} products in database.`);

    const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
      console.error('❌ Error deleting products:', deleteError.message);
    } else {
      console.log('✅ Successfully cleared all products from Supabase database.');
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

clearProducts();
