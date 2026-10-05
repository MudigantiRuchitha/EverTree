'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroSearch from '../components/HeroSearch';
import PropertyCard from '../components/PropertyCard';
import AnimatedAdsBanner from '../components/AnimatedAdsBanner';
import TopAdTicker from '../components/TopAdTicker';
import InGridAdCard from '../components/InGridAdCard';
import { propertyAPI, adAPI } from '../services/api';
import {
    ShieldCheck,
    Sparkles,
    Building2,
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    Award,
    FileText,
    PhoneCall,
    Compass,
    MapPin,
    KeyRound,
    Scale,
    DollarSign,
    Send,
    Star,
    Clock,
    BadgePercent,
    MessageCircle,
    Landmark,
    Shield,
    Check,
    ChevronLeft,
    ChevronRight,
    Flame,
    Zap
} from 'lucide-react';

const namishreeHighlights = [
    {
        icon: Scale,
        tag: 'LEGAL DILIGENCE',
        title: '100% Clear Title Verification',
        description: 'Every property is scrutinized by certified real estate advocates with complete 30-year encumbrance clearance.'
    },
    {
        icon: Landmark,
        tag: 'BANK APPROVED',
        title: 'Pre-Approved Institutional Loans',
        description: 'Direct tie-ups with SBI, HDFC, and ICICI Bank offering preferential interest rates with zero processing delays.'
    },
    {
        icon: ShieldCheck,
        tag: 'ESCROW SECURITY',
        title: 'RERA Milestone Escrow Protection',
        description: 'Funds and token advances are safely deposited in legal escrow, released strictly upon verified title handovers.'
    },
    {
        icon: KeyRound,
        tag: 'ZERO BROKERAGE',
        title: 'Direct Verified Owner Connect',
        description: 'Access direct listings and verified RERA brokers without spam, unsolicited calls, or hidden middleman charges.'
    }
];

const platformPrivileges = [
    {
        icon: FileText,
        title: 'Triple-Tier Legal Search Report',
        desc: 'Comprehensive title search, mother deed verification, and municipal revenue mutation checks.'
    },
    {
        icon: Landmark,
        title: 'Subsidized Bank Home Loans',
        desc: 'Pre-approved loan sanction letters within 48 hours at partner bank preferential rates.'
    },
    {
        icon: Compass,
        title: 'Architectural & Vaastu Audits',
        desc: 'Accurate carpet area measurements, floor plan blueprints, and 100% Vaastu alignment analysis.'
    },
    {
        icon: Star,
        title: '360° Virtual & Drone Site Tours',
        desc: 'Explore high-definition drone views, neighborhood connectivity, and interior walkthroughs.'
    },
    {
        icon: Shield,
        title: 'Safe Token Escrow Vault',
        desc: 'Buyer token advances are securely preserved in escrow until legal title verification is complete.'
    },
    {
        icon: PhoneCall,
        title: 'Dedicated Site Visit Concierge',
        desc: 'Chauffeured site visits and personal property manager escort for seamless on-ground inspections.'
    }
];

const processSteps = [
    {
        number: '01',
        title: 'Discover & Shortlist',
        description: 'Explore verified luxury residences, gated villas, and commercial spaces filtered by city and budget.'
    },
    {
        number: '02',
        title: 'Legal Audit & Site Visit',
        description: 'Review legal title reports with certified advocates and schedule private chauffeured site inspections.'
    },
    {
        number: '03',
        title: 'Secure Escrow & Possession',
        description: 'Execute transparent digital agreements with milestone escrow protection and seamless handover.'
    }
];

