const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, activateCard } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/register', signup); // Alias
router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getProfile);
router.post('/activate-card', protect, activateCard);

module.exports = router;
