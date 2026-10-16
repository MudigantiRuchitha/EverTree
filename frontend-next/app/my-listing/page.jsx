'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, PlusCircle, RefreshCw, Eye, MapPin, Tag, Bed, AlertCircle, Crown } from 'lucide-react';
import { propertyAPI, subscriptionAPI } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';
import { useAuth } from '../../context/AuthContext';

export default function MyListingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [properties, setProperties] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            loadListings();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const loadListings = async () => {
        setLoading(true);
        setError('');
        try {
            const [res, subRes] = await Promise.all([
                propertyAPI.getMyListings(),
                subscriptionAPI.getCurrentSubscription().catch(() => ({ data: { subscription: null } }))
            ]);
            setProperties(Array.isArray(res.data) ? res.data : []);
            setSubscription(subRes?.data?.subscription || null);
        } catch (err) {
            console.error('Failed to load seller listings:', err);
            setError(err.response?.data?.error || 'Unable to load your listed properties.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user || (user.role !== 'seller' && user.role !== 'broker' && user.role !== 'admin')) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <Building2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-slate-900">Seller Access Only</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Sign in as a Seller or Broker to view and manage your posted property listings.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                        <Building2 className="w-4 h-4" /> Seller Dashboard
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        My Property Listings
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        All properties you have posted on Evertree for buyers to explore.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={loadListings}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        title="Refresh listings"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <Link
                        href="/add-property"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-sm transition-all"
                    >
                        <PlusCircle className="w-4 h-4" /> Post New Property
                    </Link>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                    <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</span>
                    <button onClick={loadListings} className="px-3 py-1.5 bg-white border border-rose-200 font-bold rounded-lg hover:bg-rose-100">Retry</button>
                </div>
            )}

            {/* Listing Limit Reached Banner */}
            {subscription?.is_limit_reached && (
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xs">
                    <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Crown className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                                Property Listing Limit Reached ({subscription.current_count || properties.length} / {subscription.property_limit || 10})
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase">
                                    Subscription Required
                                </span>
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                                You have posted the maximum 10 listings on the Free plan. Sellers and brokers posting more than 10 properties require an active subscription.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={user?.role === 'broker' ? '/broker-dashboard' : '/seller-dashboard'}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                    >
                        <Crown className="w-3.5 h-3.5" />
                        Upgrade Plan
                    </Link>
                </div>
            )}

            {/* Stats Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Listed Properties</p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{properties.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-500 uppercase">Listing Limit</p>
                        {subscription?.is_limit_reached && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                                Maxed
                            </span>
                        )}
                    </div>
                    <p className={`text-2xl sm:text-3xl font-black mt-1 ${subscription?.is_limit_reached ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {subscription?.current_count ?? properties.length} / {subscription?.property_limit || 10}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {subscription?.plan_name ? `${subscription.plan_name} Plan` : 'Free Tier (10 Limit)'}
                    </p>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                    <p className="text-xs font-bold text-slate-500 uppercase">Account Verification</p>
                    <p className="text-lg sm:text-xl font-black text-slate-900 mt-1 capitalize">{(user.approval_status || 'Approved').replace(/_/g, ' ')}</p>
                </div>
            </div>

            {/* Listings Grid or Empty State */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
                            <div className="h-48 bg-slate-200" />
                            <div className="p-4 space-y-3">
                                <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                                <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : properties.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No properties listed yet</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        You haven't posted any property listings yet. Create your first listing to showcase your property to active buyers on Evertree.
                    </p>
                    <Link
                        href="/add-property"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
                    >
                        <PlusCircle className="w-4 h-4" /> Post Your First Property
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                    {properties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}