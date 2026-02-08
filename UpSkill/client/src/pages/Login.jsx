import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/common';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const from = location.state?.from?.pathname || '/dashboard';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6 py-12 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-100 blur-[100px] rounded-full opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 blur-[100px] rounded-full opacity-50" />
            </div>

            <div className="w-full max-w-md animate-premium-slide-up">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
                        <div className="bg-[#0ea5e9] text-white p-2.5 rounded-xl group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-sky-100">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <span className="text-3xl font-black tracking-tight text-neutral-900 group-hover:text-[#0ea5e9] transition-colors">UpSkill</span>
                    </Link>
                    <h2 className="text-3xl font-black text-neutral-900 mb-2">Welcome Back</h2>
                    <p className="text-neutral-500 font-medium">Log in to continue your career growth.</p>
                </div>

                <Card className="p-10 premium-shadow">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                                </svg>
                            }
                        />

                        <Input
                            label="Password"
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                        />

                        {error && (
                            <div className="bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest px-4 py-3 rounded-xl border border-rose-100 animate-premium-fade-in flex items-center">
                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-xl shadow-lg shadow-sky-100 font-black uppercase tracking-[0.2em] text-xs"
                            isLoading={loading}
                            disabled={loading}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-neutral-100 text-center">
                        <p className="text-neutral-500 text-sm font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-[#0ea5e9] font-black hover:underline underline-offset-4">
                                Sign Up Free
                            </Link>
                        </p>
                    </div>
                </Card>

                <p className="mt-10 text-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
                    Securely protected by AES-256 Encryption
                </p>
            </div>
        </div>
    );
};

export default Login;
