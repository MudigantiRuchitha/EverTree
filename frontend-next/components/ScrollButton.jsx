'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollButton() {
    const [isAtTop, setIsAtTop] = useState(true);
    const [isScrollable, setIsScrollable] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;

            // Only show if the page is tall enough to be scrollable
            const scrollable = scrollHeight > clientHeight + 150;
            setIsScrollable(scrollable);

            // If near top (<= 250px), button points down to scroll to bottom.
            // When scrolled down (> 250px), button points up to scroll back to top.
            setIsAtTop(currentScrollY <= 250);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    const handleScrollClick = () => {
        if (isAtTop) {
            // Scroll to the bottom of the page
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            // Scroll to the top of the page
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
                isScrollable
                    ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
                    : 'opacity-0 translate-y-4 pointer-events-none scale-75'
            }`}
        >
            <button
                type="button"
                onClick={handleScrollClick}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-950/20 hover:shadow-emerald-600/40 border border-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
                title={isAtTop ? 'Scroll to Bottom' : 'Scroll to Top'}
                aria-label={isAtTop ? 'Scroll to Bottom' : 'Scroll to Top'}
            >
                <ArrowUp
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ease-in-out ${
                        isAtTop ? 'rotate-180' : 'rotate-0'
                    }`}
                />
            </button>
        </div>
    );
}


