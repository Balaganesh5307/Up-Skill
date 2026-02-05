import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Spinner } from '../components/common';
import api from '../services/api';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/history');
                setHistory(response.data.data.analyses);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleDelete = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this analysis?')) {
            try {
                await api.delete(`/history/${id}`);
                setHistory(history.filter(item => item.id !== id));
            } catch (error) {
                console.error('Error deleting history:', error);
            }
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm('Are you sure you want to delete ALL analysis records? This action cannot be undone.')) {
            try {
                await api.delete('/history');
                setHistory([]);
            } catch (error) {
                console.error('Error deleting all history:', error);
            }
        }
    };

    if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl animate-premium-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm">
                        Archive & Records
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">Analysis History</h1>
                    <p className="text-neutral-500 font-medium text-lg max-w-lg">
                        A complete record of all your resume optimizations and match scores.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {history.length > 0 && (
                        <Button
                            variant="outline"
                            size="md"
                            onClick={handleDeleteAll}
                            className="px-6 h-14 border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                        >
                            Clear All
                        </Button>
                    )}
                    <Link to="/analyze">
                        <Button size="md" className="px-8 h-14 shadow-lg shadow-sky-100">
                            New Analysis
                        </Button>
                    </Link>
                </div>
            </div>

            {history.length > 0 ? (
                <div className="grid gap-6">
                    {history.map((item, index) => (
                        <Link
                            key={item.id}
                            to={`/results/${item.id}`}
                            className="group block animate-premium-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <Card noPadding className="transition-all duration-300 group-hover:border-sky-200 group-hover:scale-[1.005] group-hover:shadow-lg">
                                <div className="p-8 flex flex-col md:flex-row items-center gap-10">
                                    <div className={`
                    shrink-0 w-24 h-24 rounded-[32px] flex flex-col items-center justify-center border-4 shadow-sm transition-transform duration-500 group-hover:rotate-3
                    ${item.matchScore >= 70 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-sky-50 border-sky-100 text-sky-600'}
                  `}>
                                        <span className="text-3xl font-black leading-none">{item.matchScore}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">Score</span>
                                    </div>

                                    <div className="flex-1 space-y-3 text-center md:text-left">
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <h3 className="text-2xl font-black text-neutral-900 leading-tight tracking-tight uppercase group-hover:text-sky-600 transition-colors">
                                                {item.jobTitle}
                                            </h3>
                                            <span className="px-3 py-1 bg-neutral-100 text-neutral-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-neutral-200">
                                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6">
                                            <div className="flex items-center text-xs font-bold text-neutral-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                                {item.matchedSkills?.length || 0} Matches
                                            </div>
                                            <div className="flex items-center text-xs font-bold text-neutral-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2" />
                                                {item.missingSkills?.length || 0} Gaps
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={(e) => handleDelete(item.id, e)}
                                            className="p-3 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300"
                                            title="Delete record"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                        <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-all duration-300 border border-neutral-100 group-hover:border-sky-100">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center py-24 text-center bg-neutral-50/50 border-dashed border-2">
                    <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mb-8 text-neutral-400 group-hover:rotate-12 transition-transform shadow-sm">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 className="text-2xl font-black text-neutral-900 mb-3">No history found</h4>
                    <p className="text-neutral-500 mb-10 max-w-md font-medium px-4">You haven't performed any analyses yet. Your history will appear here once you start.</p>
                    <Link to="/analyze">
                        <Button size="lg" className="px-10">Start Your First Analysis</Button>
                    </Link>
                </Card>
            )}
        </div>
    );
};

export default History;
