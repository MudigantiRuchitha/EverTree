// const express = require('express');
// const router = express.Router();
// const propertyController = require('../controllers/propertyController');
// const { verifyToken, requireRole } = require('../middleware/authMiddleware');
// const upload = require('../middleware/uploadMiddleware');

// router.get('/', propertyController.getProperties);
// router.get('/my-listings', verifyToken, requireRole('seller', 'broker'), propertyController.getUserProperties);
// router.get('/favorites', verifyToken, propertyController.getFavorites);
// router.get('/enquiries', verifyToken, propertyController.getEnquiries);
// router.get('/:id', propertyController.getPropertyById);

// router.post('/', verifyToken, requireRole('seller', 'broker'), upload.array('files', 10), propertyController.createProperty);
// router.post('/favorite', verifyToken, propertyController.toggleFavorite);
// router.post('/enquiry', verifyToken, propertyController.createEnquiry);

// module.exports = router;
const express = require('express');

const router = express.Router();

const propertyController =
    require('../controllers/propertyController');

const {
    verifyToken,
    optionalVerifyToken,
    requireRole
} = require('../middleware/authMiddleware');

const upload =
    require('../middleware/uploadMiddleware');


// =====================================================
// PUBLIC PROPERTY ROUTES
// =====================================================

// Get all properties
//
// Guest:
//   works normally
//
// Logged-in buyer:
//   also returns is_favorite for each property
//

router.get(
    '/',
    optionalVerifyToken,
    propertyController.getProperties
);


// =====================================================
// AUTHENTICATED PROPERTY ROUTES
// =====================================================

// Seller / Broker's own properties

router.get(
    '/my-listings',
    verifyToken,
    requireRole('seller', 'broker'),
    propertyController.getUserProperties
);


// Logged-in user's wishlist

router.get(
    '/favorites',
    verifyToken,
    propertyController.getFavorites
);


// Logged-in user's enquiries

router.get(
    '/enquiries',
    verifyToken,
    propertyController.getEnquiries
);


// =====================================================
// CREATE PROPERTY
// =====================================================

router.post(
    '/',
    verifyToken,
    requireRole('seller', 'broker'),
    upload.array('files', 10),
    propertyController.createProperty
);


// =====================================================
// WISHLIST
// =====================================================

router.post(
    '/favorite',
    verifyToken,
    propertyController.toggleFavorite
);


// =====================================================
// PROPERTY ENQUIRY
// =====================================================

router.post(
    '/enquiry',
    verifyToken,
    propertyController.createEnquiry
);


// =====================================================
// DELETE PROPERTY
// =====================================================

// Seller / Broker can delete their own property

router.delete(
    '/:id',
    verifyToken,
    requireRole('seller', 'broker'),
    propertyController.deleteProperty
);


// =====================================================
// SINGLE PROPERTY
// =====================================================

router.get(
    '/:id',
    propertyController.getPropertyById
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;