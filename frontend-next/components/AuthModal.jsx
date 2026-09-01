'use client';
import React, { useState } from 'react';
import { 
    X, User, Mail, Lock, Phone, ShieldCheck, Building2, CheckCircle2, 
    FileText, KeyRound, Award, Send, Copy, Check, ArrowRight, RefreshCw, Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const AuthModal = ({ mode = 'login', onClose }) => {
    const { login, register } = useAuth();
    
    const [isLogin, setIsLogin] = useState(mode === 'login');
    const [regStep, setRegStep] = useState(1);

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('buyer');

    const [loginIdentifier, setLoginIdentifier] = useState('');

    // Dual OTP inputs (User types the codes received via Email & SMS)
    const [inputEmailOtp, setInputEmailOtp] = useState('');
    const [inputPhoneOtp, setInputPhoneOtp] = useState('');

    // Legal credentials for Seller / Broker
    const [govtIdType, setGovtIdType] = useState('Aadhaar Card');
    const [govtIdNumber, setGovtIdNumber] = useState('');
    const [reraNumber, setReraNumber] = useState('');
    const [agencyLicense, setAgencyLicense] = useState('');
    const [ownershipProofRef, setOwnershipProofRef] = useState('');

    // Success Verification ID state
    const [issuedUser, setIssuedUser] = useState(null);
    const [copiedId, setCopiedId] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSentMsg, setOtpSentMsg] = useState('');

    // Step 1 -> Step 2: Send Dual OTP to Email and Phone
    const handleSendDualOtp = async () => {
        if (!name.trim()) {
            setError('Please enter your full name.');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!phone.trim() || phone.length < 8) {
            setError('Please enter a valid mobile contact number.');
            return;
        }
        if (!password || password.length < 4) {
            setError('Password must be at least 4 characters.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await authAPI.sendOtp({ email, phone, name });
            setOtpSentMsg(res.data.message || `OTP verification codes have been sent to your email (${email}) and contact number (${phone}).`);
            setInputEmailOtp('');
            setInputPhoneOtp('');
            setRegStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to dispatch verification OTPs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 -> Step 3: Verify Both Contact & Email OTPs with backend
    const handleVerifyDualOtp = async () => {
        if (!inputEmailOtp.trim() || inputEmailOtp.length < 4) {
            setError('Please enter the 4-digit OTP code sent to your email.');
            return;
        }
        if (!inputPhoneOtp.trim() || inputPhoneOtp.length < 4) {
            setError('Please enter the 4-digit SMS OTP code sent to your contact number.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await authAPI.verifyOtp({
                email,
                phone,
                emailOtp: inputEmailOtp.trim(),
                phoneOtp: inputPhoneOtp.trim()
            });

            if (role === 'buyer') {
                // Buyers are immediately registered and issued Verification ID
                await completeFinalRegistration();
            } else {
                // Sellers and Brokers proceed to Step 3 (Legal / RERA details)
                setRegStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP code. Please check your SMS and Email inbox.');
        } finally {
            setLoading(false);
        }
    };

    const completeFinalRegistration = async () => {
        setError('');
        setLoading(true);

        try {
            const userRes = await register({
                name,
                email,
                password,
                role,
                phone,
                govt_id_type: govtIdType,
                govt_id_number: govtIdNumber,
                rera_number: reraNumber,
                agency_license: agencyLicense,
                ownership_proof_ref: ownershipProofRef
            });
            
            setIssuedUser({
                name: userRes.name || name,
                email: userRes.email || email,
                phone: userRes.phone || phone,
                role: userRes.role || role,
                verification_id: userRes.verification_id
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        await completeFinalRegistration();
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ identifier: loginIdentifier, password });
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Check your Contact Number, Email, or Verification ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyVerificationId = () => {
        if (issuedUser?.verification_id) {
            navigator.clipboard.writeText(issuedUser.verification_id);
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
        }}>
            <div className="glass-card" style={{ 
                width: '100%', 
                maxWidth: '480px', 
                padding: '28px', 
                position: 'relative', 
                background: '#ffffff',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <X size={18} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px auto',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                    }}>
                        <Building2 size={24} color="#ffffff" />
                    </div>
                    <h2 style={{ fontSize: '1.45rem', color: '#0f172a' }}>
                        {isLogin ? 'Member Login' : 'Evertree Verified Registration'}
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {isLogin ? 'Log in with Email, Contact Number, or Verification ID' : 'Dual OTP Verification for Contact Number & Email'}
                    </p>
                </div>

                {error && (
                    <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.82rem', marginBottom: '14px', lineHeight: '1.4' }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    STAGE: OFFICIAL VERIFICATION ID CARD (SUCCESS)
                   ══════════════════════════════════════════════════════════ */}
                {issuedUser ? (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: '#dcfce7',
                            color: '#15803d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px auto'
                        }}>
                            <CheckCircle2 size={36} />
                        </div>

                        <h3 style={{ color: '#0f172a', fontSize: '1.3rem', marginBottom: '4px' }}>
                            Verification Complete!
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Your contact number & email have been verified. Your official Evertree Verification ID has been issued:
                        </p>

                        {/* ID Badge Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                            border: '2px solid #86efac',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '18px',
                            boxShadow: '0 4px 15px rgba(5, 150, 105, 0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.78rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>
                                <span>🌲 Official Member ID</span>
                                <span className="badge badge-emerald">{issuedUser.role.toUpperCase()}</span>
                            </div>

                            <div style={{
                                fontFamily: 'var(--font-primary)',
                                fontSize: '1.6rem',
                                fontWeight: '800',
                                color: '#15803d',
                                letterSpacing: '2px',
                                padding: '8px',
                                background: '#ffffff',
                                borderRadius: '8px',
                                border: '1px dashed #059669',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                marginBottom: '12px'
                            }}>
                                <span>{issuedUser.verification_id}</span>
                                <button
                                    onClick={handleCopyVerificationId}
                                    style={{
                                        background: copiedId ? '#dcfce7' : '#f1f5f9',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.72rem',
                                        color: copiedId ? '#15803d' : '#475569'
                                    }}
                                    title="Copy ID"
                                >
                                    {copiedId ? <Check size={12} /> : <Copy size={12} />}
                                    {copiedId ? 'Copied' : 'Copy'}
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', textAlign: 'left' }}>
                                <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>PHONE VERIFIED</span>
                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>✓ {issuedUser.phone}</span>
                                </div>
                                <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>EMAIL VERIFIED</span>
                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>✓ {issuedUser.email}</span>
                                </div>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            You can log in at any time using this <strong>Verification ID ({issuedUser.verification_id})</strong>, your email, or contact number.
                        </p>

                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', padding: '12px', fontSize: '1rem' }} 
                            onClick={onClose}
                        >
                            Enter Evertree Portal <ArrowRight size={16} />
                        </button>
                    </div>
                ) : isLogin ? (
                    
                    /* ══════════════════════════════════════════════════════════
                        STAGE: LOGIN FORM (Supports ID, Phone, Email)
                       ══════════════════════════════════════════════════════════ */
                    <form onSubmit={handleLoginSubmit}>
                        <div className="form-group">
                            <label><KeyRound size={12} /> Contact Number / Email / Verification ID</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="e.g. EVT-BUY-89241 or 9876543210 or name@evertree.in" 
                                value={loginIdentifier} 
                                onChange={(e) => setLoginIdentifier(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label><Lock size={12} /> Password</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading}
                            style={{ width: '100%', padding: '10px', marginTop: '6px', fontSize: '0.95rem' }}
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Don't have an account?{' '}
                            <button 
                                type="button"
                                onClick={() => { setIsLogin(false); setRegStep(1); }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary-emerald)', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Create Account with OTP
                            </button>
                        </div>
                    </form>

                ) : (

                    /* ══════════════════════════════════════════════════════════
                        STAGE: MULTI-STEP VERIFICATION & REGISTRATION
                       ══════════════════════════════════════════════════════════ */
                    <div>
                        {/* Step Indicators */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
                            <span className={`badge ${regStep === 1 ? 'badge-emerald' : 'badge-blue'}`}>1. Details & Role</span>
                            <span className={`badge ${regStep === 2 ? 'badge-emerald' : 'badge-blue'}`}>2. Dual OTP</span>
                            {role !== 'buyer' && (
                                <span className={`badge ${regStep === 3 ? 'badge-emerald' : 'badge-blue'}`}>3. Legal Docs</span>
                            )}
                        </div>

                        {/* STEP 1: Details & Role Selection */}
                        {regStep === 1 && (
                            <div>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                                        SELECT ACCOUNT ROLE
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                        {[
                                            { id: 'buyer', label: 'Buyer', icon: User, desc: 'Buy & Rent' },
                                            { id: 'seller', label: 'Seller', icon: ShieldCheck, desc: 'Direct Owner' },
                                            { id: 'broker', label: 'Broker', icon: Building2, desc: 'RERA Agent' }
                                        ].map(item => {
                                             const Icon = item.icon;
                                             const active = role === item.id;
                                             return (
                                                 <button
                                                     type="button"
                                                     key={item.id}
                                                     onClick={() => setRole(item.id)}
                                                     style={{
                                                         padding: '10px 4px',
                                                         borderRadius: 'var(--radius-md)',
                                                         border: active ? '2px solid var(--primary-emerald)' : '1px solid #cbd5e1',
                                                         background: active ? '#dcfce7' : '#f8fafc',
                                                         color: active ? '#15803d' : 'var(--text-muted)',
                                                         display: 'flex',
                                                         flexDirection: 'column',
                                                         alignItems: 'center',
                                                         gap: '2px',
                                                         cursor: 'pointer',
                                                         fontSize: '0.78rem',
                                                         fontWeight: '700',
                                                         transition: 'all 0.2s ease'
                                                     }}
                                                 >
                                                     <Icon size={18} />
                                                     <span>{item.label}</span>
                                                     <span style={{ fontSize: '0.65rem', fontWeight: '400', opacity: 0.85 }}>{item.desc}</span>
                                                 </button>
                                             );
                                         })}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label><User size={12} /> Full Name *</label>
                                    <input type="text" className="form-control" placeholder="e.g. Ramesh Kumar" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>

                                <div className="form-group">
                                    <label><Mail size={12} /> Email Address (For Email OTP) *</label>
                                    <input type="email" className="form-control" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>

                                <div className="form-group">
                                    <label><Phone size={12} /> Contact Number (For SMS OTP) *</label>
                                    <input type="tel" className="form-control" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                </div>

                                <div className="form-group">
                                    <label><Lock size={12} /> Password *</label>
                                    <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>

                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    disabled={loading}
                                    style={{ width: '100%', marginTop: '6px', padding: '12px' }}
                                    onClick={handleSendDualOtp}
                                >
                                    <Send size={14} /> {loading ? 'Sending OTP Codes...' : 'Send OTP to Email & Phone →'}
                                </button>
                            </div>
                        )}

                        {/* STEP 2: DUAL OTP VERIFICATION (Enter Codes received via Email & SMS) */}
                        {regStep === 2 && (
                            <div style={{ padding: '4px 0' }}>
                                
                                {/* OTP Dispatch Notice */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                                    border: '1px solid #86efac',
                                    borderRadius: '10px',
                                    padding: '14px',
                                    marginBottom: '16px',
                                    fontSize: '0.82rem',
                                    color: '#166534'
                                }}>
                                    <div style={{ fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckCircle2 size={16} color="#059669" /> Verification Codes Dispatched:
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
                                        <div>✉️ OTP sent to your Email: <strong>{email}</strong></div>
                                        <div>📱 SMS OTP sent to your Mobile: <strong>{phone}</strong></div>
                                    </div>
                                </div>

                                {/* Dual Input Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                    
                                    {/* Email OTP Field */}
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Mail size={12} /> Email OTP
                                        </label>
                                        <input 
                                            type="text" 
                                            maxLength="6" 
                                            className="form-control" 
                                            placeholder="••••" 
                                            value={inputEmailOtp} 
                                            onChange={(e) => setInputEmailOtp(e.target.value)} 
                                            style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: '800' }}
                                        />
                                    </div>

                                    {/* Phone OTP Field */}
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Smartphone size={12} /> SMS Phone OTP
                                        </label>
                                        <input 
                                            type="text" 
                                            maxLength="6" 
                                            className="form-control" 
                                            placeholder="••••" 
                                            value={inputPhoneOtp} 
                                            onChange={(e) => setInputPhoneOtp(e.target.value)} 
                                            style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: '800' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                                        onClick={() => setRegStep(1)}
                                    >
                                        Change Phone / Email
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                                        onClick={handleSendDualOtp}
                                    >
                                        <RefreshCw size={12} /> Resend OTPs
                                    </button>
                                </div>

                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    disabled={loading}
                                    style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }} 
                                    onClick={handleVerifyDualOtp}
                                >
                                    <CheckCircle2 size={16} /> {loading ? 'Verifying OTPs...' : (role === 'buyer' ? 'Verify & Issue Verification ID' : 'Verify OTPs & Continue to Legal Info →')}
                                </button>
                            </div>
                        )}

                        {/* STEP 3: Legal Requirements for Seller & Broker */}
                        {regStep === 3 && (
                            <form onSubmit={handleRegisterSubmit}>
                                {role === 'seller' ? (
                                    <div>
                                        <div className="badge badge-gold" style={{ marginBottom: '12px', padding: '6px 10px' }}>
                                            <Award size={14} /> Direct Seller Verification Requirements
                                        </div>

                                        <div className="form-group">
                                            <label><FileText size={12} /> Government ID Proof Type *</label>
                                            <select className="form-control" value={govtIdType} onChange={(e) => setGovtIdType(e.target.value)}>
                                                <option value="Aadhaar Card">Aadhaar Card</option>
                                                <option value="PAN Card">PAN Card</option>
                                                <option value="Passport">Passport</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Government ID Number *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="e.g. 5482-9012-3456 or ABCDE1234F" 
                                                value={govtIdNumber} 
                                                onChange={(e) => setGovtIdNumber(e.target.value)} 
                                                required 
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Property Ownership Deed / Khata Reference No. *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="e.g. KHT-BLR-2024-8812 / Sale Deed No." 
                                                value={ownershipProofRef} 
                                                onChange={(e) => setOwnershipProofRef(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="badge badge-emerald" style={{ marginBottom: '12px', padding: '6px 10px' }}>
                                            <Award size={14} /> RERA & Real Estate Broker License
                                        </div>

                                        <div className="form-group">
                                            <label>RERA Registration Number * (Mandatory)</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="e.g. PRM/KA/RERA/1251/310/PR/180521/002341" 
                                                value={reraNumber} 
                                                onChange={(e) => setReraNumber(e.target.value)} 
                                                required 
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Government ID Type *</label>
                                            <select className="form-control" value={govtIdType} onChange={(e) => setGovtIdType(e.target.value)}>
                                                <option value="PAN Card">PAN Card</option>
                                                <option value="GSTIN">GSTIN Certificate</option>
                                                <option value="Aadhaar Card">Aadhaar Card</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>ID / GST Number *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="e.g. 29ABCDE1234F1Z5" 
                                                value={govtIdNumber} 
                                                onChange={(e) => setGovtIdNumber(e.target.value)} 
                                                required 
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Agency License Number (Optional)</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="e.g. LIC-BRK-2024-991" 
                                                value={agencyLicense} 
                                                onChange={(e) => setAgencyLicense(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        style={{ padding: '10px' }} 
                                        onClick={() => setRegStep(2)}
                                    >
                                        Back
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary" 
                                        disabled={loading}
                                        style={{ flex: 1, padding: '10px' }}
                                    >
                                        {loading ? 'Submitting...' : 'Complete & Issue Verification ID'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Already registered?{' '}
                            <button 
                                type="button"
                                onClick={() => setIsLogin(true)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary-emerald)', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Member Login
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
