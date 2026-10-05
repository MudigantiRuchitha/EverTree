'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Building2,
    Users,
    MessageSquare,
    Bell,
    PlusCircle,
    ArrowRight,
    RefreshCw,
    Clock3,
    ShieldCheck,
    TrendingUp,
    Briefcase,
    Phone,
    Mail,
    Eye,
    ChevronRight,
    UserPlus
} from 'lucide-react';
import { propertyAPI, serviceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PropertyCard from '../../components/PropertyCard';
import AnimatedAdsBanner from '../../components/AnimatedAdsBanner';
import TopAdTicker from '../../components/TopAdTicker';
import InGridAdCard from '../../components/InGridAdCard';
import SpotlightAdCard from '../../components/SpotlightAdCard';

export default function BrokerDashboard() {
    const { user } = useAuth();
    const [myListings, setMyListings] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [brokerRequests, setBrokerRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const loadBrokerData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const isBrokerOrSeller = user?.role === 'broker' || user?.role === 'seller';
            const [listingsRes, enquiriesRes] = await Promise.all([
                isBrokerOrSeller
                    ? propertyAPI.getMyListings().catch(() => ({ data: [] }))
                    : Promise.resolve({ data: [] }),
                propertyAPI.getEnquiries().catch(() => ({ data: [] }))
            ]);
            setMyListings(Array.isArray(listingsRes.data) ? listingsRes.data : []);
            setEnquiries(Array.isArray(enquiriesRes.data) ? enquiriesRes.data : []);
            
            // Fetch Broker requests with localStorage fallback
            let fetchedBrokerRequests = [];
            try {
                const brRes = await serviceAPI.getBrokerRequests();
                fetchedBrokerRequests = Array.isArray(brRes.data) ? brRes.data : [];
                localStorage.setItem('evertree_broker_requests', JSON.stringify(fetchedBrokerRequests));
            } catch (brErr) {
                console.error('Failed to fetch broker requests from API, falling back to local storage', brErr);
                const cached = localStorage.getItem('evertree_broker_requests');
                if (cached) {
                    try { fetchedBrokerRequests = JSON.parse(cached); } catch(e){}
                }
            }
            setBrokerRequests(fetchedBrokerRequests);
        } catch (err) {
            console.error('Failed to load broker dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBrokerData();
    }, [user]);

    const formatDate = (date) => {
        if (!date) return 'Recently';
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return 'Recently';
        return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed);
    };

    const formatPrice = (price) => {
        const val = Number(price);
        if (!val || isNaN(val)) return '₹ --';
        if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} Lakh`;
        return `₹ ${val.toLocaleString('en-IN')}`;
    };

    const totalViews = myListings.reduce((sum, p) => sum + (Number(p.views_count) || 0), 0);
    const pendingEnquiries = enquiries.filter(e => (e.status || 'pending') === 'pending').length;

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Top Live Offer & Ads Ticker */}
            <TopAdTicker />

            {/* ============================== HEADER ============================== */}
            <section
                className="relative overflow-hidden border-b border-slate-200"
                style={{
                    background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)'
                }}
            >
                {/* Decorative circles */}
                <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5" />
                <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/5" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-bold text-emerald-200 uppercase tracking-wider mb-2">
                                <Briefcase className="w-3 h-3" />
                                Broker Portal
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                                Welcome back, {user?.name || 'Broker'} 👋
                            </h1>
                            <p className="mt-1 text-sm text-emerald-200/80 max-w-lg">
                                Manage your property listings, track buyer enquiries, and grow your real estate business.
                            </p>
                            {user?.verification_id && (
                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                                    <span className="text-xs font-semibold text-emerald-100">
                                        ID: {user.verification_id}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={loadBrokerData}
                                disabled={loading}
                                className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 border border-white/10 disabled:opacity-50 transition-colors"
                                title="Refresh data"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <Link
                                href="/add-property"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Post Property</span>
                                <span className="sm:hidden">Post</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================== DASHBOARD CONTENT ============================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

                {/* =================== STATS CARDS =================== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">

                    {/* My Listings */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <Link href="/my-listing" className="text-emerald-600 hover:text-emerald-700">
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Listings</p>
                        <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
                            {loading ? '—' : myListings.length}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-400">10 free listings</p>
                    </div>

                    {/* Buyer Enquiries */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            {pendingEnquiries > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                    {pendingEnquiries} new
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Buyer Enquiries</p>
                        <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
                            {loading ? '—' : enquiries.length}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-400">Received requests</p>
                    </div>

                    {/* Total Views */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Views</p>
                        <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
                            {loading ? '—' : totalViews.toLocaleString('en-IN')}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-400">Across all listings</p>
                    </div>

                    {/* Account Status */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Status</p>
                        <h2 className="mt-1 text-lg sm:text-xl font-black text-slate-900 capitalize">
                            {user?.approval_status?.replace(/_/g, ' ') || 'Active'}
                        </h2>
                        <p className="mt-0.5 text-xs text-emerald-600 font-semibold">
                            {user?.rera_number ? `RERA: ${user.rera_number}` : 'Verified Broker'}
                        </p>
                    </div>
                </div>

                {/* Spotlight Partner Offer / Ad */}
                <div className="my-6">
                    <SpotlightAdCard />
                </div>

                {/* =================== TAB NAVIGATION (Mobile) =================== */}
                <div className="flex sm:hidden gap-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                            activeTab === 'overview'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                    >
                        Properties
                    </button>
                    <button
                        onClick={() => setActiveTab('enquiries')}
                        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                            activeTab === 'enquiries'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                    >
                        Enquiries {enquiries.length > 0 && `(${enquiries.length})`}
                    </button>
                    <button
                        onClick={() => setActiveTab('broker_requests')}
                        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                            activeTab === 'broker_requests'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                    >
                        Broker Requests {brokerRequests.length > 0 && `(${brokerRequests.length})`}
                    </button>
                </div>

                {/* =================== MY LISTINGS SECTION =================== */}
                <div className={`space-y-4 ${activeTab !== 'overview' ? 'hidden sm:block' : ''}`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">My Active Properties</h2>
                            <p className="text-xs text-slate-500">Properties you have listed on Evertree.</p>
                        </div>
                        <Link href="/my-listing" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                            View All ({myListings.length}) <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <RefreshCw className="w-6 h-6 text-slate-300 mx-auto animate-spin mb-3" />
                            <p className="text-sm text-slate-400">Loading your listings...</p>
                        </div>
                    ) : myListings.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto shadow-xs">
                            <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <h3 className="font-bold text-slate-900 text-lg">No properties listed yet</h3>
                            <p className="text-sm text-slate-500 mt-1 mb-5">Post your first property to start connecting with buyers.</p>
                            <Link
                                href="/add-property"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                            >
                                <PlusCircle className="w-4 h-4" /> Post Property Now
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                            {myListings.slice(0, 3).map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                            <InGridAdCard slotIndex={1} />
                            {myListings.slice(3, 7).map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    )}

                    {myListings.length > 8 && (
                        <div className="text-center pt-2">
                            <Link
                                href="/my-listing"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                            >
                                View all {myListings.length} listings <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* =================== RECENT BUYER ENQUIRIES SECTION =================== */}
                <div className={`space-y-4 ${activeTab !== 'enquiries' && activeTab !== 'overview' ? 'hidden sm:block' : ''}`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Recent Buyer Enquiries</h2>
                            <p className="text-xs text-slate-500">Buyers interested in your properties.</p>
                        </div>
                        {enquiries.length > 0 && (
                            <Link href="/buyer-requests" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                                View all <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <RefreshCw className="w-6 h-6 text-slate-300 mx-auto animate-spin mb-3" />
                            <p className="text-sm text-slate-400">Loading enquiries...</p>
                        </div>
                    ) : enquiries.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="font-bold text-slate-700 text-base">No buyer requests yet</p>
                            <p className="text-xs text-slate-400 mt-1">Enquiries submitted by buyers will appear here automatically.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {enquiries.slice(0, 6).map(enquiry => (
                                <div
                                    key={enquiry.id}
                                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        {/* Enquiry Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-slate-900 text-sm truncate">
                                                    {enquiry.property_title || 'Property enquiry'}
                                                </h3>
                                                <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                                    (enquiry.status || 'pending') === 'pending'
                                                        ? 'bg-amber-50 border border-amber-200 text-amber-700'
                                                        : (enquiry.status || 'pending') === 'responded'
                                                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                                        : 'bg-slate-50 border border-slate-200 text-slate-600'
                                                }`}>
                                                    {enquiry.status || 'pending'}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                                                {enquiry.buyer_name && (
                                                    <span className="text-xs text-slate-600 font-semibold">
                                                        From: {enquiry.buyer_name}
                                                    </span>
                                                )}
                                                {enquiry.buyer_phone && (
                                                    <a
                                                        href={`tel:${enquiry.buyer_phone}`}
                                                        className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-700"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        {enquiry.buyer_phone}
                                                    </a>
                                                )}
                                                {enquiry.buyer_email && (
                                                    <a
                                                        href={`mailto:${enquiry.buyer_email}`}
                                                        className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Mail className="w-3 h-3" />
                                                        {enquiry.buyer_email}
                                                    </a>
                                                )}
                                            </div>

                                            {enquiry.message && (
                                                <p className="mt-2 text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-2">
                                                    &ldquo;{enquiry.message}&rdquo;
                                                </p>
                                            )}
                                        </div>

                                        {/* Date */}
                                        <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock3 className="w-3 h-3" />
                                                {formatDate(enquiry.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {enquiries.length > 6 && (
                                <div className="text-center pt-2">
                                    <Link
                                        href="/buyer-requests"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        View all {enquiries.length} enquiries <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* =================== BROKER REQUESTS SECTION =================== */}
                <div className={`space-y-4 ${activeTab !== 'broker_requests' && activeTab !== 'overview' ? 'hidden sm:block' : ''}`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Direct Broker Requests</h2>
                            <p className="text-xs text-slate-500">Users requesting assistance from a broker.</p>
                        </div>
                    </div>

                    {loading && brokerRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <RefreshCw className="w-6 h-6 text-slate-300 mx-auto animate-spin mb-3" />
                            <p className="text-sm text-slate-400">Loading requests...</p>
                        </div>
                    ) : brokerRequests.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                            <UserPlus className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="font-bold text-slate-700 text-base">No broker requests yet</p>
                            <p className="text-xs text-slate-400 mt-1">Direct requests for brokers will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {brokerRequests.map(req => (
                                <div
                                    key={req.id}
                                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-slate-900 text-sm truncate">
                                                    Broker Request
                                                </h3>
                                                <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                                    (req.status || 'new') === 'new'
                                                        ? 'bg-amber-50 border border-amber-200 text-amber-700'
                                                        : 'bg-slate-50 border border-slate-200 text-slate-600'
                                                }`}>
                                                    {req.status || 'new'}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                                                {req.user_name && (
                                                    <span className="text-xs text-slate-600 font-semibold">
                                                        From: {req.user_name} ({req.user_role})
                                                    </span>
                                                )}
                                                {req.user_phone && (
                                                    <a
                                                        href={`tel:${req.user_phone}`}
                                                        className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-700"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        {req.user_phone}
                                                    </a>
                                                )}
                                                {req.user_email && (
                                                    <a
                                                        href={`mailto:${req.user_email}`}
                                                        className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700"
                                                    >
                                                        <Mail className="w-3 h-3" />
                                                        {req.user_email}
                                                    </a>
                                                )}
                                            </div>

                                            {req.details?.message && (
                                                <p className="mt-2 text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    &ldquo;{req.details.message}&rdquo;
                                                </p>
                                            )}
                                        </div>

                                        <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock3 className="w-3 h-3" />
                                                {formatDate(req.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* =================== QUICK ACTIONS (Mobile) =================== */}
                <div className="sm:hidden space-y-3 pb-6">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/add-property"
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                            <PlusCircle className="w-6 h-6" />
                            <span className="text-xs font-bold">Post Property</span>
                        </Link>
                        <Link
                            href="/my-listing"
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                            <Building2 className="w-6 h-6" />
                            <span className="text-xs font-bold">My Listings</span>
                        </Link>
                        <Link
                            href="/buyer-requests"
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                            <Users className="w-6 h-6" />
                            <span className="text-xs font-bold">Buyer Requests</span>
                        </Link>
                        <Link
                            href="/messages"
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                            <MessageSquare className="w-6 h-6" />
                            <span className="text-xs font-bold">Messages</span>
                        </Link>
                    </div>
                </div>

                {/* Animated Partner Showcase Banner */}
                <div className="pt-6 pb-2">
                    <AnimatedAdsBanner variant="dashboard" />
                </div>

            </section>
        </main>
    );
}