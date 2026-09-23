// 'use client';
// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Heart, Search, ArrowRight, RefreshCw, MessageSquare, Clock3, CheckCircle2, AlertCircle } from 'lucide-react';
// import { propertyAPI } from '../../services/api';
// import PropertyCard from '../../components/PropertyCard';
// import { useAuth } from '../../context/AuthContext';

// export default function BuyerDashboardPage({ onOpenChat }) {
//     const { user, loading: authLoading } = useAuth();
//     const [favorites, setFavorites] = useState([]);
//     const [enquiries, setEnquiries] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEfscfect(() => {
//         if (user) {
//             loadDashboard();
//         } else if (!authLoading) {
//             setLoading(false);
//         }
//     }, [user, authLoading]);

//     const loadDashboard = async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const [favoritesRes, enquiriesRes] = await Promise.all([
//                 propertyAPI.getFavorites(),
//                 propertyAPI.getEnquiries()
//             ]);
//             setFavorites(Array.isArray(favoritesRes.data) ? favoritesRes.data : []);
//             setEnquiries(Array.isArray(enquiriesRes.data) ? enquiriesRes.data : []);
//         } catch (err) {
//             console.error('Failed to load buyer dashboard:', err);
//             setError(err.response?.data?.error || 'Unable to load your buyer dashboard.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleFavoriteChange = (propertyId, favorited) => {
//         if (!favorited) {
//             setFavorites(current => current.filter(property => property.id !== propertyId));
//         }
//     };

//     const formatDate = (date) => new Intl.DateTimeFormat(undefined, {
//         day: 'numeric', month: 'short', year: 'numeric'
//     }).format(new Date(date));

//     if (authLoading) {
//         return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-slate-500">Loading your account...</div>;
//     }

//     if (!user) {
//         return (
//             <div className="max-w-lg mx-auto px-4 py-16 text-center">
//                 <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
//                     <h1 className="text-xl font-black text-slate-900">Sign in to view your dashboard</h1>
//                     <p className="mt-2 text-sm text-slate-500">Your saved properties and enquiries are available after you sign in.</p>
//                     <Link href="/" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700">
//                         Explore Properties <ArrowRight className="w-4 h-4" />
//                     </Link>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
            
//             {/* User Profile Header Card */}
//             <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
//                 <img 
//                     src={user?.avatar_url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9'} 
//                     alt={user?.name || 'Buyer'} 
//                     className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-emerald-500/20" 
//                 />
//                 <div className="space-y-1">
//                     <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
//                         {user ? `${user.name}'s Wishlist` : 'Buyer Dashboard'}
//                     </h1>
//                     <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
//                         <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
//                             Verified Buyer Account
//                         </span>
//                         <span className="text-xs text-slate-500">
//                             ID: {user.verification_id || 'Not issued'}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             {error && (
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
//                     <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</span>
//                     <button type="button" onClick={loadDashboard} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-rose-200 font-bold hover:bg-rose-100">
//                         <RefreshCw className="w-4 h-4" /> Retry
//                     </button>
//                 </div>
//             )}

//             <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
//                 <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
//                     <Heart className="w-5 h-5 text-rose-500 mb-3" />
//                     <p className="text-2xl font-black text-slate-900">{favorites.length}</p>
//                     <p className="text-xs text-slate-500 mt-1">Saved properties</p>
//                 </div>
//                 <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
//                     <MessageSquare className="w-5 h-5 text-emerald-600 mb-3" />
//                     <p className="text-2xl font-black text-slate-900">{enquiries.length}</p>
//                     <p className="text-xs text-slate-500 mt-1">Property enquiries</p>
//                 </div>
//                 <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
//                     <CheckCircle2 className="w-5 h-5 text-blue-600 mb-3" />
//                     <p className="text-2xl font-black text-slate-900">{user.email_verified ? 'Verified' : 'Pending'}</p>
//                     <p className="text-xs text-slate-500 mt-1">Email status</p>
//                 </div>
//             </div>

//             {/* Saved properties */}
//             <div className="flex items-center justify-between pb-4 border-b border-slate-200">
//                 <div>
//                     <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Saved Favorite Properties</h2>
//                     <p className="text-xs sm:text-sm text-slate-500">Access your shortlisted properties and contact sellers.</p>
//                 </div>
//                 <button type="button" onClick={loadDashboard} disabled={loading} className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-50" title="Refresh dashboard">
//                     <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//                 </button>
//             </div>

