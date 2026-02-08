import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'New Analysis', path: '/analyze' },
        { name: 'Rewrite', path: '/rewrite' },
        { name: 'GitHub', path: '/github' },
        { name: 'History', path: '/history' },
    ];

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <>
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group outline-none">
                        <div className="bg-sky-600 text-white p-1.5 sm:p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-lg sm:text-xl font-black tracking-tight text-neutral-900">UpSkill</span>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {isAuthenticated && navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`
                                    px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300
                                    ${location.pathname === link.path
                                        ? 'bg-sky-50 text-[#0ea5e9]'
                                        : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'}
                                `}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Actions & Mobile Menu Button */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {isAuthenticated ? (
                            <>
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 leading-none mb-1">Welcome</span>
                                    <span className="text-xs sm:text-sm font-black text-neutral-900">{user?.name?.split(' ')[0]}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={logout}
                                    className="hidden sm:flex rounded-xl border-neutral-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 h-9 sm:h-10 px-4 sm:px-6 text-xs"
                                >
                                    Logout
                                </Button>
                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 transition-colors"
                                    aria-label="Toggle menu"
                                >
                                    <svg
                                        className="w-6 h-6 text-neutral-700"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        {isMenuOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        )}
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <Link to="/login" className="px-3 sm:px-6 py-2 h-9 sm:h-10 flex items-center text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
                                    Login
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="h-9 sm:h-10 px-4 sm:px-6 rounded-xl text-xs">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Drawer */}
            <div className={`
                fixed top-16 sm:top-20 left-0 right-0 bg-white border-b border-neutral-200 shadow-xl z-50 lg:hidden
                transform transition-all duration-300 ease-out
                ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
            `}>
                <div className="container mx-auto px-4 py-4">
                    {/* Mobile Nav Links */}
                    {isAuthenticated && (
                        <div className="space-y-1 mb-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={handleLinkClick}
                                    className={`
                                        block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-200
                                        ${location.pathname === link.path
                                            ? 'bg-sky-50 text-[#0ea5e9]'
                                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}
                                    `}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Mobile User Info & Logout */}
                    {isAuthenticated && (
                        <div className="pt-4 border-t border-neutral-100">
                            <div className="flex items-center justify-between px-4 py-3">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Signed in as</span>
                                    <span className="text-sm font-black text-neutral-900">{user?.name}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { logout(); handleLinkClick(); }}
                                    className="rounded-xl border-neutral-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 h-10 px-6 text-xs"
                                >
                                    Logout
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;
