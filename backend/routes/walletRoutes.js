const express = require('express');
const router = express.Router();
const { getWalletDetails, transferFunds } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getWalletDetails);
router.post('/transfer', transferFunds);

module.exports = router;
