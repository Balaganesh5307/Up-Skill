const rateLimit = require('express-rate-limit');

const createRateLimiter = (options = {}) => {
    const {
        windowMs = 60 * 1000,
        max = 10,
        type = 'requests'
    } = options;

    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => req.userId || req.ip,
        handler: (req, res) => {
            const retryAfter = Math.ceil(windowMs / 1000);
            res.status(429).json({
                success: false,
                message: `Rate limit exceeded. You can make ${max} ${type} per ${retryAfter >= 60 ? Math.ceil(retryAfter / 60) + ' minute(s)' : retryAfter + ' seconds'}. Please try again later.`,
                retryAfter
            });
        }
    });
};

const aiRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    type: 'AI requests'
});

const dailyRateLimiter = createRateLimiter({
    windowMs: 24 * 60 * 60 * 1000,
    max: 100,
    type: 'daily AI requests'
});

const analysisRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 5,
    type: 'analysis requests'
});

module.exports = {
    createRateLimiter,
    aiRateLimiter,
    dailyRateLimiter,
    analysisRateLimiter
};
