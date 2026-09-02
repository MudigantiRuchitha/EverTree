'use client';
import React, { useState, useEffect } from 'react';
import HeroSearch from '../components/HeroSearch';
import PropertyCard from '../components/PropertyCard';
import { propertyAPI } from '../services/api';
import { ShieldCheck, Sparkles, Home, Building } from 'lucide-react';

export default function HomePage({ onOpenChat }) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        loadProperties();
    }, [filters]);

    const loadProperties = async () => {
        setLoading(true);
        try {
            const res = await propertyAPI.getProperties(filters);
            setProperties(res.data || []);
        } catch (err) {
            console.error('Failed to load properties:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchParams) => {
        setFilters(searchParams);
    };

    return (
        <div className="space-y-10 sm:space-y-14 pb-16">
            {/* Hero & Search Banner */}
            <HeroSearch onSearch={handleSearch} />

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-slate-200">
                    <div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-wider mb-1">
                            <ShieldCheck className="w-4 h-4" /> 100% RERA & Legal Certified
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                            Explore Verified Properties
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Direct contact with verified owners & certified RERA real estate brokers
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
                            {properties.length} Available Listings
                        </span>
                    </div>
                </div>

                {/* Listings Grid or Empty State */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
                                <div className="h-48 bg-slate-200" />
                                <div className="p-4 space-y-3">
                                    <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                                    <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                                    <div className="h-4 bg-slate-100 rounded-md w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Building className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No properties found</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            We couldn't find any listings matching your search filters. Try adjusting your city, budget, or property type.
                        </p>
                        <button
                            onClick={() => setFilters({})}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
                        >
                            Reset Search Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                        {properties.map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                onOpenChat={onOpenChat}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
