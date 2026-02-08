import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Spinner } from '../components/common';
import { ProgressBar, SkillTag, RoadmapCard } from '../components/features';
import api from '../services/api';

const SharedReport = () => {
    const { shareId } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get(`/reports/${shareId}`);
                setReport(response.data.data.report);
            } catch (err) {
                setError(err.response?.data?.message || 'Report not found');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [shareId]);

    if (loading) return (
        <div className="container mx-auto px-4 py-20 flex justify-center">
            <Spinner size="lg" />
        </div>
    );

    if (error) return (
        <div className="container mx-auto px-4 py-20 text-center">
            <Card className="max-w-md mx-auto py-12">
                <h2 className="text-2xl font-black text-neutral-900 mb-4">Report Not Found</h2>
                <p className="text-neutral-500 mb-8">{error}</p>
                <Link to="/" className="text-[#0ea5e9] font-semibold hover:underline">
                    Go to Homepage
                </Link>
            </Card>
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl animate-premium-fade-in">
            <div className="flex flex-col md:flex-row items-start justify-between mb-16 gap-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-violet-50 text-violet-700 text-[10px] font-black uppercase tracking-widest border border-violet-100">
                        Shared Report
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-neutral-900 leading-tight tracking-tight">
                        Analysis for <br />
                        <span className="text-[#0ea5e9] underline decoration-[#0ea5e9]/20 underline-offset-8">
                            {report.jobTitle}
                        </span>
                    </h1>
                    <p className="text-neutral-500 font-medium text-lg max-w-xl leading-relaxed">
                        This is a public view of a skill gap analysis. Create your own at UpSkill!
                    </p>
                </div>

                <Card className="flex flex-col items-center justify-center p-6 sm:p-10 w-full sm:min-w-[280px] border-none bg-neutral-900 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9] blur-[80px] opacity-30 rounded-full" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-4 relative z-10">Overall Match</span>
                    <div className="relative z-10">
                        <span className="text-5xl sm:text-7xl font-black text-white">{report.matchScore}</span>
                        <span className="text-2xl font-black text-[#0ea5e9] ml-1">%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9] mt-4 relative z-10">Gemini AI Score</p>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-20">
                <Card title="Matched Skills" subtitle="Skills found in both resume and job description" accent>
                    <div className="flex flex-wrap gap-3">
                        {report.matchedSkills.map((skill, i) => (
                            <SkillTag key={i} name={skill} type="matched" />
                        ))}
                        {report.matchedSkills.length === 0 && <p className="text-neutral-400 font-medium italic">No direct matches found.</p>}
                    </div>
                </Card>

                <Card title="Missing Skills" subtitle="Skills needed to improve match" accent className="border-t-rose-500">
                    <div className="flex flex-wrap gap-3">
                        {report.missingSkills.map((skill, i) => (
                            <SkillTag key={i} name={skill} type="missing" />
                        ))}
                        {report.missingSkills.length === 0 && <p className="text-emerald-500 font-medium italic">All required skills present!</p>}
                    </div>
                </Card>
            </div>

            {report.learningRoadmap && report.learningRoadmap.length > 0 && (
                <section className="space-y-10 animate-premium-slide-up" style={{ animationDelay: '400ms' }}>
                    <div className="px-2">
                        <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mb-2">
                            Learning Roadmap
                        </h2>
                        <p className="text-neutral-500 font-medium">
                            Suggested resources to bridge the skill gaps.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {report.learningRoadmap.map((item, i) => (
                            <RoadmapCard key={i} item={item} index={i} />
                        ))}
                    </div>
                </section>
            )}

            <div className="mt-20 text-center">
                <Link to="/">
                    <button className="px-8 py-4 bg-neutral-900 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-neutral-800 transition-all shadow-lg">
                        Create Your Own Analysis
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default SharedReport;
