const Analysis = require('../models/Analysis');

/**
 * History Controller
 * Handles viewing and managing past analyses
 */

/**
 * Get all analyses for current user
 * GET /api/history
 */
const getHistory = async (req, res, next) => {
    try {
        const analyses = await Analysis.find({ user: req.userId })
            .select('jobTitle matchScore matchedSkills missingSkills createdAt')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            data: {
                count: analyses.length,
                analyses: analyses.map(a => ({
                    id: a._id,
                    jobTitle: a.jobTitle,
                    matchScore: a.matchScore,
                    matchedCount: a.matchedSkills.length,
                    missingCount: a.missingSkills.length,
                    createdAt: a.createdAt
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single analysis by ID
 * GET /api/history/:id
 */
const getAnalysis = async (req, res, next) => {
    try {
        const analysis = await Analysis.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        res.json({
            success: true,
            data: {
                analysis: {
                    id: analysis._id,
                    jobTitle: analysis.jobTitle,
                    jobDescription: analysis.jobDescription,
                    matchedSkills: analysis.matchedSkills,
                    missingSkills: analysis.missingSkills,
                    extraSkills: analysis.extraSkills,
                    matchScore: analysis.matchScore,
                    learningRoadmap: analysis.learningRoadmap,
                    createdAt: analysis.createdAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete analysis by ID
 * DELETE /api/history/:id
 */
const deleteAnalysis = async (req, res, next) => {
    try {
        const analysis = await Analysis.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        res.json({
            success: true,
            message: 'Analysis deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete all analyses for current user
 * DELETE /api/history
 */
const deleteAllHistory = async (req, res, next) => {
    try {
        await Analysis.deleteMany({ user: req.userId });

        res.json({
            success: true,
            message: 'All analysis history deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getHistory,
    getAnalysis,
    deleteAnalysis,
    deleteAllHistory
};
