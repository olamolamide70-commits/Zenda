const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getUsers,
  updateUser,
  getDashboard,
  runReminders,
  getAllOrders,
  getAllInstallments,
  getAllTransactions,
  getAllNotifications,
  getSystemSettings,
  updateSystemSettings
} = require('../controllers/adminController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getDashboard);
router.get('/analytics', protect, admin, getAnalytics);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id', protect, superAdmin, updateUser);
router.get('/orders', protect, admin, getAllOrders);
router.get('/installments', protect, admin, getAllInstallments);
router.get('/transactions', protect, admin, getAllTransactions);
router.get('/notifications', protect, admin, getAllNotifications);
router.get('/settings', protect, superAdmin, getSystemSettings);
router.put('/settings', protect, superAdmin, updateSystemSettings);
router.post('/reminders/run', protect, superAdmin, runReminders);

module.exports = router;
