const supabase = require('../config/supabase');

/**
 * Pillar 2: Vendor Empowerment & Escrow
 * Handles automated settlement of funds from Escrow to Vendor Balance
 */

exports.processEscrowSettlements = async () => {
  console.log('--- STARTING ESCROW SETTLEMENT PROCESS ---');
  
  try {
    // 1. Find transactions ready for settlement
    // Using inner join with products via orders/installments
    const { data: ready, error: fetchError } = await supabase
      .from('transactions')
      .select('*, installments!inner(order_id, orders!inner(product_id, products!inner(vendor_id)))')
      .eq('is_settled_to_vendor', false)
      .lte('settlement_ready_at', new Date().toISOString())
      .eq('status', 'success');

    if (fetchError) throw fetchError;

    console.log(`Found ${ready?.length || 0} transactions ready for settlement.`);

    for (const trx of (ready || [])) {
      const vendorId = trx.installments?.orders?.products?.vendor_id;
      if (!vendorId) continue;

      console.log(`Settling ₦${trx.amount} to vendor ${vendorId} for transaction ${trx.id}`);
      
      try {
        // Update vendor's escrow balance
        const { data: vendor } = await supabase.from('users').select('escrow_balance').eq('id', vendorId).single();
        const newBalance = (vendor?.escrow_balance || 0) + Number(trx.amount);
        
        await supabase.from('users').update({ escrow_balance: newBalance }).eq('id', vendorId);

        // Mark transaction as settled
        await supabase
          .from('transactions')
          .update({ is_settled_to_vendor: true })
          .eq('id', trx.id);

        console.log(`. Settlement successful for transaction ${trx.id}`);
      } catch (err) {
        console.error(`. Failed to settle transaction ${trx.id}:`, err.message);
      }
    }

  } catch (err) {
    console.error('Escrow settlement process failed:', err.message);
  }
};
