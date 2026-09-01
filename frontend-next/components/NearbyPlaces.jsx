'use client';
import React from 'react';
import { School, Stethoscope, Bus, ShoppingBag, Shield, CheckCircle } from 'lucide-react';

const NearbyPlaces = ({ amenities = [] }) => {
    const places = [
        { type: 'School', name: 'National Public School', distance: '1.2 km', icon: School, color: '#2563eb' },
        { type: 'Hospital', name: 'Manipal Multi-Specialty Hospital', distance: '2.5 km', icon: Stethoscope, color: '#dc2626' },
        { type: 'Transit', name: 'Metro Station Junction', distance: '0.8 km', icon: Bus, color: '#059669' },
        { type: 'Shopping', name: 'Phoenix Marketcity Mall', distance: '3.1 km', icon: ShoppingBag, color: '#d97706' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Amenities */}
            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={18} color="var(--primary-emerald)" /> Key Amenities
                </h3>
                {amenities.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
                        {amenities.map((item, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#f8fafc',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.85rem',
                                color: 'var(--text-main)'
                            }}>
                                <CheckCircle size={14} color="var(--primary-emerald)" />
                                {item}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Power Backup, 24/7 Security, Visitor Parking.</p>
                )}
            </div>

            {/* Nearby Places */}
            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '14px' }}>Nearby Infrastructure</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {places.map((place, idx) => {
                        const Icon = place.icon;
                        return (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: '#f8fafc',
                                padding: '10px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    background: `${place.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={18} color={place.color} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{place.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{place.type} • {place.distance}</div>
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
