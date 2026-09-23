'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Clock3, Phone, Mail, MessageSquare, RefreshCw, AlertCircle, UserPlus } from 'lucide-react';
import { propertyAPI, serviceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function BuyerRequestsPage() {
    const { user, loading: authLoading } = useAuth();
    const [enquiries, setEnquiries] = useState([]);
    const [brokerRequests, setBrokerRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadEnquiries = async () => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const res = await propertyAPI.getEnquiries();
            setEnquiries(Array.isArray(res.data) ? res.data : []);
            
            if (user?.role === 'broker') {
                try {
                    const brokerRes = await serviceAPI.getBrokerRequests();
                    setBrokerRequests(Array.isArray(brokerRes.data) ? brokerRes.data : []);
                } catch (bErr) {
                    console.error('Failed to load broker requests:', bErr);
                }
            }
        } catch (err) {
            console.error('Failed to load buyer requests:', err);
            setError(err.response?.data?.error || 'Unable to load buyer enquiries.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadEnquiries();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const formatDate = (date) => {
        if (!date) return 'Recently';
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return 'Recently';
        return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed);
    };

    if (authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-slate-900">Sign in to view requests</h1>
                    <p className="mt-2 text-sm text-slate-500">Sign in to view buyer enquiries for your properties.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                        <Users className="w-4 h-4" /> Buyer Management
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Buyer Requests & Enquiries
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        All buyer enquiries and direct requests submitted for you.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadEnquiries}
                    disabled={loading}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 self-start sm:self-auto"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                    <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</span>
                    <button onClick={loadEnquiries} className="px-3 py-1 bg-white border border-rose-200 font-bold rounded-lg">Retry</button>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="py-16 text-center text-slate-500 text-sm">Loading buyer requests...</div>
            ) : enquiries.length === 0 && (user?.role !== 'broker' || brokerRequests.length === 0) ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center max-w-xl mx-auto shadow-xs mt-8">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No requests found</h3>
                    <p className="text-sm text-slate-500">
                        When buyers contact you or submit enquiries for your property listings, their requests will appear here dynamically.
                    </p>
                </div>
            ) : (
                <>
                    {enquiries.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4">Property Enquiries</h2>
                            <div className="grid gap-4">
                    {enquiries.map((enquiry) => (
                        <div key={enquiry.id} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Target Property</span>
                                    <h2 className="text-base sm:text-lg font-bold text-slate-900">{enquiry.property_title || 'Property Listing'}</h2>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                    <Clock3 className="w-3.5 h-3.5 text-slate-400" /> {formatDate(enquiry.created_at)}
                                </span>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Buyer Message</p>
                                <p className="text-sm text-slate-800 leading-relaxed font-medium">"{enquiry.message}"</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                                    <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                                        <Users className="w-4 h-4 text-blue-600" /> {enquiry.buyer_name || 'Interested Buyer'}
                                    </span>
                                    {enquiry.buyer_phone && (
                                        <a href={`tel:${enquiry.buyer_phone}`} className="flex items-center gap-1 hover:text-emerald-600">
                                            <Phone className="w-3.5 h-3.5 text-emerald-600" /> {enquiry.buyer_phone}
                                        </a>
                                    )}
                                    {enquiry.buyer_email && (
                                        <a href={`mailto:${enquiry.buyer_email}`} className="flex items-center gap-1 hover:text-emerald-600">
                                            <Mail className="w-3.5 h-3.5 text-amber-600" /> {enquiry.buyer_email}
                                        </a>
                                    )}
                                </div>

                                <Link
                                    href={`/messages?userId=${enquiry.buyer_id}&name=${encodeURIComponent(enquiry.buyer_name || 'Buyer')}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" /> Reply in Chat
                                </Link>
                            </div>
                        </div>
                            ))}
                            </div>
                        </div>
                    )}

                    {/* Broker Requests Section */}
                    {user?.role === 'broker' && brokerRequests.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Direct Broker Requests</h2>
                                <p className="text-xs text-slate-500 mt-1">Users requesting your professional assistance.</p>
                            </div>
                            
                            <div className="grid gap-4">
                                {brokerRequests.map((req) => (
                                    <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                            <div>
                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Broker Assistance Request</span>
                                                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                                    From: {req.user_name || 'User'} <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full capitalize ml-2">{req.user_role}</span>
                                                </h2>
                                            </div>
                                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                                <Clock3 className="w-3.5 h-3.5 text-slate-400" /> {formatDate(req.created_at)}
                                            </span>
                                        </div>
            
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                            <p className="text-xs font-bold text-blue-600 uppercase mb-1">Assistance Needed</p>
                                            <p className="text-sm text-slate-800 leading-relaxed font-medium">"{req.details?.message}"</p>
                                        </div>
            
                                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                                                {req.user_phone && (
                                                    <a href={`tel:${req.user_phone}`} className="flex items-center gap-1 hover:text-emerald-600">
                                                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> {req.user_phone}
                                                    </a>
                                                )}
                                                {req.user_email && (
                                                    <a href={`mailto:${req.user_email}`} className="flex items-center gap-1 hover:text-emerald-600">
                                                        <Mail className="w-3.5 h-3.5 text-amber-600" /> {req.user_email}
                                                    </a>
                                                )}
                                            </div>
                                            
                                            <Link
                                                href={`/messages?userId=${req.user_id}&name=${encodeURIComponent(req.user_name || 'User')}`}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" /> Reply in Chat
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}