const express = require('express');
const router = express.Router();
const { createPlan, getSchedule, getUserInstallments } = require('../controllers/installmentController');
const { initializeAutoDebit } = require('../controllers/autoDebitController');
const { protect } = require('../middleware/authMiddleware');
const supabase = require('../config/supabase');

router.post('/create', protect, createPlan);
router.get('/', protect, getUserInstallments);
router.post('/auto-debit', protect, initializeAutoDebit);

// Admin: get ALL installments with user info
router.get('/all', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('installments')
      .select('*, users(name, email), orders(product_name, total_amount)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const result = data.map(i => ({
      ...i,
      user_name: i.users?.name,
      user_email: i.users?.email,
      product_name: i.product_name || i.orders?.product_name,
      order_total: i.order_total || i.orders?.total_amount,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pay now — initiate a Paystack payment for an installment
router.post('/pay-now', protect, async (req, res) => {
  const { installmentId, amount, email } = req.body;
  const userEmail = email || req.user.email;

  try {
    // Verify installment belongs to user
    const { data: inst, error } = await supabase
      .from('installments')
      .select('*')
      .eq('id', installmentId)
      .single();
    if (error || !inst) return res.status(404).json({ error: 'Installment not found' });

    // Initialize Paystack payment
    const axios = require('axios');
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: userEmail,
        amount: Math.round(parseFloat(amount) * 100), // kobo
        metadata: {
          installment_id: installmentId,
          type: 'installment_payment',
          user_id: req.user.id,
        },
        callback_url: `${process.env.FRONTEND_URL}/dashboard/installments`,
      },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    res.json({
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:planId', protect, getSchedule);

module.exports = router;
