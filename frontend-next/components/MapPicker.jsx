'use client';
import React, { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const MapPicker = ({ lat = 12.9716, lng = 77.5946, isEditable = false, onChangeLocation }) => {
    const [currentLat, setCurrentLat] = useState(lat);
    const [currentLng, setCurrentLng] = useState(lng);

    useEffect(() => {
        setCurrentLat(lat);
        setCurrentLng(lng);
    }, [lat, lng]);

    const handleCoordChange = (newLat, newLng) => {
        setCurrentLat(newLat);
        setCurrentLng(newLng);
        if (onChangeLocation) {
            onChangeLocation(newLat, newLng);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{isEditable ? 'Google Maps Location Picker' : 'Property Location Pin'}</span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                    Lat: {Number(currentLat).toFixed(4)}, Lng: {Number(currentLng).toFixed(4)}
                </div>
            </div>

            <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center flex-col [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="flex flex-col items-center -translate-y-2">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                        <Navigation className="w-5 h-5 text-emerald-700" />
                    </div>
                    <span className="mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
                        Pin Active
                    </span>
                </div>

                <div className="absolute bottom-2 left-3 right-3 flex justify-between text-xs text-slate-500">
                    <span>Map View Preview</span>
                    <a
                        href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-emerald-700 hover:text-emerald-800"
                    >
                        Google Maps ↗
                    </a>
                </div>
            </div>

            {isEditable && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase">Latitude</label>
                        <input
                            type="number"
                            step="0.0001"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                            value={currentLat}
                            onChange={(e) => handleCoordChange(parseFloat(e.target.value) || 0, currentLng)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase">Longitude</label>
                        <input
                            type="number"
                            step="0.0001"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                            value={currentLng}
                            onChange={(e) => handleCoordChange(currentLat, parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapPicker;
