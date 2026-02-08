const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Gemini AI Service
 * Handles skill extraction and gap analysis using Google's Gemini API
 */

// Use models that are confirmed to be available for this API key
const GEMINI_MODELS = ['gemini-flash-latest', 'gemini-1.5-flash', 'gemini-2.0-flash'];

/**
 * Sleep helper for retry logic
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyze skill gap between resume and job description
 * @param {string} resumeText - Extracted text from resume
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} - Analysis results
 */
const analyzeSkillGap = async (resumeText, jobDescription) => {
    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY is not set in environment variables');
        throw new Error('Gemini API key is not configured');
    }

    // Initialize the Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Craft the prompt
    const prompt = `You are an expert HR analyst and career coach. Analyze the following resume and job description to identify skill gaps.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Analyze and provide a JSON response with the following structure (respond ONLY with valid JSON, no markdown code blocks):
{
  "jobTitle": "extracted job title from JD",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "extraSkills": ["skill1", "skill2"],
  "matchScore": 75,
  "learningRoadmap": [
    {
      "skill": "skill name",
      "level": "Beginner|Intermediate|Advanced",
      "estimatedDays": 14,
      "resourceUrl": "https://free-learning-resource.com",
      "resourceName": "Resource Name"
    }
  ]
}

Instructions:
1. matchedSkills: Skills present in BOTH resume and job description
2. missingSkills: Skills required in JD but NOT found in resume
3. extraSkills: Skills in resume but NOT required in JD
4. matchScore: Percentage (0-100) of how well the resume matches
5. learningRoadmap: For EACH missing skill, provide learning resources

Be specific with skill names. Provide only real URLs for free resources.`;

    let lastError;

    // Loop through available models
    for (const modelName of GEMINI_MODELS) {
        console.log(`🔄 Initializing Gemini AI with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Retry logic for each model (for temporary 429 errors)
        const maxRetries = 2;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📤 Sending request to ${modelName} (attempt ${attempt}/${maxRetries})...`);
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                console.log(`✅ Received response from ${modelName}`);

                // Parse JSON from response
                let jsonStr = text.trim();
                if (jsonStr.startsWith('```json')) {
                    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonStr.startsWith('```')) {
                    jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                const analysis = JSON.parse(jsonStr);

                // Ensure matchScore is within bounds
                analysis.matchScore = Math.min(100, Math.max(0, analysis.matchScore || 0));

                console.log(`✅ Analysis complete. Match score: ${analysis.matchScore}%`);

                return {
                    jobTitle: analysis.jobTitle || 'Position',
                    matchedSkills: analysis.matchedSkills || [],
                    missingSkills: analysis.missingSkills || [],
                    extraSkills: analysis.extraSkills || [],
                    matchScore: analysis.matchScore,
                    learningRoadmap: analysis.learningRoadmap || []
                };

            } catch (error) {
                console.error(`❌ ${modelName} attempt ${attempt} failed:`, error.message);
                lastError = error;

                // If this model specific "limit: 0" occurs, move to NEXT model immediately
                if (error.message.includes('limit: 0')) {
                    console.log(`⚠️ ${modelName} has 0 quota. Switching model...`);
                    break; // Break the retry loop for this model, move to next model in GEMINI_MODELS
                }

                // Check if it's a temporary rate limit
                if (error.message.includes('429') || error.message.includes('quota')) {
                    if (attempt < maxRetries) {
                        const waitTime = attempt * 5000;
                        console.log(`⏳ Rate limited. Waiting ${waitTime / 1000}s...`);
                        await sleep(waitTime);
                        continue;
                    }
                }

                // If it's a "model not found" or other critical error for this specific model
                if (error.message.includes('not found') || error.message.includes('404')) {
                    break; // Move to next model
                }

                // For other errors (like API_KEY issues), throw immediately
                if (error.message.includes('API_KEY') || error.message.includes('API key')) {
                    throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY.');
                }

                // If we exhausted retries for this model, the loop will move to the next model anyway
            }
        }
    }

    // If all models failed
    console.error('❌ All models and retries failed');
    throw new Error(`AI Analysis failed: ${lastError.message}`);
};

