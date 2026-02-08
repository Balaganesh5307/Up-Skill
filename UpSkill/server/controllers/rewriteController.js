const { rewriteResumeForJob, generateProjectSuggestions, suggestAlternativeRoles, analyzeGitHubProfile } = require('../services/geminiService');
const { fetchGitHubProfile } = require('../services/githubService');
const AnalysisCache = require('../models/AnalysisCache');

const rewriteResume = async (req, res, next) => {
    try {
        const { resumeText, jobDescription } = req.body;

        if (!resumeText || resumeText.trim().length < 100) {
            return res.status(400).json({
                success: false,
                message: 'Please provide resume text (at least 100 characters)'
            });
        }

        if (!jobDescription || jobDescription.trim().length < 50) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a job description (at least 50 characters)'
            });
        }

        const cacheInput = resumeText.substring(0, 5000) + jobDescription.substring(0, 3000);
        const cacheHash = AnalysisCache.generateHash(cacheInput);

        const cached = await AnalysisCache.getCache(cacheHash, 'rewrite');

        let rewrittenResume;
        if (cached) {
            console.log('📦 Cache hit for resume rewrite');
            rewrittenResume = cached.result;
        } else {
            console.log('📝 Starting resume rewrite...');
            rewrittenResume = await rewriteResumeForJob(resumeText.trim(), jobDescription.trim());
            await AnalysisCache.setCache(cacheHash, 'rewrite', rewrittenResume);
        }

        res.json({
            success: true,
            message: cached ? 'Resume loaded from cache' : 'Resume rewritten successfully',
            data: { resume: rewrittenResume }
        });
    } catch (error) {
        console.error('❌ Resume rewrite error:', error.message);
        next(error);
    }
};

const getProjectSuggestions = async (req, res, next) => {
    try {
        const { missingSkills, jobTitle } = req.body;

        if (!missingSkills || !Array.isArray(missingSkills) || missingSkills.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one missing skill'
            });
        }

        if (!jobTitle || jobTitle.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid job title'
            });
        }

        const cacheInput = missingSkills.sort().join(',') + jobTitle;
        const cacheHash = AnalysisCache.generateHash(cacheInput);

        const cached = await AnalysisCache.getCache(cacheHash, 'project');

        let projects;
        if (cached) {
            console.log('📦 Cache hit for project suggestions');
            projects = cached.result;
        } else {
            console.log(`💡 Generating project suggestions for: ${missingSkills.join(', ')}`);
            projects = await generateProjectSuggestions(missingSkills, jobTitle.trim());
            await AnalysisCache.setCache(cacheHash, 'project', projects);
        }

        res.json({
            success: true,
            message: cached ? 'Projects loaded from cache' : 'Project suggestions generated successfully',
            data: { projects }
        });
    } catch (error) {
        console.error('❌ Project suggestions error:', error.message);
        next(error);
    }
};

const getRoleSuggestions = async (req, res, next) => {
    try {
        const { resumeText, matchedSkills, jobTitle } = req.body;

        if (!resumeText || resumeText.trim().length < 100) {
            return res.status(400).json({
                success: false,
                message: 'Please provide resume text (at least 100 characters)'
            });
        }

        if (!matchedSkills || !Array.isArray(matchedSkills)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide matched skills array'
            });
        }

        if (!jobTitle || jobTitle.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid job title'
            });
        }

        const cacheInput = matchedSkills.sort().join(',') + jobTitle + resumeText.substring(0, 500);
        const cacheHash = AnalysisCache.generateHash(cacheInput);

        const cached = await AnalysisCache.getCache(cacheHash, 'role');

        let roles;
        if (cached) {
            console.log('📦 Cache hit for role suggestions');
            roles = cached.result;
        } else {
            console.log(`🎯 Generating role suggestions for ${jobTitle}...`);
            roles = await suggestAlternativeRoles(resumeText.trim(), matchedSkills, jobTitle.trim());
            await AnalysisCache.setCache(cacheHash, 'role', roles);
        }

        res.json({
            success: true,
            message: cached ? 'Roles loaded from cache' : 'Role suggestions generated successfully',
            data: { roles }
        });
    } catch (error) {
        console.error('❌ Role suggestions error:', error.message);
        next(error);
    }
};

const getGitHubAnalysis = async (req, res, next) => {
    try {
        const { username, targetRole } = req.body;

        if (!username || username.trim().length < 1) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a GitHub username'
            });
        }

        const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
        if (!usernameRegex.test(username.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid GitHub username format'
            });
        }

        if (!targetRole || targetRole.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a target role'
            });
        }

        const cacheInput = username.toLowerCase() + targetRole.toLowerCase();
        const cacheHash = AnalysisCache.generateHash(cacheInput);

        const cached = await AnalysisCache.getCache(cacheHash, 'github');

        if (cached) {
            console.log('📦 Cache hit for GitHub analysis');
            return res.json({
                success: true,
                message: 'Analysis loaded from cache',
                data: cached.result
            });
        }

        console.log(`🐙 Analyzing GitHub profile: ${username} for ${targetRole}`);

        const githubData = await fetchGitHubProfile(username.trim());
        const analysis = await analyzeGitHubProfile(githubData, targetRole.trim());

        const result = { profile: githubData, analysis };
        await AnalysisCache.setCache(cacheHash, 'github', result);

        res.json({
            success: true,
            message: 'GitHub profile analyzed successfully',
            data: result
        });
    } catch (error) {
        console.error('❌ GitHub analysis error:', error.message);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: 'GitHub user not found'
            });
        }
        if (error.message.includes('rate limit')) {
            return res.status(429).json({
                success: false,
                message: 'GitHub API rate limit exceeded. Please try again later.'
            });
        }

        next(error);
    }
};

module.exports = {
    rewriteResume,
    getProjectSuggestions,
    getRoleSuggestions,
    getGitHubAnalysis
};
