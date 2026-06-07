const supabase = require('../config/supabase');

exports.getDetailedAnalytics = async (req, res) => {
  try {
    // 1. Revenue & Outstanding Balance
    const { data: installments, error: instError } = await supabase
      .from('installments')
      .select('*, orders:order_id(amount)');

    if (instError) throw instError;

    const totalPortfolio = (installments || []).reduce((sum, item) => sum + Number(item.orders?.amount || 0), 0);
    const outstandingDebt = (installments || []).reduce((sum, item) => sum + Number(item.remaining_balance || 0), 0);
    const recoveredRevenue = totalPortfolio - outstandingDebt;

    // 2. Plan Popularity
    const plansMap = (installments || []).reduce((acc, item) => {
      acc[item.frequency] = (acc[item.frequency] || 0) + 1;
      return acc;
    }, {});

    // 3. User Risk Distribution
    const { data: riskDist, error: riskError } = await supabase
      .from('users')
      .select('risk_score')
      .not('risk_score', 'is', null);

    if (riskError) throw riskError;

    res.json({
      financials: { totalPortfolio, outstandingDebt, recoveredRevenue },
      riskDistribution: riskDist,
      plans: Object.entries(plansMap).map(([name, value]) => ({ name, value }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGrowthData = async (req, res) => {
  try {
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('amount, created_at');

    if (orderError) throw orderError;

    const { data: installments, error: instError } = await supabase
      .from('installments')
      .select('created_at');

    if (instError) throw instError;

    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Group sales by month
    const salesByMonth = (orders || []).reduce((acc, o) => {
      const month = new Date(o.created_at).getMonth() + 1;
      acc[month] = (acc[month] || 0) + Number(o.amount);
      return acc;
    }, {});

    // Group installments by month
    const instByMonth = (installments || []).reduce((acc, i) => {
      const month = new Date(i.created_at).getMonth() + 1;
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const salesData = Object.entries(salesByMonth).map(([month, sales]) => ({
      month: monthNames[month],
      sales
    })).sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month));

    const installmentData = Object.entries(instByMonth).map(([month, active]) => ({
      month: monthNames[month],
      active
    })).sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month));

    res.json({ 
      sales: salesData, 
      installments: installmentData 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('role, kyc_status, created_at');

    if (error) throw error;

    const roleBreakdown = (users || []).reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    const kycBreakdown = (users || []).reduce((acc, u) => {
      acc[u.kyc_status] = (acc[u.kyc_status] || 0) + 1;
      return acc;
    }, {});

    // Recent velocity (last 7 days vs previous 7 days)
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekSignups = users.filter(u => new Date(u.created_at) >= lastWeek).length;
    const lastWeekSignups = users.filter(u => {
      const d = new Date(u.created_at);
      return d >= twoWeeksAgo && d < lastWeek;
    }).length;

    res.json({
      roleBreakdown,
      kycBreakdown,
      velocity: {
        thisWeek: thisWeekSignups,
        lastWeek: lastWeekSignups,
        trend: lastWeekSignups === 0 ? 100 : Math.round(((thisWeekSignups - lastWeekSignups) / lastWeekSignups) * 100)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStaffAnalytics = async (req, res) => {
  try {
    const { data: staff, error } = await supabase
      .from('users')
      .select('role')
      .in('role', ['admin', 'super_admin', 'manager', 'staff', 'customer_care', 'customer_service']);

    if (error) throw error;

    const breakdown = (staff || []).reduce((acc, s) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {});

    res.json({
      total: staff?.length || 0,
      breakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
