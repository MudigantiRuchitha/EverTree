'use client';
import React, { useState, useEffect } from 'react';
import HeroSearch from '../components/HeroSearch';
import PropertyCard from '../components/PropertyCard';
import { propertyAPI } from '../services/api';
import { ShieldCheck, Sparkles, Home, Building } from 'lucide-react';

const processSteps = [
    {
        number: '01',
        title: 'Create your account',
        description: 'Choose whether you are a buyer, seller or broker and create your Evertree account.'
    },
    {
        number: '02',
        title: 'Explore properties',
        description: 'Search and discover properties based on location, property type and your requirements.'
    },
    {
        number: '03',
        title: 'Connect',
        description: 'Connect with sellers and brokers to learn more about the property you are interested in.'
    }
];

const platformAudiences = [
    {
        title: 'For Buyers',
        description: 'Discover properties that match your requirements and connect with the right people.'
    },
    {
        title: 'For Sellers',
        description: 'Showcase your properties and reach people who are actively looking.'
    },
    {
        title: 'For Brokers',
        description: 'Build your property network and manage your real estate activity.'
    }
];

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
        <div className="space-y-12 sm:space-y-16">
            {/* Hero & Search Banner */}
            <HeroSearch onSearch={handleSearch} />

            {/* Main Content Area - Explore Verified Properties */}
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
                            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
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

            {/* Section 1: Finding your property made simple (SIMPLE PROCESS) */}
            <section className="py-8 sm:py-12 lg:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 sm:mb-12">
                        <span className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest block">
                            SIMPLE PROCESS
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-1.5">
                            Finding your property made simple
                        </h2>
                        <p className="text-xs sm:text-base text-slate-500 mt-2 max-w-2xl">
                            Evertree makes it easier to discover properties and connect with the right people.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                        {processSteps.map((step) => (
                            <div
                                key={step.number}
                                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-9 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-start group"
                            >
                                <div className="text-2xl sm:text-3xl font-black text-emerald-600 mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-300 w-fit">
                                    {step.number}
                                </div>
                                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 2: Built for everyone in real estate (ONE PLATFORM) */}
            <section className="bg-emerald-50/60 border-y border-emerald-100/70 py-6 sm:py-10 lg:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-6">
                        <span className="text-xs sm:text-sm font-extrabold text-emerald-700 uppercase tracking-widest block mb-1.5">
                            ONE PLATFORM
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                            Built for everyone in real estate
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                        {platformAudiences.map((item) => (
                            <div
                                key={item.title}
                                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-9 border border-emerald-100/70 shadow-xs hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-start group"
                            >
                                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-2.5">
                                    {item.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
