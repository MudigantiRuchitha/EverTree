'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Upload, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import { propertyAPI } from '../../services/api';
import MapPicker from '../../components/MapPicker';
import { useAuth } from '../../context/AuthContext';

export default function AddPropertyPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('sell');
    const [propertyType, setPropertyType] = useState('apartment');
    const [bhk, setBhk] = useState('2');
    const [price, setPrice] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState(12.9716);
    const [longitude, setLongitude] = useState(77.5946);
    const [selectedAmenities, setSelectedAmenities] = useState(['24/7 Security', 'Power Backup']);
    const [isFeatured, setIsFeatured] = useState(false);

    const [photosVideos, setPhotosVideos] = useState([]);
    const [propertyDocs, setPropertyDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const availableAmenities = [
        'Swimming Pool', '24/7 Security', 'Power Backup', 'Gymnasium',
        'Visitor Parking', 'Clubhouse', 'Rainwater Harvesting', 'Lift / Elevator',
        'Solar Water Heater', 'CCTV Surveillance', 'Children Play Area'
    ];

    const handleAmenityToggle = (amenity) => {
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || (user.role !== 'seller' && user.role !== 'broker')) {
            alert('Only registered Sellers and Brokers can post properties.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('property_type', propertyType);
            formData.append('bhk', bhk);
            formData.append('price', price);
            formData.append('city', city);
            formData.append('district', district);
            formData.append('address', address);
            formData.append('latitude', latitude);
            formData.append('longitude', longitude);
            formData.append('amenities', JSON.stringify(selectedAmenities));
            formData.append('is_featured', isFeatured);

            for (let i = 0; i < photosVideos.length; i++) {
                formData.append('files', photosVideos[i]);
            }
            for (let i = 0; i < propertyDocs.length; i++) {
                formData.append('files', propertyDocs[i]);
            }

            await propertyAPI.createProperty(formData);
            setMessage('✅ Property listed successfully!');
            setTimeout(() => {
                router.push('/seller-dashboard');
            }, 1200);
        } catch (err) {
            setMessage('❌ Failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section-padding" style={{ maxWidth: '840px' }}>
            <button className="btn btn-secondary" onClick={() => router.back()} style={{ marginBottom: '20px' }}>
                <ArrowLeft size={16} /> Back
            </button>

            <div className="glass-card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <PlusCircle size={20} color="#ffffff" />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Add Property Listing</h1>
                </div>

                {message && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: message.includes('✅') ? '#dcfce7' : '#fef2f2',
                        border: message.includes('✅') ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        color: message.includes('✅') ? '#15803d' : '#dc2626',
                        marginBottom: '16px',
                        fontSize: '0.9rem'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title *</label>
                        <input type="text" className="form-control" placeholder="Property title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <div className="form-group">
                            <label>Category *</label>
                            <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="buy">Buy</option>
                                <option value="sell">Sell</option>
                                <option value="rent">Rent</option>
                                <option value="commercial">Commercial</option>
                                <option value="agricultural">Agricultural Land</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Type *</label>
                            <select className="form-control" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                                <option value="apartment">Apartment</option>
                                <option value="villa">Villa</option>
                                <option value="plot">Plot</option>
                                <option value="commercial_office">Commercial Office</option>
                                <option value="commercial_shop">Commercial Shop</option>
                                <option value="agricultural_land">Agricultural Land</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>BHK</label>
                            <select className="form-control" value={bhk} onChange={(e) => setBhk(e.target.value)}>
                                <option value="0">N/A</option>
                                <option value="1">1 BHK</option>
                                <option value="2">2 BHK</option>
                                <option value="3">3 BHK</option>
                                <option value="4">4+ BHK</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Price (₹) *</label>
                            <input type="number" className="form-control" placeholder="8500000" value={price} onChange={(e) => setPrice(e.target.value)} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <div className="form-group">
                            <label>City *</label>
                            <input type="text" className="form-control" placeholder="Bengaluru" value={city} onChange={(e) => setCity(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>District *</label>
                            <input type="text" className="form-control" placeholder="Urban Bengaluru" value={district} onChange={(e) => setDistrict(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea className="form-control" rows="3" placeholder="Key features..." value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div style={{ margin: '16px 0' }}>
                        <MapPicker lat={latitude} lng={longitude} isEditable={true} onChangeLocation={(newLat, newLng) => { setLatitude(newLat); setLongitude(newLng); }} />
                    </div>

                    <div className="form-group" style={{ margin: '16px 0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Upload size={14} color="var(--primary-emerald)" /> Upload Photos & Videos
                        </label>
                        <input type="file" multiple accept="image/*,video/*" className="form-control" onChange={(e) => setPhotosVideos(Array.from(e.target.files))} />
                    </div>

                    <div className="form-group" style={{ margin: '16px 0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={14} color="var(--accent-gold)" /> Property Documents (PDF/DOC Optional)
                        </label>
                        <input type="file" multiple accept=".pdf,.doc,.docx" className="form-control" onChange={(e) => setPropertyDocs(Array.from(e.target.files))} />
                    </div>

                    <div style={{ margin: '16px 0' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                            AMENITIES
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                            {availableAmenities.map(amenity => {
                                const selected = selectedAmenities.includes(amenity);
                                return (
                                    <div 
                                        key={amenity}
                                        onClick={() => handleAmenityToggle(amenity)}
                                        style={{
                                            padding: '8px 10px',
                                            borderRadius: '6px',
                                            border: selected ? '1px solid var(--primary-emerald)' : '1px solid #cbd5e1',
                                            background: selected ? '#dcfce7' : '#f8fafc',
                                            color: selected ? '#15803d' : 'var(--text-muted)',
                                            fontSize: '0.82rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <CheckCircle2 size={14} color={selected ? 'var(--primary-emerald)' : '#cbd5e1'} />
                                        {amenity}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={loading}
                        style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '16px' }}
                    >
                        {loading ? 'Submitting...' : 'Publish Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
}