/**
 * Rewrite resume to be ATS-friendly and optimized for a specific job description
 * @param {string} resumeText - Original resume text
 * @param {string} jobDescription - Target job description
 * @returns {Promise<Object>} - Rewritten resume sections
 */
const rewriteResumeForJob = async (resumeText, jobDescription) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `You are an expert resume writer and ATS optimization specialist. Your task is to rewrite the following resume to be highly optimized for the given job description.

ORIGINAL RESUME:
${resumeText}

TARGET JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. Analyze the job description for key skills, technologies, and requirements
2. Rewrite the resume to highlight matching qualifications
3. Use strong action verbs (Led, Developed, Implemented, Optimized, etc.)
4. Incorporate relevant keywords from the JD naturally
5. Quantify achievements where possible (percentages, numbers, metrics)
6. Ensure ATS-friendly formatting (no tables, graphics, or complex formatting)

Respond ONLY with valid JSON (no markdown code blocks) in this exact structure:
{
  "summary": "A powerful 2-3 sentence professional summary tailored to this role, highlighting key qualifications and career goals.",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "bullets": [
        "Action verb + achievement + impact/metrics",
        "Action verb + achievement + impact/metrics"
      ]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description with technologies used and impact achieved"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "Year"
    }
  ],
  "keywords": ["keyword1", "keyword2"]
}

The "keywords" array should contain the top 10 most important ATS keywords from the job description that are now incorporated into the resume.`;

    let lastError;

    for (const modelName of GEMINI_MODELS) {
        console.log(`🔄 [Rewrite] Using model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const maxRetries = 2;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📤 [Rewrite] Sending request (attempt ${attempt}/${maxRetries})...`);
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                console.log(`✅ [Rewrite] Received response`);

                let jsonStr = text.trim();
                if (jsonStr.startsWith('```json')) {
                    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonStr.startsWith('```')) {
                    jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                const rewritten = JSON.parse(jsonStr);

                console.log(`✅ [Rewrite] Resume rewritten with ${rewritten.skills?.length || 0} skills`);

                return {
                    summary: rewritten.summary || '',
                    skills: rewritten.skills || [],
                    experience: rewritten.experience || [],
                    projects: rewritten.projects || [],
                    education: rewritten.education || [],
                    keywords: rewritten.keywords || []
                };

            } catch (error) {
                console.error(`❌ [Rewrite] ${modelName} attempt ${attempt} failed:`, error.message);
                lastError = error;

                if (error.message.includes('limit: 0')) {
                    break;
                }

                if (error.message.includes('429') || error.message.includes('quota')) {
                    if (attempt < maxRetries) {
                        await sleep(attempt * 5000);
                        continue;
                    }
                }

                if (error.message.includes('not found') || error.message.includes('404')) {
                    break;
                }

                if (error.message.includes('API_KEY') || error.message.includes('API key')) {
                    throw new Error('Invalid Gemini API key.');
                }
            }
        }
    }

    throw new Error(`Resume rewrite failed: ${lastError.message}`);
};

/**
 * Generate project suggestions based on missing skills
 * @param {string[]} missingSkills - List of skills the user needs to learn
 * @param {string} jobTitle - Target job title
 * @returns {Promise<Object[]>} - Array of project suggestions
 */
