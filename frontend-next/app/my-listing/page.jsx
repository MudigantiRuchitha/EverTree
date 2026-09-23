'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, PlusCircle, RefreshCw, Eye, MapPin, Tag, Bed, AlertCircle } from 'lucide-react';
import { propertyAPI } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';
import { useAuth } from '../../context/AuthContext';

export default function MyListingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [properties, setProperties] = useState([]);
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
            const res = await propertyAPI.getMyListings();
            setProperties(Array.isArray(res.data) ? res.data : []);
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

            {/* Stats Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Listed Properties</p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{properties.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                    <p className="text-xs font-bold text-slate-500 uppercase">Listing Limit</p>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{properties.length} / 10</p>
                    <p className="text-xs text-slate-400 mt-0.5">Free Seller Account</p>
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