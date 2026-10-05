'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
    adAPI 
} from '../services/api';
import {
    Sparkles,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    ShieldCheck,
    Building2,
    Flame,
    ExternalLink
} from 'lucide-react';

const defaultFallbackAds = [
    {
        id: 'fb-1',
        title: 'Lowest Home Loan Interest Rates starting @ 8.35%',
        description: 'Special pre-negotiated interest rates for verified properties with SBI, HDFC & ICICI Bank with zero processing delay.',
        image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
        target_url: '/loan',
        position: '1'
    },
    {
        id: 'fb-2',
        title: 'Premium Modular Interior Design Solutions',
        description: 'Transform your dream home with 3D design previews, luxury Italian modular kitchens, and turnkey fit-outs.',
        image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
        target_url: '/interior',
        position: '2'
    },
    {
        id: 'fb-3',
        title: '100% Legal Title Search & Encumbrance Clearance',
        description: 'Complete 30-year documentation due diligence and RERA compliance verification by certified senior advocates.',
        image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
        target_url: '/legal',
        position: '3'
    },
    {
        id: 'fb-4',
        title: 'Exclusive Luxury Villas & Gated Communities',
        description: 'Resort-style luxury living with private pools, lush green gardens, clubhouse access, and smart home automation.',
        image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        target_url: '/search?type=villa',
        position: '4'
    },
    {
        id: 'fb-5',
        title: 'Reliable Movers & Relocation Partners across India',
        description: 'Seamless packing, moving, and transit insurance for premium home shifting with up to 40% exclusive partner discount.',
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        target_url: '/search',
        position: '5'
    }
];

const tickerDeals = [
    { text: "Pre-Approved Home Loans starting @ 8.35% via SBI & HDFC", tag: "FINANCE" },
    { text: "100% Free 30-Year Legal Title Search & Encumbrance Clearance", tag: "LEGAL" },
    { text: "Up to 20% Off Luxury Modular Interiors & 3D Consultation", tag: "INTERIORS" },
    { text: "RERA Milestone Escrow Protection on Every Verified Deal", tag: "SECURITY" },
    { text: "Zero Brokerage Guarantee on Verified Direct Developer Projects", tag: "SAVINGS" }
];

