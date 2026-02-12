const Analysis = require('../models/Analysis');
const User = require('../models/User');
const AnalysisCache = require('../models/AnalysisCache');
const { extractText, deleteFile } = require('../services/fileParser');
const { analyzeSkillGap } = require('../services/geminiService');

const COOLDOWN_SECONDS = 60;

const analyzeResume = async (req, res, next) => {
    let filePath = null;

    try {
        // Per-user cooldown check
        const user = await User.findById(req.userId);
        if (user?.lastAnalysisAt) {
            const elapsed = Math.floor((Date.now() - user.lastAnalysisAt.getTime()) / 1000);
            if (elapsed < COOLDOWN_SECONDS) {
                const remainingSeconds = COOLDOWN_SECONDS - elapsed;
                return res.status(429).json({
                    success: false,
                    message: `Please wait ${remainingSeconds} seconds before analyzing again.`,
                    remainingSeconds,
                    retryAfter: remainingSeconds
                });
            }
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a resume file (PDF or DOCX)'
            });
        }

        filePath = req.file.path;
        const mimeType = req.file.mimetype;

        const { jobDescription } = req.body;

        if (!jobDescription || jobDescription.trim().length < 50) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a detailed job description (at least 50 characters)'
            });
        }

        const resumeText = await extractText(filePath, mimeType);

        if (!resumeText || resumeText.trim().length < 100) {
            return res.status(400).json({
                success: false,
                message: 'Could not extract enough text from resume. Please ensure the file is readable.'
            });
        }

        const cacheInput = resumeText.substring(0, 5000) + jobDescription.substring(0, 3000);
        const cacheHash = AnalysisCache.generateHash(cacheInput);

        const cached = await AnalysisCache.getCache(cacheHash, 'skillGap');

        let analysisResult;
        if (cached) {
            console.log('📦 Cache hit for skill gap analysis');
            analysisResult = cached.result;
        } else {
            console.log('🔄 No cache, calling Gemini API...');
            analysisResult = await analyzeSkillGap(resumeText, jobDescription);
            await AnalysisCache.setCache(cacheHash, 'skillGap', analysisResult);
        }

        const analysis = await Analysis.create({
            user: req.userId,
            resumeText: resumeText.substring(0, 10000),
            jobDescription: jobDescription.substring(0, 5000),
            jobTitle: analysisResult.jobTitle,
            matchedSkills: analysisResult.matchedSkills,
            missingSkills: analysisResult.missingSkills,
            extraSkills: analysisResult.extraSkills,
            matchScore: analysisResult.matchScore,
            learningRoadmap: analysisResult.learningRoadmap
        });

        // Update user's last analysis timestamp
        await User.findByIdAndUpdate(req.userId, { lastAnalysisAt: new Date() });

        deleteFile(filePath);

        res.status(201).json({
            success: true,
            message: cached ? 'Analysis loaded from cache' : 'Analysis completed successfully',
            data: {
                analysis: {
                    id: analysis._id,
                    jobTitle: analysis.jobTitle,
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
        if (filePath) {
            deleteFile(filePath);
        }
        next(error);
    }
};

/**
 * Get current cooldown status for the authenticated user
 * GET /api/analysis/cooldown
 */
const getCooldownStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user?.lastAnalysisAt) {
            return res.json({ success: true, data: { onCooldown: false, remainingSeconds: 0 } });
        }

        const elapsed = Math.floor((Date.now() - user.lastAnalysisAt.getTime()) / 1000);
        const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);

        res.json({
            success: true,
            data: {
                onCooldown: remaining > 0,
                remainingSeconds: remaining
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    analyzeResume,
    getCooldownStatus
};
