const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to allow admin, super_admin, and vendor roles
const isAuthorized = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'vendor')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin or vendor' });
  }
};

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, isAuthorized, createProduct);
router.put('/:id', protect, isAuthorized, updateProduct);
router.delete('/:id', protect, isAuthorized, deleteProduct);

module.exports = router;
