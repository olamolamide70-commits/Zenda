const express = require('express');
const router = express.Router();
const { generateGiftCard, redeemGiftCard, listGiftCards } = require('../controllers/giftCardController');
const { protect, vendor } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/redeem', redeemGiftCard);
router.post('/generate', vendor, generateGiftCard);
router.get('/', vendor, listGiftCards);

module.exports = router;
