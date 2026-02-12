const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { analyzeResume } = require('../controllers/analysisController');
const auth = require('../middleware/auth');
const { analysisRateLimiter, dailyRateLimiter } = require('../middleware/rateLimiter');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

router.post('/analyze', auth, dailyRateLimiter, analysisRateLimiter, upload.single('resume'), analyzeResume);

module.exports = router;
