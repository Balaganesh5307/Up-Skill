const express = require('express');
const router = express.Router();
const { rewriteResume, getProjectSuggestions, getRoleSuggestions, getGitHubAnalysis } = require('../controllers/rewriteController');
const auth = require('../middleware/auth');
const { aiRateLimiter, dailyRateLimiter } = require('../middleware/rateLimiter');

router.post('/rewrite-resume', auth, dailyRateLimiter, aiRateLimiter, rewriteResume);
router.post('/project-suggestions', auth, dailyRateLimiter, aiRateLimiter, getProjectSuggestions);
router.post('/role-suggestions', auth, dailyRateLimiter, aiRateLimiter, getRoleSuggestions);
router.post('/github-analysis', auth, dailyRateLimiter, aiRateLimiter, getGitHubAnalysis);

module.exports = router;
