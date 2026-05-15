const express = require('express');
const router = express.Router();
const { requestOtp, verifyOtp, getProfile, updateProfile, activateCard } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request-otp', requestOtp);
router.post('/register', requestOtp); // Alias for legacy frontend
router.post('/login', requestOtp);    // Alias for legacy frontend
router.post('/verify-otp', verifyOtp);
router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getProfile);
router.post('/activate-card', protect, activateCard);

module.exports = router;