//             {/* Content State */}
//             {loading ? (
//                 <div className="text-center py-16 text-slate-500 text-sm">
//                     <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
//                     Loading wishlist...
//                 </div>
//             ) : favorites.length === 0 ? (
//                 <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
//                     <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
//                         <Heart className="w-8 h-8" />
//                     </div>
//                     <h3 className="text-lg font-bold text-slate-900 mb-1.5">No favorites saved yet</h3>
//                     <p className="text-xs sm:text-sm text-slate-500 mb-6">
//                         Browse listings and click the heart icon on any property to bookmark it here for quick comparison.
//                     </p>
//                     <Link
//                         href="/"
//                         className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
//                     >
//                         <Search className="w-4 h-4" /> Explore Properties <ArrowRight className="w-4 h-4" />
//                     </Link>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
//                     {favorites.map(property => (
//                         <PropertyCard 
//                             key={property.id} 
//                             property={property} 
//                             onOpenChat={onOpenChat}
//                             initialFavorite
//                             onFavoriteChange={handleFavoriteChange}
//                         />
//                     ))}
//                 </div>
//             )}

//             {/* Enquiries */}
//             <section className="space-y-4">
//                 <div className="flex items-center justify-between pb-4 border-b border-slate-200">
//                     <div>
//                         <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">My Property Enquiries</h2>
//                         <p className="text-xs sm:text-sm text-slate-500">Track conversations you have started with property owners.</p>
//                     </div>
//                 </div>
//                 {enquiries.length === 0 ? (
//                     <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-500">No property enquiries yet.</div>
//                 ) : (
//                     <div className="grid gap-3">
//                         {enquiries.map(enquiry => (
//                             <div key={enquiry.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
//                                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
//                                     <h3 className="font-bold text-slate-900">{enquiry.property_title || 'Property enquiry'}</h3>
//                                     <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500"><Clock3 className="w-3.5 h-3.5" />{formatDate(enquiry.created_at)}</span>
//                                 </div>
//                                 <p className="mt-2 text-sm text-slate-600">{enquiry.message}</p>
//                                 <span className="inline-block mt-3 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold capitalize">{enquiry.status || 'pending'}</span>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </section>
//         </div>
//     );
// }
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    Heart,
    Search,
    ArrowRight,
    RefreshCw,
    MessageSquare,
    Clock3,
    CheckCircle2,
    AlertCircle,
    UserPlus
} from "lucide-react";

import { propertyAPI, serviceAPI } from "../../services/api";
import PropertyCard from "../../components/PropertyCard";
import { useAuth } from "../../context/AuthContext";

