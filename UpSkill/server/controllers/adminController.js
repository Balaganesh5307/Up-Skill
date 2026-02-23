const User = require('../models/User');
const Analysis = require('../models/Analysis');

const getAdminStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAnalyses = await Analysis.countDocuments();
        const googleUsers = await User.countDocuments({ authProvider: 'google' });
        const localUsers = await User.countDocuments({ authProvider: 'local' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
        const analysesToday = await Analysis.countDocuments({ createdAt: { $gte: today } });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newUsersWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const analysesWeek = await Analysis.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        const avgScoreResult = await Analysis.aggregate([
            { $group: { _id: null, avgScore: { $avg: '$matchScore' } } }
        ]);
        const avgMatchScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email authProvider role createdAt profileImage');

        const recentAnalyses = await Analysis.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .select('jobTitle matchScore createdAt user');

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalAnalyses,
                    googleUsers,
                    localUsers,
                    newUsersToday,
                    analysesToday,
                    newUsersWeek,
                    analysesWeek,
                    avgMatchScore
                },
                recentUsers,
                recentAnalyses
            }
        });
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const filter = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const [users, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('name email authProvider role createdAt profileImage googleId'),
            User.countDocuments(filter)
        ]);

        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const analysisCount = await Analysis.countDocuments({ user: user._id });
                return {
                    ...user.toObject(),
                    analysisCount
                };
            })
        );

        res.json({
            success: true,
            data: {
                users: usersWithStats,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (userId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own admin account'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await Analysis.deleteMany({ user: userId });
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: `User "${user.name}" and their data have been deleted`
        });
    } catch (error) {
        next(error);
    }
};

const updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "user" or "admin"'
            });
        }

        if (userId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own role'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('name email role');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User "${user.name}" role updated to ${role}`,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminStats,
    getAllUsers,
    deleteUser,
    updateUserRole
};
