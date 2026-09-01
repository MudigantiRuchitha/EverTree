const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', propertyController.getProperties);
router.get('/my-listings', verifyToken, requireRole('seller', 'broker'), propertyController.getUserProperties);
router.get('/favorites', verifyToken, propertyController.getFavorites);
router.get('/enquiries', verifyToken, propertyController.getEnquiries);
router.get('/:id', propertyController.getPropertyById);

router.post('/', verifyToken, requireRole('seller', 'broker'), upload.array('files', 10), propertyController.createProperty);
router.post('/favorite', verifyToken, propertyController.toggleFavorite);
router.post('/enquiry', verifyToken, propertyController.createEnquiry);

module.exports = router;
