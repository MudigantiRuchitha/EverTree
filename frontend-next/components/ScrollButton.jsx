'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollButton() {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('down'); // 'up' | 'down'
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        let lastScrollY = window.scrollY || document.documentElement.scrollTop;
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY || document.documentElement.scrollTop;
                    const maxScrollY = document.documentElement.scrollHeight - document.documentElement.clientHeight;

                    // 1. Calculate scroll progress percentage (0 to 100)
                    if (maxScrollY > 0) {
                        const progress = Math.min(100, Math.max(0, (currentScrollY / maxScrollY) * 100));
                        setScrollProgress(progress);
                    }

                    // 2. Visibility: The arrow is NOT visible at the very top (<= 150px).
                    // As soon as user scrolls down past 150px, it smoothly becomes visible.
                    if (currentScrollY > 150) {
                        setIsVisible(true);
                    } else {
                        setIsVisible(false);
                    }

                    // 3. Arrow Direction (Up & Down on the same arrow):
                    // - If near bottom (> 80% or within 150px of bottom), arrow points UP
                    // - If in upper section (< 40%), arrow points DOWN
                    // - When scrolling down, arrow points DOWN (to scroll to bottom)
                    // - When scrolling up, arrow points UP (to scroll to top)
                    const diff = currentScrollY - lastScrollY;

                    if (maxScrollY > 0 && currentScrollY >= maxScrollY - 150) {
                        setScrollDirection('up');
                    } else if (currentScrollY <= 350) {
                        setScrollDirection('down');
                    } else if (Math.abs(diff) >= 3) {
                        if (diff > 0) {
                            setScrollDirection('down');
                        } else {
                            setScrollDirection('up');
                        }
                    }

                    lastScrollY = currentScrollY;
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check on mount

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleClick = () => {
        if (scrollDirection === 'down') {
            // Scroll to the bottom of the page
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
            // Flip arrow to UP after initiating scroll to bottom
            setScrollDirection('up');
        } else {
            // Scroll to the top of the page
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Flip arrow to DOWN after initiating scroll to top
            setScrollDirection('down');
        }
    };

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${
                isVisible
                    ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
                    : 'opacity-0 translate-y-6 pointer-events-none scale-75'
            }`}
        >
            <button
                type="button"
                onClick={handleClick}
                className="relative w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-950/20 hover:shadow-emerald-600/40 border border-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group"
                title={scrollDirection === 'down' ? 'Scroll to Bottom (Click)' : 'Scroll to Top (Click)'}
                aria-label={scrollDirection === 'down' ? 'Scroll to Bottom' : 'Scroll to Top'}
            >
                {/* Circular Scroll Progress Ring */}
                <svg
                    className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                    viewBox="0 0 48 48"
                >
                    <circle
                        cx="24"
                        cy="24"
                        r="21"
                        className="stroke-white/20"
                        strokeWidth="2.5"
                        fill="none"
                    />
                    <circle
                        cx="24"
                        cy="24"
                        r="21"
                        className="stroke-white transition-all duration-150"
                        strokeWidth="2.5"
                        strokeDasharray={2 * Math.PI * 21}
                        strokeDashoffset={2 * Math.PI * 21 * (1 - scrollProgress / 100)}
                        strokeLinecap="round"
                        fill="none"
                    />
                </svg>

                {/* Single Arrow Icon that smoothly rotates for UP (0deg) and DOWN (180deg) */}
                <ArrowUp
                    className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
                        scrollDirection === 'down' ? 'rotate-180' : 'rotate-0'
                    }`}
                />
            </button>
        </div>
    );
}
