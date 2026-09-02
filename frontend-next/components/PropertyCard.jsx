'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Bed, Building, Heart, MessageSquare, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { propertyAPI } from '../services/api';

const PropertyCard = ({ property, onOpenChat }) => {
    const { user } = useAuth();
    const { openChat } = useChat();
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);

    const handleViewDetails = () => {
        router.push(`/property/${property.id}`);
    };

    const handleToggleFavorite = async (e) => {
        e.stopPropagation();
        if (!user) {
            alert('Please login to save favorite properties.');
            return;
        }
        try {
            const res = await propertyAPI.toggleFavorite(property.id);
            setIsFavorite(res.data.favorited);
        } catch (err) {
            console.error('Error toggling favorite:', err);
        }
    };

    const formatPrice = (price) => {
        const val = Number(price);
        if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} Lakh`;
        return `₹ ${val.toLocaleString('en-IN')}`;
    };

    const handleChatClick = (e) => {
        e.stopPropagation();
        if (onOpenChat) {
            onOpenChat(property);
        } else {
            openChat(property);
        }
    };

    return (
        <div
            onClick={handleViewDetails}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1"
        >
            {/* Image & Badges Container */}
            <div className="relative h-48 sm:h-52 md:h-56 w-full overflow-hidden bg-slate-100">
                <img
                    src={property.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Category & Featured Tag */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                        property.category === 'buy' || property.category === 'sell'
                            ? 'bg-emerald-600 text-white'
                            : property.category === 'rent'
                            ? 'bg-blue-600 text-white'
                            : 'bg-amber-500 text-white'
                    }`}>
                        {property.category}
                    </span>
                    {property.is_featured && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                            Featured
                        </span>
                    )}
                </div>

                {/* Favorite Heart Button */}
                <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-white shadow-md transition-transform active:scale-90 z-10"
                    title="Save Favorite"
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
                </button>

                {/* Price Pill */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl font-extrabold text-base sm:text-lg text-emerald-700 shadow-md border border-white/40 z-10">
                    {formatPrice(property.price)} <span className="text-xs font-semibold text-slate-500">{property.category === 'rent' ? '/ mo' : ''}</span>
                </div>
            </div>

            {/* Content Details */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1.5">
                        {property.title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-3 line-clamp-1">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{property.city}, {property.district}</span>
                    </div>

                    {/* Specs Pills */}
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600 mb-4">
                        {property.bhk > 0 && (
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                <Bed className="w-3.5 h-3.5 text-amber-600" />
                                <span>{property.bhk} BHK</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 capitalize">
                            <Building className="w-3.5 h-3.5 text-blue-600" />
                            <span>{property.property_type?.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>

                {/* Seller & Action Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-2">
                        <img
                            src={property.seller_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                            alt={property.seller_name || 'Seller'}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="text-xs font-semibold text-slate-700">
                            {property.seller_name ? property.seller_name.split(' ')[0] : 'Verified Agent'}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleChatClick}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
