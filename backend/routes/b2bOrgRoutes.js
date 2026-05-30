const express = require('express');
const router = express.Router();
const b2bOrgController = require('../controllers/b2bOrgController');
const { protect } = require('../middleware/authMiddleware');

// Business Profile Registration
router.post('/register', protect, b2bOrgController.registerOrganization);

// Organization User Invitations (Admin only)
router.post('/invite', protect, b2bOrgController.inviteUser);

// Organization Procurement Audits (Admin only)
router.get('/orders', protect, b2bOrgController.getOrganizationOrders);

// Organization Order Approval Workflow (Admin only)
router.post('/orders/:id/approve', protect, b2bOrgController.approveProcurementOrder);

module.exports = router;
