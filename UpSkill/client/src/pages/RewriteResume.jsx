import { useState } from 'react';
import { Card, Button, Spinner } from '../components/common';
import api from '../services/api';

const RewriteResume = () => {
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [rewrittenResume, setRewrittenResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setRewrittenResume(null);

        try {
            const response = await api.post('/ai/rewrite-resume', {
                resumeText,
                jobDescription
            });

            if (response.data.success) {
                setRewrittenResume(response.data.data.resume);
            }
        } catch (err) {
            const errorData = err.response?.data;
            if (err.response?.status === 429) {
                const retryAfter = errorData?.retryAfter || 60;
                setError(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
            } else {
                setError(errorData?.message || 'Failed to rewrite resume. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatResumeText = () => {
        if (!rewrittenResume) return '';

        let text = '';

        if (rewrittenResume.summary) {
            text += `PROFESSIONAL SUMMARY\n${'─'.repeat(40)}\n${rewrittenResume.summary}\n\n`;
        }

        if (rewrittenResume.skills?.length) {
            text += `SKILLS\n${'─'.repeat(40)}\n${rewrittenResume.skills.join(' • ')}\n\n`;
        }

        if (rewrittenResume.experience?.length) {
            text += `EXPERIENCE\n${'─'.repeat(40)}\n`;
            rewrittenResume.experience.forEach(exp => {
                text += `${exp.title} | ${exp.company}\n${exp.duration}\n`;
                exp.bullets?.forEach(bullet => {
                    text += `• ${bullet}\n`;
                });
                text += '\n';
            });
        }

        if (rewrittenResume.projects?.length) {
            text += `PROJECTS\n${'─'.repeat(40)}\n`;
            rewrittenResume.projects.forEach(proj => {
                text += `${proj.name}\n${proj.description}\n\n`;
            });
        }

        if (rewrittenResume.education?.length) {
            text += `EDUCATION\n${'─'.repeat(40)}\n`;
            rewrittenResume.education.forEach(edu => {
                text += `${edu.degree} - ${edu.institution} (${edu.year})\n`;
            });
        }

        return text;
    };

    const handleCopy = async () => {
        const text = formatResumeText();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const text = formatResumeText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'optimized_resume.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto px-6 py-12 max-w-7xl animate-premium-fade-in">
            <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm mb-6">
                    AI-Powered Optimization
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight mb-4">
                    Resume Rewriter
                </h1>
                <p className="text-neutral-500 font-medium text-lg max-w-2xl mx-auto">
                    Transform your resume to be ATS-friendly and perfectly tailored for your target job description.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-neutral-700 mb-3 uppercase tracking-widest">
                                    Your Resume Text
                                </label>
                                <textarea
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    placeholder="Paste your current resume text here..."
                                    rows={10}
                                    className="w-full px-5 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-50 transition-all duration-300 text-sm font-medium resize-none"
                                    required
                                />
                                <p className="text-xs text-neutral-400 mt-2 font-medium">
                                    Minimum 100 characters required
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-neutral-700 mb-3 uppercase tracking-widest">
                                    Target Job Description
                                </label>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the job description you're applying for..."
                                    rows={8}
                                    className="w-full px-5 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl focus:outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-50 transition-all duration-300 text-sm font-medium resize-none"
                                    required
                                />
                                <p className="text-xs text-neutral-400 mt-2 font-medium">
                                    Minimum 50 characters required
                                </p>
                            </div>

                            {error && (
                                <div className="bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest px-4 py-3 rounded-xl border border-rose-100">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-14 shadow-lg shadow-fuchsia-100 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700"
                                disabled={loading || resumeText.length < 100 || jobDescription.length < 50}
                                isLoading={loading}
                            >
                                {loading ? 'Rewriting with AI...' : 'Rewrite Resume for this Job'}
                            </Button>
                        </form>
                    </Card>
                </div>

                <div className="space-y-6">
                    {loading && (
                        <Card className="p-12 flex flex-col items-center justify-center text-center">
                            <Spinner size="lg" />
                            <p className="mt-6 text-neutral-500 font-medium">
                                AI is optimizing your resume...
                            </p>
                            <p className="text-xs text-neutral-400 mt-2">
                                This may take up to 30 seconds
                            </p>
                        </Card>
                    )}

                    {rewrittenResume && !loading && (
                        <Card className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-neutral-900">Optimized Resume</h3>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCopy}
                                        className="px-4 py-2 text-xs font-black uppercase tracking-widest text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all"
                                    >
                                        {copied ? '✓ Copied!' : 'Copy'}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="px-4 py-2 text-xs font-black uppercase tracking-widest text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>

                            {rewrittenResume.keywords?.length > 0 && (
                                <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-2">
                                        ATS Keywords Incorporated
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {rewrittenResume.keywords.map((kw, i) => (
                                            <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {rewrittenResume.summary && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-3">Professional Summary</h4>
                                    <p className="text-neutral-700 font-medium leading-relaxed bg-neutral-50 p-4 rounded-xl">{rewrittenResume.summary}</p>
                                </div>
                            )}

                            {rewrittenResume.skills?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-3">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {rewrittenResume.skills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold border border-sky-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {rewrittenResume.experience?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-3">Experience</h4>
                                    <div className="space-y-4">
                                        {rewrittenResume.experience.map((exp, i) => (
                                            <div key={i} className="bg-neutral-50 p-4 rounded-xl">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-black text-neutral-900">{exp.title}</p>
                                                        <p className="text-sm text-neutral-500 font-medium">{exp.company}</p>
                                                    </div>
                                                    <span className="text-xs text-neutral-400 font-bold">{exp.duration}</span>
                                                </div>
                                                <ul className="space-y-1 mt-3">
                                                    {exp.bullets?.map((bullet, j) => (
                                                        <li key={j} className="text-sm text-neutral-600 font-medium flex items-start">
                                                            <span className="text-sky-500 mr-2">•</span>
                                                            {bullet}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {rewrittenResume.projects?.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-3">Projects</h4>
                                    <div className="space-y-3">
                                        {rewrittenResume.projects.map((proj, i) => (
                                            <div key={i} className="bg-neutral-50 p-4 rounded-xl">
                                                <p className="font-black text-neutral-900 mb-1">{proj.name}</p>
                                                <p className="text-sm text-neutral-600 font-medium">{proj.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {rewrittenResume.education?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-3">Education</h4>
                                    <div className="space-y-2">
                                        {rewrittenResume.education.map((edu, i) => (
                                            <div key={i} className="bg-neutral-50 p-4 rounded-xl flex justify-between items-center">
                                                <div>
                                                    <p className="font-black text-neutral-900">{edu.degree}</p>
                                                    <p className="text-sm text-neutral-500 font-medium">{edu.institution}</p>
                                                </div>
                                                <span className="text-xs text-neutral-400 font-bold">{edu.year}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {!rewrittenResume && !loading && (
                        <Card className="p-12 flex flex-col items-center justify-center text-center bg-neutral-50/50 border-dashed border-2">
                            <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mb-6 text-neutral-400">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-black text-neutral-900 mb-2">Your Optimized Resume</h4>
                            <p className="text-neutral-500 font-medium max-w-sm">
                                Paste your resume and job description, then click "Rewrite" to see your ATS-optimized resume here.
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RewriteResume;
