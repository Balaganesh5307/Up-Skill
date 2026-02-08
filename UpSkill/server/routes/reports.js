const express = require('express');
const router = express.Router();
const { generateShareLink, getPublicReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');

/**
 * Report Routes
 * Base path: /api/reports
 */

// POST /api/reports/generate/:analysisId - Generate share link (auth required)
router.post('/generate/:analysisId', auth, generateShareLink);

// GET /api/reports/:shareId - Get public report (no auth required)
router.get('/:shareId', getPublicReport);

module.exports = router;