const generateProjectSuggestions = async (missingSkills, jobTitle) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `You are a senior software engineering mentor. Generate 3-5 practical mini-project ideas that will help someone learn the following skills for a ${jobTitle} role.

SKILLS TO LEARN:
${missingSkills.join(', ')}

TARGET ROLE: ${jobTitle}

For each project, provide practical, portfolio-worthy ideas that are achievable in 1-4 weeks.

Respond ONLY with valid JSON (no markdown code blocks) in this exact structure:
{
  "projects": [
    {
      "title": "Project Title",
      "description": "A 2-3 sentence description of the project and what it does",
      "techStack": ["Technology1", "Technology2", "Technology3"],
      "learningOutcomes": ["What you'll learn 1", "What you'll learn 2", "What you'll learn 3"],
      "difficulty": "Beginner|Intermediate|Advanced",
      "estimatedDays": 7
    }
  ]
}

IMPORTANT:
- Projects should be practical and demonstrate real-world application of the skills
- Include a mix of difficulties
- Tech stack should include the missing skills
- Learning outcomes should be specific and measurable`;

    let lastError;

    for (const modelName of GEMINI_MODELS) {
        console.log(`🔄 [ProjectSuggestions] Using model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const maxRetries = 2;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📤 [ProjectSuggestions] Sending request (attempt ${attempt}/${maxRetries})...`);
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                console.log(`✅ [ProjectSuggestions] Received response`);

                let jsonStr = text.trim();
                if (jsonStr.startsWith('```json')) {
                    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonStr.startsWith('```')) {
                    jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                const parsed = JSON.parse(jsonStr);

                console.log(`✅ [ProjectSuggestions] Generated ${parsed.projects?.length || 0} project ideas`);

                return parsed.projects || [];

            } catch (error) {
                console.error(`❌ [ProjectSuggestions] ${modelName} attempt ${attempt} failed:`, error.message);
                lastError = error;

                if (error.message.includes('limit: 0')) {
                    break;
                }

                if (error.message.includes('429') || error.message.includes('quota')) {
                    if (attempt < maxRetries) {
                        await sleep(attempt * 5000);
                        continue;
                    }
                }

                if (error.message.includes('not found') || error.message.includes('404')) {
                    break;
                }

                if (error.message.includes('API_KEY') || error.message.includes('API key')) {
                    throw new Error('Invalid Gemini API key.');
                }
            }
        }
    }

    throw new Error(`Project suggestions failed: ${lastError.message}`);
};

/**
 * Suggest alternative job roles based on resume skills
 * @param {string} resumeText - User's resume text
 * @param {string[]} matchedSkills - Skills already matched
 * @param {string} currentJobTitle - The job they analyzed for
 * @returns {Promise<Object[]>} - Array of role suggestions
 */
const suggestAlternativeRoles = async (resumeText, matchedSkills, currentJobTitle) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `You are a senior career counselor and talent strategist. Based on the following resume, suggest 3-5 alternative job roles that this person would be a strong fit for.

RESUME:
${resumeText}

CURRENT SKILLS IDENTIFIED:
${matchedSkills.join(', ')}

ROLE THEY APPLIED FOR:
${currentJobTitle}

Suggest alternative roles they should consider based on their transferable skills and experience.

Respond ONLY with valid JSON (no markdown code blocks) in this exact structure:
{
  "roles": [
    {
      "roleName": "Job Title",
      "matchPercentage": 85,
      "fitRationale": "2-3 sentence explanation of why they're a good fit for this role based on their skills and experience",
      "skillsToAdd": ["Skill1", "Skill2"]
    }
  ]
}

IMPORTANT:
- matchPercentage should be 0-100 based on how well their current skills align
- Suggest roles that leverage their existing strengths
- skillsToAdd should be 2-4 skills that would make them even more competitive
- Order roles by matchPercentage (highest first)`;

    let lastError;

    for (const modelName of GEMINI_MODELS) {
        console.log(`🔄 [RoleSuggestions] Using model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const maxRetries = 2;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📤 [RoleSuggestions] Sending request (attempt ${attempt}/${maxRetries})...`);
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                console.log(`✅ [RoleSuggestions] Received response`);

                let jsonStr = text.trim();
                if (jsonStr.startsWith('```json')) {
                    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonStr.startsWith('```')) {
                    jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                const parsed = JSON.parse(jsonStr);

                console.log(`✅ [RoleSuggestions] Generated ${parsed.roles?.length || 0} role suggestions`);

                return parsed.roles || [];

            } catch (error) {
                console.error(`❌ [RoleSuggestions] ${modelName} attempt ${attempt} failed:`, error.message);
                lastError = error;

                if (error.message.includes('limit: 0')) break;
                if (error.message.includes('429') || error.message.includes('quota')) {
                    if (attempt < maxRetries) {
                        await sleep(attempt * 5000);
                        continue;
                    }
                }
                if (error.message.includes('not found') || error.message.includes('404')) break;
                if (error.message.includes('API_KEY') || error.message.includes('API key')) {
                    throw new Error('Invalid Gemini API key.');
                }
            }
        }
    }

    throw new Error(`Role suggestions failed: ${lastError.message}`);
};