const platformAudiences = [
    {
        title: 'For Discerning Buyers',
        role: 'Verified Acquisitions',
        description: 'Access curated premium inventory with 100% legal title guarantees, transparent pricing, and zero spam.'
    },
    {
        title: 'For Property Owners & Sellers',
        role: 'Maximum Realization',
        description: 'Showcase your property to qualified high-net-worth buyers with professional photography and fast closings.'
    },
    {
        title: 'For Certified RERA Brokers',
        role: 'Network & Scale',
        description: 'Manage institutional property portfolios, co-broke with verified agents, and receive direct escrow commissions.'
    }
];

export default function HomePage({ onOpenChat }) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});

    // VIP Callback Inquiry Form state (Namishree format)
    const [leadForm, setLeadForm] = useState({
        name: '',
        phone: '',
        interest: 'Buying Verified Home'
    });
    const [leadSubmitted, setLeadSubmitted] = useState(false);

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

    const handleLeadSubmit = (e) => {
        e.preventDefault();
        if (!leadForm.phone.trim()) return;
        setLeadSubmitted(true);
    };

    return (
        <div className="bg-slate-50 text-slate-900">
            {/* Top Live Offers Marquee Ticker */}
            <TopAdTicker />

            <div className="space-y-12 sm:space-y-16 lg:space-y-20">
                {/* ========================================================
                    1. HERO & SEARCH CONSOLE (NAMISHREE AESTHETIC)
                ======================================================== */}
                <div className="relative">
                <HeroSearch onSearch={handleSearch} />

                {/* Namishree-style Luxury Metrics Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5">
                        
                        <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 border-r border-slate-100 last:border-r-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <div className="text-base sm:text-xl font-black text-slate-900">100%</div>
                                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Clear Title Verified</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 border-r border-slate-100 last:border-r-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <div className="text-base sm:text-xl font-black text-slate-900">RERA</div>
                                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Certified Brokers</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 border-r border-slate-100 last:border-r-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                                <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <div className="text-base sm:text-xl font-black text-slate-900">₹0</div>
                                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Hidden Brokerage</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <div className="text-base sm:text-xl font-black text-slate-900">5,000+</div>
                                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Homes</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ========================================================
                2. PROJECT & PLATFORM HIGHLIGHTS (NAMISHREE FORMAT)
            ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Project & Platform Highlights
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Setting The Benchmark In Transparent Real Estate
                    </h2>
                    <p className="mt-2 text-xs sm:text-base text-slate-600 leading-relaxed">
                        Every listing on Evertree undergoes legal title scrutiny, escrow milestone safeguards, and direct owner pricing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                    {namishreeHighlights.map((item, idx) => {
                        const IconComponent = item.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100/80 group-hover:scale-110 transition-transform">
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            {item.tag}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-emerald-700 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                    <span>Verified Standards</span>
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ========================================================
                3. CURATED RESIDENCES: EXPLORE VERIFIED PROPERTIES
                Strictly 4 properties shown, with direct link to all properties
            ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-slate-200">
                    <div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-wider mb-1">
                            <ShieldCheck className="w-4 h-4" /> Curated Residences & Units
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                            Explore Verified Properties
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Direct contact with verified owners & certified RERA real estate brokers
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/search"
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                            <span>View more properties</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Listings Grid (Strictly 4 Properties) */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((n) => (
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
                            <Building2 className="w-8 h-8" />
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
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                            {properties.slice(0, 3).map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    onOpenChat={onOpenChat}
                                />
                            ))}
                            <InGridAdCard slotIndex={2} />
                        </div>
                    </div>
                )}

            </section>

            {/* ========================================================
                4. ANIMATED LUXURY SECTION: EXCLUSIVE PARTNER PRIVILEGES & ADS
                Includes animated marquee, smooth slide entrances, progress timer,
                pulsing ambient glow, shimmer light streaks, and interactive arrows.
            ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                <AnimatedAdsBanner variant="dark" />
            </section>

            {/* ========================================================
                5. NAMISHREE-STYLE PRIVILEGES & WORLD-CLASS AMENITIES
            ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-700 uppercase tracking-widest block mb-2">
                        UNMATCHED STANDARDS
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                        Platform Privileges & Assurance
                    </h2>
                    <p className="mt-2 text-xs sm:text-base text-slate-500 max-w-2xl mx-auto">
                        Engineered to eliminate risk, protect capital, and deliver institutional real estate transparency.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {platformPrivileges.map((item, i) => {
                        const IconComponent = item.icon;
                        return (
                            <div 
                                key={i}
                                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                    <IconComponent className="w-6 h-6" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ========================================================
                6. SEAMLESS 3-STEP JOURNEY (PROCESS)
            ======================================================== */}
            <section className="bg-white border-y border-slate-200/80 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 sm:mb-12">
                        <span className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest block">
                            THE 3-STEP PROCESS
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-1.5">
                            Seamless From Search To Handover
                        </h2>
                        <p className="text-xs sm:text-base text-slate-500 mt-2 max-w-2xl">
                            Evertree makes it effortless to discover properties and conclude legally verified transactions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                        {processSteps.map((step) => (
                            <div
                                key={step.number}
                                className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 lg:p-9 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-start group"
                            >
                                <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-300 w-fit">
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

            {/* ========================================================
                7. BUILT FOR EVERYONE IN REAL ESTATE (AUDIENCES)
            ======================================================== */}
            <section className="py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-8">
                        <span className="text-xs sm:text-sm font-extrabold text-emerald-700 uppercase tracking-widest block mb-1.5">
                            ONE PLATFORM
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                            Built For Everyone In Real Estate
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                        {platformAudiences.map((item) => (
                            <div
                                key={item.title}
                                className="bg-white rounded-3xl p-6 sm:p-8 lg:p-9 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-start group"
                            >
                                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-2">
                                    {item.role}
                                </div>
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

            {/* ========================================================
                8. NAMISHREE-STYLE VIP INQUIRY / SCHEDULE CONSULTATION BANNER
            ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
                <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 rounded-3xl p-6 sm:p-10 lg:p-14 text-white shadow-2xl border border-emerald-800/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7 space-y-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <PhoneCall className="w-3.5 h-3.5" /> Direct Advisor Desk
                            </span>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                                Schedule A Private Viewing Or Legal Consultation
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                                Connect directly with an Evertree property specialist for verified inventory walkthroughs, customized loan assessments, and title due diligence.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-slate-300">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Immediate 15-Minute Callback</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Confidential & Spam-Free</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Callback Form */}
                        <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-white/15">
                            {leadSubmitted ? (
                                <div className="text-center py-6 space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                                        <Check className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-lg font-bold text-white">Callback Request Confirmed!</h4>
                                    <p className="text-xs text-slate-300">
                                        Our senior advisor will reach out to you shortly at {leadForm.phone}.
                                    </p>
                                    <button 
                                        onClick={() => setLeadSubmitted(false)}
                                        className="text-xs text-emerald-400 underline font-semibold mt-2 cursor-pointer"
                                    >
                                        Send another request
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleLeadSubmit} className="space-y-3.5">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Request Instant VIP Callback
                                    </h4>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Your Full Name"
                                            value={leadForm.name}
                                            onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-hidden focus:border-emerald-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="tel"
                                            placeholder="Phone Number (+91)"
                                            value={leadForm.phone}
                                            onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-hidden focus:border-emerald-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <select
                                            value={leadForm.interest}
                                            onChange={(e) => setLeadForm({ ...leadForm, interest: e.target.value })}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/20 text-white text-xs sm:text-sm focus:outline-hidden focus:border-emerald-400"
                                        >
                                            <option value="Buying Verified Home">Interested in Buying a Home</option>
                                            <option value="Selling Property">Interested in Selling Property</option>
                                            <option value="Home Loan Clearance">Need Home Loan Approval</option>
                                            <option value="Legal Title Verification">Need Legal Title Clearance</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span>Connect With Advisor</span>
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            </div>
        </div>
    );
}
