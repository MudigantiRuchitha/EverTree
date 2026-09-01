'use client';
import React, { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const MapPicker = ({ lat = 12.9716, lng = 77.5946, isEditable = false, onChangeLocation }) => {
    const [currentLat, setCurrentLat] = useState(lat);
    const [currentLng, setCurrentLng] = useState(lng);

    useEffect(() => {
        setCurrentLat(lat);
        setCurrentLng(lng);
    }, [lat, lng]);

    const handleCoordChange = (newLat, newLng) => {
        setCurrentLat(newLat);
        setCurrentLng(newLng);
        if (onChangeLocation) {
            onChangeLocation(newLat, newLng);
        }
    };

    return (
        <div className="glass-card" style={{ padding: '16px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                    <MapPin size={16} color="var(--primary-emerald)" />
                    {isEditable ? 'Google Maps Location Picker' : 'Property Location Pin'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Lat: {Number(currentLat).toFixed(4)}, Lng: {Number(currentLng).toFixed(4)}
                </div>
            </div>

            <div style={{
                position: 'relative',
                height: '220px',
                width: '100%',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-10px)' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(5, 150, 105, 0.15)',
                        border: '2px solid var(--primary-emerald)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(5, 150, 105, 0.4)'
                    }}>
                        <Navigation size={20} color="var(--primary-emerald)" />
                    </div>
                    <span className="badge badge-emerald" style={{ marginTop: '6px' }}>Pin Active</span>
                </div>

                <div style={{ position: 'absolute', bottom: '8px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Map View</span>
                    <a
                        href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--primary-emerald)', textDecoration: 'none', fontWeight: '700' }}
                    >
                        Google Maps ↗
                    </a>
                </div>
            </div>

            {isEditable && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Latitude</label>
                        <input
                            type="number"
                            step="0.0001"
                            className="form-control"
                            value={currentLat}
                            onChange={(e) => handleCoordChange(parseFloat(e.target.value) || 0, currentLng)}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Longitude</label>
                        <input
                            type="number"
                            step="0.0001"
                            className="form-control"
                            value={currentLng}
                            onChange={(e) => handleCoordChange(currentLat, parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapPicker;
