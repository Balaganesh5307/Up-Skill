const express = require('express');
const router = express.Router();
const { register, login, getProfile, googleAuth, googleCallback } = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', auth, getProfile);

// GET /api/auth/google - Initiate Google OAuth
router.get('/google', googleAuth);

// GET /api/auth/google/callback - Google OAuth callback
router.get('/google/callback', googleCallback);

module.exports = router;
