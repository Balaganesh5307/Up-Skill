const Analysis = require('../models/Analysis');
const { nanoid } = require('nanoid');

/**
 * Report Controller
 * Handles public shareable reports
 */

/**
 * Generate a share link for an analysis
 * POST /api/reports/generate/:analysisId
 * Requires authentication
 */
const generateShareLink = async (req, res, next) => {
    try {
        const analysis = await Analysis.findOne({
            _id: req.params.analysisId,
            user: req.userId
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        // If shareId already exists, return it
        if (analysis.shareId) {
            return res.json({
                success: true,
                data: {
                    shareId: analysis.shareId
                }
            });
        }

        // Generate new shareId
        const shareId = nanoid(12);
        analysis.shareId = shareId;
        await analysis.save();

        res.json({
            success: true,
            data: {
                shareId
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get public report by shareId
 * GET /api/reports/:shareId
 * No authentication required
 */
const getPublicReport = async (req, res, next) => {
    try {
        const analysis = await Analysis.findOne({
            shareId: req.params.shareId
        }).select('-resumeText -jobDescription -user');

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            data: {
                report: {
                    jobTitle: analysis.jobTitle,
                    matchScore: analysis.matchScore,
                    matchedSkills: analysis.matchedSkills,
                    missingSkills: analysis.missingSkills,
                    extraSkills: analysis.extraSkills,
                    learningRoadmap: analysis.learningRoadmap,
                    createdAt: analysis.createdAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateShareLink,
    getPublicReport
};
