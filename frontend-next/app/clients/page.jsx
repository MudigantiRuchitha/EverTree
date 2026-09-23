'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Users,
    Clock3,
    Phone,
    Mail,
    MessageSquare,
    RefreshCw,
    AlertCircle,
    UserPlus,
    ShieldCheck,
    Home,
    Search
} from 'lucide-react';
import { serviceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ClientsPage() {
    const { user, loading: authLoading } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // 'all' | 'buyer' | 'seller'
    const [search, setSearch] = useState('');

    const loadRequests = async () => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const res = await serviceAPI.getBrokerRequests();
            const data = Array.isArray(res.data) ? res.data : [];
            setRequests(data);
            // cache for offline
            localStorage.setItem('evertree_broker_requests', JSON.stringify(data));
        } catch (err) {
            console.error('Failed to load broker requests:', err);
            const cached = localStorage.getItem('evertree_broker_requests');
            if (cached) {
                try { setRequests(JSON.parse(cached)); } catch (e) {}
                setError('Showing cached data. Could not reach server.');
            } else {
                setError(err.response?.data?.error || 'Unable to load client requests.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) loadRequests();
        else if (!authLoading) setLoading(false);
    }, [user, authLoading]);

    const formatDate = (date) => {
        if (!date) return 'Recently';
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return 'Recently';
        return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed);
    };

    const filtered = requests.filter(r => {
        const matchFilter = filter === 'all' || r.user_role === filter;
        const matchSearch = !search ||
            (r.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.user_email || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.details?.message || '').toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const buyerCount = requests.filter(r => r.user_role === 'buyer').length;
    const sellerCount = requests.filter(r => r.user_role === 'seller').length;

    if (authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-slate-900">Sign in to view clients</h1>
                    <p className="mt-2 text-sm text-slate-500">You need to be logged in as a broker to see client requests.</p>
                </div>
            </div>
        );
    }

    if (user.role !== 'broker') {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-xl font-black text-slate-900">Brokers Only</h1>
                    <p className="mt-2 text-sm text-slate-500">This page is only accessible to registered brokers.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                        <Users className="w-4 h-4" /> Client Management
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        My Clients
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        All buyers and sellers who have requested your professional assistance.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadRequests}
                    disabled={loading}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 self-start sm:self-auto"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
                    <p className="text-2xl font-black text-slate-900">{requests.length}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">Total Requests</p>
                </div>
                <div className="bg-white rounded-2xl border border-blue-100 p-4 text-center shadow-xs">
                    <p className="text-2xl font-black text-blue-600">{buyerCount}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">From Buyers</p>
                </div>
                <div className="bg-white rounded-2xl border border-emerald-100 p-4 text-center shadow-xs">
                    <p className="text-2xl font-black text-emerald-600">{sellerCount}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">From Sellers</p>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or message..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                {/* Role filter tabs */}
                <div className="flex gap-2 shrink-0">
                    {['all', 'buyer', 'seller'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                                filter === f
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {f === 'all' ? 'All' : f === 'buyer' ? `Buyers (${buyerCount})` : `Sellers (${sellerCount})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Error banner ── */}
            {error && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                    <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</span>
                    <button onClick={loadRequests} className="px-3 py-1 bg-white border border-amber-200 font-bold rounded-lg text-xs">Retry</button>
                </div>
            )}

            {/* ── List ── */}
            {loading ? (
                <div className="py-16 text-center">
                    <RefreshCw className="w-6 h-6 text-slate-300 mx-auto animate-spin mb-3" />
                    <p className="text-sm text-slate-400">Loading client requests...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
                    <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {requests.length === 0 ? 'No client requests yet' : 'No results found'}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {requests.length === 0
                            ? 'When buyers or sellers request your assistance, they will appear here.'
                            : 'Try adjusting your search or filter.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map(req => (
                        <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">

                                    {/* Role badge + name */}
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            req.user_role === 'seller'
                                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                                : 'bg-blue-50 border border-blue-200 text-blue-700'
                                        }`}>
                                            {req.user_role === 'seller' ? <Home className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                            {req.user_role}
                                        </span>
                                        <h2 className="text-base font-bold text-slate-900 truncate">
                                            {req.user_name || 'Unknown User'}
                                        </h2>
                                    </div>

                                    {/* Contact info */}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                        {req.user_phone && (
                                            <a href={`tel:${req.user_phone}`} className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-700">
                                                <Phone className="w-3 h-3" /> {req.user_phone}
                                            </a>
                                        )}
                                        {req.user_email && (
                                            <a href={`mailto:${req.user_email}`} className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700">
                                                <Mail className="w-3 h-3" /> {req.user_email}
                                            </a>
                                        )}
                                    </div>

                                    {/* Message */}
                                    {req.details?.message && (
                                        <div className={`mt-3 p-3 rounded-xl border text-xs text-slate-700 italic leading-relaxed ${
                                            req.user_role === 'seller'
                                                ? 'bg-emerald-50/50 border-emerald-100'
                                                : 'bg-blue-50/50 border-blue-100'
                                        }`}>
                                            &ldquo;{req.details.message}&rdquo;
                                        </div>
                                    )}
                                </div>

                                {/* Right side – date + action */}
                                <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-3">
                                    <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                                        <Clock3 className="w-3 h-3" />
                                        {formatDate(req.created_at)}
                                    </span>
                                    <Link
                                        href={`/messages?userId=${req.user_id}&name=${encodeURIComponent(req.user_name || 'User')}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors whitespace-nowrap"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}