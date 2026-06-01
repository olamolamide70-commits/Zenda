const express = require('express');
const router = express.Router();
const { getOrders, createOrder, getOrderStats, requestDeliveryCode, confirmDelivery } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const supabase = require('../config/supabase');

router.get('/', protect, getOrders);
router.post('/', protect, createOrder);
router.get('/stats', protect, getOrderStats);
router.post('/request-delivery-code', protect, requestDeliveryCode);
router.post('/confirm-delivery', protect, confirmDelivery);

// Admin: get ALL orders
router.get('/all', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const orders = data.map(o => ({ ...o, user_name: o.users?.name, user_email: o.users?.email }));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update order status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
