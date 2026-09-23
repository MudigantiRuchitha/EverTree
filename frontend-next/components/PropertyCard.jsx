'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Bed, Building, MessageSquare, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { propertyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useCart } from '../context/CartContext';

export default function PropertyCard({
    property,
    initialFavorite = false,
    onFavoriteChange,
    onOpenChat
}) {
    const router = useRouter();
    const { user } = useAuth();
    const chatContext = useChat();
    const { addToCart, removeFromCart, isInCart } = useCart();

    const [isFavorite, setIsFavorite] = useState(
        Boolean(property?.is_favorite ?? initialFavorite)
    );
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [inCart, setInCart] = useState(false);

    useEffect(() => {
        setIsFavorite(Boolean(property?.is_favorite ?? initialFavorite));
    }, [property?.is_favorite, initialFavorite]);

    useEffect(() => {
        if (property?.id) {
            setInCart(isInCart(property.id));
        }
    }, [property?.id, isInCart]);

    const handleOpenProperty = () => {
        if (!property?.id) return;
        router.push(`/property/${property.id}`);
    };

    const handleFavorite = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!user) {
            alert('Please sign in to add properties to your wishlist.');
            return;
        }

        if (favoriteLoading || !property?.id) return;

        setFavoriteLoading(true);
        try {
            const response = await propertyAPI.toggleFavorite(property.id);
            const favorited = Boolean(response.data?.favorited);
            setIsFavorite(favorited);
            if (onFavoriteChange) {
                onFavoriteChange(property.id, favorited);
            }
        } catch (error) {
            console.error('Favorite error:', error);
            if (error.response?.status === 401) {
                alert('Please sign in to save properties to your wishlist.');
            }
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleCartToggle = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!property?.id) return;

        if (inCart) {
            removeFromCart(property.id);
            setInCart(false);
        } else {
            addToCart(property);
            setInCart(true);
        }
    };

    const handleChatClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onOpenChat) {
            onOpenChat(property);
        } else if (chatContext?.openChat) {
            chatContext.openChat(property);
        } else {
            router.push(`/messages?propertyId=${property.id}`);
        }
    };

    const formatPrice = (price) => {
        const val = Number(price);
        if (!val || isNaN(val)) return '₹ --';
        if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} Lakh`;
        return `₹ ${val.toLocaleString('en-IN')}`;
    };

    const getImageUrl = (rawUrl) => {
        const url = rawUrl || property?.cover_image || property?.image_url || property?.image;
        if (!url) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
        return url;
    };

    const coverImage = getImageUrl();
    const category = (property?.category || 'sell').toLowerCase();

    return (
        <article
            onClick={handleOpenProperty}
            className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1"
        >
            {/* Image Container */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                <img
                    src={coverImage}
                    alt={property?.title || 'Property Listing'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa';
                    }}
                />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs ${
                        category === 'buy' || category === 'sell'
                            ? 'bg-emerald-600 text-white'
                            : category === 'rent'
                            ? 'bg-blue-600 text-white'
                            : 'bg-amber-500 text-white'
                    }`}>
                        {property?.category || 'SELL'}
                    </span>
                    {property?.is_featured && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                            Featured
                        </span>
                    )}
                </div>

                {/* Wishlist (Heart) Button */}
                <button
                    type="button"
                    onClick={handleFavorite}
                    disabled={favoriteLoading}
                    aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-white shadow-xs transition-transform active:scale-90 z-10"
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
                </button>

                {/* Price Pill */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl font-black text-sm sm:text-base text-emerald-700 shadow-xs border border-white/50 z-10">
                    {formatPrice(property?.price)}
                    {category === 'rent' ? <span className="text-xs font-normal text-slate-500"> / mo</span> : ''}
                </div>
            </div>

            {/* Content Details */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 text-base">
                        {property?.title || 'Untitled Property'}
                    </h3>

                    {(property?.city || property?.district || property?.address) && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 line-clamp-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                                {[property?.city, property?.district].filter(Boolean).join(', ')}
                            </span>
                        </div>
                    )}

                    {/* Specs Chips */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                        {Number(property?.bhk) > 0 && (
                            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                <Bed className="w-3.5 h-3.5 text-amber-600" />
                                <span>{property.bhk} BHK</span>
                            </div>
                        )}
                        {property?.property_type && (
                            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 capitalize truncate">
                                <Building className="w-3.5 h-3.5 text-blue-600" />
                                <span>{String(property.property_type).replace(/_/g, ' ')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer: Seller + Action Buttons */}
                <div className="pt-3 border-t border-slate-100 mt-auto space-y-2">
                    {/* Seller Info */}
                    <div className="flex items-center gap-2 min-w-0">
                        {property?.seller_avatar ? (
                            <img
                                src={property.seller_avatar}
                                alt={property?.seller_name || 'Seller'}
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {(property?.seller_name || 'S').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-xs font-semibold text-slate-700 truncate">
                            {property?.seller_name ? property.seller_name.split(' ')[0] : 'Owner'}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Chat Button */}
                        <button
                            type="button"
                            onClick={handleChatClick}
                            className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Chat
                        </button>

                        {/* Add to Cart Button */}
                        <button
                            type="button"
                            onClick={handleCartToggle}
                            aria-label={inCart ? 'Remove from cart' : 'Add to cart'}
                            className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                                inCart
                                    ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
                                    : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200'
                            }`}
                        >
                            {inCart ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                                <ShoppingCart className="w-3.5 h-3.5" />
                            )}
                            {inCart ? 'Added' : 'Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}