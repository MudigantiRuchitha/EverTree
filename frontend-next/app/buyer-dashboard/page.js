'use client';
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { propertyAPI } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';
import { useAuth } from '../../context/AuthContext';

export default function BuyerDashboardPage({ onOpenChat }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadFavorites();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const res = await propertyAPI.getFavorites();
            setFavorites(res.data);
        } catch (err) {
            console.error('Failed to load favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section-padding">
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img 
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9'} 
                    alt={user?.name || 'Buyer'} 
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-emerald)' }} 
                />
                <div>
                    <h1 style={{ fontSize: '1.4rem', color: '#0f172a' }}>{user ? `${user.name}'s Wishlist` : 'Buyer Dashboard'}</h1>
                    <span className="badge badge-emerald">Wishlist & Saved Properties</span>
                </div>
            </div>

            <div className="section-header" style={{ textAlign: 'left', marginBottom: '20px' }}>
                <h2>Saved Favorite Properties</h2>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading favorites...</div>
            ) : favorites.length === 0 ? (
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                    <Heart size={40} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                    <h3 style={{ color: '#0f172a', marginBottom: '4px' }}>No favorites saved yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Browse listings and click the heart icon on any property to save it here.</p>
                </div>
            ) : (
                <div className="grid-3">
                    {favorites.map(property => (
                        <PropertyCard 
                            key={property.id} 
                            property={property} 
                            onOpenChat={onOpenChat}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
