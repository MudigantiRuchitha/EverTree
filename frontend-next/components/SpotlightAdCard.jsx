'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adAPI } from '../services/api';
import { Sparkles, ArrowRight, ExternalLink, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';

const defaultSpotlightAds = [
    {
        title: 'Instant Home Loan Pre-Approval',
        description: 'Interest rates from 8.35% with zero processing fee via SBI & HDFC Bank.',
        image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
        target_url: '/loan',
        position: '1'
    },
    {
        title: '3D Modular Interiors & Fitouts',
        description: 'Get up to 20% subsidy on customized turnkey interior packages for verified homes.',
        image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
        target_url: '/interior',
        position: '2'
    },
    {
        title: 'Free 30-Year Legal Title Search',
        description: 'Certified real estate advocates verify encumbrance certificates & title documents.',
        image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
        target_url: '/legal',
        position: '3'
    }
];

export default function SpotlightAdCard({ className = "" }) {
    const [ads, setAds] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const getImageUrl = (url) => {
        if (!url) return defaultSpotlightAds[0].image_url;
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
        adAPI.getAds()
            .then(res => {
                if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
                    setAds(res.data);
                } else {
                    setAds(defaultSpotlightAds);
                }
            })
            .catch(() => {
                if (isMounted) setAds(defaultSpotlightAds);
            });
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (ads.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % ads.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [ads]);

    const activeList = ads.length > 0 ? ads : defaultSpotlightAds;
    const currentAd = activeList[currentIndex] || activeList[0];
    const imgUrl = getImageUrl(currentAd?.image_url);

    const handleClick = () => {
        const url = currentAd?.target_url || '/search';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            window.location.href = url;
        }
    };

    return (
        <div 
            onClick={handleClick}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 border-2 border-emerald-500/40 p-5 text-white shadow-xl hover:border-amber-400/60 transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 animate-ad-glow ${className}`}
        >
            {/* Top Light Shimmer Streak */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-ad-shimmer" />
            </div>

            {/* Background photo blend */}
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} /> 
                        Partner Privilege
                    </span>
                    <div className="flex items-center gap-1">
                        {activeList.slice(0, 4).map((_, i) => (
                            <span 
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/30'}`}
                            />
                        ))}
                    </div>
                </div>

                <div key={currentIndex} className="animate-ad-entrance space-y-1.5">
                    <h4 className="text-base font-black text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {currentAd.title}
                    </h4>
                    {currentAd.description && (
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {currentAd.description}
                        </p>
                    )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs font-bold text-emerald-400">
                    <span className="group-hover:text-amber-300 transition-colors flex items-center gap-1">
                        Claim Privilege <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[10px] text-slate-400">
                        Offer #{currentAd.position || currentIndex + 1}
                    </span>
                </div>
            </div>
        </div>
    );
}
