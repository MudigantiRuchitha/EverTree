'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Bed, Building, Heart, MessageSquare } from 'lucide-react';
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

    const getCategoryBadgeClass = (cat) => {
        if (cat === 'buy' || cat === 'sell') return 'badge-emerald';
        if (cat === 'rent') return 'badge-blue';
        return 'badge-gold';
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
            className="glass-card"
            style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
            onClick={handleViewDetails}
        >
            {/* Image Header */}
            <div style={{ position: 'relative', height: '210px', width: '100%', overflow: 'hidden' }}>
                <img
                    src={property.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                    alt={property.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                    <span className={`badge ${getCategoryBadgeClass(property.category)}`}>
                        {property.category}
                    </span>
                    {property.is_featured && (
                        <span className="badge badge-gold">Featured</span>
                    )}
                </div>

                <button
                    onClick={handleToggleFavorite}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e2e8f0',
                        color: isFavorite ? '#ef4444' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    title="Save Favorite"
                >
                    <Heart size={16} fill={isFavorite ? '#ef4444' : 'none'} />
                </button>

                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-primary)',
                    fontWeight: '800',
                    fontSize: '1.15rem',
                    color: 'var(--primary-emerald)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    {formatPrice(property.price)} {property.category === 'rent' ? '/ mo' : ''}
                </div>
            </div>

            {/* Details */}
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '6px', lineHeight: '1.3' }}>
                        {property.title}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
                        <MapPin size={14} color="var(--primary-emerald)" />
                        {property.city}, {property.district}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {property.bhk > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Bed size={15} color="var(--accent-gold)" /> {property.bhk} BHK
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building size={15} color="var(--accent-blue)" /> {property.property_type.replace('_', ' ')}
                        </div>
                    </div>
                </div>

                {/* Seller & Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img
                            src={property.seller_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                            alt={property.seller_name}
                            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {property.seller_name ? property.seller_name.split(' ')[0] : 'Agent'}
                        </span>
                    </div>

                    <button
                        className="btn btn-secondary"
                        onClick={handleChatClick}
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                    >
                        <MessageSquare size={14} color="var(--primary-emerald)" /> Chat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
