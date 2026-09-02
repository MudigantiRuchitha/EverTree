'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Upload, FileText, CheckCircle2, ArrowLeft, Building2, MapPin, DollarSign, Home, Image as ImageIcon } from 'lucide-react';
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            
            {/* Back Button */}
            <button 
                onClick={() => router.back()} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs mb-6 transition-all cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {/* Form Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-sm">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 shrink-0">
                        <PlusCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                            Add Property Listing
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Provide property details, upload photos & documents, and pin exact location.
                        </p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-2xl text-sm font-semibold mb-6 ${
                        message.includes('✅') 
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                            : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Property Title *
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                                placeholder="e.g. Luxurious 3 BHK Villa in Whitefield" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                required 
                            />
                        </div>

                        {/* Category, Type, BHK, Price Grid (Mobile: 1 col, Tablet: 2 cols, Laptop: 4 cols) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category *</label>
                                <select 
                                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
                                    value={category} 
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="buy">Buy</option>
                                    <option value="sell">Sell</option>
                                    <option value="rent">Rent</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="agricultural">Agricultural Land</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Type *</label>
                                <select 
                                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
                                    value={propertyType} 
                                    onChange={(e) => setPropertyType(e.target.value)}
                                >
                                    <option value="apartment">Apartment</option>
                                    <option value="villa">Villa</option>
                                    <option value="plot">Plot</option>
                                    <option value="commercial_office">Commercial Office</option>
                                    <option value="commercial_shop">Commercial Shop</option>
                                    <option value="agricultural_land">Agricultural Land</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">BHK</label>
                                <select 
                                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
                                    value={bhk} 
                                    onChange={(e) => setBhk(e.target.value)}
                                >
                                    <option value="0">N/A</option>
                                    <option value="1">1 BHK</option>
                                    <option value="2">2 BHK</option>
                                    <option value="3">3 BHK</option>
                                    <option value="4">4+ BHK</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Price (₹) *</label>
                                <input 
                                    type="number" 
                                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
                                    placeholder="8500000" 
                                    value={price} 
                                    onChange={(e) => setPrice(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Location Fields (City, District, Address) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">City *</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
                                    placeholder="Bengaluru" 
                                    value={city} 
                                    onChange={(e) => setCity(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">District *</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
                                    placeholder="Urban Bengaluru" 
                                    value={district} 
                                    onChange={(e) => setDistrict(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Address</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
                                placeholder="House / Flat No., Street, Landmark" 
                                value={address} 
                                onChange={(e) => setAddress(e.target.value)} 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Property Description</label>
                            <textarea 
                                rows={3} 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
                                placeholder="Describe key features, flooring, layout, facing, and nearby landmarks..." 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                            />
                        </div>
                    </div>

                    {/* Interactive Map Location Pin */}
                    <div>
                        <MapPicker 
                            lat={latitude} 
                            lng={longitude} 
                            isEditable={true} 
                            onChangeLocation={(newLat, newLng) => { setLatitude(newLat); setLongitude(newLng); }} 
                        />
                    </div>

                    {/* File Upload Section (Mobile friendly touch zones) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/50 transition-colors">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase mb-2">
                                <Upload className="w-4 h-4 text-emerald-600" /> Upload Photos & Videos
                            </label>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*,video/*" 
                                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" 
                                onChange={(e) => setPhotosVideos(Array.from(e.target.files))} 
                            />
                            {photosVideos.length > 0 && (
                                <p className="text-xs text-emerald-600 font-semibold mt-2">✓ {photosVideos.length} files selected</p>
                            )}
                        </div>

                        <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-500 bg-slate-50/50 transition-colors">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase mb-2">
                                <FileText className="w-4 h-4 text-amber-600" /> Property Documents (PDF/DOC)
                            </label>
                            <input 
                                type="file" 
                                multiple 
                                accept=".pdf,.doc,.docx" 
                                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer" 
                                onChange={(e) => setPropertyDocs(Array.from(e.target.files))} 
                            />
                            {propertyDocs.length > 0 && (
                                <p className="text-xs text-amber-600 font-semibold mt-2">✓ {propertyDocs.length} documents selected</p>
                            )}
                        </div>
                    </div>

                    {/* Amenities Multi-Selector Grid (Touch friendly chips) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            Amenities & Facilities
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                            {availableAmenities.map(amenity => {
                                const selected = selectedAmenities.includes(amenity);
                                return (
                                    <button 
                                        type="button"
                                        key={amenity}
                                        onClick={() => handleAmenityToggle(amenity)}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${
                                            selected 
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500/20' 
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${selected ? 'text-emerald-600' : 'text-slate-300'}`} />
                                        <span className="truncate">{amenity}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-slate-100">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 text-base"
                        >
                            <PlusCircle className="w-5 h-5" />
                            {loading ? 'Submitting Property...' : 'Publish Property Listing'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
