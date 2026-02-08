/**
 * GitHub API Service
 * Fetches public profile data, repositories, and activity
 */

const axios = require('axios');

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Fetch GitHub profile and repositories for a username
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} - Profile summary with repos and languages
 */
const fetchGitHubProfile = async (username) => {
    try {
        console.log(`🔍 Fetching GitHub profile for: ${username}`);

        // Fetch user profile
        const profileResponse = await axios.get(`${GITHUB_API_BASE}/users/${username}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'UpSkill-App'
            }
        });

        const profile = profileResponse.data;

        // Fetch user's public repositories (up to 30 most recent)
        const reposResponse = await axios.get(`${GITHUB_API_BASE}/users/${username}/repos`, {
            params: {
                sort: 'updated',
                per_page: 30
            },
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'UpSkill-App'
            }
        });

        const repos = reposResponse.data;

        // Aggregate languages from repos
        const languageCount = {};
        repos.forEach(repo => {
            if (repo.language) {
                languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
            }
        });

        // Sort languages by frequency
        const primaryLanguages = Object.entries(languageCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([lang]) => lang);

        // Get recent activity (repos updated in last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const recentRepos = repos.filter(repo => {
            const updatedAt = new Date(repo.updated_at);
            return updatedAt >= sixMonthsAgo;
        });

        // Build summary
        const summary = {
            username: profile.login,
            name: profile.name || username,
            bio: profile.bio || '',
            publicRepos: profile.public_repos,
            followers: profile.followers,
            following: profile.following,
            createdAt: profile.created_at,
            primaryLanguages,
            totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
            topRepos: repos
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 5)
                .map(repo => ({
                    name: repo.name,
                    description: repo.description || 'No description',
                    language: repo.language,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    url: repo.html_url
                })),
            recentActivity: recentRepos.length,
            recentRepoNames: recentRepos.slice(0, 5).map(r => r.name)
        };

        console.log(`✅ GitHub profile fetched: ${summary.publicRepos} repos, ${primaryLanguages.length} languages`);

        return summary;

    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                throw new Error('GitHub user not found');
            }
            if (error.response.status === 403) {
                throw new Error('GitHub API rate limit exceeded. Please try again later.');
            }
        }
        console.error('❌ GitHub API error:', error.message);
        throw new Error(`Failed to fetch GitHub profile: ${error.message}`);
    }
};

module.exports = {
    fetchGitHubProfile
};
