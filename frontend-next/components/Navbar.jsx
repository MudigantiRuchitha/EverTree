'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
    Building2, Heart, MessageSquare, PlusCircle, User, LogOut, 
    ShieldCheck, Home, Calculator, Briefcase, FileCheck, ShieldAlert, 
    Menu, X, Search 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import AdminVerificationModal from './AdminVerificationModal';

const Navbar = ({ onOpenChat }) => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => {
        if (path === '/') return pathname === '/';
        return pathname ? pathname.startsWith(path) : false;
    };

    const navLinks = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/loan', label: 'Home Loans', icon: Calculator },
        { href: '/legal', label: 'Legal Services', icon: FileCheck },
        { href: '/interior', label: 'Interior Design', icon: Briefcase },
        { href: '/search', label: 'Search', icon: Search },
    ];

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        
                        {/* Brand Logo */}
                        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group focus:outline-hidden" onClick={closeMobileMenu}>
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
                                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight leading-none">
                                    evertree<span className="text-emerald-600">.in</span>
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                                    Legal Verified Portal
                                </div>
                            </div>
                        </Link>

                        {/* Desktop & Laptop Nav Links */}
                        <nav className="hidden lg:flex items-center gap-1.5">
                            {navLinks.map(({ href, label, icon: Icon }) => {
                                const active = isActive(href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                                            active
                                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Desktop & Laptop User Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            {user ? (
                                <>
                                    {(user.role === 'seller' || user.role === 'broker') && (
                                        <Link
                                            href="/add-property"
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm hover:from-amber-700 hover:to-amber-800 transition-all hover:-translate-y-0.5"
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                            Post Property
                                        </Link>
                                    )}

                                    <button
                                        onClick={onOpenChat}
                                        className="p-2.5 rounded-lg border border-slate-200 text-emerald-600 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                                        title="Live Chat"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </button>

                                    {user.role === 'admin' ? (
                                        <button
                                            onClick={() => setShowAdminModal(true)}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-all"
                                        >
                                            <ShieldAlert className="w-4 h-4" />
                                            Admin Portal
                                        </button>
                                    ) : user.role === 'buyer' ? (
                                        <Link
                                            href="/buyer-dashboard"
                                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                                                isActive('/buyer-dashboard')
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                        >
                                            <Heart className="w-4 h-4" />
                                            Wishlist
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/seller-dashboard"
                                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                                                isActive('/seller-dashboard')
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            {user.role === 'broker' ? 'Broker Portal' : 'Seller Portal'}
                                        </Link>
                                    )}

                                    {/* User Avatar Pill */}
                                    <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                                        <img
                                            src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                                            alt={user.name}
                                            className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-600/30"
                                        />
                                        <div className="hidden xl:block text-left leading-tight">
                                            <div className="text-xs font-bold text-slate-900">{user.name?.split(' ')[0]}</div>
                                            <div className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full mt-0.5">
                                                {user.verification_id || 'VERIFIED'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                                            title="Logout"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                                    >
                                        <User className="w-4 h-4" />
                                        Login
                                    </button>
                                    <button
                                        onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                                    >
                                        Register
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile & Tablet Hamburger Toggle */}
                        <div className="flex md:hidden items-center gap-2">
                            {user && (
                                <button
                                    onClick={onOpenChat}
                                    className="p-2 rounded-lg text-emerald-600 bg-slate-100 hover:bg-slate-200"
                                    title="Live Chat"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                                aria-label="Toggle Menu"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Mobile & Tablet Dropdown Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200 shadow-xl">
                        {/* Mobile Navigation Links */}
                        <div className="grid grid-cols-2 gap-2">
                            {navLinks.map(({ href, label, icon: Icon }) => {
                                const active = isActive(href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={closeMobileMenu}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                            active
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile User Actions */}
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                            {user ? (
                                <>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-600/30"
                                            />
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{user.name}</div>
                                                <div className="text-xs text-slate-500 capitalize">{user.role} &bull; <span className="text-emerald-600 font-semibold">{user.verification_id || 'VERIFIED'}</span></div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { logout(); closeMobileMenu(); }}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Logout"
                                        >
                                            <LogOut className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {(user.role === 'seller' || user.role === 'broker') && (
                                        <Link
                                            href="/add-property"
                                            onClick={closeMobileMenu}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
                                        >
                                            <PlusCircle className="w-5 h-5" />
                                            Post Property Listing
                                        </Link>
                                    )}

                                    {user.role === 'admin' ? (
                                        <button
                                            onClick={() => { setShowAdminModal(true); closeMobileMenu(); }}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700"
                                        >
                                            <ShieldAlert className="w-5 h-5" />
                                            Legal Admin Portal
                                        </button>
                                    ) : user.role === 'buyer' ? (
                                        <Link
                                            href="/buyer-dashboard"
                                            onClick={closeMobileMenu}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200"
                                        >
                                            <Heart className="w-5 h-5 text-rose-500" />
                                            View Saved Wishlist
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/seller-dashboard"
                                            onClick={closeMobileMenu}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200"
                                        >
                                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                            {user.role === 'broker' ? 'Broker Portal' : 'Seller Dashboard'}
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => { setAuthMode('login'); setShowAuthModal(true); closeMobileMenu(); }}
                                        className="py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-800 hover:bg-slate-200"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => { setAuthMode('register'); setShowAuthModal(true); closeMobileMenu(); }}
                                        className="py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                                    >
                                        Register
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {showAuthModal && (
                <AuthModal
                    mode={authMode}
                    onClose={() => setShowAuthModal(false)}
                />
            )}

            {showAdminModal && (
                <AdminVerificationModal
                    isOpen={showAdminModal}
                    onClose={() => setShowAdminModal(false)}
                />
            )}
        </>
    );
};

export default Navbar;
