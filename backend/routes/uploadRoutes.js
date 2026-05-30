const express = require('express');
const router = express.Router();
const { uploadImage, getImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');
const fileUpload = require('express-fileupload');

// Public route to view images
router.get('/image/:id', getImage);

// Protected route to upload images
router.post('/image', protect, fileUpload(), uploadImage);


module.exports = router;
