import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Card, Spinner } from '../components/common';
import { ProgressBar, SkillTag, RoadmapCard, ProjectCard, RoleCard } from '../components/features';
import api from '../services/api';

const Results = () => {
    const { id } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [projectsError, setProjectsError] = useState('');
    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [rolesError, setRolesError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await api.get(`/history/${id}`);
                setAnalysis(response.data.data.analysis);
            } catch (err) {
                console.error('Error fetching results:', err);
                setError('Failed to load analysis results. It might have been deleted.');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [id]);

    const fetchProjectSuggestions = async () => {
        if (!analysis || analysis.missingSkills?.length === 0) return;
        setProjectsLoading(true);
        setProjectsError('');
        try {
            const response = await api.post('/ai/project-suggestions', {
                missingSkills: analysis.missingSkills,
                jobTitle: analysis.jobTitle
            });
            if (response.data.success) {
                setProjects(response.data.data.projects);
            }
        } catch (err) {
            const errorData = err.response?.data;
            if (err.response?.status === 429) {
                const retryAfter = errorData?.retryAfter || 60;
                setProjectsError(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
            } else {
                setProjectsError('Failed to generate project suggestions.');
            }
            console.error('Project suggestions error:', err);
        } finally {
            setProjectsLoading(false);
        }
    };

    const fetchRoleSuggestions = async () => {
        if (!analysis) return;
        setRolesLoading(true);
        setRolesError('');
        try {
            const response = await api.post('/ai/role-suggestions', {
                resumeText: `Skills: ${analysis.matchedSkills?.join(', ')}. Missing skills for ${analysis.jobTitle}: ${analysis.missingSkills?.join(', ')}`,
                matchedSkills: analysis.matchedSkills || [],
                jobTitle: analysis.jobTitle
            });
            if (response.data.success) {
                setRoles(response.data.data.roles);
            }
        } catch (err) {
            const errorData = err.response?.data;
            if (err.response?.status === 429) {
                const retryAfter = errorData?.retryAfter || 60;
                setRolesError(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
            } else {
                setRolesError('Failed to generate role suggestions.');
            }
            console.error('Role suggestions error:', err);
        } finally {
            setRolesLoading(false);
        }
    };

    if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;
    if (error) return (
        <div className="container mx-auto px-6 py-20 text-center animate-premium-fade-in">
            <Card className="max-w-md mx-auto py-12">
                <h2 className="text-2xl font-black text-neutral-900 mb-4">Error</h2>
                <p className="text-neutral-500 mb-8">{error}</p>
                <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
            </Card>
        </div>
    );

    return (
        <div className="container mx-auto px-6 py-12 max-w-7xl animate-premium-fade-in">
            <div className="flex flex-col md:flex-row items-start justify-between mb-16 gap-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        Analysis Complete
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-neutral-900 leading-tight tracking-tight">
                        Analysis for <br />
                        <span className="text-[#0ea5e9] underline decoration-[#0ea5e9]/20 underline-offset-8">
                            {analysis.jobTitle}
                        </span>
                    </h1>
                    <p className="text-neutral-500 font-medium text-lg max-w-xl leading-relaxed">
                        We've identified how your skills map to this role. Use the roadmap below to close any identified gaps.
                    </p>
                </div>

                <Card className="flex flex-col items-center justify-center p-10 min-w-[280px] border-none bg-neutral-900 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9] blur-[80px] opacity-30 rounded-full" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-4 relative z-10">Overall Match</span>
                    <div className="relative z-10">
                        <span className="text-7xl font-black text-white">{analysis.matchScore}</span>
                        <span className="text-2xl font-black text-[#0ea5e9] ml-1">%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0ea5e9] mt-4 relative z-10">Gemini AI Score</p>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-20">
                <Card title="Matched Skills" subtitle="Skills found in both your resume and the JD" accent>
                    <div className="flex flex-wrap gap-3">
                        {analysis.matchedSkills.map((skill, i) => (
                            <SkillTag key={i} name={skill} type="matched" />
                        ))}
                        {analysis.matchedSkills.length === 0 && <p className="text-neutral-400 font-medium italic">No direct matches found.</p>}
                    </div>
                </Card>

                <Card title="Missing Skills" subtitle="Critical skills identified for this role" accent className="border-t-rose-500">
                    <div className="flex flex-wrap gap-3">
                        {analysis.missingSkills.map((skill, i) => (
                            <SkillTag key={i} name={skill} type="missing" />
                        ))}
                        {analysis.missingSkills.length === 0 && <p className="text-emerald-500 font-medium italic">You have all the required skills!</p>}
                    </div>
                </Card>
            </div>

            {analysis.missingSkills.length > 0 && (
                <section className="space-y-10 animate-premium-slide-up" style={{ animationDelay: '400ms' }}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                        <div>
                            <h2 className="text-4xl font-black text-neutral-900 mb-2">Learning Roadmap</h2>
                            <p className="text-neutral-500 font-medium">Personalized plan with vetted resources to bridge your skill gap.</p>
                        </div>
                        <div className="px-5 py-2.5 bg-sky-50 rounded-2xl border border-sky-100 flex items-center shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-[#0ea5e9] mr-3 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest text-[#0ea5e9]">
                                {analysis.learningRoadmap.length} Training Modules
                            </span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {analysis.learningRoadmap.map((item, index) => (
                            <RoadmapCard key={index} item={item} index={index} />
                        ))}
                    </div>
                </section>
            )}

            {analysis.missingSkills.length > 0 && (
                <section className="mt-20 pt-12 border-t border-neutral-100 animate-premium-slide-up" style={{ animationDelay: '500ms' }}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-4xl font-black text-neutral-900 mb-2">Project Ideas</h2>
                            <p className="text-neutral-500 font-medium">Build portfolio-worthy projects to master your missing skills.</p>
                        </div>
                        {projects.length === 0 && !projectsLoading && (
                            <Button
                                onClick={fetchProjectSuggestions}
                                className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 shadow-lg shadow-fuchsia-100"
                            >
                                Generate Project Ideas
                            </Button>
                        )}
                    </div>

                    {projectsLoading && (
                        <div className="bg-neutral-50 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                            <Spinner size="lg" />
                            <p className="mt-6 text-neutral-500 font-medium">AI is generating project ideas...</p>
                        </div>
                    )}

                    {projectsError && (
                        <div className="bg-rose-50 text-rose-600 text-sm font-bold px-6 py-4 rounded-2xl border border-rose-100">
                            {projectsError}
                        </div>
                    )}

                    {projects.length > 0 && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project, index) => (
                                <ProjectCard key={index} project={project} />
                            ))}
                        </div>
                    )}
                </section>
            )}

            <section className="mt-20 pt-12 border-t border-neutral-100 animate-premium-slide-up" style={{ animationDelay: '550ms' }}>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-4xl font-black text-neutral-900 mb-2">Career Paths</h2>
                        <p className="text-neutral-500 font-medium">Explore alternative roles that match your skillset.</p>
                    </div>
                    {roles.length === 0 && !rolesLoading && (
                        <Button
                            onClick={fetchRoleSuggestions}
                            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-100"
                        >
                            Discover Career Paths
                        </Button>
                    )}
                </div>

                {rolesLoading && (
                    <div className="bg-neutral-50 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                        <Spinner size="lg" />
                        <p className="mt-6 text-neutral-500 font-medium">AI is finding career paths for you...</p>
                    </div>
                )}

                {rolesError && (
                    <div className="bg-rose-50 text-rose-600 text-sm font-bold px-6 py-4 rounded-2xl border border-rose-100">
                        {rolesError}
                    </div>
                )}

                {roles.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roles.map((role, index) => (
                            <RoleCard key={index} role={role} />
                        ))}
                    </div>
                )}
            </section>

            {analysis.extraSkills && analysis.extraSkills.length > 0 && (
                <div className="mt-20 pt-12 border-t border-neutral-100 animate-premium-slide-up" style={{ animationDelay: '600ms' }}>
                    <h3 className="text-xl font-black text-neutral-900 mb-6 px-2 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Extra Assets from Your Resume
                    </h3>
                    <div className="flex flex-wrap gap-2.5 px-2">
                        {analysis.extraSkills.map((skill, i) => (
                            <SkillTag key={i} name={skill} type="extra" />
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-16 flex justify-center pb-12">
                <Link to="/dashboard">
                    <Button variant="ghost" size="lg" className="px-12 rounded-2xl hover:bg-neutral-100 transition-all font-black uppercase tracking-[0.2em] text-xs">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default Results;
