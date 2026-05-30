const express = require('express');
const router = express.Router();
const b2bController = require('../controllers/b2bController');
const { protect, merchantApiKey } = require('../middleware/authMiddleware');

// Internal merchant routes (Requires user to be logged in)
router.post('/keys', protect, b2bController.generateApiKey);
router.get('/keys', protect, b2bController.getApiKeys);
router.delete('/keys/:id', protect, b2bController.revokeApiKey);
router.get('/stats', protect, b2bController.getMerchantStats);
router.post('/webhook/config', protect, b2bController.saveWebhookConfig);
router.get('/webhook/logs', protect, b2bController.getWebhookLogs);

// Public B2B API (Requires API Key)
router.post('/checkout/session', merchantApiKey, b2bController.createCheckoutSession);

module.exports = router;
