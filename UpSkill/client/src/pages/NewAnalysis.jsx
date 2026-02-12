import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Spinner } from '../components/common';
import { FileUpload } from '../components/features';
import api from '../services/api';

const NewAnalysis = () => {
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resumeError, setResumeError] = useState(null);
    const [cooldown, setCooldown] = useState(0);
    const timerRef = useRef(null);

    // Fetch cooldown status on mount
    useEffect(() => {
        const fetchCooldown = async () => {
            try {
                const response = await api.get('/analysis/cooldown');
                const { remainingSeconds } = response.data.data;
                if (remainingSeconds > 0) {
                    startCooldown(remainingSeconds);
                }
            } catch (err) {
                // Silently ignore - user can still try to analyze
            }
        };
        fetchCooldown();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startCooldown = (seconds) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setCooldown(seconds);
        timerRef.current = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleFileSelect = (file, err) => {
        setResume(file);
        setResumeError(err);
        if (error) setError(null);
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (cooldown > 0) return;

        if (!resume) {
            setResumeError('Please upload your resume first');
            return;
        }
        if (jobDescription.trim().length < 50) {
            setError('Please provide a more detailed job description (minimum 50 characters)');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('resume', resume);
            formData.append('jobDescription', jobDescription);

            const response = await api.post('/analysis/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                navigate(`/results/${response.data.data.analysis.id}`);
            }
        } catch (err) {
            console.error('Analysis error:', err);
            const errorData = err.response?.data;
            if (err.response?.status === 429) {
                const remaining = errorData?.remainingSeconds || errorData?.retryAfter || 60;
                startCooldown(remaining);
                setError(null); // Clear error, countdown is shown instead
            } else {
                setError(errorData?.message || 'Analysis failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isDisabled = loading || cooldown > 0;

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl animate-premium-slide-up">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm">
                    AI Analysis Engine
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 leading-tight">
                    Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">Perfect Match</span>
                </h1>
                <p className="text-neutral-500 font-medium text-lg max-w-2xl mx-auto">
                    Upload your resume and the job description. Our AI will handle the rest.
                </p>
            </div>

            <div className="grid gap-10">
                <Card title="1. Resume Upload" subtitle="Support for PDF and DOCX formats (Max 5MB)" accent>
                    <FileUpload
                        onFileSelect={handleFileSelect}
                        error={resumeError}
                        loading={loading}
                    />
                </Card>

                <Card title="2. Job Description" subtitle="Paste the full job requirements from the posting" accent>
                    <div className="space-y-4">
                        <textarea
                            className={`
                w-full min-h-[300px] p-6 rounded-3xl border-2 transition-all duration-300 outline-none
                font-medium text-neutral-700 bg-neutral-50/50 resize-y
                placeholder:text-neutral-300
                focus:bg-white focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 shadow-sm
                ${jobDescription.trim().length > 0 && jobDescription.trim().length < 50 ? 'border-amber-200 focus:border-amber-400' : 'border-neutral-100'}
              `}
                            placeholder="Paste job title and responsibilities here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            disabled={loading}
                        />
                        <div className="flex justify-between items-center px-2">
                            <p className={`text-xs font-black uppercase tracking-widest ${jobDescription.trim().length < 50 ? 'text-neutral-400' : 'text-emerald-500'}`}>
                                {jobDescription.length} characters (minimum 50)
                            </p>
                            {error && <span className="text-xs text-rose-500 font-black uppercase tracking-widest animate-premium-fade-in">{error}</span>}
                        </div>
                    </div>
                </Card>

                <div className="flex flex-col items-center py-8">
                    <Button
                        size="lg"
                        onClick={handleAnalyze}
                        isLoading={loading}
                        disabled={isDisabled}
                        className={`w-full sm:w-80 h-16 shadow-2xl shadow-sky-100 transform transition-all duration-300 ${cooldown > 0 ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                    >
                        {cooldown > 0 ? `Cooldown (${cooldown}s)` : 'Analyze Skills'}
                    </Button>
                    {cooldown > 0 ? (
                        <div className="mt-6 flex flex-col items-center gap-2 animate-premium-fade-in">
                            <div className="w-48 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000 ease-linear"
                                    style={{ width: `${(cooldown / 60) * 100}%` }}
                                />
                            </div>
                            <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest flex items-center">
                                <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Please wait before next analysis
                            </p>
                        </div>
                    ) : (
                        <p className="mt-6 text-neutral-400 text-xs font-bold uppercase tracking-widest flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Secure AI Processing
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewAnalysis;
