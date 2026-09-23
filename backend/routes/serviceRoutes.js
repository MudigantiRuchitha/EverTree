const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/lead', verifyToken, serviceController.submitLead);
router.post('/emi-calculator', serviceController.calculateEmi);
router.get('/broker-requests', verifyToken, serviceController.getBrokerRequests);

module.exports = router;
