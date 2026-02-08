import { useState } from 'react';
import { Button, Card, Spinner } from '../components/common';
import api from '../services/api';

const GitHubAnalyzer = () => {
    const [username, setUsername] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (!username.trim()) {
            setError('Please enter a GitHub username');
            return;
        }

        if (!targetRole.trim()) {
            setError('Please enter a target role');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/ai/github-analysis', {
                username: username.trim(),
                targetRole: targetRole.trim()
            });

            if (response.data.success) {
                setResult(response.data.data);
            }
        } catch (err) {
            const errorData = err.response?.data;
            if (err.response?.status === 429) {
                const retryAfter = errorData?.retryAfter || 60;
                setError(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
            } else {
                setError(errorData?.message || 'Failed to analyze GitHub profile');
            }
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'from-emerald-500 to-teal-600';
        if (score >= 60) return 'from-sky-500 to-blue-600';
        if (score >= 40) return 'from-amber-500 to-orange-600';
        return 'from-rose-500 to-pink-600';
    };

    return (
        <div className="container mx-auto px-6 py-12 max-w-7xl animate-premium-fade-in">
            <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest mb-6">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub Analyzer</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight">
                    Analyze Your <span className="text-[#0ea5e9]">GitHub</span>
                </h1>
                <p className="text-neutral-500 font-medium text-lg max-w-2xl mx-auto">
                    Get AI-powered insights on how your GitHub profile stacks up against your target role.
                </p>
            </div>

            <Card className="max-w-2xl mx-auto mb-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-black text-neutral-700 mb-2">
                            GitHub Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g., octocat"
                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-sky-400 focus:ring-0 outline-none font-medium transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-neutral-700 mb-2">
                            Target Role
                        </label>
                        <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g., Full Stack Developer"
                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-sky-400 focus:ring-0 outline-none font-medium transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="bg-rose-50 text-rose-600 text-sm font-bold px-4 py-3 rounded-xl border border-rose-100">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-neutral-900 hover:bg-neutral-800"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <Spinner size="sm" className="mr-2" />
                                Analyzing...
                            </span>
                        ) : (
                            'Analyze Profile'
                        )}
                    </Button>
                </form>
            </Card>

            {result && (
                <div className="space-y-8 animate-premium-slide-up">
                    <div className="grid lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                                    {result.profile.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-neutral-900">{result.profile.name}</h3>
                                    <p className="text-neutral-500 font-medium">@{result.profile.username}</p>
                                    {result.profile.bio && (
                                        <p className="text-neutral-600 font-medium mt-2">{result.profile.bio}</p>
                                    )}
                                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                                        <span className="font-bold text-neutral-600">
                                            <span className="text-neutral-900">{result.profile.publicRepos}</span> repos
                                        </span>
                                        <span className="font-bold text-neutral-600">
                                            <span className="text-neutral-900">{result.profile.followers}</span> followers
                                        </span>
                                        <span className="font-bold text-neutral-600">
                                            <span className="text-neutral-900">{result.profile.totalStars}</span> stars
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Primary Languages</p>
                                <div className="flex flex-wrap gap-2">
                                    {result.profile.primaryLanguages.map((lang, i) => (
                                        <span key={i} className="px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-sm font-bold border border-sky-100">
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <Card className={`flex flex-col items-center justify-center p-8 text-white bg-gradient-to-br ${getScoreColor(result.analysis.overallScore)}`}>
                            <span className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Role Match</span>
                            <span className="text-6xl font-black">{result.analysis.overallScore}</span>
                            <span className="text-2xl font-black opacity-80">%</span>
                            <p className="text-xs font-bold mt-2 opacity-80">{targetRole}</p>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <Card title="Strengths" subtitle="What you're doing well" accent>
                            <ul className="space-y-3">
                                {result.analysis.strengths.map((strength, i) => (
                                    <li key={i} className="flex items-start text-sm font-medium text-neutral-700">
                                        <span className="text-emerald-500 mr-2 mt-0.5">✓</span>
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card title="Gaps" subtitle="Areas to improve" accent className="border-t-rose-500">
                            <ul className="space-y-3">
                                {result.analysis.gaps.map((gap, i) => (
                                    <li key={i} className="flex items-start text-sm font-medium text-neutral-700">
                                        <span className="text-rose-500 mr-2 mt-0.5">○</span>
                                        {gap}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    {result.analysis.projectSuggestions?.length > 0 && (
                        <div>
                            <h3 className="text-2xl font-black text-neutral-900 mb-4">Suggested Projects</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {result.analysis.projectSuggestions.map((project, i) => (
                                    <Card key={i} className="hover:border-sky-200 transition-colors">
                                        <h4 className="font-black text-neutral-900 mb-2">{project.title}</h4>
                                        <p className="text-sm text-neutral-600 font-medium mb-3">{project.description}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {project.skills?.map((skill, j) => (
                                                <span key={j} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs font-bold">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.analysis.repoImprovements?.length > 0 && (
                        <div>
                            <h3 className="text-2xl font-black text-neutral-900 mb-4">Repository Improvements</h3>
                            <div className="space-y-3">
                                {result.analysis.repoImprovements.map((repo, i) => (
                                    <Card key={i} className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-neutral-900">{repo.repoName}</h4>
                                            <p className="text-sm text-neutral-600 font-medium">{repo.suggestion}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.analysis.actionItems?.length > 0 && (
                        <Card title="Action Items" subtitle="Your next steps" className="bg-neutral-900 text-white border-none">
                            <ul className="space-y-3">
                                {result.analysis.actionItems.map((item, i) => (
                                    <li key={i} className="flex items-start text-sm font-medium text-neutral-300">
                                        <span className="text-sky-400 mr-3 font-black">{i + 1}.</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default GitHubAnalyzer;
