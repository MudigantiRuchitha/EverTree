'use client';
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    Search, MapPin, Building, DollarSign, Home, SlidersHorizontal, 
    X, RotateCcw, Sparkles, AlertCircle, ArrowUpDown, CheckCircle2, ShieldCheck, HelpCircle
} from 'lucide-react';
import { propertyAPI } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';

function SearchPageContent({ onOpenChat }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read initial filters from URL params
    const initialCategory = searchParams.get('category') || 'all';
    const initialSearch = searchParams.get('search') || '';
    const initialCity = searchParams.get('city') || '';
    const initialDistrict = searchParams.get('district') || '';
    const initialType = searchParams.get('property_type') || '';
    const initialBhk = searchParams.get('bhk') || '';
    const initialMaxPrice = searchParams.get('max_price') || '';

    const [category, setCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [city, setCity] = useState(initialCity);
    const [district, setDistrict] = useState(initialDistrict);
    const [propertyType, setPropertyType] = useState(initialType);
    const [bhk, setBhk] = useState(initialBhk);
    const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
    const [sortBy, setSortBy] = useState('newest');

    const [properties, setProperties] = useState([]);
    const [relatedProperties, setRelatedProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRelated, setLoadingRelated] = useState(false);

    // Sync state when URL params change
    useEffect(() => {
        setCategory(searchParams.get('category') || 'all');
        setSearchQuery(searchParams.get('search') || '');
        setCity(searchParams.get('city') || '');
        setDistrict(searchParams.get('district') || '');
        setPropertyType(searchParams.get('property_type') || '');
        setBhk(searchParams.get('bhk') || '');
        setMaxPrice(searchParams.get('max_price') || '');
    }, [searchParams]);

    // Active filters summary
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (category && category !== 'all') count++;
        if (searchQuery.trim()) count++;
        if (city.trim()) count++;
        if (district.trim()) count++;
        if (propertyType) count++;
        if (bhk) count++;
        if (maxPrice) count++;
        return count;
    }, [category, searchQuery, city, district, propertyType, bhk, maxPrice]);

    // Push updated params to URL
    const updateURL = (newFilters) => {
        const params = new URLSearchParams();
        const f = {
            category,
            search: searchQuery,
            city,
            district,
            property_type: propertyType,
            bhk,
            max_price: maxPrice,
            ...newFilters
        };

        if (f.category && f.category !== 'all') params.set('category', f.category);
        if (f.search && f.search.trim()) params.set('search', f.search.trim());
        if (f.city && f.city.trim()) params.set('city', f.city.trim());
        if (f.district && f.district.trim()) params.set('district', f.district.trim());
        if (f.property_type) params.set('property_type', f.property_type);
        if (f.bhk) params.set('bhk', f.bhk);
        if (f.max_price) params.set('max_price', f.max_price);

        const qs = params.toString();
        router.push(qs ? `/search?${qs}` : '/search');
    };

    // Load main search results
    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const params = {};
                if (category && category !== 'all') params.category = category;
                if (searchQuery.trim()) params.search = searchQuery.trim();
                if (city.trim()) params.city = city.trim();
                if (district.trim()) params.district = district.trim();
                if (propertyType) params.property_type = propertyType;
                if (bhk) params.bhk = bhk;
                if (maxPrice) params.max_price = maxPrice;

                const res = await propertyAPI.getProperties(params);
                let list = res.data || [];

                // Client-side sorting if needed
                if (sortBy === 'price_asc') {
                    list.sort((a, b) => Number(a.price) - Number(b.price));
                } else if (sortBy === 'price_desc') {
                    list.sort((a, b) => Number(b.price) - Number(a.price));
                }

                setProperties(list);

                // If zero properties found, fetch related/recommended properties
                if (list.length === 0) {
                    fetchRelatedProperties();
                } else {
                    setRelatedProperties([]);
                }
            } catch (err) {
                console.error('Failed to search properties:', err);
                setProperties([]);
                fetchRelatedProperties();
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [category, searchQuery, city, district, propertyType, bhk, maxPrice, sortBy]);

    // Fetch related/fallback properties
    const fetchRelatedProperties = async () => {
        setLoadingRelated(true);
        try {
            // First attempt: try relaxing some filters (e.g. just category or just city)
            let relatedRes = null;
            if (city.trim()) {
                relatedRes = await propertyAPI.getProperties({ city: city.trim() });
            } else if (category && category !== 'all') {
                relatedRes = await propertyAPI.getProperties({ category });
            } else if (propertyType) {
                relatedRes = await propertyAPI.getProperties({ property_type: propertyType });
            }

            let relatedList = relatedRes?.data || [];

            // If still empty or no specific criteria, fetch featured / all properties
            if (relatedList.length === 0) {
                const fallbackRes = await propertyAPI.getProperties({});
                relatedList = fallbackRes.data || [];
            }

            setRelatedProperties(relatedList.slice(0, 8));
        } catch (err) {
            console.error('Failed to load related properties:', err);
            setRelatedProperties([]);
        } finally {
            setLoadingRelated(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        updateURL();
    };

    const handleResetFilters = () => {
        setCategory('all');
        setSearchQuery('');
        setCity('');
        setDistrict('');
        setPropertyType('');
        setBhk('');
        setMaxPrice('');
        router.push('/search');
    };

    const popularCities = ['Bengaluru', 'Mumbai', 'Hyderabad', 'Delhi NCR', 'Pune', 'Chennai'];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header / Search Controls Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-30 shadow-xs backdrop-blur-md bg-white/95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    
                    {/* Top Row: Title & Quick Category Pills */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                                    <Search className="w-4 h-4" />
                                </span>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Search Properties
                                </h1>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Browse 100% legal verified homes, apartments, and commercial spaces
                            </p>
                        </div>

                        {/* Category Selector Tabs */}
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
                            {[
                                { id: 'all', label: 'All Listings' },
                                { id: 'sell', label: 'Buy' },
                                { id: 'rent', label: 'Rent' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                        setCategory(tab.id);
                                        updateURL({ category: tab.id });
                                    }}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        category === tab.id
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter Inputs Form */}
                    <form onSubmit={handleFormSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                            
                            {/* Search Keyword */}
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="Keyword / Area / Villa..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* City */}
                            <div className="relative">
                                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="City (e.g. Bengaluru)"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>

                            {/* District */}
                            <div className="relative">
                                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    placeholder="District / Region"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                />
                            </div>

                            {/* Property Type */}
                            <div className="relative">
                                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                                <select
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    value={propertyType}
                                    onChange={(e) => {
                                        setPropertyType(e.target.value);
                                        updateURL({ property_type: e.target.value });
                                    }}
                                >
                                    <option value="">All Types</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="villa">Villa</option>
                                    <option value="commercial_office">Commercial</option>
                                    <option value="agricultural_land">Agricultural</option>
                                </select>
                            </div>

                            {/* BHK */}
                            <div className="relative">
                                <Home className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                                <select
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    value={bhk}
                                    onChange={(e) => {
                                        setBhk(e.target.value);
                                        updateURL({ bhk: e.target.value });
                                    }}
                                >
                                    <option value="">Any BHK</option>
                                    <option value="1">1 BHK</option>
                                    <option value="2">2 BHK</option>
                                    <option value="3">3 BHK</option>
                                    <option value="4">4+ BHK</option>
                                </select>
                            </div>

                            {/* Max Budget */}
                            <div className="relative">
                                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                                <select
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                    value={maxPrice}
                                    onChange={(e) => {
                                        setMaxPrice(e.target.value);
                                        updateURL({ max_price: e.target.value });
                                    }}
                                >
                                    <option value="">Max Budget</option>
                                    <option value="3000000">₹30 Lakhs</option>
                                    <option value="6000000">₹60 Lakhs</option>
                                    <option value="10000000">₹1 Crore</option>
                                    <option value="20000000">₹2 Crores</option>
                                    <option value="50000000">₹5 Crores</option>
                                </select>
                            </div>

                        </div>

                        {/* Bottom Actions Row: Quick City Pills, Apply Button, Reset */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Popular:</span>
                                {popularCities.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => {
                                            setCity(c);
                                            updateURL({ city: c });
                                        }}
                                        className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                                            city.toLowerCase() === c.toLowerCase()
                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                {activeFiltersCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Reset
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                                >
                                    <Search className="w-3.5 h-3.5" />
                                    Search
                                </button>
                            </div>
                        </div>

                    </form>

                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                
                {/* Active Filter Chips & Sort Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                            {loading ? 'Searching properties...' : `${properties.length} Properties Found`}
                        </span>

                        {/* Filter Badges */}
                        {searchQuery && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Keyword: "{searchQuery}"
                                <button type="button" onClick={() => { setSearchQuery(''); updateURL({ search: '' }); }}>
                                    <X className="w-3 h-3 hover:text-rose-500 cursor-pointer" />
                                </button>
                            </span>
                        )}
                        {city && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                City: {city}
                                <button type="button" onClick={() => { setCity(''); updateURL({ city: '' }); }}>
                                    <X className="w-3 h-3 hover:text-rose-500 cursor-pointer" />
                                </button>
                            </span>
                        )}
                        {district && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                District: {district}
                                <button type="button" onClick={() => { setDistrict(''); updateURL({ district: '' }); }}>
                                    <X className="w-3 h-3 hover:text-rose-500 cursor-pointer" />
                                </button>
                            </span>
                        )}
                        {propertyType && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                                {propertyType.replace('_', ' ')}
                                <button type="button" onClick={() => { setPropertyType(''); updateURL({ property_type: '' }); }}>
                                    <X className="w-3 h-3 hover:text-rose-500 cursor-pointer" />
                                </button>
                            </span>
                        )}
                        {bhk && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                {bhk} BHK
                                <button type="button" onClick={() => { setBhk(''); updateURL({ bhk: '' }); }}>
                                    <X className="w-3 h-3 hover:text-rose-500 cursor-pointer" />
                                </button>
                            </span>
                        )}
                        {maxPrice && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Under ₹{(Number(maxPrice) / 100000).toFixed(0)} Lakhs
                                <button type="button" onClick={() => { setMaxPrice(''); updateURL({ max_price: '' }); }}>
                                    <X className="w-3 h-3 hover:text-rose-500 cursor-pointer" />
                                </button>
                            </span>
                        )}
                    </div>

                    {/* Sorting dropdown */}
                    <div className="flex items-center gap-2 shrink-0">
                        <ArrowUpDown className="w-4 h-4 text-slate-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Main Results Grid or Zero Results State */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
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
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                        {properties.map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                onOpenChat={onOpenChat}
                            />
                        ))}
                    </div>
                ) : (
                    /* Zero Results State with Related/Recommended Properties */
                    <div className="space-y-12">
                        
                        {/* No Exact Match Alert Card */}
                        <div className="bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/50 border border-amber-200/80 rounded-3xl p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-sm">
                            <div className="w-16 h-16 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                                No exact properties found
                            </h2>
                            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                We couldn't find any listings matching all your selected filters
                                {searchQuery || city ? ` for "${[searchQuery, city, district].filter(Boolean).join(', ')}"` : ''}.
                                Don't worry, we've curated <span className="font-bold text-emerald-700">related verified properties</span> below!
                            </p>

                            {/* Quick Action Suggestions */}
                            <div className="flex flex-wrap items-center justify-center gap-2.5">
                                {city && (
                                    <button
                                        onClick={() => {
                                            setCategory('all');
                                            setPropertyType('');
                                            setBhk('');
                                            setMaxPrice('');
                                            updateURL({ category: 'all', property_type: '', bhk: '', max_price: '' });
                                        }}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-800 hover:border-emerald-500 hover:text-emerald-700 shadow-xs transition-all cursor-pointer"
                                    >
                                        Show all in {city}
                                    </button>
                                )}

                                {category !== 'all' && (
                                    <button
                                        onClick={() => {
                                            setCategory('all');
                                            updateURL({ category: 'all' });
                                        }}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-800 hover:border-emerald-500 hover:text-emerald-700 shadow-xs transition-all cursor-pointer"
                                    >
                                        Include all categories (Buy & Rent)
                                    </button>
                                )}

                                <button
                                    onClick={handleResetFilters}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                                >
                                    Reset All Search Filters
                                </button>
                            </div>
                        </div>

                        {/* Related / Recommended Properties Section */}
                        {relatedProperties.length > 0 && (
                            <div className="space-y-6 pt-4 border-t border-slate-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                                                Related & Recommended Properties
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Handpicked certified listings that might match what you are looking for
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full w-fit">
                                        {relatedProperties.length} Suggested Listings
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                                    {relatedProperties.map((property) => (
                                        <div key={property.id} className="relative group">
                                            <PropertyCard
                                                property={property}
                                                onOpenChat={onOpenChat}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}

            </div>
        </div>
    );
}

export default function SearchPage({ onOpenChat }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-bold text-slate-600">Loading Search Portal...</p>
                </div>
            </div>
        }>
            <SearchPageContent onOpenChat={onOpenChat} />
        </Suspense>
    );
}
