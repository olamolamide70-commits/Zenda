const express = require('express');
const router = express.Router();
const { registerMerchant, getMerchantProducts, getMerchantStats, getMerchantSalesHistory, requestPayout } = require('../controllers/merchantController');
const { protect } = require('../middleware/authMiddleware');

const isMerchant = (req, res, next) => {
  if (req.user.role !== 'merchant') return res.status(403).json({ error: 'Merchant access required' });
  next();
};

router.post('/register', protect, registerMerchant);
router.get('/products', protect, isMerchant, getMerchantProducts);
router.get('/stats', protect, isMerchant, getMerchantStats);
router.get('/sales-history', protect, isMerchant, getMerchantSalesHistory);
router.post('/withdraw', protect, isMerchant, requestPayout);

module.exports = router;
