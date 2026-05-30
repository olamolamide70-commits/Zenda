const supabase = require('../config/supabase');
const flutterwaveService = require('../services/FlutterwaveService');

exports.registerVendor = async (req, res) => {
  const userId = req.user.id;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({ role: 'vendor' })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Welcome to the Vendor Community!', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVendorProducts = async (req, res) => {
  const vendorId = req.user.id;
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVendorStats = async (req, res) => {
  const vendorId = req.user.id;
  try {
    const [
      { data: user, error: uError },
      { count: productCount, error: pError },
      { data: orders, error: oError }
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', vendorId).single(),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('vendor_id', vendorId),
      supabase.from('orders').select('amount, products!inner(vendor_id)').eq('products.vendor_id', vendorId)
    ]);

    if (uError || pError || oError) {
      if (uError) throw uError;
      if (pError) throw pError;
      if (oError) throw oError;
    }

    const totalSales = (orders || []).length;
    const totalRevenue = (orders || []).reduce((sum, o) => sum + Number(o.amount), 0);

    res.json({
      productCount,
      totalSales,
      totalRevenue,
      escrowBalance: user?.settled_payout_balance || 0,
      pendingPayout: user?.pending_payout_balance || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVendorSalesHistory = async (req, res) => {
  const vendorId = req.user.id;
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('amount, created_at, products!inner(vendor_id)')
      .eq('products.vendor_id', vendorId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const historyMap = (orders || []).reduce((acc, o) => {
      const date = new Date(o.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + Number(o.amount);
      return acc;
    }, {});

    const result = Object.entries(historyMap).slice(-7).map(([date, sales]) => ({
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      sales
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requestPayout = async (req, res) => {
  const vendorId = req.user.id;
  const { amount } = req.body;

  try {
    const { data: vendor, error: vError } = await supabase
      .from('users')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (vError || !vendor || vendor.role !== 'vendor') return res.status(403).json({ error: 'Access denied' });

    if (amount > vendor.settled_payout_balance) {
      return res.status(400).json({ error: 'Insufficient settled balance' });
    }

    const bankDetails = vendor.bank_details || {};
    if (!bankDetails.account_number || !bankDetails.bank_name) {
      return res.status(400).json({ error: 'Bank details not configured' });
    }

    // Initiate Transfer via Flutterwave
    const payout = await flutterwaveService.initiateTransfer({
      account_bank: bankDetails.bank_name, 
      account_number: bankDetails.account_number,
      amount: amount,
      narration: `GadgetFlex Payout for ${vendor.name}`
    });

    if (payout.status === 'success') {
      // Deduct balance
      const newBalance = vendor.settled_payout_balance - amount;
      await supabase.from('users').update({ settled_payout_balance: newBalance }).eq('id', vendorId);

      // Log transaction
      await supabase.from('transactions').insert([{
        user_id: vendorId,
        amount: amount,
        type: 'payout',
        status: 'success',
        reference: payout.data.reference
      }]);

      res.json({ message: 'Payout initiated successfully', data: payout.data });
    } else {
      res.status(400).json({ error: payout.message || 'Payout initiation failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
