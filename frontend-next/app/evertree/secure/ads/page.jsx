'use client';
import React, { useState, useEffect, useRef } from 'react';
import { adAPI } from '../../../../services/api';
import { 
    Plus, Edit2, Trash2, Save, X, ImageIcon, LayoutTemplate, 
    Activity, UploadCloud, CheckCircle2, AlertCircle, Link as LinkIcon,
    Calendar, ArrowUpRight, RefreshCw, Eye
} from 'lucide-react';

const getAdImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }
    if (url.startsWith('/uploads/')) {
        return `http://localhost:5000${url}`;
    }
    return url;
};

export default function AdminAdsPage() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAd, setCurrentAd] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadAds();
    }, []);

    const loadAds = async () => {
        setLoading(true);
        try {
            const res = await adAPI.getAds();
            setAds(res.data || []);
        } catch (err) {
            console.error('Failed to load ads', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (ad) => {
        setCurrentAd({ ...ad });
        setPreviewUrl(getAdImageUrl(ad.image_url));
        setShowUrlInput(!!(ad.image_url && !ad.image_url.startsWith('/uploads/')));
        setUploadSuccess(false);
        setIsEditing(true);
    };

    const handleAddNew = () => {
        const nextPosition = (ads.length + 1).toString();
        setCurrentAd({
            title: '',
            description: '',
            image_url: '',
            target_url: '',
            position: nextPosition,
            start_date: new Date().toISOString().slice(0, 16),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
        });
        setPreviewUrl('');
        setUploadSuccess(false);
        setShowUrlInput(false);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this ad? It will be removed from the dashboard.')) return;
        try {
            await adAPI.deleteAd(id);
            loadAds();
        } catch (err) {
            console.error('Failed to delete ad', err);
            alert('Failed to delete ad.');
        }
    };

    // Handle File Selection and Upload
    const handleFileSelect = async (file) => {
        if (!file) return;

        // Check if file is image
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (PNG, JPG, JPEG, WEBP, GIF)');
            return;
        }

        // Show local preview immediately
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);

        // Upload to server
        const formData = new FormData();
        formData.append('photo', file);

        setUploading(true);
        setUploadSuccess(false);

        try {
            const res = await adAPI.uploadPhoto(formData);
            if (res.data && res.data.imageUrl) {
                const uploadedPath = res.data.imageUrl;
                setCurrentAd(prev => ({
                    ...prev,
                    image_url: uploadedPath
                }));
                setPreviewUrl(getAdImageUrl(uploadedPath));
                setUploadSuccess(true);
            }
        } catch (err) {
            console.error('Failed to upload ad image:', err);
            alert('Failed to upload photo. Please check backend connection.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleRemovePhoto = () => {
        setCurrentAd(prev => ({ ...prev, image_url: '' }));
        setPreviewUrl('');
        setUploadSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentAd.title || !currentAd.title.trim()) {
            alert('Please provide an ad title.');
            return;
        }

        // Only send the DB columns - exclude UI state
        const payload = {
            title: currentAd.title?.trim(),
            description: currentAd.description?.trim() || '',
            image_url: currentAd.image_url || '',
            target_url: currentAd.target_url?.trim() || '',
            position: currentAd.position || '1',
            start_date: currentAd.start_date || null,
            end_date: currentAd.end_date || null,
        };

        try {
            if (currentAd.id) {
                await adAPI.updateAd(currentAd.id, payload);
            } else {
                await adAPI.createAd(payload);
            }
            setIsEditing(false);
            loadAds();
        } catch (err) {
            console.error('Failed to save ad:', err);
            const msg = err?.response?.data?.error || err?.message || 'Unknown error';
            alert('Error saving advertisement: ' + msg);
        }
    };

    if (loading && !ads.length) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-slate-500 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="font-semibold text-sm">Loading Advertisements...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <LayoutTemplate className="w-7 h-7 text-emerald-600" /> Advertisement Manager
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Upload advertisement photos to dynamically display across the dashboard property grid.
                    </p>
                </div>
                {!isEditing && (
                    <button 
                        onClick={handleAddNew}
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer w-fit"
                    >
                        <Plus className="w-4 h-4" /> Upload New Ad
                    </button>
                )}
            </div>

            {/* Editing / Uploading Form */}
            {isEditing ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {currentAd.id ? 'Edit Advertisement' : 'Upload New Advertisement'}
                            </h2>
                            <p className="text-xs text-slate-500">
                                Upload a banner photo and set display position for the dashboard.
                            </p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setIsEditing(false)} 
                            className="p-2 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Left Column: Photo Upload Section */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Ad Photo Upload *
                                    </label>
                                    
                                    {/* Hidden File Input */}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />

                                    {/* Upload Dropzone */}
                                    <div 
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                                            isDragging 
                                                ? 'border-emerald-500 bg-emerald-50/50' 
                                                : previewUrl 
                                                    ? 'border-slate-300 bg-slate-50/70 hover:border-emerald-500' 
                                                    : 'border-slate-300 bg-slate-50 hover:bg-emerald-50/20 hover:border-emerald-500'
                                        }`}
                                    >
                                        {previewUrl ? (
                                            <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-inner group">
                                                <img 
                                                    src={previewUrl} 
                                                    alt="Ad Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <span className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow">
                                                        Change Photo
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
                                                    <UploadCloud className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    Click to choose photo or drag & drop here
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Supports PNG, JPG, JPEG, WEBP or GIF (Max 15MB)
                                                </p>
                                            </div>
                                        )}

                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2">
                                                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                                                <span className="text-xs font-bold text-slate-700">Uploading photo to server...</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Bar below Photo Upload */}
                                    <div className="flex items-center justify-between mt-2 px-1">
                                        <div className="flex items-center gap-2">
                                            {uploadSuccess && (
                                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Photo uploaded & connected!
                                                </span>
                                            )}
                                        </div>
                                        {previewUrl && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemovePhoto();
                                                }}
                                                className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                                            >
                                                Remove Photo
                                            </button>
                                        )}
                                    </div>

                                    {/* Toggle for manual URL option */}
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowUrlInput(!showUrlInput)}
                                            className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                                        >
                                            <LinkIcon className="w-3.5 h-3.5" />
                                            {showUrlInput ? 'Hide manual image URL' : 'Or enter external image URL manually'}
                                        </button>

                                        {showUrlInput && (
                                            <div className="mt-2">
                                                <input 
                                                    type="text" 
                                                    value={currentAd.image_url || ''} 
                                                    onChange={(e) => {
                                                        const url = e.target.value;
                                                        setCurrentAd({...currentAd, image_url: url});
                                                        setPreviewUrl(getAdImageUrl(url));
                                                    }} 
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                                                    placeholder="https://images.unsplash.com/..." 
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Live Preview Card in Admin */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Eye className="w-3.5 h-3.5 text-emerald-600" /> Live Dashboard Preview
                                    </label>
                                    <div className="relative rounded-2xl overflow-hidden min-h-[160px] flex flex-col justify-center text-white border border-slate-200 shadow-xs">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-800"></div>
                                        {previewUrl && (
                                            <img 
                                                src={previewUrl} 
                                                alt="Ad Preview" 
                                                className="absolute inset-0 w-full h-full object-cover opacity-45"
                                            />
                                        )}
                                        <div className="relative z-10 p-5">
                                            <span className="inline-block px-2.5 py-0.5 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md mb-2 border border-white/20">
                                                Advertisement
                                            </span>
                                            <h4 className="text-lg font-black leading-tight drop-shadow-sm truncate">
                                                {currentAd.title || 'Your Ad Title Here'}
                                            </h4>
                                            <p className="text-xs text-emerald-50 line-clamp-1 mt-1">
                                                {currentAd.description || 'Your promotional description will show here...'}
                                            </p>
                                            <div className="mt-3 text-[11px] font-bold bg-white text-slate-900 w-fit px-3 py-1 rounded-lg shadow-sm">
                                                Visit Link
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Ad Details & Settings */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Ad Title *
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={currentAd.title} 
                                        onChange={(e) => setCurrentAd({...currentAd, title: e.target.value})} 
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                                        placeholder="e.g. Exclusive Waterfront Villas" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Subtitle / Description
                                    </label>
                                    <textarea 
                                        rows={3}
                                        value={currentAd.description} 
                                        onChange={(e) => setCurrentAd({...currentAd, description: e.target.value})} 
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                                        placeholder="e.g. Transform your living space with verified luxury listings..." 
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Target URL / Destination Link
                                    </label>
                                    <input 
                                        type="text" 
                                        value={currentAd.target_url || ''} 
                                        onChange={(e) => setCurrentAd({...currentAd, target_url: e.target.value})} 
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                                        placeholder="e.g. /search?type=villa or https://yourpartner.com" 
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Users clicking the ad button on the dashboard will be redirected here.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Display Position on Dashboard *
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={currentAd.position || ''} 
                                        onChange={(e) => setCurrentAd({...currentAd, position: e.target.value})} 
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                                        placeholder="e.g. 1" 
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Position 1 appears after 4 properties, Position 2 after 8 properties, etc.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Start Date
                                        </label>
                                        <input 
                                            type="datetime-local" 
                                            value={currentAd.start_date ? new Date(currentAd.start_date).toISOString().slice(0, 16) : ''} 
                                            onChange={(e) => setCurrentAd({...currentAd, start_date: e.target.value})} 
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            End Date
                                        </label>
                                        <input 
                                            type="datetime-local" 
                                            value={currentAd.end_date ? new Date(currentAd.end_date).toISOString().slice(0, 16) : ''} 
                                            onChange={(e) => setCurrentAd({...currentAd, end_date: e.target.value})} 
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save & Cancel Buttons */}
                        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(false)} 
                                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={uploading}
                                className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow transition-all disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" /> Save Advertisement
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                /* Advertisements Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ads.length === 0 ? (
                        <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
                            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900">No Advertisements Yet</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                                Click the "Upload New Ad" button above to add banner photos that will appear on the dashboard.
                            </p>
                            <button
                                onClick={handleAddNew}
                                className="mt-5 px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 shadow-sm cursor-pointer transition-all inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Upload First Ad
                            </button>
                        </div>
                    ) : (
                        ads.map(ad => {
                            const imgSrc = getAdImageUrl(ad.image_url);
                            return (
                                <div key={ad.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
                                    {/* Ad Banner Image Preview */}
                                    <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 z-10"></div>
                                        {imgSrc ? (
                                            <img 
                                                src={imgSrc} 
                                                alt={ad.title} 
                                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                                                <ImageIcon className="w-8 h-8 opacity-40" />
                                            </div>
                                        )}
                                        <div className="relative z-20 h-full p-5 flex flex-col justify-between text-white">
                                            <div className="flex justify-between items-start">
                                                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                                                    Position #{ad.position}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black leading-tight drop-shadow-sm line-clamp-1">
                                                    {ad.title}
                                                </h3>
                                                {ad.description && (
                                                    <p className="text-xs text-slate-300 line-clamp-1 mt-1 font-medium">
                                                        {ad.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Details & Actions */}
                                    <div className="p-4 flex flex-col justify-between flex-1 bg-white">
                                        <div className="text-xs text-slate-500 space-y-1 mb-4">
                                            <div className="flex items-center gap-1 text-slate-600 truncate">
                                                <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="truncate">{ad.target_url || 'No link attached'}</span>
                                            </div>
                                            {ad.image_url && (
                                                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold truncate">
                                                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">Photo attached</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                            <button 
                                                onClick={() => handleEdit(ad)} 
                                                className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                                title="Edit Advertisement"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(ad.id)} 
                                                className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                                title="Delete Advertisement"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
