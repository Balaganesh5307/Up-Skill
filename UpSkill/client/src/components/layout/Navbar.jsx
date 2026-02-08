import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'New Analysis', path: '/analyze' },
        { name: 'Rewrite', path: '/rewrite' },
        { name: 'GitHub', path: '/github' },
        { name: 'History', path: '/history' },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-3 group outline-none">
                    <div className="bg-sky-600 text-white p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-xl font-black tracking-tight text-neutral-900">UpSkill</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-2">
                    {isAuthenticated && navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`
                px-5 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300
                ${location.pathname === link.path
                                    ? 'bg-sky-50 text-[#0ea5e9]'
                                    : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'}
              `}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Auth Actions */}
                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-6">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-xs font-black uppercase tracking-widest text-neutral-400 leading-none mb-1">Welcome back</span>
                                <span className="text-sm font-black text-neutral-900">{user?.name}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={logout}
                                className="rounded-xl border-neutral-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 h-10 px-6"
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link to="/login" className="px-6 py-2 h-10 flex items-center text-sm font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
                                Login
                            </Link>
                            <Link to="/register">
                                <Button size="sm" className="h-10 px-6 rounded-xl">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
