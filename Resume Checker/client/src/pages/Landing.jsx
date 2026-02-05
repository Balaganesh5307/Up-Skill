import { Link } from 'react-router-dom';
import { Button } from '../components/common';

const Landing = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-44 md:pb-40 overflow-hidden">
                {/* Background Accents */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-400 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="container mx-auto px-6 text-center">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-sky-50 text-sky-700 border border-sky-100 mb-8 animate-premium-fade-in shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                        </span>
                        <span className="text-xs font-black uppercase tracking-widest">Powered by Gemini AI 2.0</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-neutral-900 mb-8 tracking-tight animate-premium-slide-up leading-[1.05]">
                        Close the Gap <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#6366f1]">
                            Get the Job.
                        </span>
                    </h1>

                    <p className="text-xl text-neutral-500 max-w-2xl mx-auto mb-12 animate-premium-slide-up font-medium leading-relaxed" style={{ animationDelay: '200ms' }}>
                        AI-powered resume analysis that identifies skill gaps and provides a personalized roadmap to master them.
                    </p>

                    <div className="flex items-center justify-center animate-premium-slide-up" style={{ animationDelay: '400ms' }}>
                        <Link to="/register">
                            <Button size="lg" className="px-10 h-16 shadow-xl shadow-sky-100 hover:shadow-2xl hover:shadow-sky-200">
                                Analyze Your Resume
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-white border-t border-neutral-100">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    <div className="flex items-center space-x-3 group">
                        <div className="bg-[#0ea5e9] text-white p-2.5 rounded-xl group-hover:rotate-12 transition-transform duration-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tight text-neutral-900">SkillGap</span>
                    </div>

                    <div className="flex items-center space-x-8 text-sm font-black text-neutral-400 uppercase tracking-widest">
                        <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
                        <a href="#" className="hover:text-neutral-900 transition-colors">Contact</a>
                    </div>

                    <p className="text-neutral-400 text-xs font-bold">
                        © 2026 SkillGap AI. Built for the future of work.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
