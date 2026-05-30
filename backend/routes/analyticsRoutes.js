const express = require('express');
const router = express.Router();
const { getDetailedAnalytics, getGrowthData } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Allow admin, super_admin, and vendor roles
router.use((req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'vendor')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin or vendor' });
  }
});

router.get('/detailed', getDetailedAnalytics);
router.get('/growth', getGrowthData);

module.exports = router;
