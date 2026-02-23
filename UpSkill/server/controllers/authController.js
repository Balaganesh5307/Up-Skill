const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            authProvider: 'local'
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (user.authProvider === 'google' && !user.password) {
            return res.status(400).json({
                success: false,
                message: 'This account uses Google Sign-In. Please use "Continue with Google" to log in.'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    profileImage: req.user.profileImage,
                    authProvider: req.user.authProvider,
                    role: req.user.role,
                    createdAt: req.user.createdAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const googleAuth = (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(503).json({
            success: false,
            message: 'Google authentication is not configured on this server.'
        });
    }
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })(req, res, next);
};

const googleCallback = (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        return res.redirect(`${clientUrl}/login?error=google_not_configured`);
    }
    passport.authenticate('google', { session: false, failureRedirect: '/login' }, (err, user) => {
        if (err || !user) {
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
        }

        const token = generateToken(user._id);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/auth/google/callback?token=${token}`);
    })(req, res, next);
};

module.exports = {
    register,
    login,
    getProfile,
    googleAuth,
    googleCallback
};
