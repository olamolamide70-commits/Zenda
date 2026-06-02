const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, activateCard, forgotPassword, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/register', signup); // Alias
router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getProfile);
router.post('/activate-card', protect, activateCard);
router.post('/forgot-password', forgotPassword);
router.post('/update-password', protect, updatePassword);

module.exports = router;
