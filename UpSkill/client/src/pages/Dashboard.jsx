import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Spinner } from '../components/common';
import api from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, highest: 0, recent: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/history');
                const history = response.data.data.analyses;

                if (history && history.length > 0) {
                    const highest = Math.max(...history.map(a => a.matchScore));
                    setStats({
                        total: response.data.data.count,
                        highest,
                        recent: history.slice(0, 3)
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl animate-premium-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-sky-50 text-sky-700 text-[10px] font-black uppercase tracking-widest border border-sky-100">
                        Analytics Overview
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 leading-tight">
                        Welcome, <span className="text-[#0ea5e9]">{user?.name?.split(' ')[0]}</span>.
                    </h1>
                    <p className="text-neutral-500 font-medium">Here's what's happening with your job applications.</p>
                </div>
                <Link to="/analyze" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 shadow-xl shadow-sky-100/50">
                        Start New Analysis
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card className="flex flex-col justify-center border-l-4 border-l-sky-500">
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Total Analyses</span>
                    <span className="text-4xl font-black text-neutral-900 leading-none">{stats.total}</span>
                </Card>
                <Card className="flex flex-col justify-center border-l-4 border-l-emerald-500">
                    <span className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Best Match Score</span>
                    <span className="text-4xl font-black text-neutral-900 leading-none">{stats.highest}%</span>
                </Card>
                <Card noPadding className="col-span-1 lg:col-span-2 relative group cursor-pointer overflow-hidden border-none bg-neutral-900">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-600/20 to-indigo-600/20 group-hover:opacity-100 opacity-60 transition-opacity duration-700" />
                    <div className="p-8 relative z-10">
                        <h3 className="text-white text-xl font-black mb-2">Pro Tip: Optimize for Keywords</h3>
                        <p className="text-neutral-400 text-sm font-medium leading-relaxed max-w-sm">
                            Skills identified as "Missing" are usually key terms the recruiter's ATS is looking for. Add them to your resume!
                        </p>
                    </div>
                </Card>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-neutral-900">Recent Activity</h3>
                        <Link to="/history" className="text-xs font-black uppercase tracking-widest text-sky-600 hover:text-sky-700 transition-colors">
                            View All History
                        </Link>
                    </div>

                    {stats.recent.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recent.map((analysis, index) => (
                                <Link key={analysis.id} to={`/results/${analysis.id}`} className="block group">
                                    <Card noPadding className="transition-all duration-300 hover:scale-[1.01] hover:border-sky-200">
                                        <div className="p-6 flex items-center justify-between">
                                            <div className="flex items-center space-x-6">
                                                <div className={`
                          w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm
                          ${analysis.matchScore >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}
                        `}>
                                                    {analysis.matchScore}%
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-neutral-900 mb-1 group-hover:text-sky-600 transition-colors uppercase tracking-tight">
                                                        {analysis.jobTitle}
                                                    </h4>
                                                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                                                        Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-all duration-300">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card className="flex flex-col items-center justify-center py-20 text-center bg-neutral-50/50 border-dashed border-2">
                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6 text-neutral-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-black text-neutral-400 mb-2">No analyses yet</h4>
                            <p className="text-neutral-500 mb-8 max-w-sm font-medium">Start your first analysis to see results and optimize your job applications.</p>
                            <Link to="/analyze">
                                <Button variant="outline" size="md">Start Now</Button>
                            </Link>
                        </Card>
                    )}
                </div>

                {/* Success Tips */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-neutral-900 px-2">Expert Guide</h3>
                    <div className="space-y-4">
                        {[
                            {
                                title: 'Be Specific',
                                desc: 'Job titles in JD should match exactly what you are aiming for.',
                                icon: '🔍'
                            },
                            {
                                title: 'Update Skills',
                                desc: 'Always use technical keywords like "React v18" instead of just "React".',
                                icon: '⚡'
                            },
                            {
                                title: 'Review PDF',
                                desc: 'Ensure your PDF text is selectable (not just an image).',
                                icon: '📄'
                            }
                        ].map((tip, i) => (
                            <Card key={i} className="p-6 hover:border-emerald-100 transition-colors">
                                <div className="flex space-x-4">
                                    <span className="text-2xl">{tip.icon}</span>
                                    <div>
                                        <h5 className="font-black text-neutral-900 text-sm mb-1 uppercase tracking-tight">{tip.title}</h5>
                                        <p className="text-neutral-500 text-xs font-medium leading-relaxed">{tip.desc}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
