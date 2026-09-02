'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, PhoneCall, MessageSquare, Share2, FileText, Download, ArrowLeft, Eye, CheckCircle2, ShieldCheck } from 'lucide-react';
import { propertyAPI } from '../../../services/api';
import MapPicker from '../../../components/MapPicker';
import NearbyPlaces from '../../../components/NearbyPlaces';
import EmiCalculator from '../../../components/EmiCalculator';
import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../context/ChatContext';

export default function PropertyPage({ onOpenChat }) {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { openChat } = useChat();
    const propertyId = params?.id;

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);
    const [enquiryMessage, setEnquiryMessage] = useState('');
    const [enquirySent, setEnquirySent] = useState(false);

    useEffect(() => {
        if (propertyId) {
            loadPropertyDetails();
        }
    }, [propertyId]);

    const loadPropertyDetails = async () => {
        setLoading(true);
        try {
            const res = await propertyAPI.getPropertyById(propertyId);
            setProperty(res.data);
        } catch (err) {
            console.error('Failed to load property details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendEnquiry = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to send an enquiry.');
            return;
        }
        try {
            await propertyAPI.createEnquiry({ property_id: propertyId, message: enquiryMessage });
            setEnquirySent(true);
            setEnquiryMessage('');
        } catch (err) {
            alert('Enquiry submission failed.');
        }
    };

    const handleWhatsAppShare = () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const text = `Property on evertree.in: ${property?.title} for ₹${property?.price} in ${property?.city}! Link: ${url}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-semibold text-sm">Loading verified property details...</p>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Property not found</h2>
                <p className="text-sm text-slate-500 mb-6">The listing you are looking for might have been sold or removed.</p>
                <button 
                    onClick={() => router.push('/')} 
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Search
                </button>
            </div>
        );
    }

    const mediaList = property.media && property.media.length > 0 
        ? property.media 
        : [{ file_url: property.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa', media_type: 'image' }];

    const activeMedia = mediaList[selectedMediaIdx] || mediaList[0];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
            
            {/* Back Button */}
            <button 
                onClick={() => router.push('/')} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs transition-all cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Search
            </button>

            {/* Title & Price Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {property.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                            {property.property_type?.replace('_', ' ')}
                        </span>
                        {property.bhk > 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                                {property.bhk} BHK
                            </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Legal Verified
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                        {property.title}
                    </h1>

                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{property.address || `${property.city}, ${property.district}`}</span>
                    </div>
                </div>

                <div className="text-left md:text-right shrink-0">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600">
                        ₹ {Number(property.price).toLocaleString('en-IN')}
                        {property.category === 'rent' && <span className="text-xs sm:text-sm text-slate-500 font-normal"> / month</span>}
                    </div>
                    <div className="flex items-center md:justify-end gap-1 text-xs text-slate-400 mt-1">
                        <Eye className="w-3.5 h-3.5" /> {property.views_count || 1} views
                    </div>
                </div>
            </div>

            {/* Gallery & Sidebar Grid (Mobile: 1 col, Laptop: 3 cols grid with 2 cols main, 1 col sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                
                {/* Main Media & Overview Column */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Visual Media Viewer */}
                    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-md border border-slate-200">
                        <div className="h-64 sm:h-96 md:h-[460px] w-full flex items-center justify-center bg-black">
                            {activeMedia.media_type === 'video' ? (
                                <video src={activeMedia.file_url} controls className="w-full h-full object-contain" />
                            ) : (
                                <img src={activeMedia.file_url} alt={property.title} className="w-full h-full object-cover" />
                            )}
                        </div>
                    </div>

                    {/* Thumbnail Gallery */}
                    {mediaList.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                            {mediaList.map((m, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setSelectedMediaIdx(idx)}
                                    className={`w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer ${
                                        selectedMediaIdx === idx 
                                            ? 'ring-3 ring-emerald-500 opacity-100 scale-105' 
                                            : 'opacity-60 hover:opacity-100 border border-slate-200'
                                    }`}
                                >
                                    <img src={m.file_url} alt="thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Description Overview */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Property Overview</h3>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                            {property.description || 'Spacious property with prime layout and high-yield connectivity in prime metropolitan region.'}
                        </p>
                    </div>

                    {/* Property Documents */}
                    {property.docs && property.docs.length > 0 && (
                        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-amber-600" /> Verified Legal Documentation
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {property.docs.map((doc, idx) => (
                                    <a 
                                        key={idx} 
                                        href={doc.file_url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all"
                                    >
                                        <div className="flex items-center gap-2 truncate text-xs sm:text-sm font-semibold text-slate-800">
                                            <span>📄</span>
                                            <span className="truncate">{doc.title || 'Property Document PDF'}</span>
                                        </div>
                                        <Download className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nearby Infrastructure & Amenities */}
                    <NearbyPlaces amenities={property.amenities} />

                </div>

                {/* Sticky Contact & Map Sidebar */}
                <div className="space-y-6">
                    
                    {/* Seller Card & Actions */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs sticky top-24">
                        
                        {/* Seller Pill */}
                        <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-slate-100">
                            <img 
                                src={property.seller_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                                alt={property.seller_name} 
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30"
                            />
                            <div>
                                <div className="font-bold text-slate-900 text-base">{property.seller_name}</div>
                                <div className="text-xs text-slate-500 capitalize flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Verified {property.seller_role}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2.5">
                            <button 
                                onClick={() => {
                                    if (onOpenChat) onOpenChat(property);
                                    else openChat(property);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                            >
                                <MessageSquare className="w-4 h-4" /> Live Chat with Owner
                            </button>

                            <a 
                                href={`tel:${property.seller_phone}`} 
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
                            >
                                <PhoneCall className="w-4 h-4 text-amber-600" /> Call ({property.seller_phone})
                            </a>

                            <button 
                                onClick={handleWhatsAppShare}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm transition-all cursor-pointer"
                            >
                                <Share2 className="w-4 h-4" /> Share on WhatsApp
                            </button>
                        </div>

                        {/* Quick Enquiry Form */}
                        <form onSubmit={handleSendEnquiry} className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 uppercase">Direct Enquiry Message</label>
                                <textarea 
                                    rows={2} 
                                    placeholder="I am interested in this property..." 
                                    value={enquiryMessage} 
                                    onChange={(e) => setEnquiryMessage(e.target.value)} 
                                    required 
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                            >
                                Send Quick Enquiry
                            </button>
                            {enquirySent && (
                                <div className="text-xs text-emerald-600 font-bold text-center">
                                    ✓ Enquiry sent to seller!
                                </div>
                            )}
                        </form>

                    </div>

                    {/* Property Map Pin */}
                    <MapPicker lat={property.latitude} lng={property.longitude} isEditable={false} />

                </div>

            </div>

            {/* EMI Calculator Section */}
            <div className="pt-4">
                <EmiCalculator defaultPrincipal={property.price} />
            </div>

        </div>
    );
}
