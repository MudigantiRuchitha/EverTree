'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Building2, MessageSquare, Eye, Users } from 'lucide-react';
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
            setMyProperties(propsRes.data);
            setEnquiries(enqRes.data);
        } catch (err) {
            console.error('Failed to load seller dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section-padding">
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img 
                        src={user?.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a'} 
                        alt={user?.name || 'Seller'} 
                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-emerald)' }} 
                    />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <h1 style={{ fontSize: '1.4rem', color: '#0f172a' }}>{user?.name || 'Seller'}'s Dashboard</h1>
                            <span className="badge badge-emerald">{user?.role === 'broker' ? 'Broker Portal' : 'Seller Dashboard'}</span>
                        </div>
                    </div>
                </div>

                <Link href="/add-property" className="btn btn-accent" style={{ padding: '10px 20px' }}>
                    <PlusCircle size={16} /> Add Property
                </Link>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    className={`btn ${activeTab === 'listings' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('listings')}
                >
                    <Building2 size={16} /> My Listings ({myProperties.length})
                </button>
                <button 
                    className={`btn ${activeTab === 'enquiries' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('enquiries')}
                >
                    <Users size={16} /> View Enquiries ({enquiries.length})
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading...</div>
            ) : activeTab === 'listings' ? (
                myProperties.length === 0 ? (
                    <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                        <h3 style={{ color: '#0f172a', marginBottom: '6px' }}>No properties listed yet</h3>
                        <Link href="/add-property" className="btn btn-primary" style={{ marginTop: '12px' }}>
                            <PlusCircle size={16} /> Add Property
                        </Link>
                    </div>
                ) : (
                    <div className="grid-3">
                        {myProperties.map(prop => (
                            <div 
                                key={prop.id} 
                                className="glass-card" 
                                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                                onClick={() => router.push(`/property/${prop.id}`)}
                            >
                                <div style={{ height: '160px', position: 'relative' }}>
                                    <img src={prop.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '8px', left: '8px' }} className="badge badge-emerald">{prop.category}</div>
                                </div>
                                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '4px' }}>{prop.title}</h3>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{prop.city}, {prop.district}</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-emerald)' }}>
                                            ₹ {Number(prop.price).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        <Eye size={12} /> {prop.views_count || 0} Views
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                enquiries.length === 0 ? (
                    <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No enquiries received yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {enquiries.map(enq => (
                            <div key={enq.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--primary-emerald)', fontWeight: '700' }}>
                                        Enquiry: {enq.property_title}
                                    </div>
                                    <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '2px' }}>
                                        Buyer: {enq.buyer_name}
                                    </h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>"{enq.message}"</p>
                                </div>

                                <button 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        const partner = { seller_id: enq.buyer_id, seller_name: enq.buyer_name };
                                        if (onOpenChat) onOpenChat(partner);
                                        else openChat(partner);
                                    }}
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    <MessageSquare size={14} /> Chat Buyer
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