export default function BuyerDashboardPage({ onOpenChat }) {
    const { user, loading: authLoading } = useAuth();

    const [favorites, setFavorites] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
    const [brokerMessage, setBrokerMessage] = useState("");
    const [isSubmittingBroker, setIsSubmittingBroker] = useState(false);
    const [brokerSuccessMessage, setBrokerSuccessMessage] = useState("");

    /**
     * Load all buyer dashboard data from API
     */
    const loadDashboard = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const [favoritesRes, enquiriesRes] = await Promise.all([
                propertyAPI.getFavorites(),
                propertyAPI.getEnquiries(),
            ]);

            const favoriteData = Array.isArray(favoritesRes?.data)
                ? favoritesRes.data
                : [];

            const enquiryData = Array.isArray(enquiriesRes?.data)
                ? enquiriesRes.data
                : [];

            setFavorites(favoriteData);
            setEnquiries(enquiryData);
        } catch (err) {
            console.error("Failed to load buyer dashboard:", err);

            setError(
                err?.response?.data?.error ||
                    err?.response?.data?.message ||
                    "Unable to load your buyer dashboard."
            );
        } finally {
            setLoading(false);
        }
    }, [user]);

    /**
     * Load dashboard whenever authenticated user changes
     */
    useEffect(() => {
        if (user) {
            loadDashboard();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading, loadDashboard]);

    /**
     * Remove property from local favorites
     * PropertyCard handles the actual API operation.
     */
    const handleFavoriteChange = useCallback(
        (propertyId, favorited) => {
            if (!favorited) {
                setFavorites((current) =>
                    current.filter(
                        (property) => String(property?.id) !== String(propertyId)
                    )
                );
            }
        },
        []
    );

    /**
     * Format API date safely
     */
    const formatDate = (date) => {
        if (!date) {
            return "Date unavailable";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Date unavailable";
        }

        return new Intl.DateTimeFormat(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(parsedDate);
    };

    /**
     * Get user initials when avatar is not available.
     * No external/default image is used.
     */
    const getUserInitials = () => {
        const name = user?.name?.trim();

        if (!name) {
            return "?";
        }

        const words = name.split(/\s+/);

        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }

        return (
            words[0].charAt(0) + words[words.length - 1].charAt(0)
        ).toUpperCase();
    };

    /**
     * Submit broker request
     */
    const handleBrokerSubmit = async (e) => {
        e.preventDefault();
        if (!brokerMessage.trim()) return;

        setIsSubmittingBroker(true);
        try {
            await serviceAPI.submitLead({
                service_type: 'broker',
                details: { message: brokerMessage }
            });
            setBrokerSuccessMessage('Broker request submitted successfully!');
            setTimeout(() => {
                setIsBrokerModalOpen(false);
                setBrokerSuccessMessage('');
                setBrokerMessage('');
            }, 2000);
        } catch (err) {
            console.error('Failed to submit broker request:', err);
            alert('Failed to submit broker request. Please try again.');
        } finally {
            setIsSubmittingBroker(false);
        }
    };

    /* ------------------------------------------
       Authentication loading
    ------------------------------------------ */

    if (authLoading) {
        return (
            <main className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-sm text-slate-500">
                        Loading your account...
                    </p>
                </div>
            </main>
        );
    }

    /* ------------------------------------------
       User not logged in
    ------------------------------------------ */

    if (!user) {
        return (
            <main className="min-h-[60vh] flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-lg">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                            <Search className="w-7 h-7" />
                        </div>

                        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                            Sign in to view your dashboard
                        </h1>

                        <p className="mt-2 text-sm text-slate-500 leading-6">
                            Your saved properties and enquiries are available
                            after you sign in.
                        </p>

                        <Link
                            href="/"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 mt-6 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors"
                        >
                            <Search className="w-4 h-4" />
                            Explore Properties
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    /* ------------------------------------------
       Dashboard
    ------------------------------------------ */

    return (
        <main className="w-full">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-5 sm:py-8 lg:py-12 space-y-6 sm:space-y-8">

                {/* =========================================
                    PROFILE HEADER
                ========================================= */}

                <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 lg:p-7 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 lg:gap-6 text-center sm:text-left">

                        {/* User Avatar */}
                        <div className="shrink-0">
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user?.name || "Buyer"}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-emerald-500/20"
                                />
                            ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 flex items-center justify-center ring-4 ring-emerald-500/10">
                                    <span className="text-xl sm:text-2xl font-black text-emerald-700">
                                        {getUserInitials()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* User Information */}
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight break-words">
                                {user?.name || "Buyer"}
                            </h1>

                            {user?.email && (
                                <p className="mt-1 text-xs sm:text-sm text-slate-500 break-all">
                                    {user.email}
                                </p>
                            )}

                            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">

                                {/* Dynamic verification status */}
                                <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                        user?.email_verified
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />

                                    {user?.email_verified
                                        ? "Verified"
                                        : "Verification Pending"}
                                </span>

                                {/* Dynamic verification ID */}
                                {user?.verification_id && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                                        ID: {user.verification_id}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="shrink-0 mt-4 sm:mt-0 self-center sm:self-start">
                            <button
                                onClick={() => setIsBrokerModalOpen(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                Connect as Broker Request
                            </button>
                        </div>
                    </div>
                </section>

                {/* =========================================
                    ERROR MESSAGE
                ========================================= */}

                {error && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">

                        <div className="flex items-start gap-2 text-sm min-w-0">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

                            <span className="break-words">
                                {error}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={loadDashboard}
                            disabled={loading}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-rose-200 font-bold text-sm hover:bg-rose-100 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            />
                            Retry
                        </button>
                    </div>
                )}

                {/* =========================================
                    DASHBOARD STATISTICS
                ========================================= */}

                <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">

                    {/* Favorites */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-3">
                            <Heart className="w-5 h-5 text-rose-500" />
                        </div>

                        <p className="text-xl sm:text-2xl font-black text-slate-900">
                            {favorites.length}
                        </p>

                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Saved properties
                        </p>
                    </div>

                    {/* Enquiries */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                            <MessageSquare className="w-5 h-5 text-emerald-600" />
                        </div>

                        <p className="text-xl sm:text-2xl font-black text-slate-900">
                            {enquiries.length}
                        </p>

                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Property enquiries
                        </p>
                    </div>

                    {/* Email */}
                    <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        </div>

                        <p className="text-xl sm:text-2xl font-black text-slate-900">
                            {user?.email_verified
                                ? "Verified"
                                : "Pending"}
                        </p>

                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Email status
                        </p>
                    </div>
                </section>

                {/* =========================================
                    SAVED PROPERTIES HEADER
                ========================================= */}

                <section>
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200">

                        <div className="min-w-0">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                                Saved Favorite Properties
                            </h2>

                            <p className="mt-1 text-xs sm:text-sm text-slate-500">
                                Access your shortlisted properties and contact sellers.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={loadDashboard}
                            disabled={loading}
                            className="shrink-0 p-2.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
                            title="Refresh dashboard"
                            aria-label="Refresh dashboard"
                        >
                            <RefreshCw
                                className={`w-5 h-5 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            />
                        </button>
                    </div>

                    {/* =========================================
                        SAVED PROPERTIES CONTENT
                    ========================================= */}

                    {loading ? (
                        <div className="py-16 text-center">
                            <div className="w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

                            <p className="text-sm text-slate-500">
                                Loading saved properties...
                            </p>
                        </div>
                    ) : favorites.length === 0 ? (
                        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-7 sm:p-12 text-center max-w-xl mx-auto mt-6 shadow-sm">

                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-7 h-7 sm:w-8 sm:h-8" />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900">
                                No favorites saved yet
                            </h3>

                            <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-6">
                                Browse listings and save properties you are
                                interested in to access them here.
                            </p>

                            <Link
                                href="/"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
                            >
                                <Search className="w-4 h-4" />
                                Explore Properties
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mt-6">
                            {favorites.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={{ ...property, is_favorite: true }}
                                    onOpenChat={onOpenChat}
                                    initialFavorite={true}
                                    onFavoriteChange={
                                        handleFavoriteChange
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* =========================================
                    ENQUIRIES
                ========================================= */}

                <section className="space-y-4">

                    <div className="pb-4 border-b border-slate-200">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                            My Property Enquiries
                        </h2>

                        <p className="mt-1 text-xs sm:text-sm text-slate-500">
                            Track conversations you have started with property owners.
                        </p>
                    </div>

                    {enquiries.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center text-sm text-slate-500">
                            No property enquiries yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">

                            {enquiries.map((enquiry) => (
                                <article
                                    key={enquiry.id}
                                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm"
                                >
                                    <div className="flex flex-col gap-3">

                                        {/* Enquiry heading */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                                            <h3 className="font-bold text-slate-900 text-sm sm:text-base break-words">
                                                {enquiry.property_title ||
                                                    enquiry.property_name ||
                                                    "Property enquiry"}
                                            </h3>

                                            {enquiry.created_at && (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 shrink-0">
                                                    <Clock3 className="w-3.5 h-3.5" />
                                                    {formatDate(
                                                        enquiry.created_at
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        {/* Enquiry message */}
                                        {enquiry.message && (
                                            <p className="text-sm text-slate-600 leading-6 break-words">
                                                {enquiry.message}
                                            </p>
                                        )}

                                        {/* Enquiry status */}
                                        {enquiry.status && (
                                            <div>
                                                <span
                                                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                                        enquiry.status
                                                            .toLowerCase() ===
                                                        "approved"
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : enquiry.status
                                                                  .toLowerCase() ===
                                                              "rejected"
                                                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                            : "bg-amber-50 text-amber-700 border border-amber-200"
                                                    }`}
                                                >
                                                    {enquiry.status}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
                
                {/* =========================================
                    BROKER MODAL
                ========================================= */}
                {isBrokerModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
                            <h3 className="text-xl font-black text-slate-900 mb-2">Request a Broker</h3>
                            <p className="text-sm text-slate-500 mb-6">Need help finding or buying a property? Connect with a professional broker.</p>
                            
                            {brokerSuccessMessage ? (
                                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl mb-4 text-center font-medium">
                                    {brokerSuccessMessage}
                                </div>
                            ) : (
                                <form onSubmit={handleBrokerSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">How can a broker help you?</label>
                                        <textarea
                                            required
                                            value={brokerMessage}
                                            onChange={(e) => setBrokerMessage(e.target.value)}
                                            rows="4"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                                            placeholder="Describe what kind of property you are looking for..."
                                        />
                                    </div>
                                    <div className="flex items-center justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsBrokerModalOpen(false)}
                                            className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingBroker}
                                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm shadow-sm transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                        >
                                            {isSubmittingBroker && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                            Submit Request
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}