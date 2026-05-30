const supabase = require('../config/supabase');

// 1. Fetch Wallet Balance & Transaction History Ledger
exports.getWalletDetails = async (req, res) => {
  try {
    const { id } = req.user;

    // Fetch user balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', id)
      .single();

    if (userError) throw userError;

    // Fetch transactions
    const { data: transactions, error: txError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    if (txError) throw txError;

    res.json({
      balance: Number(user.wallet_balance || 0),
      transactions: transactions || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Peer-to-Peer Wallet Transfer
exports.transferFunds = async (req, res) => {
  const { recipientEmail, amount: rawAmount, description = '' } = req.body;
  const senderId = req.user.id;
  const amount = Number(rawAmount);

  if (!recipientEmail || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Please enter a valid recipient email and transfer amount' });
  }

  if (recipientEmail.toLowerCase() === req.user.email.toLowerCase()) {
    return res.status(400).json({ error: 'You cannot send money to yourself' });
  }

  try {
    // A. Verify recipient exists
    const { data: recipient, error: recError } = await supabase
      .from('users')
      .select('id, name, wallet_balance')
      .eq('email', recipientEmail.trim().toLowerCase())
      .single();

    if (recError || !recipient) {
      return res.status(404).json({ error: 'No user registered with this email address' });
    }

    // B. Verify sender has enough balance
    const { data: sender, error: sendError } = await supabase
      .from('users')
      .select('wallet_balance, name')
      .eq('id', senderId)
      .single();

    if (sendError || !sender) {
      return res.status(404).json({ error: 'Sender profile not found' });
    }

    const senderBalance = Number(sender.wallet_balance || 0);
    if (senderBalance < amount) {
      return res.status(400).json({ error: `Insufficient wallet balance. You tried to send ₦${amount.toLocaleString()} but only have ₦${senderBalance.toLocaleString()}` });
    }

    // C. Perform ledger updates in Supabase
    // Note: To mimic atomic transactions elegantly, we execute the updates in sequence
    const newSenderBal = senderBalance - amount;
    const newRecBal = Number(recipient.wallet_balance || 0) + amount;

    // 1. Debit sender balance
    const { error: debitErr } = await supabase
      .from('users')
      .update({ wallet_balance: newSenderBal })
      .eq('id', senderId);
    if (debitErr) throw debitErr;

    // 2. Credit recipient balance
    const { error: creditErr } = await supabase
      .from('users')
      .update({ wallet_balance: newRecBal })
      .eq('id', recipient.id);
    if (creditErr) {
      // Revert debit on crash (safety guard)
      await supabase.from('users').update({ wallet_balance: senderBalance }).eq('id', senderId);
      throw creditErr;
    }

    // 3. Create debit ledger transaction log for sender
    const { error: txDebitErr } = await supabase
      .from('wallet_transactions')
      .insert([{
        user_id: senderId,
        type: 'debit',
        amount,
        description: description || `P2P transfer to ${recipient.name} (${recipientEmail})`
      }]);
    if (txDebitErr) console.error('Ledger debit log warning:', txDebitErr.message);

    // 4. Create credit ledger transaction log for recipient
    const { error: txCreditErr } = await supabase
      .from('wallet_transactions')
      .insert([{
        user_id: recipient.id,
        type: 'credit',
        amount,
        description: `P2P transfer received from ${sender.name} (${req.user.email})`
      }]);
    if (txCreditErr) console.error('Ledger credit log warning:', txCreditErr.message);

    res.json({
      message: `Successfully transferred ₦${amount.toLocaleString()} to ${recipient.name}!`,
      newBalance: newSenderBal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
