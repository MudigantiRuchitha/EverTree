'use client';
import React, { useState } from 'react';
import { Search, MapPin, Building, DollarSign, Home } from 'lucide-react';

const HeroSearch = ({ onSearch }) => {
    const [category, setCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [bhk, setBhk] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch({
            category,
            search: searchQuery,
            city,
            district,
            property_type: propertyType,
            bhk,
            max_price: maxPrice
        });
    };

    return (
        <div style={{ position: 'relative', padding: '40px 0 50px 0', textAlign: 'center' }}>
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                
                {/* Hero Headline */}
                <div style={{ maxWidth: '750px', margin: '0 auto 28px auto' }}>
                    <span className="badge badge-emerald" style={{ marginBottom: '12px', padding: '6px 14px', fontSize: '0.82rem' }}>
                        🌲 evertree.in
                    </span>
                    <h1 style={{ fontSize: '2.8rem', color: '#0f172a', marginBottom: '8px', lineHeight: '1.15' }}>
                        Property Connect: <span style={{ color: 'var(--primary-emerald)' }}>Buy</span> • <span style={{ color: 'var(--accent-gold)' }}>Sell</span> • <span style={{ color: '#2563eb' }}>Rent</span>
                    </h1>
                </div>

                {/* Light Search Box */}
                <div className="glass-card" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
                    
                    {/* Visual Tabs */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                        {[
                            { id: 'all', label: 'All Listings' },
                            { id: 'buy', label: 'Buy' },
                            { id: 'sell', label: 'Sell' },
                            { id: 'rent', label: 'Rent' },
                            { id: 'commercial', label: 'Commercial' },
                            { id: 'agricultural', label: 'Agricultural Land' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setCategory(tab.id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontFamily: 'var(--font-primary)',
                                    fontWeight: '700',
                                    fontSize: '0.88rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    background: category === tab.id ? 'var(--primary-emerald)' : '#f1f5f9',
                                    color: category === tab.id ? '#ffffff' : 'var(--text-muted)'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Filters */}
                    <form onSubmit={handleSearchSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                            
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label><Search size={14} /> Search</label>
                                <input type="text" className="form-control" placeholder="Indiranagar, Villa..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label><MapPin size={14} /> City</label>
                                <input type="text" className="form-control" placeholder="Bengaluru" value={city} onChange={(e) => setCity(e.target.value)} />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label><MapPin size={14} /> District</label>
                                <input type="text" className="form-control" placeholder="Urban Bengaluru" value={district} onChange={(e) => setDistrict(e.target.value)} />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label><Building size={14} /> Type</label>
                                <select className="form-control" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                                    <option value="">All Types</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="villa">Villa</option>
                                    <option value="commercial_office">Commercial</option>
                                    <option value="agricultural_land">Agricultural</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label><Home size={14} /> BHK</label>
                                <select className="form-control" value={bhk} onChange={(e) => setBhk(e.target.value)}>
                                    <option value="">Any BHK</option>
                                    <option value="1">1 BHK</option>
                                    <option value="2">2 BHK</option>
                                    <option value="3">3 BHK</option>
                                    <option value="4">4+ BHK</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label><DollarSign size={14} /> Max Budget</label>
                                <select className="form-control" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
                                    <option value="">No Limit</option>
                                    <option value="3000000">₹30 Lakhs</option>
                                    <option value="6000000">₹60 Lakhs</option>
                                    <option value="10000000">₹1 Crore</option>
                                    <option value="20000000">₹2 Crores</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '10px 28px', fontSize: '0.95rem' }}>
                                <Search size={16} /> Search Properties
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HeroSearch;
