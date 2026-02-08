require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env file in the server directory');
    process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
const historyRoutes = require('./routes/history');
const aiRoutes = require('./routes/ai');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

connectDB();

// CORS configuration - allow multiple origins for production and development
const allowedOrigins = [
    'https://upskill-enchancer.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
