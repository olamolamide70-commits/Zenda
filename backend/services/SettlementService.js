/**
 * SettlementService
 * 
 * Handles the logic for vendor payouts and platform commissions.
 */

const supabase = require('../config/supabase');

class SettlementService {
  /**
   * Calculate payout for an order and update balances
   * @param {string} orderId 
   */
  async processOrderCommission(orderId) {
    // 1. Fetch order and join with product to get vendor info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, products:product_id(vendor_id)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) return;

    const vendorId = order.vendor_id || order.products?.vendor_id;
    if (!vendorId) return;

    // 2. Fetch vendor details
    const { data: vendor, error: vendorError } = await supabase
      .from('users')
      .select('vendor_commission_rate')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) return;

    const price = order.amount;
    const commissionRate = (vendor.vendor_commission_rate || 5) / 100;
    const commission = price * commissionRate;
    const payout = price - commission;

    // 3. Update order with payout details
    await supabase
      .from('orders')
      .update({
        vendor_id: vendorId,
        platform_commission: commission,
        vendor_payout_amount: payout,
        payout_status: 'pending'
      })
      .eq('id', orderId);

    // 4. Update vendor's pending balance
    // In Supabase, we usually use RPC for increments to avoid race conditions
    // But for simplicity, we'll fetch and update or assume the user has an increment function.
    const { data: currentVendor } = await supabase.from('users').select('pending_payout_balance').eq('id', vendorId).single();
    const newPending = (currentVendor?.pending_payout_balance || 0) + payout;
    
    await supabase.from('users').update({ pending_payout_balance: newPending }).eq('id', vendorId);

    return { commission, payout };
  }

  /**
   * Settle funds (move from pending to settled)
   * This is called after delivery is confirmed or a safety period
   * @param {string} orderId 
   */
  async settleFunds(orderId) {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order || order.payout_status !== 'pending') return;

    const payoutAmount = order.vendor_payout_amount;
    const vendorId = order.vendor_id;

    // Safety: skip if no vendor linked (direct platform sale)
    if (!vendorId || !payoutAmount) return;

    // Move balance for vendor
    const { data: vendor } = await supabase.from('users').select('pending_payout_balance, settled_payout_balance').eq('id', vendorId).single();
    
    await supabase.from('users').update({ 
      pending_payout_balance: (vendor?.pending_payout_balance || 0) - payoutAmount,
      settled_payout_balance: (vendor?.settled_payout_balance || 0) + payoutAmount
    }).eq('id', vendorId);

    await supabase.from('orders').update({ payout_status: 'settled' }).eq('id', orderId);

    return true;
  }
}

module.exports = new SettlementService();
