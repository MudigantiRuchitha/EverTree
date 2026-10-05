'use client';

import React, { useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Maximize2 } from 'lucide-react';

export default function MediaLightbox({
    isOpen,
    onClose,
    mediaList = [],
    currentIndex = 0,
    onChangeIndex,
    title = 'Property Media',
    getMediaUrl = (url) => url
}) {
    const total = mediaList.length;

    const handlePrev = useCallback(() => {
        if (total <= 1) return;
        onChangeIndex((currentIndex - 1 + total) % total);
    }, [currentIndex, total, onChangeIndex]);

    const handleNext = useCallback(() => {
        if (total <= 1) return;
        onChangeIndex((currentIndex + 1) % total);
    }, [currentIndex, total, onChangeIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        // Prevent background scroll
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose, handlePrev, handleNext]);

    if (!isOpen || total === 0) return null;

    const activeMedia = mediaList[currentIndex] || mediaList[0];
    const isVideo = activeMedia?.media_type === 'video';
    const mediaSrc = getMediaUrl(activeMedia?.file_url || activeMedia?.media_url || '');

    return (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Full screen property media gallery"
        >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-black/80 to-transparent z-10">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold shrink-0">
                        {isVideo ? 'Video' : 'Photo'} {currentIndex + 1} of {total}
                    </span>
                    {title && (
                        <h2 className="text-white/90 text-sm sm:text-base font-semibold truncate max-w-md">
                            {title}
                        </h2>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors text-xs font-semibold cursor-pointer"
                        title="Close (Esc)"
                    >
                        <X className="w-5 h-5" />
                        <span className="hidden sm:inline">Close</span>
                    </button>
                </div>
            </div>

            {/* Main Stage with Side Arrows */}
            <div className="relative flex-1 flex items-center justify-center px-4 sm:px-20 overflow-hidden">
                {/* Left Arrow Button */}
                {total > 1 && (
                    <button
                        type="button"
                        onClick={handlePrev}
                        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/50 hover:bg-emerald-600/80 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
                        title="Previous (Left Arrow)"
                        aria-label="Previous image or video"
                    >
                        <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
                    </button>
                )}

                {/* Active Media Container */}
                <div className="max-w-[90vw] max-h-[75vh] flex items-center justify-center">
                    {isVideo ? (
                        <video
                            key={mediaSrc}
                            src={mediaSrc}
                            controls
                            autoPlay
                            className="max-h-[75vh] max-w-[90vw] rounded-2xl shadow-2xl bg-black"
                        />
                    ) : (
                        <img
                            key={mediaSrc}
                            src={mediaSrc}
                            alt={title || 'Property photo'}
                            className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-transform duration-200"
                        />
                    )}
                </div>

                {/* Right Arrow Button */}
                {total > 1 && (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/50 hover:bg-emerald-600/80 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
                        title="Next (Right Arrow)"
                        aria-label="Next image or video"
                    >
                        <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
                    </button>
                )}
            </div>

            {/* Bottom Thumbnail Strip */}
            {total > 1 && (
                <div className="py-4 px-4 sm:px-8 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-10">
                    <div className="flex items-center justify-center gap-2.5 overflow-x-auto max-w-5xl mx-auto py-1 scrollbar-none">
                        {mediaList.map((item, idx) => {
                            const isThumbVideo = item.media_type === 'video';
                            const thumbSrc = getMediaUrl(item.file_url || item.media_url || '');
                            const isSelected = currentIndex === idx;

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => onChangeIndex(idx)}
                                    className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                        isSelected
                                            ? 'border-emerald-400 ring-4 ring-emerald-500/40 scale-105 opacity-100'
                                            : 'border-white/20 opacity-50 hover:opacity-90 hover:border-white/50'
                                    }`}
                                    title={`View item ${idx + 1}`}
                                >
                                    {isThumbVideo ? (
                                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                            <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                                        </div>
                                    ) : (
                                        <img
                                            src={thumbSrc}
                                            alt={`Thumb ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    )}

                                    {isSelected && (
                                        <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
