const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyOTP, resendOTP, googleAuth } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);

module.exports = router;
