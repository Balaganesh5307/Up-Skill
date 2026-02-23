import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common';

const GoogleAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const { googleLogin } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const authError = searchParams.get('error');

            if (authError) {
                setError('Google authentication failed. Please try again.');
                setTimeout(() => navigate('/login', { replace: true }), 2000);
                return;
            }

            if (!token) {
                setError('No authentication token received.');
                setTimeout(() => navigate('/login', { replace: true }), 2000);
                return;
            }

            try {
                const result = await googleLogin(token);
                if (result.success) {
                    navigate('/dashboard', { replace: true });
                } else {
                    setError(result.error || 'Authentication failed');
                    setTimeout(() => navigate('/login', { replace: true }), 2000);
                }
            } catch (err) {
                setError('Something went wrong. Please try again.');
                setTimeout(() => navigate('/login', { replace: true }), 2000);
            }
        };

        handleCallback();
    }, [searchParams, googleLogin, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
            <div className="text-center">
                {error ? (
                    <div className="animate-premium-fade-in">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-rose-600 font-bold text-lg mb-2">{error}</p>
                        <p className="text-neutral-400 text-sm">Redirecting to login...</p>
                    </div>
                ) : (
                    <div className="animate-premium-fade-in">
                        <Spinner size="lg" />
                        <p className="mt-6 text-neutral-600 font-bold text-lg">Completing Google Sign-In...</p>
                        <p className="text-neutral-400 text-sm mt-1">Please wait while we set up your session.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleAuthCallback;
