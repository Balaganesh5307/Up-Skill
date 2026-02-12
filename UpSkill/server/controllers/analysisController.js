const Analysis = require('../models/Analysis');
const AnalysisCache = require('../models/AnalysisCache');
const { extractText, deleteFile } = require('../services/fileParser');
const { analyzeSkillGap } = require('../services/geminiService');

const analyzeResume = async (req, res, next) => {
    let filePath = null;

    try {
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

module.exports = {
    analyzeResume
};
