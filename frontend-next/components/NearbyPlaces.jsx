'use client';
import React from 'react';
import { School, Stethoscope, Bus, ShoppingBag, Shield, CheckCircle } from 'lucide-react';

const NearbyPlaces = ({ amenities = [] }) => {
    const places = [
        { type: 'School', name: 'National Public School', distance: '1.2 km', icon: School, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        { type: 'Hospital', name: 'Manipal Multi-Specialty Hospital', distance: '2.5 km', icon: Stethoscope, color: 'text-rose-600 bg-rose-50 border-rose-200' },
        { type: 'Transit', name: 'Metro Station Junction', distance: '0.8 km', icon: Bus, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        { type: 'Shopping', name: 'Phoenix Marketcity Mall', distance: '3.1 km', icon: ShoppingBag, color: 'text-amber-600 bg-amber-50 border-amber-200' }
    ];

    return (
        <div className="space-y-6">
            {/* Amenities */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" /> Key Amenities
                </h3>
                {amenities.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                        {amenities.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-700">
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="truncate">{item}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs sm:text-sm text-slate-500">Power Backup, 24/7 Security, Visitor Parking.</p>
                )}
            </div>

            {/* Nearby Infrastructure */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Nearby Infrastructure</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {places.map((place, idx) => {
                        const Icon = place.icon;
                        return (
                            <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${place.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900">{place.name}</div>
                                    <div className="text-xs text-slate-500">{place.type} &bull; {place.distance}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default NearbyPlaces;
