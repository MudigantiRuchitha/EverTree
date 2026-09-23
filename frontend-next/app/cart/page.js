'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, ShoppingCart, Trash2, MapPin, Bed, Building, MessageSquare } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useChat } from '../../context/ChatContext';

export default function CartPage() {
    const { cartItems, removeFromCart, clearCart, cartCount } = useCart();
    const { openChat } = useChat();
    const router = useRouter();

    const formatPrice = (price) => {
        const val = Number(price);
        if (!val || isNaN(val)) return '₹ --';
        if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} Lakh`;
        return `₹ ${val.toLocaleString('en-IN')}`;
    };

    const getImageUrl = (property) => {
        const url = property?.cover_image || property?.image_url || property?.image;
        if (!url) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
        return url;
    };

    if (cartCount === 0) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-xs sm:px-10">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <ShoppingCart className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">Your cart is empty</h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Browse verified properties and add the ones you want to compare or enquire about.
                    </p>
                    <Link
                        href="/"
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                    >
                        <Search className="h-4 w-4" />
                        Find Properties
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            My Cart
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {cartCount} {cartCount === 1 ? 'property' : 'properties'} saved for comparison
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={clearCart}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                </div>

                {/* Cart Items */}
                <div className="space-y-4">
                    {cartItems.map((property) => (
                        <div
                            key={property.id}
                            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                        >
                            <div className="flex flex-col sm:flex-row">
                                {/* Property Image */}
                                <div
                                    className="w-full sm:w-48 h-40 sm:h-auto bg-slate-100 shrink-0 cursor-pointer"
                                    onClick={() => router.push(`/property/${property.id}`)}
                                >
                                    <img
                                        src={getImageUrl(property)}
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa';
                                        }}
                                    />
                                </div>

                                {/* Property Details */}
                                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                                    <div>
                                        {/* Category Badge */}
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase mb-2 ${
                                            property.category === 'rent'
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        }`}>
                                            {property.category || 'Sell'}
                                        </span>

                                        {/* Title */}
                                        <h2
                                            className="text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors line-clamp-1"
                                            onClick={() => router.push(`/property/${property.id}`)}
                                        >
                                            {property.title || 'Untitled Property'}
                                        </h2>

                                        {/* Location */}
                                        {(property.city || property.district) && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span>{[property.city, property.district].filter(Boolean).join(', ')}</span>
                                            </div>
                                        )}

                                        {/* Specs */}
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            {Number(property.bhk) > 0 && (
                                                <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                                    <Bed className="w-3.5 h-3.5 text-amber-600" />
                                                    {property.bhk} BHK
                                                </span>
                                            )}
                                            {property.property_type && (
                                                <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 capitalize">
                                                    <Building className="w-3.5 h-3.5 text-blue-600" />
                                                    {String(property.property_type).replace(/_/g, ' ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer: Price + Actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                                        <div className="text-xl font-black text-emerald-700">
                                            {formatPrice(property.price)}
                                            {property.category === 'rent' && (
                                                <span className="text-xs font-normal text-slate-500"> / mo</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Chat with seller */}
                                            <button
                                                type="button"
                                                onClick={() => openChat(property)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                Chat
                                            </button>

                                            {/* View Property */}
                                            <button
                                                type="button"
                                                onClick={() => router.push(`/property/${property.id}`)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                                            >
                                                View
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>

                                            {/* Remove from Cart */}
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(property.id)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Continue Shopping */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                    >
                        <Search className="w-4 h-4" />
                        Continue Browsing Properties
                    </Link>
                </div>

            </div>
        </main>
    );
}
