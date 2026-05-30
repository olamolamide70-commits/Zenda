const express = require('express');
const router = express.Router();
const { getAnalytics, getUsers, updateUser, getDashboard, runReminders } = require('../controllers/adminController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getDashboard);
router.get('/analytics', protect, admin, getAnalytics);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id', protect, superAdmin, updateUser);
router.post('/reminders/run', protect, admin, runReminders);

module.exports = router;
