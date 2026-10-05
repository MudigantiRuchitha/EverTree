'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adAPI } from '../services/api';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

const defaultTickerItems = [
    { text: "Pre-Approved Home Loans starting @ 8.35% via SBI & HDFC", tag: "HOME LOAN", url: "/loan" },
    { text: "100% Free 30-Year Legal Title Search & Encumbrance Clearance", tag: "LEGAL", url: "/legal" },
    { text: "Up to 20% Off Luxury Modular Interiors & 3D Consultation", tag: "INTERIOR", url: "/interior" },
    { text: "RERA Milestone Escrow Protection on Every Verified Deal", tag: "SECURITY", url: "/search" },
    { text: "Zero Brokerage Guarantee on Verified Direct Developer Projects", tag: "DIRECT", url: "/search" }
];

export default function TopAdTicker({ className = "" }) {
    const [ads, setAds] = useState([]);

    useEffect(() => {
        let isMounted = true;
        adAPI.getAds()
            .then(res => {
                if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
                    setAds(res.data);
                }
            })
            .catch(() => {});
        return () => { isMounted = false; };
    }, []);

    const tickerItems = ads.length > 0
        ? ads.map((ad, idx) => ({
            text: ad.title + (ad.description ? ` — ${ad.description}` : ''),
            tag: ad.position ? `SLOT #${ad.position}` : `OFFER #${idx + 1}`,
            url: ad.target_url || '/search'
        }))
        : defaultTickerItems;

    const repeated = [...tickerItems, ...tickerItems, ...tickerItems];

    return (
        <div className={`relative overflow-hidden py-2 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 border-y border-emerald-800/40 text-white shadow-inner select-none ${className}`}>
            <div className="animate-marquee-scroll flex items-center gap-10 whitespace-nowrap text-xs font-bold text-slate-200">
                {repeated.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.url}
                        target={item.url.startsWith('http') ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="flex items-center gap-2.5 hover:text-amber-300 transition-colors group cursor-pointer"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            {item.tag}
                        </span>
                        <span className="tracking-wide">{item.text}</span>
                        <span className="text-amber-500/50 text-xs ml-2 group-hover:translate-x-0.5 transition-transform inline-flex items-center">✦</span>
                    </a>
                ))}
            </div>
        </div>
    );
}
