const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const supabase = require('../config/supabase');

// Middleware to allow admin, super_admin, and vendor roles
const isAuthorized = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'vendor')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin or vendor' });
  }
};

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, isAuthorized, createProduct);
router.put('/:id', protect, isAuthorized, updateProduct);
router.delete('/:id', protect, isAuthorized, deleteProduct);

// Reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*, users(name)')
      .eq('product_id', req.params.id)
      .order('created_at', { ascending: false });
    if (error) {
      // Table may not exist yet — return empty array gracefully
      return res.json([]);
    }
    const reviews = (data || []).map(r => ({ ...r, user_name: r.users?.name }));
    res.json(reviews);
  } catch (err) {
    res.json([]);
  }
});

router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) return res.status(400).json({ error: 'Rating and comment are required' });
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: req.params.id,
        user_id: req.user.id,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        comment,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
