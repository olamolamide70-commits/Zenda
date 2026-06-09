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

exports.getAllOrders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, users(name, email), products(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllInstallments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('installments')
      .select('*, users(name, email), orders(id, product_id, amount, status)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, users(name, email), orders(id, amount, status), installments(id, order_id, total_amount, next_payment_date)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSystemSettings = async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .maybeSingle();

    if (error) throw error;

    if (!settings) {
      const defaultSettings = {
        maintenance_mode: false,
        enable_reminders: true,
        enable_auto_debit: true,
        enable_vendor_settlement: true,
        default_credit_limit: 100000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('system_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (insertError) throw insertError;
      return res.json(data);
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSystemSettings = async (req, res) => {
  try {
    const {
      maintenance_mode,
      enable_reminders,
      enable_auto_debit,
      enable_vendor_settlement,
      default_credit_limit
    } = req.body;

    const { data: existing, error } = await supabase
      .from('system_settings')
      .select('*')
      .maybeSingle();

    if (error) throw error;

    const payload = {
      maintenance_mode,
      enable_reminders,
      enable_auto_debit,
      enable_vendor_settlement,
      default_credit_limit,
      updated_at: new Date().toISOString()
    };

    const trimmedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );

    let result;
    if (existing) {
      const { data, error: updateError } = await supabase
        .from('system_settings')
        .update(trimmedPayload)
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) throw updateError;
      result = data;
    } else {
      const { data, error: insertError } = await supabase
        .from('system_settings')
        .insert(trimmedPayload)
        .select()
        .single();

      if (insertError) throw insertError;
      result = data;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
