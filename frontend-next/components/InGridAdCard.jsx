'use client';

import React from 'react';
import { Sparkles, ArrowRight, ArrowUpRight, CheckCircle2, Building2 } from 'lucide-react';

export default function InGridAdCard({ ad, slotIndex = 1, className = "" }) {
    const fallbackAd = {
        title: 'Lowest Home Loan Rates @ 8.35%',
        description: 'Instant pre-approval with SBI & HDFC Bank. Zero processing fee for verified properties.',
        image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        target_url: '/loan',
        position: slotIndex
    };

    const currentAd = ad || fallbackAd;

    const getImageUrl = (url) => {
        if (!url) return fallbackAd.image_url;
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
            return url;
        }
        const cleaned = url.startsWith('/') ? url : `/${url}`;
        if (cleaned.startsWith('/uploads/')) {
            return `http://localhost:5000${cleaned}`;
        }
        return url;
    };

    const imageUrl = getImageUrl(currentAd.image_url);

    const handleClick = () => {
        const url = currentAd.target_url || '/search';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            window.location.href = url;
        }
    };

    return (
        <div 
            onClick={handleClick}
            className={`group relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white rounded-2xl border-2 border-emerald-500/40 overflow-hidden shadow-lg hover:shadow-2xl hover:border-amber-400/70 transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1 ${className}`}
        >
            {/* Top Ambient Glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/25 transition-all"></div>

            {/* Media Image Frame with Shimmer Streak */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 shrink-0">
                {/* Diagonal Light Shimmer Streak */}
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ad-shimmer" />
                </div>

                <img
                    src={imageUrl}
                    alt={currentAd.title || 'Sponsored Advertisement'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackAd.image_url;
                    }}
                />

                {/* Dark Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

                {/* Top Badge: Sponsored & Position */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
                        <Sparkles className="w-3 h-3 text-slate-950" />
                        Sponsored Deal
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-amber-300 border border-amber-400/40 backdrop-blur-md">
                        Slot #{currentAd.position || slotIndex}
                    </span>
                </div>

                {/* Verified Pill */}
                <div className="absolute bottom-3 left-3 bg-emerald-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 z-20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Evertree Privilege</span>
                </div>
            </div>

            {/* Content Details */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 relative z-10">
                <div>
                    <h3 className="font-black text-white group-hover:text-amber-300 transition-colors line-clamp-2 text-base sm:text-lg leading-tight">
                        {currentAd.title}
                    </h3>

                    {currentAd.description && (
                        <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                            {currentAd.description}
                        </p>
                    )}
                </div>

                {/* Bottom CTA Action Button */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 group-hover:underline flex items-center gap-1">
                        Explore Offer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                </div>
            </div>
        </div>
    );
}
