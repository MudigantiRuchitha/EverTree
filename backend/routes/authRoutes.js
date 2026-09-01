const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);

// Admin Legal Verification routes
router.get('/pending-verifications', authController.getPendingVerifications);
router.post('/approve-user', authController.approveUser);

module.exports = router;
