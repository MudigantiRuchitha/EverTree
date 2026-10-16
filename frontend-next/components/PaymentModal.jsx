'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    CreditCard,
    Smartphone,
    Building,
    Wallet,
    ShieldCheck,
    CheckCircle2,
    Lock,
    ArrowRight,
    QrCode,
    Loader2,
    Check,
    Sparkles,
    AlertCircle,
    Copy,
    ExternalLink
} from 'lucide-react';
import { subscriptionAPI } from '../services/api';

export default function PaymentModal({
    isOpen,
    onClose,
    plan,
    onSuccess
}) {
    const [selectedMethod, setSelectedMethod] = useState('upi'); // upi | card | netbanking | wallet
    
    // UPI states
    const [upiMode, setUpiMode] = useState('qr'); // qr | id | app
    const [upiId, setUpiId] = useState('');
    const [upiApp, setUpiApp] = useState('gpay');
    const [upiVerified, setUpiVerified] = useState(false);
    const [upiUtr, setUpiUtr] = useState('');
    const [copiedVpa, setCopiedVpa] = useState(false);
    const evertreeVpa = 'evertree@okhdfcbank';

    // Card states
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    // Net Banking states
    const [selectedBank, setSelectedBank] = useState('HDFC Bank');

    // Wallet states
    const [selectedWallet, setSelectedWallet] = useState('Paytm');

    // Payment processing states
    const [processing, setProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [successData, setSuccessData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Reset when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setProcessing(false);
            setProcessingStep('');
            setSuccessData(null);
            setErrorMsg('');
            setUpiVerified(false);
            setUpiUtr('');
            setCopiedVpa(false);
        }
    }, [isOpen, plan]);

    if (!isOpen || !plan) return null;

    const priceNum = Number(plan.price) || 999;
    const basePrice = Math.round(priceNum / 1.18);
    const gstPrice = priceNum - basePrice;

    const upiDeepLink = `upi://pay?pa=${encodeURIComponent(evertreeVpa)}&pn=${encodeURIComponent('EverTree Property Connect')}&am=${priceNum}&cu=INR&tn=${encodeURIComponent(plan.name + ' Plan Subscription')}`;
    const upiQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiDeepLink)}`;

    const handleCopyVpa = () => {
        try {
            navigator.clipboard?.writeText(evertreeVpa);
            setCopiedVpa(true);
            setTimeout(() => setCopiedVpa(false), 2000);
        } catch (_) {}
    };

    // Format Card Number (XXXX XXXX XXXX XXXX)
    const handleCardNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        setCardNumber(formatted);
    };

    // Format Expiry (MM/YY)
    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (val.length >= 3) {
            val = val.slice(0, 2) + '/' + val.slice(2);
        }
        setCardExpiry(val);
    };

    // Verify UPI ID simulation
    const handleVerifyUpi = () => {
        if (!upiId.includes('@')) {
            setErrorMsg('Please enter a valid UPI ID (e.g. mobile@upi or name@okhdfcbank)');
            return;
        }
        setErrorMsg('');
        setUpiVerified(true);
    };

    // Card brand detection
    const getCardBrand = () => {
        const cleaned = cardNumber.replace(/\s+/g, '');
        if (cleaned.startsWith('4')) return 'Visa';
        if (cleaned.startsWith('5')) return 'Mastercard';
        if (cleaned.startsWith('6') || cleaned.startsWith('508')) return 'RuPay';
        return 'Card';
    };

    // Execute Payment
    const handleProcessPayment = async () => {
        setErrorMsg('');
        
        // Validation check
        if (selectedMethod === 'upi') {
            if (upiMode === 'id' && !upiId.trim()) {
                setErrorMsg('Please enter your UPI ID');
                return;
            }
        } else if (selectedMethod === 'card') {
            const cleanNum = cardNumber.replace(/\s+/g, '');
            if (cleanNum.length < 16) {
                setErrorMsg('Please enter a valid 16-digit card number');
                return;
            }
            if (!cardHolder.trim()) {
                setErrorMsg('Please enter the cardholder name');
                return;
            }
            if (cardExpiry.length < 5) {
                setErrorMsg('Please enter valid expiry date (MM/YY)');
                return;
            }
            if (cardCvv.length < 3) {
                setErrorMsg('Please enter 3-digit CVV');
                return;
            }
        }

        setProcessing(true);
        setProcessingStep('Connecting to secure payment gateway...');

        try {
            // Simulated gateway step 1
            await new Promise(r => setTimeout(r, 800));
            setProcessingStep('Authorizing payment with bank server...');

            // Simulated gateway step 2
            await new Promise(r => setTimeout(r, 900));
            setProcessingStep('Verifying 3D Secure / UPI authorization...');

            const rawTxn = upiUtr.trim() || `TXN_EVT_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
            const txnId = upiUtr.trim() ? `UPI_UTR_${upiUtr.trim()}` : rawTxn;
            let methodLabel = 'UPI';
            if (selectedMethod === 'upi') {
                if (upiMode === 'qr') {
                    methodLabel = upiUtr.trim() ? `UPI (QR Scan - UTR: ${upiUtr.trim()})` : 'UPI (QR Code Scan)';
                } else if (upiMode === 'app') {
                    methodLabel = upiUtr.trim() ? `UPI (${upiApp.toUpperCase()} - UTR: ${upiUtr.trim()})` : `UPI (${upiApp.toUpperCase()})`;
                } else {
                    methodLabel = upiUtr.trim() ? `UPI (${upiId || 'VPA'} - UTR: ${upiUtr.trim()})` : `UPI (${upiId || 'VPA'})`;
                }
            } else if (selectedMethod === 'card') {
                methodLabel = `${getCardBrand()} Card (ending ${cardNumber.slice(-4)})`;
            } else if (selectedMethod === 'netbanking') {
                methodLabel = `Net Banking (${selectedBank})`;
            } else if (selectedMethod === 'wallet') {
                methodLabel = `Wallet (${selectedWallet})`;
            }

            // Post to backend
            const response = await subscriptionAPI.subscribe({
                plan_id: plan.id,
                payment_method: methodLabel,
                transaction_id: txnId,
                amount: priceNum
            });

            await new Promise(r => setTimeout(r, 600));

            const resData = response.data;
            setSuccessData({
                planName: plan.name,
                propertyLimit: resData.property_limit || plan.property_limit,
                transactionId: txnId,
                amount: priceNum,
                method: methodLabel
            });

            if (onSuccess) {
                onSuccess(resData);
            }

        } catch (err) {
            console.error('Payment error:', err);
            setErrorMsg(err.response?.data?.message || err.message || 'Payment processing failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-auto">
                
                {/* MODAL HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                                <Sparkles className="w-3 h-3" /> Secure Checkout
                            </span>
                            <span className="text-xs text-slate-300">256-Bit SSL Encrypted</span>
                        </div>
                        <h3 className="text-xl font-bold mt-1 tracking-tight">Complete Plan Subscription</h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* MODAL CONTENT */}
                {successData ? (
                    /* SUCCESS SCREEN */
                    <div className="p-8 sm:p-12 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner ring-8 ring-emerald-50 animate-bounce">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>

                        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-slate-900">
                            Payment Successful!
                        </h2>
                        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto">
                            Your subscription to the <strong className="text-emerald-700">{successData.planName} Plan</strong> is now active.
                        </p>

                        <div className="mt-6 max-w-md mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-sm space-y-2.5">
                            <div className="flex justify-between text-slate-600">
                                <span>Transaction ID:</span>
                                <span className="font-mono font-bold text-slate-900">{successData.transactionId}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Payment Method:</span>
                                <span className="font-semibold text-slate-900">{successData.method}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Amount Paid:</span>
                                <span className="font-bold text-emerald-600">₹{successData.amount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2">
                                <span>Total Property Limit:</span>
                                <span className="font-black text-emerald-700 text-base">{successData.propertyLimit} Properties</span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Continue & Upload Properties
                            </button>
                        </div>
                    </div>
                ) : (
                    /* PAYMENT FORM */
                    <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px]">
                        
                        {/* PAYMENT METHODS TABS (MD: 4 COLS) */}
                        <div className="md:col-span-4 bg-slate-50 border-r border-slate-200 p-4 space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">
                                Payment Options
                            </p>

                            {/* UPI TAB */}
                            <button
                                type="button"
                                onClick={() => setSelectedMethod('upi')}
                                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                                    selectedMethod === 'upi'
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                        : 'text-slate-700 hover:bg-slate-200/60'
                                }`}
                            >
                                <Smartphone className="w-5 h-5 shrink-0" />
                                <div className="flex-1">
                                    <div className="leading-tight">UPI / QR</div>
                                    <div className={`text-[10px] ${selectedMethod === 'upi' ? 'text-emerald-100' : 'text-slate-500'}`}>
                                        GPay, PhonePe, Paytm
                                    </div>
                                </div>
                            </button>

                            {/* CARDS TAB */}
                            <button
                                type="button"
                                onClick={() => setSelectedMethod('card')}
                                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                                    selectedMethod === 'card'
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                        : 'text-slate-700 hover:bg-slate-200/60'
                                }`}
                            >
                                <CreditCard className="w-5 h-5 shrink-0" />
                                <div className="flex-1">
                                    <div className="leading-tight">Credit / Debit Card</div>
                                    <div className={`text-[10px] ${selectedMethod === 'card' ? 'text-emerald-100' : 'text-slate-500'}`}>
                                        Visa, Mastercard, RuPay
                                    </div>
                                </div>
                            </button>

                            {/* NET BANKING TAB */}
                            <button
                                type="button"
                                onClick={() => setSelectedMethod('netbanking')}
                                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                                    selectedMethod === 'netbanking'
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                        : 'text-slate-700 hover:bg-slate-200/60'
                                }`}
                            >
                                <Building className="w-5 h-5 shrink-0" />
                                <div className="flex-1">
                                    <div className="leading-tight">Net Banking</div>
                                    <div className={`text-[10px] ${selectedMethod === 'netbanking' ? 'text-emerald-100' : 'text-slate-500'}`}>
                                        All Indian Banks
                                    </div>
                                </div>
                            </button>

                            {/* WALLET TAB */}
                            <button
                                type="button"
                                onClick={() => setSelectedMethod('wallet')}
                                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                                    selectedMethod === 'wallet'
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                        : 'text-slate-700 hover:bg-slate-200/60'
                                }`}
                            >
                                <Wallet className="w-5 h-5 shrink-0" />
                                <div className="flex-1">
                                    <div className="leading-tight">Wallets</div>
                                    <div className={`text-[10px] ${selectedMethod === 'wallet' ? 'text-emerald-100' : 'text-slate-500'}`}>
                                        Paytm, PhonePe, Amazon
                                    </div>
                                </div>
                            </button>

                            {/* ORDER SUMMARY PREVIEW IN SIDEBAR */}
                            <div className="pt-4 mt-4 border-t border-slate-200 text-xs text-slate-600 space-y-1.5 px-2">
                                <div className="flex justify-between font-semibold text-slate-800">
                                    <span>{plan.name} Plan</span>
                                    <span>₹{priceNum.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 text-[11px]">
                                    <span>Listing Quota:</span>
                                    <span className="font-bold text-emerald-700">{plan.property_limit} Properties</span>
                                </div>
                                <div className="flex justify-between text-slate-500 text-[11px]">
                                    <span>Validity:</span>
                                    <span>{plan.duration_days || 30} Days</span>
                                </div>
                            </div>
                        </div>

                        {/* PAYMENT DETAILS FORM (MD: 8 COLS) */}
                        <div className="md:col-span-8 p-6 flex flex-col justify-between">
                            
                            <div>
                                {errorMsg && (
                                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}

                                {/* ==================== 1. UPI METHOD ==================== */}
                                {selectedMethod === 'upi' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <h4 className="font-bold text-slate-900 text-sm">UPI Payment Method</h4>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setUpiMode('id')}
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                                        upiMode === 'id' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    UPI ID
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setUpiMode('qr')}
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                                                        upiMode === 'qr' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    <QrCode className="w-3.5 h-3.5" /> Scan QR
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setUpiMode('app')}
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                                        upiMode === 'app' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    UPI Apps
                                                </button>
                                            </div>
                                        </div>

                                        {upiMode === 'id' && (
                                            <div className="space-y-3">
                                                <label className="block text-xs font-bold text-slate-700">
                                                    Enter Virtual Payment Address (UPI ID)
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={upiId}
                                                        onChange={(e) => {
                                                            setUpiId(e.target.value);
                                                            setUpiVerified(false);
                                                        }}
                                                        placeholder="e.g. mobile@upi or username@okhdfcbank"
                                                        className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleVerifyUpi}
                                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                                            upiVerified
                                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                                : 'bg-slate-800 text-white hover:bg-slate-900'
                                                        }`}
                                                    >
                                                        {upiVerified ? '✓ Verified' : 'Verify'}
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500">
                                                    <span className="cursor-pointer hover:text-emerald-700 font-medium" onClick={() => setUpiId(prev => (prev.split('@')[0] || 'seller') + '@okaxis')}>@okaxis</span>
                                                    <span className="cursor-pointer hover:text-emerald-700 font-medium" onClick={() => setUpiId(prev => (prev.split('@')[0] || 'seller') + '@okhdfcbank')}>@okhdfcbank</span>
                                                    <span className="cursor-pointer hover:text-emerald-700 font-medium" onClick={() => setUpiId(prev => (prev.split('@')[0] || 'seller') + '@paytm')}>@paytm</span>
                                                    <span className="cursor-pointer hover:text-emerald-700 font-medium" onClick={() => setUpiId(prev => (prev.split('@')[0] || 'seller') + '@ybl')}>@ybl</span>
                                                </div>

                                                <div className="pt-2">
                                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                                        UPI Transaction Ref / UTR No. (optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={upiUtr}
                                                        onChange={(e) => setUpiUtr(e.target.value)}
                                                        placeholder="e.g. 428901234567 (12 digits)"
                                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-emerald-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {upiMode === 'qr' && (
                                            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 text-center">
                                                    {/* Real Dynamic UPI QR Code */}
                                                    <img
                                                        src={upiQrCodeUrl}
                                                        alt="UPI Payment QR Code"
                                                        className="w-44 h-44 object-contain mx-auto rounded-lg"
                                                    />
                                                    <div className="mt-2 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5">
                                                        <span>UPI ID: <strong className="text-emerald-700">{evertreeVpa}</strong></span>
                                                        <button
                                                            type="button"
                                                            onClick={handleCopyVpa}
                                                            className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                                                            title="Copy UPI ID"
                                                        >
                                                            {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="mt-3 text-xs font-bold text-slate-800 text-center">
                                                    Scan with Google Pay, PhonePe, Paytm, or BHIM
                                                </p>
                                                <p className="text-[11px] text-slate-500 text-center">
                                                    Payable Amount: <strong className="text-emerald-700 font-bold">₹{priceNum}</strong>
                                                </p>

                                                {/* Deep link button for mobile / instant UPI app open */}
                                                <a
                                                    href={upiDeepLink}
                                                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                                                >
                                                    <Smartphone className="w-3.5 h-3.5" />
                                                    <span>Open Any UPI App Directly</span>
                                                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                                                </a>

                                                <div className="w-full mt-4 pt-3 border-t border-slate-200">
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        UPI Transaction Ref / UTR No. (after payment)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={upiUtr}
                                                        onChange={(e) => setUpiUtr(e.target.value)}
                                                        placeholder="e.g. 428901234567 (12 digits, optional)"
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-emerald-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {upiMode === 'app' && (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { id: 'gpay', name: 'Google Pay', color: 'border-blue-500 bg-blue-50/50' },
                                                        { id: 'phonepe', name: 'PhonePe', color: 'border-purple-500 bg-purple-50/50' },
                                                        { id: 'paytm', name: 'Paytm UPI', color: 'border-cyan-500 bg-cyan-50/50' }
                                                    ].map((app) => (
                                                        <a
                                                            key={app.id}
                                                            href={upiDeepLink}
                                                            onClick={() => setUpiApp(app.id)}
                                                            className={`p-3 rounded-xl border text-center cursor-pointer transition-all block ${
                                                                upiApp === app.id
                                                                    ? `${app.color} ring-2 ring-emerald-500 font-bold`
                                                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                                            }`}
                                                        >
                                                            <div className="text-sm font-bold text-slate-900">{app.name}</div>
                                                            <div className="text-[10px] text-emerald-600 font-semibold mt-1">Tap to Open App</div>
                                                        </a>
                                                    ))}
                                                </div>

                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        Enter UPI UTR / Transaction ID (from your app)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={upiUtr}
                                                        onChange={(e) => setUpiUtr(e.target.value)}
                                                        placeholder="Enter 12-digit UTR No. (optional)"
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-emerald-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ==================== 2. CARD METHOD ==================== */}
                                {selectedMethod === 'card' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <h4 className="font-bold text-slate-900 text-sm">Credit or Debit Card</h4>
                                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                {getCardBrand()}
                                            </span>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Number</label>
                                            <input
                                                type="text"
                                                maxLength={19}
                                                value={cardNumber}
                                                onChange={handleCardNumberChange}
                                                placeholder="4532 8901 2345 6789"
                                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono tracking-wider focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Cardholder Name</label>
                                            <input
                                                type="text"
                                                value={cardHolder}
                                                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                                                placeholder="AS PRINTED ON CARD"
                                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm uppercase focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Valid Thru</label>
                                                <input
                                                    type="text"
                                                    maxLength={5}
                                                    value={cardExpiry}
                                                    onChange={handleExpiryChange}
                                                    placeholder="MM/YY"
                                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">CVV / CVC</label>
                                                <input
                                                    type="password"
                                                    maxLength={4}
                                                    value={cardCvv}
                                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="•••"
                                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ==================== 3. NET BANKING METHOD ==================== */}
                                {selectedMethod === 'netbanking' && (
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                                            Select Your Bank
                                        </h4>
                                        <div className="grid grid-cols-3 gap-2.5">
                                            {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((bank) => (
                                                <div
                                                    key={bank}
                                                    onClick={() => setSelectedBank(bank)}
                                                    className={`p-2.5 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                                        selectedBank === bank
                                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                                                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    {bank}
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Or choose other bank</label>
                                            <select
                                                value={selectedBank}
                                                onChange={(e) => setSelectedBank(e.target.value)}
                                                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                                            >
                                                <option>HDFC Bank</option>
                                                <option>State Bank of India</option>
                                                <option>ICICI Bank</option>
                                                <option>Axis Bank</option>
                                                <option>Kotak Mahindra Bank</option>
                                                <option>Punjab National Bank</option>
                                                <option>Bank of Baroda</option>
                                                <option>Canara Bank</option>
                                                <option>IndusInd Bank</option>
                                                <option>Union Bank of India</option>
                                                <option>IDFC FIRST Bank</option>
                                                <option>Yes Bank</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* ==================== 4. WALLETS METHOD ==================== */}
                                {selectedMethod === 'wallet' && (
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                                            Choose Digital Wallet
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'Paytm', label: 'Paytm Wallet' },
                                                { id: 'PhonePe', label: 'PhonePe Wallet' },
                                                { id: 'AmazonPay', label: 'Amazon Pay Balance' },
                                                { id: 'MobiKwik', label: 'MobiKwik' }
                                            ].map((w) => (
                                                <div
                                                    key={w.id}
                                                    onClick={() => setSelectedWallet(w.id)}
                                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                                        selectedWallet === w.id
                                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                                                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <div className="text-sm font-semibold">{w.label}</div>
                                                    <div className="text-[10px] text-slate-500">Fast 1-click checkout</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* BOTTOM PAYMENT ACTION */}
                            <div className="pt-5 mt-5 border-t border-slate-200">
                                <div className="flex items-center justify-between mb-3 text-xs">
                                    <span className="text-slate-500">Plan Quota Upgrade:</span>
                                    <span className="font-bold text-slate-900">{plan.name} (+{plan.property_limit} listings)</span>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-xs text-slate-500">Total Payable Amount</div>
                                        <div className="text-2xl font-black text-slate-900">
                                            ₹{priceNum.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                        <ShieldCheck className="w-3.5 h-3.5" /> 100% Buyer Protected
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={handleProcessPayment}
                                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>{processingStep}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            <span>Pay ₹{priceNum.toLocaleString('en-IN')} & Activate Subscription</span>
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
