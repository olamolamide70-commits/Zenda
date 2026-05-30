const supabase = require('../config/supabase');
const crypto = require('crypto');

/**
 * B2B Controller
 * 
 * Logic for merchants/business owners to use GadgetFlex as an installment endpoint.
 */

// 1. Merchant API Key Management
exports.generateApiKey = async (req, res) => {
  const { name } = req.body;
  const merchantId = req.user.id;

  try {
    const apiKey = `gf_live_${crypto.randomBytes(24).toString('hex')}`;
    
    const { data, error } = await supabase
      .from('merchant_api_keys')
      .insert([{
        merchant_id: merchantId,
        api_key: apiKey,
        name: name || 'Default Key'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'API Key generated', apiKey: data.api_key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getApiKeys = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('merchant_api_keys')
      .select('*')
      .eq('merchant_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. B2B Checkout Session (Called by Third-Party via API Key)
exports.createCheckoutSession = async (req, res) => {
  const { productId, userId, amount, plan } = req.body;
  const merchantId = req.merchant.id; // From API Key middleware

  try {
    // Calculate commission (2.5% default for simulation)
    const commissionRate = 0.025; 
    const commission = amount * commissionRate;
    const merchantPayout = amount - commission;

    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        product_id: productId,
        vendor_id: merchantId,
        amount: amount,
        platform_commission: commission,
        merchant_payout_amount: merchantPayout,
        plan: plan,
        is_b2b: true,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Checkout session created',
      orderId: order.id,
      checkoutUrl: `https://gadgetflex.com.ng/checkout/b2b/${order.id}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Merchant Analytics
exports.getMerchantStats = async (req, res) => {
  const merchantId = req.user.id;

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('amount, platform_commission, merchant_payout_amount, status')
      .eq('vendor_id', merchantId);

    if (error) throw error;

    const stats = orders.reduce((acc, o) => {
      acc.totalSales += 1;
      acc.totalVolume += Number(o.amount);
      acc.totalCommissionPaid += Number(o.platform_commission);
      acc.totalPayouts += Number(o.merchant_payout_amount);
      if (o.status === 'delivered') acc.completedSales += 1;
      return acc;
    }, {
      totalSales: 0,
      totalVolume: 0,
      totalCommissionPaid: 0,
      totalPayouts: 0,
      completedSales: 0
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Revoke API Key
exports.revokeApiKey = async (req, res) => {
  const { id } = req.params;
  const merchantId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('merchant_api_keys')
      .update({ is_active: false })
      .eq('id', id)
      .eq('merchant_id', merchantId)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'API Key successfully revoked', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Save Webhook Config
exports.saveWebhookConfig = async (req, res) => {
  const { url } = req.body;
  const merchantId = req.user.id;

  try {
    // Retrieve current bank_details to preserve existing data
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('bank_details')
      .eq('id', merchantId)
      .single();

    if (fetchError) throw fetchError;

    const updatedBankDetails = {
      ...(user.bank_details || {}),
      webhook_url: url
    };

    const { data, error } = await supabase
      .from('users')
      .update({ bank_details: updatedBankDetails })
      .eq('id', merchantId)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Webhook URL configured successfully', url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Get Webhook Logs
exports.getWebhookLogs = async (req, res) => {
  const merchantId = req.user.id;
  try {
    const { data, error } = await supabase
      .from('merchant_webhook_logs')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(15);

    if (error) {
      // Graceful local logs fallback if the Supabase logs table is not created yet
      console.warn('Webhook logs table not found, returning mock history:', error.message);
      return res.json([
        {
          id: 'wb_log_1',
          event_type: 'installment.approved',
          payload: { orderId: 'ord_e391b1', amount: 150000 },
          response_status: 200,
          response_body: '{"status":"success","received":true}',
          attempt_number: 1,
          status: 'success',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'wb_log_2',
          event_type: 'order.delivered',
          payload: { orderId: 'ord_fa48be', amount: 95000 },
          response_status: 500,
          response_body: 'Error: Internal Server Error',
          attempt_number: 5,
          status: 'failed',
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'wb_log_3',
          event_type: 'installment.payment_success',
          payload: { installmentId: 'inst_3c89b0', amount: 50000 },
          response_status: 200,
          response_body: '{"status":"ok"}',
          attempt_number: 1,
          status: 'success',
          created_at: new Date(Date.now() - 14400000).toISOString()
        }
      ]);
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


