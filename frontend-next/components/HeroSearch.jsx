'use client';
import React, { useState } from 'react';
import { Search, MapPin, Building, DollarSign, Home, SlidersHorizontal } from 'lucide-react';

const HeroSearch = ({ onSearch }) => {
    const [category, setCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [bhk, setBhk] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch({
            category,
            search: searchQuery,
            city,
            district,
            property_type: propertyType,
            bhk,
            max_price: maxPrice
        });
    };

    return (
        <div className="relative bg-center bg-no-repeat bg-cover py-10 sm:py-16 lg:py-20" style={{ backgroundImage: "url('/images/Hero-bg.jpg')" }}>
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Hero Badge & Title */}
                <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-md mb-4">
                        🌲 Legal Verified Properties Across India
                    </span>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md">
                        Find Your Dream Home With 100% Clear Title
                    </h1>
                    <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-slate-100 font-medium drop-shadow">
                        Verified sellers, certified RERA brokers, and direct escrow assistance.
                    </p>
                </div>

                {/* Light Glass Search Box */}
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl max-w-5xl mx-auto">
                    
                    {/* Category Selector Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 sm:mb-6 border-b border-slate-200 scrollbar-none">
                        {[
                            { id: 'all', label: 'All Listings' },
                            { id: 'sell', label: 'Buy' },
                            { id: 'rent', label: 'Rent' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setCategory(tab.id)}
                                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    category === tab.id
                                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Filters Form */}
                    <form onSubmit={handleSearchSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                            
                            {/* Keyword Search */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    <Search className="w-3.5 h-3.5 text-emerald-600" /> Search
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="Indiranagar, Villa..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* City */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> City
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="Bengaluru"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>

                            {/* District */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    <MapPin className="w-3.5 h-3.5 text-amber-600" /> District
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="Urban Bengaluru"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                />
                            </div>

                            {/* Property Type */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    <Building className="w-3.5 h-3.5 text-emerald-600" /> Type
                                </label>
                                <select
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    value={propertyType}
                                    onChange={(e) => setPropertyType(e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="villa">Villa</option>
                                    <option value="commercial_office">Commercial</option>
                                    <option value="agricultural_land">Agricultural</option>
                                </select>
                            </div>

                            {/* BHK */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    <Home className="w-3.5 h-3.5 text-blue-600" /> BHK
                                </label>
                                <select
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    value={bhk}
                                    onChange={(e) => setBhk(e.target.value)}
                                >
                                    <option value="">Any BHK</option>
                                    <option value="1">1 BHK</option>
                                    <option value="2">2 BHK</option>
                                    <option value="3">3 BHK</option>
                                    <option value="4">4+ BHK</option>
                                </select>
                            </div>

                            {/* Max Price */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Max Budget
                                </label>
                                <select
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                >
                                    <option value="">No Limit</option>
                                    <option value="3000000">₹30 Lakhs</option>
                                    <option value="6000000">₹60 Lakhs</option>
                                    <option value="10000000">₹1 Crore</option>
                                    <option value="20000000">₹2 Crores</option>
                                </select>
                            </div>

                        </div>

                        {/* Search Action Button */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 cursor-pointer"
                            >
                                <Search className="w-4 h-4" />
                                Search Properties
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HeroSearch;
