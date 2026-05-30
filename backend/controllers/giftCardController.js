const supabase = require('../config/supabase');
const crypto = require('crypto');

// Utility to generate cryptographically random gift card codes
function generateSecureCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters like O, I, 1, 0
  let code = 'ZENDA-';
  for (let i = 0; i < 4; i++) {
    code += chars[crypto.randomInt(0, chars.length)];
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars[crypto.randomInt(0, chars.length)];
  }
  return code;
}

// 1. Generate Virtual Gift Card (Admins / Merchants)
exports.generateGiftCard = async (req, res) => {
  const { amount: rawAmount } = req.body;
  const amount = Number(rawAmount);

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Please enter a valid gift card value' });
  }

  try {
    const code = generateSecureCode();

    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .insert([{
        code,
        initial_amount: amount,
        current_amount: amount,
        is_active: true,
        created_by: req.user.id
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: `Gift card generated successfully!`,
      giftCard
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Redeem Zenda Gift Card
exports.redeemGiftCard = async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid gift card coupon code' });
  }

  try {
    // A. Query the gift card code
    const { data: card, error: cardError } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single();

    if (cardError || !card) {
      return res.status(404).json({ error: 'Invalid or incorrect gift card code' });
    }

    if (!card.is_active || Number(card.current_amount || 0) <= 0) {
      return res.status(400).json({ error: 'This gift card has already been claimed or deactivated' });
    }

    const claimValue = Number(card.current_amount);

    // B. Fetch redeemer balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Redeemer user profile not found' });
    }

    const currentBal = Number(user.wallet_balance || 0);
    const newBal = currentBal + claimValue;

    // C. Perform ledger writes
    // 1. Credit redeemer wallet balance
    const { error: userUpdateErr } = await supabase
      .from('users')
      .update({ wallet_balance: newBal })
      .eq('id', userId);
    if (userUpdateErr) throw userUpdateErr;

    // 2. Deactivate gift card
    const { error: cardUpdateErr } = await supabase
      .from('gift_cards')
      .update({
        current_amount: 0,
        is_active: false,
        redeemed_by: userId,
        redeemed_at: new Date().toISOString()
      })
      .eq('id', card.id);
    if (cardUpdateErr) {
      // Revert user credit on crash
      await supabase.from('users').update({ wallet_balance: currentBal }).eq('id', userId);
      throw cardUpdateErr;
    }

    // 3. Create credit ledger transaction log
    const { error: txErr } = await supabase
      .from('wallet_transactions')
      .insert([{
        user_id: userId,
        type: 'credit',
        amount: claimValue,
        description: `Voucher Activation - Redeemed gift card ${card.code}`
      }]);
    if (txErr) console.error('Gift card redemption transaction log error:', txErr.message);

    res.json({
      message: `Congratulations! You successfully claimed ₦${claimValue.toLocaleString()} to your digital wallet balance.`,
      claimedValue: claimValue,
      newBalance: newBal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Audit Generated Gift Cards (Super Admins, Admins, and Merchants)
exports.listGiftCards = async (req, res) => {
  try {
    let query = supabase.from('gift_cards').select('*, redeemed_users:users!redeemed_by(name, email)');

    // If role is vendor, only fetch cards they generated!
    if (req.user.role === 'vendor') {
      query = query.eq('created_by', req.user.id);
    }

    const { data: cards, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(cards || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
