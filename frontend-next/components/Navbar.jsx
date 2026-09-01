'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Building2, Heart, MessageSquare, PlusCircle, User, LogOut, ShieldCheck, Home, Calculator, Briefcase, FileCheck, ShieldAlert } from 'lucide-react';
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

    const isActive = (path) => pathname === path;

    return (
        <>
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
                    
                    {/* Brand */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                        }}>
                            <Building2 size={22} color="#ffffff" />
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-primary)', fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: '1' }}>
                                evertree<span style={{ color: 'var(--primary-emerald)' }}>.in</span>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px', fontWeight: '600' }}>
                                Legal Verified Portal
                            </div>
                        </div>
                    </Link>

                    {/* Nav Links */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Link href="/" className={`btn ${isActive('/') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 14px', fontSize: '0.88rem' }}>
                            <Home size={16} /> Home
                        </Link>
                        <Link href="/loan" className={`btn ${isActive('/loan') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 14px', fontSize: '0.88rem' }}>
                            <Calculator size={16} /> Home Loans
                        </Link>
                        <Link href="/legal" className={`btn ${isActive('/legal') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 14px', fontSize: '0.88rem' }}>
                            <FileCheck size={16} /> Legal Services
                        </Link>
                        <Link href="/interior" className={`btn ${isActive('/interior') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 14px', fontSize: '0.88rem' }}>
                            <Briefcase size={16} /> Interior Design
                        </Link>
                    </nav>

                    {/* User Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {user ? (
                            <>
                                {(user.role === 'seller' || user.role === 'broker') && (
                                    <Link
                                        href="/add-property"
                                        className="btn btn-accent"
                                        style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                                    >
                                        <PlusCircle size={16} /> Post Property
                                    </Link>
                                )}

                                <button
                                    className="btn btn-secondary"
                                    onClick={onOpenChat}
                                    style={{ padding: '8px 12px' }}
                                    title="Live Chat"
                                >
                                    <MessageSquare size={18} color="var(--primary-emerald)" />
                                </button>

                                {user.role === 'admin' ? (
                                    <button
                                        className="btn btn-accent"
                                        onClick={() => setShowAdminModal(true)}
                                        style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                                    >
                                        <ShieldAlert size={16} /> Legal Admin Portal
                                    </button>
                                ) : user.role === 'buyer' ? (
                                    <Link
                                        href="/buyer-dashboard"
                                        className={`btn ${isActive('/buyer-dashboard') ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                                    >
                                        <Heart size={16} /> Wishlist
                                    </Link>
                                ) : (
                                    <Link
                                        href="/seller-dashboard"
                                        className={`btn ${isActive('/seller-dashboard') ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                                    >
                                        <ShieldCheck size={16} /> {user.role === 'broker' ? 'Broker Portal' : 'Seller Portal'}
                                    </Link>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
                                    <img
                                        src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                                        alt={user.name}
                                        style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-emerald)' }}
                                    />
                                    <div style={{ lineHeight: '1.2' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>{user.name.split(' ')[0]}</div>
                                        <div className="badge badge-emerald" style={{ fontSize: '0.62rem', padding: '1px 4px' }}>
                                            {user.verification_id || 'VERIFIED'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                        title="Logout"
                                    >
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                                    style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                                >
                                    <User size={16} /> Login
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                                    style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                                >
                                    Register
                                </button>
                            </div>
                        )}
                    </div>
                </div>
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
