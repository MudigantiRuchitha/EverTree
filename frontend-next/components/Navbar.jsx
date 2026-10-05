'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    Building2,
    Heart,
    MessageSquare,
    PlusCircle,
    User,
    LogOut,
    ShieldAlert,
    ShieldCheck,
    Home,
    Calculator,
    Briefcase,
    FileCheck,
    Menu,
    X,
    Search,
    ShoppingCart,
    Users,
    Bell,
    ClipboardList,
    UserCheck
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';
import AdminVerificationModal from './AdminVerificationModal';


const Navbar = ({ onOpenChat }) => {

    const { user, logout } = useAuth();
    const { cartCount } = useCart();

    const pathname = usePathname();

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


    // =====================================================
    // USER ROLE
    // =====================================================

    const role = user?.role?.toLowerCase();


    // =====================================================
    // ACTIVE LINK
    // =====================================================

    const isActive = (path) => pathname === path;


    // =====================================================
    // PUBLIC NAVIGATION
    // =====================================================

    const publicNavLinks = [
        {
            href: '/',
            label: 'Home',
            icon: Home
        },
        {
            href: '/loan',
            label: 'Home Loans',
            icon: Calculator
        },
        {
            href: '/legal',
            label: 'Legal Services',
            icon: FileCheck
        },
        {
            href: '/interior',
            label: 'Interior Design',
            icon: Briefcase
        }
    ];


    // =====================================================
    // BUYER NAVIGATION
    // =====================================================

    const buyerNavLinks = [
        {
            href: '/',
            label: 'Home',
            icon: Home
        },
        {
            href: '/buyer-dashboard',
            label: 'Wishlist',
            icon: Heart
        },
        {
            href: '/cart',
            label: 'Cart',
            icon: ShoppingCart
        },
        {
            href: '/messages',
            label: 'Messages',
            icon: MessageSquare
        }
    ];


    // =====================================================
    // SELLER NAVIGATION
    // =====================================================

    const sellerNavLinks = [
        {
            href: '/seller-dashboard',
            label: 'Dashboard',
            icon: Home
        },
        {
            href: '/my-listing',
            label: 'My Listings',
            icon: Building2
        },
        {
            href: '/buyer-requests',
            label: 'Buyer Requests',
            icon: UserCheck
        },
        // {
        //     href: '/messages',
        //     label: 'Messages',
        //     icon: MessageSquare
        // },
        {
            href: '/notifications',
            label: 'Notifications',
            icon: Bell
        }
    ];


    // =====================================================
    // BROKER NAVIGATION
    // Broker can BUY + SELL
    // =====================================================

    const brokerNavLinks = [
        {
            href: '/broker-dashboard',
            label: 'Dashboard',
            icon: Home
        },
        {
            href: '/properties',
            label: 'Find Properties',
            icon: Search
        },
        {
            href: '/my-listing',
            label: 'My Listings',
            icon: Building2
        },
        {
            href: '/clients',
            label: 'Clients',
            icon: Users
        },
        {
            href: '/buyer-requests',
            label: 'Buyer Requests',
            icon: UserCheck
        },
        {
            href: '/messages',
            label: 'Messages',
            icon: MessageSquare
        }
    ];


    // =====================================================
    // ADMIN NAVIGATION
    // =====================================================

    const adminNavLinks = [
        {
            href: '/admin',
            label: 'Dashboard',
            icon: Home
        },
        {
            href: '/admin/users',
            label: 'Users',
            icon: Users
        },
        {
            href: '/admin/properties',
            label: 'Properties',
            icon: Building2
        },
        {
            href: '/admin/approvals',
            label: 'Approvals',
            icon: ClipboardList
        },
        {
            href: '/admin/messages',
            label: 'Messages',
            icon: MessageSquare
        }
    ];


    // =====================================================
    // SELECT NAVIGATION BASED ON ROLE
    // =====================================================

    let navLinks = publicNavLinks;

    if (role === 'buyer') {
        navLinks = buyerNavLinks;
    }

    if (role === 'seller') {
        navLinks = sellerNavLinks;
    }

    if (role === 'broker') {
        navLinks = brokerNavLinks;
    }

    // Note: Admin links are dedicated to /evertree/secure and should not override public portal navigation


    // =====================================================
    // CLOSE MOBILE MENU
    // =====================================================

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };


    // =====================================================
    // LOGIN MODAL
    // =====================================================

    const openLogin = () => {
        setAuthMode('login');
        setShowAuthModal(true);
        closeMobileMenu();
    };


    // =====================================================
    // REGISTER MODAL
    // =====================================================

    const openRegister = () => {
        setAuthMode('register');
        setShowAuthModal(true);
        closeMobileMenu();
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {
        logout();
        closeMobileMenu();
    };


    // =====================================================
    // PROFILE LINK
    // =====================================================

    const getProfileLink = () => {

        if (role === 'admin') {
            return '/admin';
        }

        if (role === 'seller') {
            return '/seller-dashboard';
        }

        if (role === 'broker') {
            return '/broker-dashboard';
        }

        return '/buyer-dashboard';
    };


    return (
        <>
            {/* =====================================================
                MAIN NAVBAR
            ===================================================== */}

            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex items-center justify-between h-16 sm:h-20">


                        {/* =================================================
                            LOGO
                        ================================================= */}

                        <Link
                            href="/"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
                        >

                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">

                                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />

                            </div>


                            <div>

                                <div className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight leading-none">

                                    evertree
                                    <span className="text-emerald-600">
                                        .in
                                    </span>

                                </div>


                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">

                                    Legal Verified Portal

                                </div>

                            </div>

                        </Link>


                        {/* =================================================
                            DESKTOP NAVIGATION
                        ================================================= */}

                        <nav className="hidden lg:flex items-center gap-1.5">

                            {navLinks.map(({ href, label, icon: Icon }) => {

                                const active = isActive(href);
                                const isCartLink = href === '/cart';

                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                                            active
                                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >

                                        <Icon className="w-4 h-4" />

                                        {label}

                                        {isCartLink && cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                                                {cartCount > 9 ? '9+' : cartCount}
                                            </span>
                                        )}

                                    </Link>
                                );

                            })}

                        </nav>


                        {/* =================================================
                            DESKTOP USER ACTIONS
                        ================================================= */}

                        <div className="hidden md:flex items-center gap-3">


                            {user && role !== 'admin' ? (

                                <>  
                                {/* =====================================
                                            DESKTOP LIVE CHAT
                                ===================================== */}

                                    <button
                                        onClick={onOpenChat}
                                        className="p-2.5 rounded-lg text-emerald-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                                        title="Live Chat"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                        

                                    {/* =====================================
                                        SELLER / BROKER POST PROPERTY
                                    ===================================== */}

                                    {(role === 'seller' || role === 'broker') && (

                                        <Link
                                            href="/add-property"
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm hover:from-amber-700 hover:to-amber-800 transition-all"
                                        >

                                            <PlusCircle className="w-4 h-4" />

                                            Post Property

                                        </Link>

                                    )}


                                    {/* =====================================
                                        PROFILE
                                    ===================================== */}

                                    <Link
                                        href={getProfileLink()}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >

                                        <User className="w-4 h-4" />

                                        <span className="text-sm font-semibold text-slate-700">
                                            {user.name?.split(' ')[0] || 'Account'}
                                        </span>

                                    </Link>


                                    {/* =====================================
                                        LOGOUT
                                    ===================================== */}

                                    <button
                                        onClick={handleLogout} 
                                        className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                        title="Logout"
                                    >

                                        <LogOut className="w-5 h-5" />

                                    </button>

                                </>

                            ) : (

                                /* =========================================
                                   PUBLIC USER / LOGIN & REGISTER
                                ========================================= */

                                <div className="flex items-center gap-2">

                                    <button
                                        onClick={openLogin}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                                    >

                                        <User className="w-4 h-4" />

                                        Login

                                    </button>


                                    <button
                                        onClick={openRegister}
                                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all hover:-translate-y-0.5 cursor-pointer font-bold"
                                    >

                                        Register

                                    </button>

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            MOBILE MENU BUTTON
                        ================================================= */}

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

                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}

                            </button>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    MOBILE MENU
                ===================================================== */}

                {mobileMenuOpen && (

                    <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl">


                        {/* =============================================
                            MOBILE NAV LINKS
                        ============================================= */}

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


                        {/* =============================================
                            MOBILE USER AREA
                        ============================================= */}

                        <div className="pt-2 border-t border-slate-100 space-y-2">


                            {user && role !== 'admin' ? (

                                <>


                                    {/* =====================================
                                        USER PROFILE
                                    ===================================== */}

                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">

                                        <div className="flex items-center gap-3">

                                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">

                                                <User className="w-5 h-5 text-white" />

                                            </div>


                                            <div>

                                                <div className="text-sm font-bold text-slate-900">
                                                    {user.name}
                                                </div>

                                                <div className="text-xs text-slate-500 capitalize">

                                                    {role}

                                                    <span className="mx-1">
                                                        •
                                                    </span>

                                                    <span className="text-emerald-600 font-semibold">
                                                        {user.verification_id || 'VERIFIED'}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        <button
                                            onClick={handleLogout}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Logout"
                                        >

                                            <LogOut className="w-5 h-5" />

                                        </button>

                                    </div>


                                    {/* =====================================
                                        SELLER / BROKER POST PROPERTY
                                    ===================================== */}

                                    {(role === 'seller' || role === 'broker') && (

                                        <Link
                                            href="/add-property"
                                            onClick={closeMobileMenu}
                                            className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
                                        >

                                            <PlusCircle className="w-5 h-5" />

                                            Post Property Listing

                                        </Link>

                                    )}


                                    {/* =====================================
                                        ADMIN
                                    ===================================== */}

                                    {role === 'admin' && (

                                        <button
                                            onClick={() => {
                                                setShowAdminModal(true);
                                                closeMobileMenu();
                                            }}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700"
                                        >

                                            <ShieldAlert className="w-5 h-5" />

                                            Legal Admin Portal

                                        </button>

                                    )}


                                    {/* =====================================
                                        BUYER
                                    ===================================== */}

                                    {role === 'buyer' && (

                                        <Link
                                            href="/buyer-dashboard"
                                            onClick={closeMobileMenu}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200"
                                        >

                                            <Heart className="w-5 h-5 text-rose-500" />

                                            View Saved Wishlist

                                        </Link>

                                    )}


                                    {/* =====================================
                                        SELLER
                                    ===================================== */}

                                    {role === 'seller' && (

                                        <Link
                                            href="/seller-dashboard"
                                            onClick={closeMobileMenu}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200"
                                        >

                                            <ShieldCheck className="w-5 h-5 text-emerald-600" />

                                            Seller Dashboard

                                        </Link>

                                    )}


                                    {/* =====================================
                                        BROKER
                                    ===================================== */}

                                    {role === 'broker' && (

                                        <Link
                                            href="/broker-dashboard"
                                            onClick={closeMobileMenu}
                                            className="ml-8 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200"
                                        >

                                            <ShieldCheck className="w-5 h-5 text-emerald-600" />

                                            Broker Dashboard

                                        </Link>

                                    )}

                                </>

                            ) : (

                                /* =========================================
                                   PUBLIC MOBILE LOGIN / REGISTER
                                ========================================= */

                                <div className="grid grid-cols-2 gap-2">

                                    <button
                                        onClick={openLogin}
                                        className="py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-800 hover:bg-slate-200"
                                    >

                                        Log In

                                    </button>


                                    <button
                                        onClick={openRegister}
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


            {/* =========================================================
                AUTH MODAL
            ========================================================= */}

            {showAuthModal && (

                <AuthModal
                    mode={authMode}
                    onClose={() => setShowAuthModal(false)}
                />

            )}


            {/* =========================================================
                ADMIN VERIFICATION MODAL
            ========================================================= */}

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