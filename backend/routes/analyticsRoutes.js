const express = require('express');
const router = express.Router();
const { getDetailedAnalytics, getGrowthData, getUserAnalytics, getStaffAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Allow internal staff roles
router.use((req, res, next) => {
  const allowedRoles = ['admin', 'super_admin', 'manager', 'customer_care', 'customer_service', 'staff', 'merchant'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized for analytics' });
  }
});

router.get('/detailed', getDetailedAnalytics);
router.get('/growth', getGrowthData);
router.get('/users', getUserAnalytics);
router.get('/staff', getStaffAnalytics);

module.exports = router;
