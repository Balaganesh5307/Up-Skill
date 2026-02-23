import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/common';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const result = await register(formData.name, formData.email, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6 py-12 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 blur-[100px] rounded-full opacity-50" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-100 blur-[100px] rounded-full opacity-50" />
            </div>

            <div className="w-full max-w-lg animate-premium-slide-up">
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
                    <h2 className="text-3xl font-black text-neutral-900 mb-2">Create Account</h2>
                    <p className="text-neutral-500 font-medium">Join 1,000+ professionals optimizing their careers.</p>
                </div>

                <Card className="p-10 premium-shadow">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full Name"
                            id="name"
                            placeholder="John Doe"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            }
                        />

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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                            <Input
                                label="Confirm"
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                }
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest px-4 py-3 rounded-xl border border-rose-100 animate-premium-fade-in">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-xl shadow-lg shadow-sky-100 font-black uppercase tracking-[0.2em] text-xs"
                            isLoading={loading}
                            disabled={loading}
                        >
                            Initialize Account
                        </Button>
                    </form>

                    {/* OR Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Google Sign-Up Button */}
                    <a
                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/google`}
                        className="w-full h-14 rounded-xl border-2 border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 flex items-center justify-center gap-3 transition-all duration-300 group shadow-sm hover:shadow-md"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-sm font-bold text-neutral-700 group-hover:text-neutral-900 transition-colors">
                            Continue with Google
                        </span>
                    </a>

                    <div className="mt-8 pt-8 border-t border-neutral-100 text-center">
                        <p className="text-neutral-500 text-sm font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#0ea5e9] font-black hover:underline underline-offset-4">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </Card>

                <p className="mt-10 text-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
                    Advanced Resume ↔ Job Matching Engine
                </p>
            </div>
        </div>
    );
};

export default Register;