/**
 * Analyze GitHub profile against a target role
 * @param {Object} githubData - GitHub profile summary from githubService
 * @param {string} targetRole - Target job role
 * @returns {Promise<Object>} - Analysis with strengths, gaps, and suggestions
 */
const analyzeGitHubProfile = async (githubData, targetRole) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `You are a senior tech recruiter and career advisor. Analyze this GitHub profile for someone targeting a ${targetRole} role.

GITHUB PROFILE:
- Username: ${githubData.username}
- Name: ${githubData.name}
- Bio: ${githubData.bio}
- Public Repos: ${githubData.publicRepos}
- Followers: ${githubData.followers}
- Total Stars: ${githubData.totalStars}
- Primary Languages: ${githubData.primaryLanguages.join(', ')}
- Recent Activity (repos updated in 6 months): ${githubData.recentActivity}
- Top Repos: ${githubData.topRepos.map(r => `${r.name} (${r.language}, ${r.stars} stars)`).join(', ')}

TARGET ROLE: ${targetRole}

Provide a comprehensive analysis.

Respond ONLY with valid JSON (no markdown code blocks) in this exact structure:
{
  "overallScore": 75,
  "strengths": [
    "Strength 1 based on their GitHub activity",
    "Strength 2"
  ],
  "gaps": [
    "Gap 1 compared to target role requirements",
    "Gap 2"
  ],
  "projectSuggestions": [
    {
      "title": "Project to Build",
      "description": "Why this project would help",
      "skills": ["Skill1", "Skill2"]
    }
  ],
  "repoImprovements": [
    {
      "repoName": "existing-repo-name",
      "suggestion": "How to improve this repository"
    }
  ],
  "actionItems": [
    "Specific action item 1",
    "Specific action item 2"
  ]
}

IMPORTANT:
- overallScore should be 0-100 based on how well their GitHub demonstrates readiness for the target role
- Be specific and actionable in your suggestions
- Reference their actual repos and languages when possible`;

    let lastError;

    for (const modelName of GEMINI_MODELS) {
        console.log(`🔄 [GitHubAnalysis] Using model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const maxRetries = 2;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📤 [GitHubAnalysis] Sending request (attempt ${attempt}/${maxRetries})...`);
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                console.log(`✅ [GitHubAnalysis] Received response`);

                let jsonStr = text.trim();
                if (jsonStr.startsWith('```json')) {
                    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonStr.startsWith('```')) {
                    jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                const parsed = JSON.parse(jsonStr);

                console.log(`✅ [GitHubAnalysis] Analysis complete: ${parsed.overallScore}% match`);

                return {
                    overallScore: parsed.overallScore || 0,
                    strengths: parsed.strengths || [],
                    gaps: parsed.gaps || [],
                    projectSuggestions: parsed.projectSuggestions || [],
                    repoImprovements: parsed.repoImprovements || [],
                    actionItems: parsed.actionItems || []
                };

            } catch (error) {
                console.error(`❌ [GitHubAnalysis] ${modelName} attempt ${attempt} failed:`, error.message);
                lastError = error;

                if (error.message.includes('limit: 0')) break;
                if (error.message.includes('429') || error.message.includes('quota')) {
                    if (attempt < maxRetries) {
                        await sleep(attempt * 5000);
                        continue;
                    }
                }
                if (error.message.includes('not found') || error.message.includes('404')) break;
                if (error.message.includes('API_KEY') || error.message.includes('API key')) {
                    throw new Error('Invalid Gemini API key.');
                }
            }
        }
    }

    throw new Error(`GitHub analysis failed: ${lastError.message}`);
};

module.exports = {
    analyzeSkillGap,
    rewriteResumeForJob,
    generateProjectSuggestions,
    suggestAlternativeRoles,
    analyzeGitHubProfile
};
