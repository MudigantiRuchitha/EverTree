'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, PhoneCall, MessageSquare, Share2, FileText, Download, ArrowLeft, Eye } from 'lucide-react';
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
            <div className="container section-padding" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading property details...
            </div>
        );
    }

    if (!property) {
        return (
            <div className="container section-padding" style={{ textAlign: 'center' }}>
                <h2>Property not found.</h2>
                <button className="btn btn-secondary" onClick={() => router.push('/')} style={{ marginTop: '16px' }}>
                    <ArrowLeft size={16} /> Back to Search
                </button>
            </div>
        );
    }

    const mediaList = property.media && property.media.length > 0 
        ? property.media 
        : [{ file_url: property.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa', media_type: 'image' }];

    const activeMedia = mediaList[selectedMediaIdx] || mediaList[0];

    return (
        <div className="container section-padding">
            <button className="btn btn-secondary" onClick={() => router.push('/')} style={{ marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back to Search
            </button>

            {/* Title & Price Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                <div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                        <span className="badge badge-emerald">{property.category}</span>
                        <span className="badge badge-blue">{property.property_type}</span>
                        {property.bhk > 0 && <span className="badge badge-gold">{property.bhk} BHK</span>}
                    </div>
                    <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '4px' }}>{property.title}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <MapPin size={16} color="var(--primary-emerald)" />
                        {property.address || `${property.city}, ${property.district}`}
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-emerald)', fontFamily: 'var(--font-primary)' }}>
                        ₹ {Number(property.price).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Eye size={12} /> {property.views_count || 1} views
                    </div>
                </div>
            </div>

            {/* Gallery & Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                
                {/* Visual Media Viewer */}
                <div>
                    <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '12px' }}>
                        <div style={{ height: '360px', width: '100%', position: 'relative', background: '#000' }}>
                            {activeMedia.media_type === 'video' ? (
                                <video src={activeMedia.file_url} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <img src={activeMedia.file_url} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                        </div>
                    </div>

                    {/* Thumbnail gallery */}
                    {mediaList.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                            {mediaList.map((m, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setSelectedMediaIdx(idx)}
                                    style={{
                                        width: '72px',
                                        height: '54px',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: selectedMediaIdx === idx ? '2px solid var(--primary-emerald)' : '1px solid #e2e8f0',
                                        opacity: selectedMediaIdx === idx ? 1 : 0.6
                                    }}
                                >
                                    <img src={m.file_url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    <div className="glass-card" style={{ padding: '20px', marginTop: '16px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '8px' }}>Property Overview</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.9rem' }}>
                            {property.description || 'Spacious property with prime layout and high-yield connectivity.'}
                        </p>
                    </div>

                    {/* Property Docs */}
                    {property.docs && property.docs.length > 0 && (
                        <div className="glass-card" style={{ padding: '20px', marginTop: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FileText size={18} color="var(--accent-gold)" /> Property Documents
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {property.docs.map((doc, idx) => (
                                    <a 
                                        key={idx} 
                                        href={doc.file_url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            color: '#0f172a',
                                            textDecoration: 'none',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <span>📄 {doc.title || 'Document PDF'}</span>
                                        <Download size={14} color="var(--primary-emerald)" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Seller Actions & Map */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                            <img 
                                src={property.seller_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                                alt={property.seller_name} 
                                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{property.seller_name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified {property.seller_role}</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '10px' }}
                                onClick={() => {
                                    if (onOpenChat) onOpenChat(property);
                                    else openChat(property);
                                }}
                            >
                                <MessageSquare size={16} /> Live Chat
                            </button>

                            <a 
                                href={`tel:${property.seller_phone}`} 
                                className="btn btn-secondary" 
                                style={{ width: '100%', padding: '10px', textDecoration: 'none' }}
                            >
                                <PhoneCall size={16} color="var(--accent-gold)" /> Call ({property.seller_phone})
                            </a>

                            <button 
                                className="btn btn-whatsapp" 
                                style={{ width: '100%', padding: '10px' }}
                                onClick={handleWhatsAppShare}
                            >
                                <Share2 size={16} /> Share WhatsApp
                            </button>
                        </div>

                        {/* Quick Enquiry */}
                        <form onSubmit={handleSendEnquiry} style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                            <div className="form-group">
                                <label>Direct Message</label>
                                <textarea 
                                    className="form-control" 
                                    rows="2" 
                                    placeholder="I am interested in this property..." 
                                    value={enquiryMessage} 
                                    onChange={(e) => setEnquiryMessage(e.target.value)} 
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '8px' }}>
                                Send Enquiry
                            </button>
                            {enquirySent && (
                                <div style={{ marginTop: '6px', color: '#059669', fontSize: '0.78rem', textAlign: 'center' }}>
                                    ✓ Enquiry sent to seller!
                                </div>
                            )}
                        </form>
                    </div>

                    <MapPicker lat={property.latitude} lng={property.longitude} isEditable={false} />
                </div>
            </div>

            <NearbyPlaces amenities={property.amenities} />

            <div style={{ marginTop: '30px' }}>
                <EmiCalculator defaultPrincipal={property.price} />
            </div>
        </div>
    );
}
