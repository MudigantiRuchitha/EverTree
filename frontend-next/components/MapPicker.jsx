'use client';

import React, { useEffect, useState } from 'react';
import {
    MapPin,
    Navigation,
    ExternalLink,
    Crosshair,
    Globe,
    Compass,
    Check
} from 'lucide-react';

const MapPicker = ({
    lat = 12.9716,
    lng = 77.5946,
    isEditable = false,
    address = '',
    onChangeLocation
}) => {
    const [currentLat, setCurrentLat] = useState(lat || 12.9716);
    const [currentLng, setCurrentLng] = useState(lng || 77.5946);
    const [isLocating, setIsLocating] = useState(false);
    const [locateSuccess, setLocateSuccess] = useState(false);

    useEffect(() => {
        if (lat != null && !isNaN(Number(lat))) {
            setCurrentLat(Number(lat));
        }
        if (lng != null && !isNaN(Number(lng))) {
            setCurrentLng(Number(lng));
        }
    }, [lat, lng]);

    const handleCoordChange = (newLat, newLng) => {
        setCurrentLat(newLat);
        setCurrentLng(newLng);
        if (onChangeLocation) {
            onChangeLocation(newLat, newLng);
        }
    };

    // Detect user's current GPS location
    const handleDetectCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const detectedLat = Number(position.coords.latitude.toFixed(6));
                const detectedLng = Number(position.coords.longitude.toFixed(6));
                handleCoordChange(detectedLat, detectedLng);
                setIsLocating(false);
                setLocateSuccess(true);
                setTimeout(() => setLocateSuccess(false), 3000);
            },
            (error) => {
                console.warn('Geolocation error:', error.message);
                setIsLocating(false);
                alert('Unable to retrieve your location. Please check browser permissions or enter coordinates manually.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Google Maps direct URL
    const googleMapsUrl = `https://www.google.com/maps?q=${currentLat},${currentLng}`;

    // Popular Indian City Presets for quick selection
    const cityPresets = [
        { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
        { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
        { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
        { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
        { name: 'Pune', lat: 18.5204, lng: 73.8567 }
    ];

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <span>{isEditable ? 'Google Maps Location Picker' : 'Property Location Pin'}</span>
                        {address && (
                            <p className="text-xs font-normal text-slate-500 truncate max-w-xs sm:max-w-md">
                                {address}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isEditable && (
                        <button
                            type="button"
                            onClick={handleDetectCurrentLocation}
                            disabled={isLocating}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
                            title="Detect your device GPS location"
                        >
                            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-600' : 'text-slate-600'}`} />
                            <span>{isLocating ? 'Detecting...' : locateSuccess ? '✓ Pinned!' : 'Detect My Location'}</span>
                        </button>
                    )}

                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all border border-emerald-200 cursor-pointer shadow-xs"
                    >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>

            {/* MAP VIEWPORT WITH EMBEDDED REAL GOOGLE MAP & CLICKABLE ACTIVE PIN */}
            <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
                
                {/* 1. EMBEDDED GOOGLE MAPS IFRAME (REAL LIVE TILES) */}
                <iframe
                    title="Google Maps Location Preview"
                    src={`https://maps.google.com/maps?q=${currentLat},${currentLng}&hl=en&z=15&output=embed`}
                    className="w-full h-full border-0 absolute inset-0 pointer-events-auto"
                    loading="lazy"
                />

                {/* 2. SUBTLE OVERLAY VIGNETTE */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/20 via-transparent to-slate-950/10" />

                {/* 3. CLICKABLE ACTIVE GOOGLE MAPS PIN (CENTERED) */}
                <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Click to open ${currentLat}, ${currentLng} in Google Maps`}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer group/pin transition-all transform hover:scale-110 active:scale-95"
                >
                    {/* Glowing radar pulses */}
                    <span className="absolute -inset-3 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
                    <span className="absolute -inset-5 rounded-full bg-rose-400/20 animate-pulse pointer-events-none" />

                    {/* PIN ICON */}
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-red-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 border-2 border-white ring-4 ring-rose-500/30 transition-transform group-hover/pin:rotate-6">
                        <MapPin className="w-6 h-6 drop-shadow-md text-white" />
                    </div>

                    {/* PIN ACTIVE BADGE (CLICKABLE) */}
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white text-slate-900 border border-slate-200 shadow-xl backdrop-blur-md group-hover/pin:bg-rose-600 group-hover/pin:text-white group-hover/pin:border-rose-600 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>Pin Active</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover/pin:text-white shrink-0 ml-0.5" />
                    </div>

                    {/* HOVER TOOLTIP */}
                    <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/90 text-white shadow-md opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none">
                        Click to view on Google Maps ↗
                    </span>
                </a>

                {/* 4. BOTTOM BAR WITH DIRECT LINK & COORDINATES */}
                <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between text-xs pointer-events-none">
                    <div className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-slate-700 text-[11px] font-mono font-bold shadow-md border border-white/60 pointer-events-auto">
                        📍 {Number(currentLat).toFixed(4)}, {Number(currentLng).toFixed(4)}
                    </div>

                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-md transition-colors pointer-events-auto inline-flex items-center gap-1 cursor-pointer"
                    >
                        <span>Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>

            </div>

            {/* 5. EDITABLE COORDINATE CONTROLS & CITY PRESETS */}
            {isEditable && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                    
                    {/* CITY PRESETS FOR FAST SELECTION */}
                    <div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Compass className="w-3 h-3 text-slate-400" /> Quick City Pointers
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {cityPresets.map((c) => {
                                const isSelected = Math.abs(currentLat - c.lat) < 0.05 && Math.abs(currentLng - c.lng) < 0.05;
                                return (
                                    <button
                                        key={c.name}
                                        type="button"
                                        onClick={() => handleCoordChange(c.lat, c.lng)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        }`}
                                    >
                                        {c.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* LATITUDE & LONGITUDE NUMBER INPUTS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 uppercase">Latitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                value={currentLat}
                                onChange={(e) => handleCoordChange(parseFloat(e.target.value) || 0, currentLng)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 uppercase">Longitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                value={currentLng}
                                onChange={(e) => handleCoordChange(currentLat, parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default MapPicker;
