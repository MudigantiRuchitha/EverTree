const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/lead', serviceController.submitLead);
router.post('/emi-calculator', serviceController.calculateEmi);

module.exports = router;
