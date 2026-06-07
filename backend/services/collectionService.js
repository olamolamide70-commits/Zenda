const supabase = require('../config/supabase');
const { chargeAuthorization } = require('./paystackService');
const { sendEmail } = require('./emailService');

/**
 * Pillar 1: Risk & Collection Engine
 * Handles automated debt recovery and late fee application
 */

const LATE_FEE_PERCENTAGE = 0.05; // 5% late fee
const GRACE_PERIOD_DAYS = 3;

exports.processCollection = async () => {
  console.log('--- STARTING COLLECTION PROCESS ---');
  
  try {
    // 1. Find overdue installments
    const { data: overdue, error: fetchError } = await supabase
      .from('installments')
      .select('*, users:user_id(email, name)')
      .lt('next_payment_date', new Date().toISOString())
      .neq('status', 'completed');

    if (fetchError) throw fetchError;

    console.log(`Found ${overdue?.length || 0} overdue installments.`);

    for (const inst of (overdue || [])) {
      const user = inst.users;
      if (!user) continue;

      const daysOverdue = Math.floor((new Date() - new Date(inst.next_payment_date)) / (1000 * 60 * 60 * 24));
      
      // 2. Apply Late Fees if beyond grace period
      if (daysOverdue >= GRACE_PERIOD_DAYS && (inst.late_fees_accrued || 0) == 0) {
        const lateFee = parseFloat(inst.remaining_balance) * LATE_FEE_PERCENTAGE;
        console.log(`Applying late fee of ₦${lateFee} to installment ${inst.id} (User: ${user.name})`);
        
        const newBalance = parseFloat(inst.remaining_balance) + lateFee;
        await supabase
          .from('installments')
          .update({ 
            late_fees_accrued: lateFee, 
            remaining_balance: newBalance 
          })
          .eq('id', inst.id);

        // Notify User
        await sendEmail({
          to: user.email,
          subject: 'Late Fee Applied - Zenda',
          text: `Hi ${user.name}, a late fee of ₦${lateFee} has been applied to your overdue installment. Please settle your balance to avoid further penalties.`
        });
      }

      // 3. Auto-Retry Payment if cards are on file
      // Assuming auto_debit_subscriptions table exists in Supabase
      const { data: cards, error: cardError } = await supabase
        .from('auto_debit_subscriptions')
        .select('authorization_code')
        .eq('user_id', inst.user_id)
        .eq('status', 'active')
        .limit(1);

      if (!cardError && cards && cards.length > 0) {
        console.log(`Attempting auto-retry for overdue installment ${inst.id}...`);
        const authCode = cards[0].authorization_code;
        
        // Only retry every 3 days
        const lastRetry = inst.last_collection_retry ? new Date(inst.last_collection_retry) : null;
        const daysSinceLastRetry = lastRetry ? Math.floor((new Date() - lastRetry) / (1000 * 60 * 60 * 24)) : 99;

        if (daysSinceLastRetry >= 3) {
          try {
            const success = await chargeAuthorization(user.email, inst.remaining_balance, authCode);
            if (success) {
              console.log(`. Auto-retry successful for ${inst.id}`);
              await supabase
                .from('installments')
                .update({ remaining_balance: 0, status: 'completed' })
                .eq('id', inst.id);
            } else {
              console.warn(`. Auto-retry failed for ${inst.id}`);
              await supabase
                .from('installments')
                .update({ last_collection_retry: new Date().toISOString() })
                .eq('id', inst.id);
            }
          } catch (err) {
            console.error(`Retry error for ${inst.id}:`, err.message);
          }
        }
      }
    }

  } catch (err) {
    console.error('Collection process failed:', err);
  }
};