export default function AnimatedAdsBanner({ 
    variant = "dashboard", // "dark", "dashboard", or "compact"
    showManageLink = false,
    className = "" 
}) {
    const [ads, setAds] = useState([]);
    const [activeAdIndex, setActiveAdIndex] = useState(0);
    const [isAdPaused, setIsAdPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const getAdImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
            return url;
        }
        const cleaned = url.startsWith('/') ? url : `/${url}`;
        if (cleaned.startsWith('/uploads/')) {
            return `http://localhost:5000${cleaned}`;
        }
        return url;
    };

    useEffect(() => {
        let isMounted = true;
        const fetchAds = async () => {
            try {
                const res = await adAPI.getAds();
                if (isMounted) {
                    if (Array.isArray(res.data) && res.data.length > 0) {
                        setAds(res.data);
                    } else {
                        setAds(defaultFallbackAds);
                    }
                }
            } catch (err) {
                console.warn('Could not fetch remote ads, using fallback ads:', err?.message);
                if (isMounted) {
                    setAds(defaultFallbackAds);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchAds();
        return () => { isMounted = false; };
    }, []);

    // Auto-cycle through ads every 6 seconds unless paused
    useEffect(() => {
        if (!ads || ads.length <= 1 || isAdPaused) return;
        const timer = setInterval(() => {
            setActiveAdIndex((prev) => (prev + 1) % ads.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [ads, isAdPaused]);

    const handlePrevAd = () => {
        if (!ads || ads.length <= 1) return;
        setActiveAdIndex((prev) => (prev - 1 + ads.length) % ads.length);
    };

    const handleNextAd = () => {
        if (!ads || ads.length <= 1) return;
        setActiveAdIndex((prev) => (prev + 1) % ads.length);
    };

    const activeAd = ads[activeAdIndex] || ads[0] || defaultFallbackAds[0];
    const activeImageUrl = getAdImageUrl(activeAd?.image_url);

    const handleAdClick = (url) => {
        if (!url) return;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            window.location.href = url;
        }
    };

    const isDark = variant === "dark";

    return (
        <section 
            className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border ${
                isDark 
                    ? 'bg-gradient-to-br from-[#060e14] via-[#0a181e] to-[#040b10] border-emerald-900/60 text-white' 
                    : 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 border-emerald-800/40 text-white'
            } ${className}`}
            onMouseEnter={() => setIsAdPaused(true)}
            onMouseLeave={() => setIsAdPaused(false)}
        >
            {/* Ambient dynamic glows */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Top Animated Marquee Ticker */}
            <div className="relative overflow-hidden py-2 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md">
                <div className="animate-marquee-scroll flex items-center gap-10 whitespace-nowrap text-xs font-bold text-amber-200">
                    {[...tickerDeals, ...tickerDeals, ...tickerDeals].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                {item.tag}
                            </span>
                            <span className="tracking-wide text-xs">{item.text}</span>
                            <span className="text-amber-500/40 text-sm ml-2">✦</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative p-5 sm:p-7 lg:p-8">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} /> 
                            Exclusive Partner Privileges & Live Ads
                        </div>
                        <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                            Featured Verified Offers & Privileges
                        </h3>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        {showManageLink && (
                            <Link 
                                href="/evertree/secure/ads" 
                                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
                            >
                                <span>Manage Ads</span>
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                        )}

                        <span className="text-[11px] font-semibold text-slate-400 hidden md:inline">
                            {isAdPaused ? 'Paused on hover' : 'Auto-sliding'}
                        </span>

                        {/* Navigation Arrows */}
                        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/15 backdrop-blur-md">
                            <button
                                type="button"
                                onClick={handlePrevAd}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
                                aria-label="Previous Offer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNextAd}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
                                aria-label="Next Offer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Slide Dots */}
                        <div className="flex items-center gap-1.5 ml-1">
                            {ads.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveAdIndex(i)}
                                    className={`transition-all duration-500 rounded-full cursor-pointer ${
                                        i === activeAdIndex 
                                            ? 'w-6 sm:w-7 h-2 bg-gradient-to-r from-amber-400 to-emerald-400 shadow-sm shadow-amber-400/50' 
                                            : 'w-2 h-2 bg-white/25 hover:bg-white/50'
                                    }`}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Spotlight Showcase Card */}
                <div className="relative bg-white/[0.06] backdrop-blur-xl border border-white/15 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-amber-400/50 group animate-ad-glow">
                    {/* Top Animated Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden z-20">
                        <div 
                            key={`progress-${activeAdIndex}-${isAdPaused}`}
                            className={`h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 ${isAdPaused ? 'opacity-40' : 'animate-ad-progress'}`}
                            style={{
                                animationDuration: '6000ms',
                                animationPlayState: isAdPaused ? 'paused' : 'running'
                            }}
                        />
                    </div>

                    {/* Floating Left/Right Hover Arrows */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrevAd();
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-950/80 text-white border border-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
                        aria-label="Previous Offer"
                    >
                        <ChevronLeft className="w-5 h-5 text-amber-400" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNextAd();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-950/80 text-white border border-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
                        aria-label="Next Offer"
                    >
                        <ChevronRight className="w-5 h-5 text-amber-400" />
                    </button>

                    {/* Animated Content Body */}
                    <div 
                        key={activeAdIndex}
                        onClick={() => handleAdClick(activeAd.target_url)}
                        className="p-5 sm:p-7 lg:p-9 cursor-pointer animate-ad-entrance"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                            {/* Left Text Column */}
                            <div className="lg:col-span-7 space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
                                        </span>
                                        Featured Privilege
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-slate-200 border border-white/15">
                                        Offer #{activeAd.position || activeAdIndex + 1} of {ads.length}
                                    </span>
                                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Certified Partner
                                    </span>
                                </div>

                                <h4 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight group-hover:text-amber-300 transition-colors">
                                    {activeAd.title}
                                </h4>

                                {activeAd.description && (
                                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal max-w-2xl">
                                        {activeAd.description}
                                    </p>
                                )}

                                {/* Value perks */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-white/5 p-2 rounded-xl border border-white/10">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <span>Zero Middlemen</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-white/5 p-2 rounded-xl border border-white/10">
                                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                        <span>Escrow Protection</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-white/5 p-2 rounded-xl border border-white/10">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                        <span>Exclusive Subsidy</span>
                                    </div>
                                </div>

                                {/* Call to action button */}
                                <div className="pt-2">
                                    <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 group-hover:from-amber-300 group-hover:to-amber-400 shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-all">
                                        <span>Claim Offer & Explore</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>

                            {/* Right Image Frame with Shimmer Streak */}
                            <div className="lg:col-span-5">
                                <div className="relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 border-2 border-white/20 shadow-2xl group-hover:border-amber-400/60 transition-all duration-500 bg-slate-900 group/image">
                                    {/* Animated Light Shimmer Streak */}
                                    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                                        <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ad-shimmer" />
                                    </div>

                                    {activeImageUrl ? (
                                        <img 
                                            src={activeImageUrl} 
                                            alt={activeAd.title || 'Deal Offer'} 
                                            className="w-full h-full object-cover group-hover/image:scale-110 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-emerald-950 p-8 text-center">
                                            <Building2 className="w-16 h-16 text-amber-400/60" />
                                        </div>
                                    )}

                                    {/* Vignette */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                                    {/* Floating Verified Badge */}
                                    <div className="absolute top-3 right-3 z-20">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-950/85 text-amber-300 backdrop-blur-md border border-amber-400/30 shadow-md">
                                            <Sparkles className="w-3 h-3 text-amber-400" />
                                            Evertree Verified
                                        </span>
                                    </div>

                                    <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-xs text-slate-300">
                                        <span className="font-semibold text-[11px]">Click to view privilege</span>
                                        <ArrowUpRight className="w-4 h-4 text-amber-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick-Switch Thumbnails / Deals Selector */}
                {ads.length > 1 && (
                    <div className="mt-4 sm:mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
                        {ads.map((ad, idx) => {
                            const isSelected = idx === activeAdIndex;
                            const img = getAdImageUrl(ad.image_url);

                            return (
                                <button
                                    key={ad.id || idx}
                                    type="button"
                                    onClick={() => setActiveAdIndex(idx)}
                                    className={`p-2 sm:p-2.5 rounded-xl text-left transition-all duration-300 border flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                        isSelected 
                                            ? 'bg-white/20 border-amber-400 shadow-md shadow-amber-500/20 -translate-y-1' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:-translate-y-0.5'
                                    }`}
                                >
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden shrink-0 bg-slate-800 border border-white/10">
                                        {img ? (
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-full h-full p-1.5 text-amber-400/60" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-bold text-white truncate leading-tight">
                                            {ad.title}
                                        </p>
                                        <p className="text-[10px] text-amber-300 truncate">
                                            Offer #{ad.position || idx + 1}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
