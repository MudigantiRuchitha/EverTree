'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Building2, MessageSquare, Eye, Users, ShieldCheck, TrendingUp } from 'lucide-react';
import { propertyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export default function SellerDashboardPage({ onOpenChat }) {
    const { user } = useAuth();
    const { openChat } = useChat();
    const router = useRouter();
    const [myProperties, setMyProperties] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [activeTab, setActiveTab] = useState('listings');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadDashboardData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [propsRes, enqRes] = await Promise.all([
                propertyAPI.getMyListings(),
                propertyAPI.getEnquiries()
            ]);
            setMyProperties(propsRes.data || []);
            setEnquiries(enqRes.data || []);
        } catch (err) {
            console.error('Failed to load seller dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

            {/* Profile & Action Header */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <img
                        src={user?.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a'}
                        alt={user?.name || 'Seller'}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-4 ring-emerald-500/20"
                    />
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                                {user?.name || 'Seller'}'s Dashboard
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {user?.role === 'broker' ? 'Broker Portal' : 'Seller Dashboard'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">ID: {user?.verification_id || 'EVT-VERIFIED'}</p>
                    </div>
                </div>
                <Link
                    href="/add-property"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all hover:-translate-y-0.5 shrink-0"
                >
                    <PlusCircle className="w-4 h-4" /> Add New Property
                </Link>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Listings', value: myProperties.length, icon: Building2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    { label: 'Total Enquiries', value: enquiries.length, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                    { label: 'Total Views', value: myProperties.reduce((sum, p) => sum + (p.views_count || 0), 0), icon: Eye, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                    { label: 'Verified Status', value: 'Active', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-3 ${stat.color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-slate-900">{stat.value}</div>
                            <div className="text-xs text-slate-500 font-semibold mt-0.5">{stat.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit">
                <button
                    onClick={() => setActiveTab('listings')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        activeTab === 'listings'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Building2 className="w-4 h-4" /> My Listings ({myProperties.length})
                </button>
                <button
                    onClick={() => setActiveTab('enquiries')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        activeTab === 'enquiries'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Users className="w-4 h-4" /> Enquiries ({enquiries.length})
                </button>
            </div>

            {/* Tab Content */}
            {loading ? (
                <div className="text-center py-16 text-slate-500 text-sm">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading dashboard data...
                </div>
            ) : activeTab === 'listings' ? (
                myProperties.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1.5">No properties listed yet</h3>
                        <p className="text-xs sm:text-sm text-slate-500 mb-6">Start posting your property listings to attract verified buyers and tenants directly.</p>
                        <Link
                            href="/add-property"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                        >
                            <PlusCircle className="w-4 h-4" /> Add First Property
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                        {myProperties.map(prop => (
                            <div
                                key={prop.id}
                                onClick={() => router.push(`/property/${prop.id}`)}
                                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-emerald-500/40 transition-all cursor-pointer hover:-translate-y-1 flex flex-col"
                            >
                                <div className="relative h-44 overflow-hidden bg-slate-100">
                                    <img
                                        src={prop.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                                        alt={prop.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-600 text-white shadow-xs">
                                        {prop.category}
                                    </span>
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">{prop.title}</h3>
                                        <p className="text-xs text-slate-500 mb-2">{prop.city}, {prop.district}</p>
                                        <div className="text-base font-black text-emerald-600">
                                            ₹ {Number(prop.price).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-3 mt-2 border-t border-slate-100 text-xs text-slate-500 font-semibold">
                                        <Eye className="w-3.5 h-3.5" /> {prop.views_count || 0} Views
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                enquiries.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center max-w-lg mx-auto shadow-xs text-slate-500 text-sm">
                        <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        No enquiries received yet. Enquiries from buyers will appear here.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {enquiries.map(enq => (
                            <div
                                key={enq.id}
                                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-emerald-200 transition-colors"
                            >
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                        Re: {enq.property_title}
                                    </div>
                                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                                        Buyer: {enq.buyer_name}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-slate-500 italic">"{enq.message}"</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const partner = { seller_id: enq.buyer_id, seller_name: enq.buyer_name };
                                        if (onOpenChat) onOpenChat(partner);
                                        else openChat(partner);
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all shrink-0 cursor-pointer"
                                >
                                    <MessageSquare className="w-4 h-4" /> Chat Buyer
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
