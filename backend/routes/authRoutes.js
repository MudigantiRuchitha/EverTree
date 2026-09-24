const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);

// Admin Legal Verification routes
router.post(
  '/change-password',
  verifyToken,
  authController.changePassword
); 

router.get(
  '/pending-verifications',
  verifyToken,
  requireRole('admin'),
  authController.getPendingVerifications
);

router.post(
  '/approve-user',
  verifyToken,
  requireRole('admin'),
  authController.approveUser
);

module.exports = router;
