'use client';
import React, { useState, useEffect } from 'react';
import HeroSearch from '../components/HeroSearch';
import PropertyCard from '../components/PropertyCard';
import { propertyAPI } from '../services/api';

export default function HomePage({ onOpenChat }) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        loadProperties();
    }, [filters]);

    const loadProperties = async () => {
        setLoading(true);
        try {
            const res = await propertyAPI.getProperties(filters);
            setProperties(res.data);
        } catch (err) {
            console.error('Failed to load properties:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchParams) => {
        setFilters(searchParams);
    };

    return (
        <div>
            <HeroSearch onSearch={handleSearch} />

            <div className="container" style={{ paddingBottom: '60px' }}>
                <div className="section-header" style={{ textAlign: 'left', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h2>Explore Verified Properties</h2>
                        <p>Direct contact with verified owners & RERA registered brokers</p>
                    </div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                        {properties.length} Available Listings
                    </span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                        Loading verified properties...
                    </div>
                ) : properties.length === 0 ? (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <h3>No properties found</h3>
                        <p style={{ marginTop: '8px' }}>Try adjusting your search criteria or filters</p>
                    </div>
                ) : (
                    <div className="grid-3">
                        {properties.map(property => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                onOpenChat={onOpenChat}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
