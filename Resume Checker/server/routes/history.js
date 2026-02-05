const express = require('express');
const router = express.Router();
const { getHistory, getAnalysis, deleteAnalysis, deleteAllHistory } = require('../controllers/historyController');
const auth = require('../middleware/auth');

/**
 * History Routes
 * Base path: /api/history
 * All routes are protected
 */

// GET /api/history - Get all analyses for current user
router.get('/', auth, getHistory);

// GET /api/history/:id - Get single analysis by ID
router.get('/:id', auth, getAnalysis);

// DELETE /api/history - Delete all analyses for current user
router.delete('/', auth, deleteAllHistory);

// DELETE /api/history/:id - Delete analysis by ID
router.delete('/:id', auth, deleteAnalysis);

module.exports = router;
