const supabase = require('../config/supabase');

exports.getAnalytics = async (req, res) => {
  try {
    const [
      { count: userCount, error: userError },
      { count: orderCount, error: orderError },
      { data: transactions, error: transError }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('amount').eq('status', 'success')
    ]);

    if (userError || orderError || transError) {
      throw userError || orderError || transError;
    }

    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    res.json({
      totalUsers: userCount,
      totalOrders: orderCount,
      totalRevenue,
      activePlans: orderCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [
      { count: userCount },
      { count: orderCount },
      { data: successOrders },
      { count: installmentCount },
      { data: activeInstallments },
      { data: recentOrders, error: recentError }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('amount').eq('status', 'delivered'), // Assuming delivered = revenue
      supabase.from('installments').select('*', { count: 'exact', head: true }),
      supabase.from('installments').select('remaining_balance').eq('status', 'active'),
      supabase.from('orders').select('*, products:product_id(name)').order('created_at', { ascending: false }).limit(10)
    ]);

    if (recentError) throw recentError;

    const totalRevenue = (successOrders || []).reduce((sum, o) => sum + Number(o.amount), 0);
    const outstandingDebt = (activeInstallments || []).reduce((sum, i) => sum + Number(i.remaining_balance), 0);

    res.json({
      userCount,
      orderCount,
      revenue: totalRevenue,
      installmentCount,
      outstandingDebt,
      recentOrders: recentOrders.map(o => ({
        ...o,
        product_name: o.products?.name
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at, wallet_balance, credit_limit, kyc_status')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, credit_limit, wallet_balance, kyc_status } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({ role, credit_limit, wallet_balance, kyc_status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.runReminders = async (req, res) => {
  const reminderService = require('../services/ReminderService');
  try {
    await reminderService.processDailyReminders();
    res.json({ message: 'AI Reminder cycle completed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
