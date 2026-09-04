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

    // Dual OTP inputs
    const [inputEmailOtp, setInputEmailOtp] = useState('');
    

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
    const handleSendOtp = async () => {
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
        // Email OTP only
        const res = await authAPI.sendOtp({
            email,
            name
        });

        setOtpSentMsg(
            res.data.message ||
            `OTP has been sent to your email (${email}).`
        );

        setInputEmailOtp('');
        setRegStep(2);

    } catch (err) {
        setError(
            err.response?.data?.error ||
            'Failed to send email OTP. Please try again.'
        );
    } finally {
        setLoading(false);
    }
};

    // Step 2 -> Step 3: Verify Both Contact & Email OTPs with backend
    const handleVerifyOtp = async () => {
    if (!inputEmailOtp.trim() || inputEmailOtp.length < 4) {
        setError('Please enter the 4-digit OTP code sent to your email.');
        return;
    }

    setError('');
    setLoading(true);

    try {
        await authAPI.verifyOtp({
            email,
            emailOtp: inputEmailOtp.trim()
        });

        if (role === 'buyer') {
            await completeFinalRegistration();
        } else {
            setRegStep(3);
        }

    } catch (err) {
        setError(
            err.response?.data?.error ||
            'Invalid email OTP. Please check your email.'
        );
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
        const loggedInUser = await login({
            identifier: loginIdentifier,
            password
        });

        onClose();

        // Redirect based on user role
        if (loggedInUser.role === 'seller') {
            window.location.href = '/seller-dashboard';
        } else if (loggedInUser.role === 'broker') {
            window.location.href = '/broker-dashboard';
        } else if (loggedInUser.role === 'admin') {
            window.location.href = '/admin';
        } else {
            // Buyer
            window.location.href = '/buyer-dashboard';
        }

    } catch (err) {
        setError(
            err.response?.data?.error ||
            'Login failed. Check your Contact Number, Email, or Verification ID.'
        );
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md sm:max-w-lg p-5 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/25">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {isLogin ? 'Member Login' : 'Evertree Verified Registration'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        {isLogin ? 'Log in with Email, Mobile Number, or Verification ID' : 'Email OTP Verification'}
                    </p>
                </div>

                {error && (
                    <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm leading-relaxed">
                        ⚠️ {error}
                    </div>
                )}

                {/* STAGE: OFFICIAL VERIFICATION ID CARD (SUCCESS) */}
                {issuedUser ? (
                    <div className="text-center py-2 space-y-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-9 h-9" />
                        </div>

                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                                Verification Complete!
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Your mobile & email have been verified. Your official Evertree Verification ID has been issued:
                            </p>
                        </div>

                        {/* ID Badge Card */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 shadow-sm space-y-3">
                            <div className="flex justify-between items-center text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                <span>🌲 Official Member ID</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-extrabold text-[10px]">
                                    {issuedUser.role}
                                </span>
                            </div>

                            <div className="flex items-center justify-center gap-3 p-3 bg-white rounded-xl border border-dashed border-emerald-500">
                                <span className="font-mono text-xl sm:text-2xl font-black text-emerald-700 tracking-wider">
                                    {issuedUser.verification_id}
                                </span>
                                <button
                                    onClick={handleCopyVerificationId}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                        copiedId
                                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copiedId ? 'Copied' : 'Copy'}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-left text-xs">
                                <div className="bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="text-[10px] text-slate-400 font-bold block">MOBILE VERIFIED</span>
                                    <span className="font-bold text-slate-800 truncate block">✓ {issuedUser.phone}</span>
                                </div>
                                <div className="bg-white p-2 rounded-lg border border-slate-100">
                                    <span className="text-[10px] text-slate-400 font-bold block">EMAIL VERIFIED</span>
                                    <span className="font-bold text-slate-800 truncate block">✓ {issuedUser.email}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500">
                            You can log in at any time using this <strong>Verification ID ({issuedUser.verification_id})</strong>, your email, or mobile number.
                        </p>

                        <button 
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer" 
                            onClick={onClose}
                        >
                            Enter Evertree Portal <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : isLogin ? (
                    
                    /* STAGE: LOGIN FORM */
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Mobile / Email / Verification ID
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                                placeholder="e.g. EVT-BUY-89241 or 9876543210 or name@evertree.in" 
                                value={loginIdentifier} 
                                onChange={(e) => setLoginIdentifier(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                <Lock className="w-3.5 h-3.5 text-emerald-600" /> Password
                            </label>
                            <input 
                                type="password" 
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>

                        <div className="text-center pt-2 text-xs sm:text-sm text-slate-500">
                            Don't have an account?{' '}
                            <button 
                                type="button"
                                onClick={() => { setIsLogin(false); setRegStep(1); }}
                                className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                            >
                                Create Account with OTP
                            </button>
                        </div>
                    </form>

                ) : (

                    /* STAGE: MULTI-STEP VERIFICATION & REGISTRATION */
                    <div className="space-y-4">
                        {/* Step Indicators */}
                        <div className="flex justify-center items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${regStep === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                1. Details
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${regStep === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                2. Dual OTP
                            </span>
                            {role !== 'buyer' && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${regStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                    3. Legal Docs
                                </span>
                            )}
                        </div>

                        {/* STEP 1: Details & Role Selection */}
                        {regStep === 1 && (
                            <div className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        SELECT ACCOUNT ROLE
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
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
                                                     className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                                         active 
                                                             ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20' 
                                                             : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                                     }`}
                                                 >
                                                     <Icon className="w-5 h-5" />
                                                     <span className="text-xs font-bold">{item.label}</span>
                                                     <span className="text-[10px] text-slate-400 font-normal">{item.desc}</span>
                                                 </button>
                                             );
                                         })}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        <User className="w-3.5 h-3.5 text-emerald-600" /> Full Name *
                                    </label>
                                    <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Ramesh Kumar" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>

                                <div className="space-y-1">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        <Mail className="w-3.5 h-3.5 text-emerald-600" /> Email Address (For OTP) *
                                    </label>
                                    <input type="email" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>

                                <div className="space-y-1">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> Mobile Number+ *
                                    </label>
                                    <input type="tel" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                </div>

                                <div className="space-y-1">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        <Lock className="w-3.5 h-3.5 text-emerald-600" /> Password *
                                    </label>
                                    <input type="password" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>

                                <button 
                                    type="button" 
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
                                    onClick={handleSendOtp}
                                >
                                    <Send className="w-4 h-4" /> {loading ? 'Sending OTP Codes...' : 'Send OTP to Email →'}
                                </button>
                            </div>
                        )}

                        {/* STEP 2: DUAL OTP VERIFICATION */}
                        {regStep === 2 && (
                            <div className="space-y-4">
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1.5">
                                    <div className="font-bold flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verification Code sent:
                                    </div>
                                    <div className="text-emerald-800 space-y-0.5">
                                        <div>✉️ Email OTP sent to: <strong>{email}</strong></div>
                                        
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="space-y-1">
                                        <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 uppercase">
                                            <Mail className="w-3 h-3 text-emerald-600" /> Email OTP
                                        </label>
                                        <input 
                                            type="text" 
                                            maxLength="6" 
                                            className="w-full py-2.5 text-center text-lg font-black tracking-widest bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
                                            placeholder="••••" 
                                            value={inputEmailOtp} 
                                            onChange={(e) => setInputEmailOtp(e.target.value)} 
                                        />
                                    </div>

                                    
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        onClick={() => setRegStep(1)}
                                    >
                                        Change Email
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center gap-1"
                                        onClick={handleSendOtp}
                                    >
                                        <RefreshCw className="w-3 h-3" /> Resend OTP
                                    </button>
                                </div>

                                <button 
                                    type="button" 
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60" 
                                    onClick={handleVerifyOtp}
                                >
                                    <CheckCircle2 className="w-4 h-4" /> {loading ? 'Verifying Email....' : (role === 'buyer' ? 'Verify Email & Issue Verification ID' : 'Verify Email & Continue to Legal Info →')}
                                </button>
                            </div>
                        )}

                        {/* STEP 3: Legal Requirements for Seller & Broker */}
                        {regStep === 3 && (
                            <form onSubmit={handleRegisterSubmit} className="space-y-3">
                                {role === 'seller' ? (
                                    <div className="space-y-3">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                            <Award className="w-3.5 h-3.5" /> Direct Seller Verification
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Government ID Proof Type *</label>
                                            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900" value={govtIdType} onChange={(e) => setGovtIdType(e.target.value)}>
                                                <option value="Aadhaar Card">Aadhaar Card</option>
                                                <option value="PAN Card">PAN Card</option>
                                                <option value="Passport">Passport</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Government ID Number *</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900" 
                                                placeholder="e.g. 5482-9012-3456 or ABCDE1234F" 
                                                value={govtIdNumber} 
                                                onChange={(e) => setGovtIdNumber(e.target.value)} 
                                                required 
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Property Ownership Deed / Khata Ref *</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900" 
                                                placeholder="e.g. KHT-BLR-2024-8812 / Sale Deed No." 
                                                value={ownershipProofRef} 
                                                onChange={(e) => setOwnershipProofRef(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            <Award className="w-3.5 h-3.5" /> RERA & Broker License
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700 uppercase">RERA Registration Number *</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900" 
                                                placeholder="e.g. PRM/KA/RERA/1251/310/PR/180521/002341" 
                                                value={reraNumber} 
                                                onChange={(e) => setReraNumber(e.target.value)} 
                                                required 
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Government ID Type *</label>
                                            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900" value={govtIdType} onChange={(e) => setGovtIdType(e.target.value)}>
                                                <option value="PAN Card">PAN Card</option>
                                                <option value="GSTIN">GSTIN Certificate</option>
                                                <option value="Aadhaar Card">Aadhaar Card</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700 uppercase">ID / GST Number *</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900" 
                                                placeholder="e.g. 29ABCDE1234F1Z5" 
                                                value={govtIdNumber} 
                                                onChange={(e) => setGovtIdNumber(e.target.value)} 
                                                required 
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Agency License Number (Optional)</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900" 
                                                placeholder="e.g. LIC-BRK-2024-991" 
                                                value={agencyLicense} 
                                                onChange={(e) => setAgencyLicense(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <button 
                                        type="button" 
                                        className="py-2.5 px-4 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200" 
                                        onClick={() => setRegStep(2)}
                                    >
                                        Back
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all disabled:opacity-60"
                                    >
                                        {loading ? 'Submitting...' : 'Complete & Issue Verification ID'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="text-center pt-2 text-xs sm:text-sm text-slate-500">
                            Already registered?{' '}
                            <button 
                                type="button"
                                onClick={() => setIsLogin(true)}
                                className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
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
