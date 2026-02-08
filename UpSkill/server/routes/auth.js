const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', auth, getProfile);

module.exports = router;
