'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Search, ArrowRight } from 'lucide-react';
import { propertyAPI } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';
import { useAuth } from '../../context/AuthContext';

export default function BuyerDashboardPage({ onOpenChat }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadFavorites();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const res = await propertyAPI.getFavorites();
            setFavorites(res.data || []);
        } catch (err) {
            console.error('Failed to load favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
            
            {/* User Profile Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                <img 
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9'} 
                    alt={user?.name || 'Buyer'} 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-emerald-500/20" 
                />
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {user ? `${user.name}'s Wishlist` : 'Buyer Dashboard'}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Verified Buyer Account
                        </span>
                        <span className="text-xs text-slate-500">
                            ID: {user?.verification_id || 'EVT-BUY-VERIFIED'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Saved Favorite Properties</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Easily access your shortlisted properties and contact sellers</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {favorites.length} Saved
                </span>
            </div>

            {/* Content State */}
            {loading ? (
                <div className="text-center py-16 text-slate-500 text-sm">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading wishlist...
                </div>
            ) : favorites.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1.5">No favorites saved yet</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mb-6">
                        Browse listings and click the heart icon on any property to bookmark it here for quick comparison.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
                    >
                        <Search className="w-4 h-4" /> Explore Properties <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                    {favorites.map(property => (
                        <PropertyCard 
                            key={property.id} 
                            property={property} 
                            onOpenChat={onOpenChat}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
