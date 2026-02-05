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

module.exports = {
    analyzeSkillGap
};
