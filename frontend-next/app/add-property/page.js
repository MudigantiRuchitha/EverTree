// 'use client';
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { PlusCircle, Upload, FileText, CheckCircle2, ArrowLeft, Building2, MapPin, DollarSign, Home, Image as ImageIcon } from 'lucide-react';
// import { propertyAPI } from '../../services/api';
// import MapPicker from '../../components/MapPicker';
// import { useAuth } from '../../context/AuthContext';

// export default function AddPropertyPage() {
//     const router = useRouter();
//     const { user } = useAuth();

//     const [title, setTitle] = useState('');
//     const [description, setDescription] = useState('');
//     const [category, setCategory] = useState('sell');
//     const [propertyType, setPropertyType] = useState('apartment');
//     const [bhk, setBhk] = useState('2');
//     const [price, setPrice] = useState('');
//     const [city, setCity] = useState('');
//     const [district, setDistrict] = useState('');
//     const [address, setAddress] = useState('');
//     const [latitude, setLatitude] = useState(12.9716);
//     const [longitude, setLongitude] = useState(77.5946);
//     const [selectedAmenities, setSelectedAmenities] = useState(['24/7 Security', 'Power Backup']);
//     const [isFeatured, setIsFeatured] = useState(false);

//     const [photosVideos, setPhotosVideos] = useState([]);
//     const [propertyDocs, setPropertyDocs] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState('');
//     const [subscriptionRequired, setSubscriptionRequired] = useState(false);

//     const availableAmenities = [
//         'Swimming Pool', '24/7 Security', 'Power Backup', 'Gymnasium',
//         'Visitor Parking', 'Clubhouse', 'Rainwater Harvesting', 'Lift / Elevator',
//         'Solar Water Heater', 'CCTV Surveillance', 'Children Play Area'
//     ];

//     const handleAmenityToggle = (amenity) => {
//         if (selectedAmenities.includes(amenity)) {
//             setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
//         } else {
//             setSelectedAmenities([...selectedAmenities, amenity]);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!user || (user.role !== 'seller' && user.role !== 'broker')) {
//             alert('Only registered Sellers and Brokers can post properties.');
//             return;
//         }

//         setLoading(true);
//         setMessage('');

//         try {
//             const formData = new FormData();
//             formData.append('title', title);
//             formData.append('description', description);
//             formData.append('category', category);
//             formData.append('property_type', propertyType);
//             formData.append('bhk', bhk);
//             formData.append('price', price);
//             formData.append('city', city);
//             formData.append('district', district);
//             formData.append('address', address);
//             formData.append('latitude', latitude);
//             formData.append('longitude', longitude);
//             formData.append('amenities', JSON.stringify(selectedAmenities));
//             formData.append('is_featured', isFeatured);

//             for (let i = 0; i < photosVideos.length; i++) {
//                 formData.append('files', photosVideos[i]);
//             }
//             for (let i = 0; i < propertyDocs.length; i++) {
//                 formData.append('files', propertyDocs[i]);
//             }

//             await propertyAPI.createProperty(formData);
//             setMessage('✅ Property listed successfully!');
//             setTimeout(() => {
//                 router.push('/seller-dashboard');
//             }, 1200);
//         } catch (err) {
//             if (err.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
//                 setSubscriptionRequired(true);
//             } else {
//                 setMessage('❌ Failed: ' + (err.response?.data?.error || err.message));
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

//             {subscriptionRequired && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
//                     <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
//                         <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
//                             <Building2 className="h-6 w-6" />
//                         </div>
//                         <h2 className="mt-5 text-2xl font-black text-slate-900">Subscription required</h2>
//                         <p className="mt-2 text-sm leading-6 text-slate-600">
//                             You have reached the free limit of 10 property listings. Subscribe to post additional properties.
//                         </p>
//                         <div className="mt-6 flex flex-wrap gap-3">
//                             <button
//                                 type="button"
//                                 onClick={() => router.push('/seller-dashboard')}
//                                 className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
//                             >
//                                 View my listings
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={() => setSubscriptionRequired(false)}
//                                 className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
            
//             {/* Back Button */}
//             <button 
//                 onClick={() => router.back()} 
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs mb-6 transition-all cursor-pointer"
//             >
//                 <ArrowLeft className="w-4 h-4" /> Back
//             </button>

//             {/* Form Card */}
//             <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-sm">
                
//                 {/* Header */}
//                 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
//                     <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 shrink-0">
//                         <PlusCircle className="w-6 h-6" />
//                     </div>
//                     <div>
//                         <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
//                             Add Property Listing
//                         </h1>
//                         <p className="text-xs sm:text-sm text-slate-500">
//                             Provide property details, upload photos & documents, and pin exact location.
//                         </p>
//                     </div>
//                 </div>

//                 {message && (
//                     <div className={`p-4 rounded-2xl text-sm font-semibold mb-6 ${
//                         message.includes('✅') 
//                             ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
//                             : 'bg-rose-50 border border-rose-200 text-rose-800'
//                     }`}>
//                         {message}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-6">
                    
//                     {/* Basic Info Section */}
//                     <div className="space-y-4">
//                         <div className="space-y-1.5">
//                             <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
//                                 Property Title *
//                             </label>
//                             <input 
//                                 type="text" 
//                                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
//                                 placeholder="e.g. Luxurious 3 BHK Villa in Whitefield" 
//                                 value={title} 
//                                 onChange={(e) => setTitle(e.target.value)} 
//                                 required 
//                             />
//                         </div>

//                         {/* Category, Type, BHK, Price Grid (Mobile: 1 col, Tablet: 2 cols, Laptop: 4 cols) */}
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category *</label>
//                                 <select 
//                                     className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
//                                     value={category} 
//                                     onChange={(e) => setCategory(e.target.value)}
//                                 >
//                                     <option value="buy">Buy</option>
//                                     <option value="sell">Sell</option>
//                                     <option value="rent">Rent</option>
//                                     <option value="commercial">Commercial</option>
//                                     <option value="agricultural">Agricultural Land</option>
//                                 </select>
//                             </div>

//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Type *</label>
//                                 <select 
//                                     className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
//                                     value={propertyType} 
//                                     onChange={(e) => setPropertyType(e.target.value)}
//                                 >
//                                     <option value="apartment">Apartment</option>
//                                     <option value="villa">Villa</option>
//                                     <option value="plot">Plot</option>
//                                     <option value="commercial_office">Commercial Office</option>
//                                     <option value="commercial_shop">Commercial Shop</option>
//                                     <option value="agricultural_land">Agricultural Land</option>
//                                 </select>
//                             </div>

//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">BHK</label>
//                                 <select 
//                                     className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
//                                     value={bhk} 
//                                     onChange={(e) => setBhk(e.target.value)}
//                                 >
//                                     <option value="0">N/A</option>
//                                     <option value="1">1 BHK</option>
//                                     <option value="2">2 BHK</option>
//                                     <option value="3">3 BHK</option>
//                                     <option value="4">4+ BHK</option>
//                                 </select>
//                             </div>

//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Price (₹) *</label>
//                                 <input 
//                                     type="number" 
//                                     className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
//                                     placeholder="8500000" 
//                                     value={price} 
//                                     onChange={(e) => setPrice(e.target.value)} 
//                                     required 
//                                 />
//                             </div>
//                         </div>

//                         {/* Location Fields (City, District, Address) */}
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">City *</label>
//                                 <input 
//                                     type="text" 
//                                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
//                                     placeholder="Bengaluru" 
//                                     value={city} 
//                                     onChange={(e) => setCity(e.target.value)} 
//                                     required 
//                                 />
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">District *</label>
//                                 <input 
//                                     type="text" 
//                                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
//                                     placeholder="Urban Bengaluru" 
//                                     value={district} 
//                                     onChange={(e) => setDistrict(e.target.value)} 
//                                     required 
//                                 />
//                             </div>
//                         </div>

//                         <div className="space-y-1.5">
//                             <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Address</label>
//                             <input 
//                                 type="text" 
//                                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
//                                 placeholder="House / Flat No., Street, Landmark" 
//                                 value={address} 
//                                 onChange={(e) => setAddress(e.target.value)} 
//                             />
//                         </div>

//                         <div className="space-y-1.5">
//                             <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Property Description</label>
//                             <textarea 
//                                 rows={3} 
//                                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500" 
//                                 placeholder="Describe key features, flooring, layout, facing, and nearby landmarks..." 
//                                 value={description} 
//                                 onChange={(e) => setDescription(e.target.value)} 
//                             />
//                         </div>
//                     </div>

//                     {/* Interactive Map Location Pin */}
//                     <div>
//                         <MapPicker 
//                             lat={latitude} 
//                             lng={longitude} 
//                             isEditable={true} 
//                             onChangeLocation={(newLat, newLng) => { setLatitude(newLat); setLongitude(newLng); }} 
//                         />
//                     </div>

//                     {/* File Upload Section (Mobile friendly touch zones) */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/50 transition-colors">
//                             <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase mb-2">
//                                 <Upload className="w-4 h-4 text-emerald-600" /> Upload Photos & Videos
//                             </label>
//                             <input 
//                                 type="file" 
//                                 multiple 
//                                 accept="image/*,video/*" 
//                                 className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" 
//                                 onChange={(e) => setPhotosVideos(Array.from(e.target.files))} 
//                             />
//                             {photosVideos.length > 0 && (
//                                 <p className="text-xs text-emerald-600 font-semibold mt-2">✓ {photosVideos.length} files selected</p>
//                             )}
//                         </div>

//                         <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-500 bg-slate-50/50 transition-colors">
//                             <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase mb-2">
//                                 <FileText className="w-4 h-4 text-amber-600" /> Property Documents (PDF/DOC)
//                             </label>
//                             <input 
//                                 type="file" 
//                                 multiple 
//                                 accept=".pdf,.doc,.docx" 
//                                 className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer" 
//                                 onChange={(e) => setPropertyDocs(Array.from(e.target.files))} 
//                             />
//                             {propertyDocs.length > 0 && (
//                                 <p className="text-xs text-amber-600 font-semibold mt-2">✓ {propertyDocs.length} documents selected</p>
//                             )}
//                         </div>
//                     </div>

//                     {/* Amenities Multi-Selector Grid (Touch friendly chips) */}
//                     <div className="space-y-2">
//                         <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
//                             Amenities & Facilities
//                         </label>
//                         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
//                             {availableAmenities.map(amenity => {
//                                 const selected = selectedAmenities.includes(amenity);
//                                 return (
//                                     <button 
//                                         type="button"
//                                         key={amenity}
//                                         onClick={() => handleAmenityToggle(amenity)}
//                                         className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${
//                                             selected 
//                                                 ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500/20' 
//                                                 : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
//                                         }`}
//                                     >
//                                         <CheckCircle2 className={`w-4 h-4 shrink-0 ${selected ? 'text-emerald-600' : 'text-slate-300'}`} />
//                                         <span className="truncate">{amenity}</span>
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="pt-4 border-t border-slate-100">
//                         <button 
//                             type="submit" 
//                             disabled={loading}
//                             className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 text-base"
//                         >
//                             <PlusCircle className="w-5 h-5" />
//                             {loading ? 'Submitting Property...' : 'Publish Property Listing'}
//                         </button>
//                     </div>

//                 </form>
//             </div>
//         </div>
//     );
// }
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    PlusCircle,
    Upload,
    FileText,
    CheckCircle2,
    ArrowLeft,
    Building2,
    X,
    Crown,
    Check,
    Loader2,
    AlertCircle
} from 'lucide-react';

import {
    propertyAPI,
    subscriptionAPI
} from '../../services/api';

import MapPicker from '../../components/MapPicker';
import { useAuth } from '../../context/AuthContext';


export default function AddPropertyPage() {

    const router = useRouter();
    const { user } = useAuth();


    // =========================================================
    // PROPERTY FORM STATES
    // =========================================================

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

    const [selectedAmenities, setSelectedAmenities] = useState([
        '24/7 Security',
        'Power Backup'
    ]);

    const [isFeatured, setIsFeatured] = useState(false);

    const [photosVideos, setPhotosVideos] = useState([]);
    const [propertyDocs, setPropertyDocs] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');


    // =========================================================
    // SUBSCRIPTION STATES
    // =========================================================

    const [subscriptionRequired, setSubscriptionRequired] =
        useState(false);

    const [showSubscriptionPlans, setShowSubscriptionPlans] =
        useState(false);

    const [subscriptionPlans, setSubscriptionPlans] =
        useState([]);

    const [subscriptionLoading, setSubscriptionLoading] =
        useState(false);

    const [subscriptionError, setSubscriptionError] =
        useState('');


    // =========================================================
    // AVAILABLE AMENITIES
    // =========================================================

    const availableAmenities = [
        'Swimming Pool',
        '24/7 Security',
        'Power Backup',
        'Gymnasium',
        'Visitor Parking',
        'Clubhouse',
        'Rainwater Harvesting',
        'Lift / Elevator',
        'Solar Water Heater',
        'CCTV Surveillance',
        'Children Play Area'
    ];


    // =========================================================
    // AMENITY TOGGLE
    // =========================================================

    const handleAmenityToggle = (amenity) => {

        if (selectedAmenities.includes(amenity)) {

            setSelectedAmenities(
                selectedAmenities.filter(
                    (item) => item !== amenity
                )
            );

        } else {

            setSelectedAmenities([
                ...selectedAmenities,
                amenity
            ]);

        }

    };


    // =========================================================
    // LOAD SUBSCRIPTION PLANS
    // =========================================================

    const loadSubscriptionPlans = async () => {

        setSubscriptionLoading(true);
        setSubscriptionError('');

        try {

            const response =
                await subscriptionAPI.getPlans();

            const plans =
                response?.data?.plans || [];

            setSubscriptionPlans(
                Array.isArray(plans)
                    ? plans
                    : []
            );

        } catch (error) {

            console.error(
                'Failed to load subscription plans:',
                error
            );

            setSubscriptionError(
                error?.response?.data?.message ||
                'Unable to load subscription plans.'
            );

        } finally {

            setSubscriptionLoading(false);

        }

    };


    // =========================================================
    // OPEN SUBSCRIPTION PLANS
    // =========================================================

    const handleOpenSubscriptionPlans = async () => {

        setSubscriptionRequired(false);
        setShowSubscriptionPlans(true);

        await loadSubscriptionPlans();

    };


    // =========================================================
    // CLOSE SUBSCRIPTION PLANS
    // =========================================================

    const handleCloseSubscriptionPlans = () => {

        setShowSubscriptionPlans(false);
        setSubscriptionError('');

    };


    // =========================================================
    // SUBMIT PROPERTY
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // -----------------------------------------------------
        // USER VALIDATION
        // -----------------------------------------------------

        if (
            !user ||
            (
                user.role !== 'seller' &&
                user.role !== 'broker'
            )
        ) {

            alert(
                'Only registered Sellers and Brokers can post properties.'
            );

            return;

        }


        setLoading(true);
        setMessage('');


        try {

            // -------------------------------------------------
            // FORM DATA
            // -------------------------------------------------

            const formData = new FormData();

            formData.append(
                'title',
                title
            );

            formData.append(
                'description',
                description
            );

            formData.append(
                'category',
                category
            );

            formData.append(
                'property_type',
                propertyType
            );

            formData.append(
                'bhk',
                bhk
            );

            formData.append(
                'price',
                price
            );

            formData.append(
                'city',
                city
            );

            formData.append(
                'district',
                district
            );

            formData.append(
                'address',
                address
            );

            formData.append(
                'latitude',
                latitude
            );

            formData.append(
                'longitude',
                longitude
            );

            formData.append(
                'amenities',
                JSON.stringify(
                    selectedAmenities
                )
            );

            formData.append(
                'is_featured',
                isFeatured
            );


            // -------------------------------------------------
            // PHOTOS / VIDEOS
            // -------------------------------------------------

            for (
                let i = 0;
                i < photosVideos.length;
                i++
            ) {

                formData.append(
                    'files',
                    photosVideos[i]
                );

            }


            // -------------------------------------------------
            // DOCUMENTS
            // -------------------------------------------------

            for (
                let i = 0;
                i < propertyDocs.length;
                i++
            ) {

                formData.append(
                    'files',
                    propertyDocs[i]
                );

            }


            // -------------------------------------------------
            // CREATE PROPERTY
            // -------------------------------------------------

            await propertyAPI.createProperty(
                formData
            );


            setMessage(
                '✅ Property listed successfully!'
            );


            setTimeout(() => {

                router.push(
                    '/seller-dashboard'
                );

            }, 1200);


        } catch (err) {

            // -------------------------------------------------
            // SUBSCRIPTION REQUIRED
            // -------------------------------------------------

            if (
                err.response?.data?.code ===
                'SUBSCRIPTION_REQUIRED'
            ) {

                setSubscriptionRequired(
                    true
                );

            } else {

                setMessage(
                    '❌ Failed: ' +
                    (
                        err.response?.data?.error ||
                        err.message
                    )
                );

            }

        } finally {

            setLoading(false);

        }

    };


    return (

        <div
            className="
                max-w-4xl
                mx-auto
                px-4
                sm:px-6
                lg:px-8
                py-8
                sm:py-12
            "
        >


            {/* =====================================================
                SUBSCRIPTION REQUIRED MODAL
            ===================================================== */}

            {subscriptionRequired && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-slate-900/60
                        backdrop-blur-sm
                        p-4
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-md
                            rounded-3xl
                            bg-white
                            p-5
                            sm:p-7
                            shadow-2xl
                        "
                    >

                        {/* ICON */}

                        <div
                            className="
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-2xl
                                bg-amber-100
                                text-amber-700
                            "
                        >

                            <Crown
                                className="h-6 w-6"
                            />

                        </div>


                        {/* TITLE */}

                        <h2
                            className="
                                mt-5
                                text-xl
                                sm:text-2xl
                                font-black
                                text-slate-900
                            "
                        >
                            Subscription required
                        </h2>


                        {/* DESCRIPTION */}

                        <p
                            className="
                                mt-2
                                text-sm
                                leading-6
                                text-slate-600
                            "
                        >
                            Your current property listing
                            limit has been reached. Choose
                            a subscription plan to post
                            additional properties.
                        </p>


                        {/* BUTTONS */}

                        <div
                            className="
                                mt-6
                                flex
                                flex-col
                                sm:flex-row
                                gap-3
                            "
                        >

                            {/* SUBSCRIPTION */}

                            <button
                                type="button"
                                onClick={
                                    handleOpenSubscriptionPlans
                                }
                                className="
                                    w-full
                                    sm:flex-1
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-emerald-600
                                    px-5
                                    py-3
                                    text-sm
                                    font-bold
                                    text-white
                                    hover:bg-emerald-700
                                    transition-colors
                                "
                            >

                                <Crown
                                    className="h-4 w-4"
                                />

                                Subscription

                            </button>


                            {/* CLOSE */}

                            <button
                                type="button"
                                onClick={() =>
                                    setSubscriptionRequired(
                                        false
                                    )
                                }
                                className="
                                    w-full
                                    sm:flex-1
                                    rounded-xl
                                    bg-slate-100
                                    px-5
                                    py-3
                                    text-sm
                                    font-bold
                                    text-slate-700
                                    hover:bg-slate-200
                                    transition-colors
                                "
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                SUBSCRIPTION PLANS MODAL
            ===================================================== */}

            {showSubscriptionPlans && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[60]
                        flex
                        items-center
                        justify-center
                        bg-slate-950/60
                        backdrop-blur-sm
                        p-3
                        sm:p-5
                    "
                >

                    {/* OVERLAY */}

                    <div
                        className="absolute inset-0"
                        onClick={
                            handleCloseSubscriptionPlans
                        }
                    />


                    {/* MODAL */}

                    <div
                        className="
                            relative
                            w-full
                            max-w-6xl
                            max-h-[94vh]
                            overflow-hidden
                            rounded-2xl
                            sm:rounded-3xl
                            bg-white
                            shadow-2xl
                        "
                    >

                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                gap-4
                                border-b
                                border-slate-200
                                p-4
                                sm:p-6
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-amber-50
                                    "
                                >

                                    <Crown
                                        className="
                                            h-5
                                            w-5
                                            text-amber-600
                                        "
                                    />

                                </div>


                                <div>

                                    <h2
                                        className="
                                            text-lg
                                            sm:text-2xl
                                            font-black
                                            text-slate-900
                                        "
                                    >
                                        Subscription Plans
                                    </h2>

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            sm:text-sm
                                            text-slate-500
                                        "
                                    >
                                        Choose a plan to continue
                                        adding properties.
                                    </p>

                                </div>

                            </div>


                            {/* CLOSE */}

                            <button
                                type="button"
                                onClick={
                                    handleCloseSubscriptionPlans
                                }
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    text-slate-500
                                    hover:bg-slate-100
                                    hover:text-slate-900
                                "
                                aria-label="
                                    Close subscription plans
                                "
                            >

                                <X
                                    className="h-5 w-5"
                                />

                            </button>

                        </div>


                        {/* =================================================
                            CONTENT
                        ================================================= */}

                        <div
                            className="
                                max-h-[calc(94vh-90px)]
                                overflow-y-auto
                                p-4
                                sm:p-6
                                lg:p-8
                            "
                        >

                            {/* =================================================
                                LOADING
                            ================================================= */}

                            {subscriptionLoading && (

                                <div
                                    className="
                                        py-16
                                        text-center
                                    "
                                >

                                    <Loader2
                                        className="
                                            mx-auto
                                            h-8
                                            w-8
                                            animate-spin
                                            text-emerald-600
                                        "
                                    />

                                    <p
                                        className="
                                            mt-3
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        Loading subscription
                                        plans...
                                    </p>

                                </div>

                            )}


                            {/* =================================================
                                ERROR
                            ================================================= */}

                            {!subscriptionLoading &&
                                subscriptionError && (

                                    <div
                                        className="
                                            flex
                                            items-start
                                            gap-3
                                            rounded-xl
                                            border
                                            border-red-200
                                            bg-red-50
                                            p-4
                                            text-sm
                                            text-red-700
                                        "
                                    >

                                        <AlertCircle
                                            className="
                                                h-5
                                                w-5
                                                shrink-0
                                            "
                                        />

                                        <div className="flex-1">

                                            {subscriptionError}

                                        </div>


                                        <button
                                            type="button"
                                            onClick={
                                                loadSubscriptionPlans
                                            }
                                            className="
                                                text-xs
                                                font-bold
                                                underline
                                            "
                                        >
                                            Retry
                                        </button>

                                    </div>

                                )}


                            {/* =================================================
                                NO PLANS
                            ================================================= */}

                            {!subscriptionLoading &&
                                !subscriptionError &&
                                subscriptionPlans.length === 0 && (

                                    <div
                                        className="
                                            py-16
                                            text-center
                                        "
                                    >

                                        <Crown
                                            className="
                                                mx-auto
                                                h-10
                                                w-10
                                                text-slate-300
                                            "
                                        />

                                        <p
                                            className="
                                                mt-3
                                                text-sm
                                                text-slate-500
                                            "
                                        >
                                            No subscription plans
                                            are currently available.
                                        </p>

                                    </div>

                                )}


                            {/* =================================================
                                DYNAMIC SUBSCRIPTION PLANS
                            ================================================= */}

                            {!subscriptionLoading &&
                                !subscriptionError &&
                                subscriptionPlans.length > 0 && (

                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            gap-4
                                            sm:grid-cols-2
                                            sm:gap-6
                                            lg:grid-cols-3
                                        "
                                    >

                                        {subscriptionPlans.map(
                                            (plan) => {

                                                const features =
                                                    Array.isArray(
                                                        plan.features
                                                    )
                                                        ? plan.features
                                                        : [];


                                                return (

                                                    <div
                                                        key={plan.id}
                                                        className="
                                                            flex
                                                            flex-col
                                                            rounded-2xl
                                                            border
                                                            border-slate-200
                                                            bg-white
                                                            p-5
                                                            sm:p-6
                                                            transition-all
                                                            hover:-translate-y-1
                                                            hover:shadow-lg
                                                        "
                                                    >

                                                        {/* PLAN NAME */}

                                                        <h3
                                                            className="
                                                                text-xl
                                                                font-black
                                                                text-slate-900
                                                            "
                                                        >
                                                            {plan.name}
                                                        </h3>


                                                        {/* DESCRIPTION */}

                                                        {plan.description && (

                                                            <p
                                                                className="
                                                                    mt-2
                                                                    text-sm
                                                                    leading-6
                                                                    text-slate-500
                                                                "
                                                            >
                                                                {plan.description}
                                                            </p>

                                                        )}


                                                        {/* PRICE */}

                                                        <div
                                                            className="
                                                                mt-5
                                                                flex
                                                                items-baseline
                                                                flex-wrap
                                                            "
                                                        >

                                                            <span
                                                                className="
                                                                    text-3xl
                                                                    sm:text-4xl
                                                                    font-black
                                                                    text-slate-900
                                                                "
                                                            >

                                                                {plan.currency ===
                                                                'INR'
                                                                    ? '₹'
                                                                    : plan.currency}

                                                                {Number(
                                                                    plan.price
                                                                ).toLocaleString(
                                                                    'en-IN'
                                                                )}

                                                            </span>


                                                            <span
                                                                className="
                                                                    ml-1
                                                                    text-sm
                                                                    text-slate-500
                                                                "
                                                            >

                                                                /
                                                                {' '}
                                                                {plan.duration_days}
                                                                {' '}
                                                                days

                                                            </span>

                                                        </div>


                                                        {/* PROPERTY LIMIT */}

                                                        <div
                                                            className="
                                                                mt-5
                                                                rounded-xl
                                                                border
                                                                border-slate-100
                                                                bg-slate-50
                                                                p-4
                                                            "
                                                        >

                                                            <p
                                                                className="
                                                                    text-xs
                                                                    text-slate-500
                                                                "
                                                            >
                                                                Property listing
                                                                limit
                                                            </p>


                                                            <p
                                                                className="
                                                                    mt-1
                                                                    text-lg
                                                                    font-black
                                                                    text-slate-900
                                                                "
                                                            >

                                                                {plan.property_limit}

                                                                {' '}

                                                                properties

                                                            </p>

                                                        </div>


                                                        {/* FEATURES */}

                                                        {features.length > 0 && (

                                                            <ul
                                                                className="
                                                                    mt-5
                                                                    flex-1
                                                                    space-y-3
                                                                "
                                                            >

                                                                {features.map(
                                                                    (
                                                                        feature,
                                                                        index
                                                                    ) => (

                                                                        <li
                                                                            key={
                                                                                `${plan.id}-${index}`
                                                                            }
                                                                            className="
                                                                                flex
                                                                                items-start
                                                                                gap-2
                                                                                text-sm
                                                                                text-slate-600
                                                                            "
                                                                        >

                                                                            <Check
                                                                                className="
                                                                                    mt-0.5
                                                                                    h-4
                                                                                    w-4
                                                                                    shrink-0
                                                                                    text-emerald-600
                                                                                "
                                                                            />

                                                                            <span>

                                                                                {typeof feature ===
                                                                                'string'
                                                                                    ? feature
                                                                                    : feature?.name ||
                                                                                      feature?.title ||
                                                                                      ''}

                                                                            </span>

                                                                        </li>

                                                                    )
                                                                )}

                                                            </ul>

                                                        )}


                                                        {/* SUBSCRIBE BUTTON */}

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                console.log(
                                                                    'Selected subscription plan:',
                                                                    plan.id
                                                                );

                                                            }}
                                                            className="
                                                                mt-6
                                                                w-full
                                                                rounded-xl
                                                                bg-emerald-600
                                                                py-3
                                                                text-sm
                                                                font-bold
                                                                text-white
                                                                hover:bg-emerald-700
                                                                transition-colors
                                                            "
                                                        >

                                                            Subscribe

                                                        </button>

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>

                                )}

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                BACK BUTTON
            ===================================================== */}

            <button
                type="button"
                onClick={() => router.back()}
                className="
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-xl
                    text-sm
                    font-semibold
                    bg-white
                    border
                    border-slate-200
                    text-slate-700
                    hover:bg-slate-100
                    shadow-2xs
                    mb-6
                    transition-all
                    cursor-pointer
                "
            >

                <ArrowLeft
                    className="w-4 h-4"
                />

                Back

            </button>


            {/* =====================================================
                FORM CARD
            ===================================================== */}

            <div
                className="
                    bg-white
                    rounded-3xl
                    border
                    border-slate-200
                    p-5
                    sm:p-8
                    lg:p-10
                    shadow-sm
                "
            >

                {/* HEADER */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        mb-6
                        pb-4
                        border-b
                        border-slate-100
                    "
                >

                    <div
                        className="
                            w-11
                            h-11
                            rounded-2xl
                            bg-gradient-to-br
                            from-emerald-600
                            to-emerald-700
                            flex
                            items-center
                            justify-center
                            text-white
                            shadow-md
                            shadow-emerald-600/25
                            shrink-0
                        "
                    >

                        <PlusCircle
                            className="w-6 h-6"
                        />

                    </div>


                    <div>

                        <h1
                            className="
                                text-xl
                                sm:text-2xl
                                lg:text-3xl
                                font-black
                                text-slate-900
                                tracking-tight
                            "
                        >
                            Add Property Listing
                        </h1>


                        <p
                            className="
                                text-xs
                                sm:text-sm
                                text-slate-500
                            "
                        >
                            Provide property details, upload
                            photos & documents, and pin exact
                            location.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    MESSAGE
                ================================================= */}

                {message && (

                    <div
                        className={`
                            p-4
                            rounded-2xl
                            text-sm
                            font-semibold
                            mb-6
                            ${
                                message.includes('✅')
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                            }
                        `}
                    >

                        {message}

                    </div>

                )}


                {/* =================================================
                    PROPERTY FORM
                ================================================= */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* =================================================
                        BASIC INFO
                    ================================================= */}

                    <div className="space-y-4">

                        {/* PROPERTY TITLE */}

                        <div className="space-y-1.5">

                            <label
                                className="
                                    text-xs
                                    font-bold
                                    text-slate-700
                                    uppercase
                                    tracking-wider
                                "
                            >
                                Property Title *
                            </label>


                            <input
                                type="text"
                                className="
                                    w-full
                                    px-4
                                    py-3
                                    bg-slate-50
                                    border
                                    border-slate-200
                                    rounded-xl
                                    text-sm
                                    text-slate-900
                                    placeholder:text-slate-400
                                    focus:bg-white
                                    focus:outline-hidden
                                    focus:ring-2
                                    focus:ring-emerald-500
                                    focus:border-emerald-500
                                    transition-all
                                "
                                placeholder="
                                    e.g. Luxurious 3 BHK Villa in Whitefield
                                "
                                value={title}
                                onChange={(e) =>
                                    setTitle(
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>


                        {/* CATEGORY / TYPE / BHK / PRICE */}

                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                lg:grid-cols-4
                                gap-4
                            "
                        >

                            {/* CATEGORY */}

                            <div className="space-y-1.5">

                                <label
                                    className="
                                        text-xs
                                        font-bold
                                        text-slate-700
                                        uppercase
                                        tracking-wider
                                    "
                                >
                                    Category *
                                </label>


                                <select
                                    className="
                                        w-full
                                        px-3.5
                                        py-3
                                        bg-slate-50
                                        border
                                        border-slate-200
                                        rounded-xl
                                        text-sm
                                        text-slate-900
                                        focus:bg-white
                                        focus:outline-hidden
                                        focus:ring-2
                                        focus:ring-emerald-500
                                    "
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="buy">
                                        Buy
                                    </option>

                                    <option value="sell">
                                        Sell
                                    </option>

                                    <option value="rent">
                                        Rent
                                    </option>

                                    <option value="commercial">
                                        Commercial
                                    </option>

                                    <option value="agricultural">
                                        Agricultural Land
                                    </option>

                                </select>

                            </div>


                            {/* TYPE */}

                            <div className="space-y-1.5">

                                <label
                                    className="
                                        text-xs
                                        font-bold
                                        text-slate-700
                                        uppercase
                                        tracking-wider
                                    "
                                >
                                    Type *
                                </label>


                                <select
                                    className="
                                        w-full
                                        px-3.5
                                        py-3
                                        bg-slate-50
                                        border
                                        border-slate-200
                                        rounded-xl
                                        text-sm
                                        text-slate-900
                                        focus:bg-white
                                        focus:outline-hidden
                                        focus:ring-2
                                        focus:ring-emerald-500
                                    "
                                    value={propertyType}
                                    onChange={(e) =>
                                        setPropertyType(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="apartment">
                                        Apartment
                                    </option>

                                    <option value="villa">
                                        Villa
                                    </option>

                                    <option value="plot">
                                        Plot
                                    </option>

                                    <option value="commercial_office">
                                        Commercial Office
                                    </option>

                                    <option value="commercial_shop">
                                        Commercial Shop
                                    </option>

                                    <option value="agricultural_land">
                                        Agricultural Land
                                    </option>

                                </select>

                            </div>


                            {/* BHK */}

                            <div className="space-y-1.5">

                                <label
                                    className="
                                        text-xs
                                        font-bold
                                        text-slate-700
                                        uppercase
                                        tracking-wider
                                    "
                                >
                                    BHK
                                </label>


                                <select
                                    className="
                                        w-full
                                        px-3.5
                                        py-3
                                        bg-slate-50
                                        border
                                        border-slate-200
                                        rounded-xl
                                        text-sm
                                        text-slate-900
                                        focus:bg-white
                                        focus:outline-hidden
                                        focus:ring-2
                                        focus:ring-emerald-500
                                    "
                                    value={bhk}
                                    onChange={(e) =>
                                        setBhk(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="0">
                                        N/A
                                    </option>

                                    <option value="1">
                                        1 BHK
                                    </option>

                                    <option value="2">
                                        2 BHK
                                    </option>

                                    <option value="3">
                                        3 BHK
                                    </option>

                                    <option value="4">
                                        4+ BHK
                                    </option>

                                </select>

                            </div>


                            {/* PRICE */}

                            <div className="space-y-1.5">

                                <label
                                    className="
                                        text-xs
                                        font-bold
                                        text-slate-700
                                        uppercase
                                        tracking-wider
                                    "
                                >
                                    Price (₹) *
                                </label>


                                <input
                                    type="number"
                                    className="
                                        w-full
                                        px-3.5
                                        py-3
                                        bg-slate-50
                                        border
                                        border-slate-200
                                        rounded-xl
                                        text-sm
                                        text-slate-900
                                        placeholder:text-slate-400
                                        focus:bg-white
                                        focus:outline-hidden
                                        focus:ring-2
                                        focus:ring-emerald-500
                                    "
                                    placeholder="8500000"
                                    value={price}
                                    onChange={(e) =>
                                        setPrice(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* LOCATION */}

                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                gap-4
                            "
                        >

                            {/* CITY */}

                            <div className="space-y-1.5">

                                <label
                                    className="
                                        text-xs
                                        font-bold
                                        text-slate-700
                                        uppercase
                                        tracking-wider
                                    "
                                >
                                    City *
                                </label>


                                <input
                                    type="text"
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        bg-slate-50
                                        border
                                        border-slate-200
                                        rounded-xl
                                        text-sm
                                        text-slate-900
                                        placeholder:text-slate-400
                                        focus:bg-white
                                        focus:outline-hidden
                                        focus:ring-2
                                        focus:ring-emerald-500
                                    "
                                    placeholder="Bengaluru"
                                    value={city}
                                    onChange={(e) =>
                                        setCity(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            {/* DISTRICT */}

                            <div className="space-y-1.5">

                                <label
                                    className="
                                        text-xs
                                        font-bold
                                        text-slate-700
                                        uppercase
                                        tracking-wider
                                    "
                                >
                                    District *
                                </label>


                                <input
                                    type="text"
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        bg-slate-50
                                        border
                                        border-slate-200
                                        rounded-xl
                                        text-sm
                                        text-slate-900
                                        placeholder:text-slate-400
                                        focus:bg-white
                                        focus:outline-hidden
                                        focus:ring-2
                                        focus:ring-emerald-500
                                    "
                                    placeholder="Urban Bengaluru"
                                    value={district}
                                    onChange={(e) =>
                                        setDistrict(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* ADDRESS */}

                        <div className="space-y-1.5">

                            <label
                                className="
                                    text-xs
                                    font-bold
                                    text-slate-700
                                    uppercase
                                    tracking-wider
                                "
                            >
                                Full Address
                            </label>


                            <input
                                type="text"
                                className="
                                    w-full
                                    px-4
                                    py-3
                                    bg-slate-50
                                    border
                                    border-slate-200
                                    rounded-xl
                                    text-sm
                                    text-slate-900
                                    placeholder:text-slate-400
                                    focus:bg-white
                                    focus:outline-hidden
                                    focus:ring-2
                                    focus:ring-emerald-500
                                "
                                placeholder="
                                    House / Flat No., Street, Landmark
                                "
                                value={address}
                                onChange={(e) =>
                                    setAddress(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        {/* DESCRIPTION */}

                        <div className="space-y-1.5">

                            <label
                                className="
                                    text-xs
                                    font-bold
                                    text-slate-700
                                    uppercase
                                    tracking-wider
                                "
                            >
                                Property Description
                            </label>


                            <textarea
                                rows={3}
                                className="
                                    w-full
                                    px-4
                                    py-3
                                    bg-slate-50
                                    border
                                    border-slate-200
                                    rounded-xl
                                    text-sm
                                    text-slate-900
                                    placeholder:text-slate-400
                                    focus:bg-white
                                    focus:outline-hidden
                                    focus:ring-2
                                    focus:ring-emerald-500
                                "
                                placeholder="
                                    Describe key features, flooring,
                                    layout, facing, and nearby landmarks...
                                "
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    {/* =================================================
                        MAP
                    ================================================= */}

                    <div>

                        <MapPicker
                            lat={latitude}
                            lng={longitude}
                            isEditable={true}
                            onChangeLocation={(
                                newLat,
                                newLng
                            ) => {

                                setLatitude(
                                    newLat
                                );

                                setLongitude(
                                    newLng
                                );

                            }}
                        />

                    </div>


                    {/* =================================================
                        FILE UPLOAD
                    ================================================= */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            gap-4
                        "
                    >

                        {/* PHOTOS / VIDEOS */}

                        <div
                            className="
                                p-4
                                rounded-2xl
                                border-2
                                border-dashed
                                border-slate-200
                                hover:border-emerald-500
                                bg-slate-50/50
                                transition-colors
                            "
                        >

                            <label
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-xs
                                    font-bold
                                    text-slate-800
                                    uppercase
                                    mb-2
                                "
                            >

                                <Upload
                                    className="
                                        w-4
                                        h-4
                                        text-emerald-600
                                    "
                                />

                                Upload Photos & Videos

                            </label>

                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                className="
                                    w-full
                                    text-xs
                                    text-slate-600
                                    file:mr-3
                                    file:py-2
                                    file:px-4
                                    file:rounded-xl
                                    file:border-0
                                    file:text-xs
                                    file:font-semibold
                                    file:bg-emerald-50
                                    file:text-emerald-700
                                    hover:file:bg-emerald-100
                                    cursor-pointer
                                "
                                onChange={(e) => {
                                    const newFiles = Array.from(e.target.files);
                                    setPhotosVideos(prev => [...prev, ...newFiles]);
                                    // Reset input so the same files can be selected again if removed
                                    e.target.value = '';
                                }}
                            />

                            {/* PREVIEW GALLERY */}
                            {photosVideos.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs text-emerald-600 font-semibold mb-3">
                                        ✓ {photosVideos.length} files selected
                                    </p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {photosVideos.map((file, idx) => (
                                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white aspect-square">
                                                {file.type.startsWith('video/') ? (
                                                    <video
                                                        src={URL.createObjectURL(file)}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt="preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPhotosVideos(prev => prev.filter((_, i) => i !== idx));
                                                    }}
                                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>


                        {/* DOCUMENTS */}

                        <div
                            className="
                                p-4
                                rounded-2xl
                                border-2
                                border-dashed
                                border-slate-200
                                hover:border-amber-500
                                bg-slate-50/50
                                transition-colors
                            "
                        >

                            <label
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-xs
                                    font-bold
                                    text-slate-800
                                    uppercase
                                    mb-2
                                "
                            >

                                <FileText
                                    className="
                                        w-4
                                        h-4
                                        text-amber-600
                                    "
                                />

                                Property Documents (PDF/DOC)

                            </label>


                            <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx"
                                className="
                                    w-full
                                    text-xs
                                    text-slate-600
                                    file:mr-3
                                    file:py-2
                                    file:px-4
                                    file:rounded-xl
                                    file:border-0
                                    file:text-xs
                                    file:font-semibold
                                    file:bg-amber-50
                                    file:text-amber-700
                                    hover:file:bg-amber-100
                                    cursor-pointer
                                "
                                onChange={(e) =>
                                    setPropertyDocs(
                                        Array.from(
                                            e.target.files
                                        )
                                    )
                                }
                            />


                            {propertyDocs.length > 0 && (

                                <p
                                    className="
                                        text-xs
                                        text-amber-600
                                        font-semibold
                                        mt-2
                                    "
                                >
                                    ✓ {propertyDocs.length}
                                    {' '}
                                    documents selected
                                </p>

                            )}

                        </div>

                    </div>


                    {/* =================================================
                        AMENITIES
                    ================================================= */}

                    <div className="space-y-2">

                        <label
                            className="
                                text-xs
                                font-bold
                                text-slate-700
                                uppercase
                                tracking-wider
                                block
                            "
                        >
                            Amenities & Facilities
                        </label>


                        <div
                            className="
                                grid
                                grid-cols-2
                                sm:grid-cols-3
                                lg:grid-cols-4
                                gap-2.5
                            "
                        >

                            {availableAmenities.map(
                                (amenity) => {

                                    const selected =
                                        selectedAmenities.includes(
                                            amenity
                                        );


                                    return (

                                        <button
                                            type="button"
                                            key={amenity}
                                            onClick={() =>
                                                handleAmenityToggle(
                                                    amenity
                                                )
                                            }
                                            className={`
                                                flex
                                                items-center
                                                gap-2
                                                p-2.5
                                                rounded-xl
                                                text-xs
                                                font-semibold
                                                border
                                                transition-all
                                                cursor-pointer
                                                text-left

                                                ${
                                                    selected
                                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500/20'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                }
                                            `}
                                        >

                                            <CheckCircle2
                                                className={`
                                                    w-4
                                                    h-4
                                                    shrink-0

                                                    ${
                                                        selected
                                                            ? 'text-emerald-600'
                                                            : 'text-slate-300'
                                                    }
                                                `}
                                            />


                                            <span className="truncate">
                                                {amenity}
                                            </span>

                                        </button>

                                    );

                                }
                            )}

                        </div>

                    </div>


                    {/* =================================================
                        SUBMIT
                    ================================================= */}

                    <div
                        className="
                            pt-4
                            border-t
                            border-slate-100
                        "
                    >

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                w-full
                                py-3.5
                                px-6
                                rounded-2xl
                                font-bold
                                text-white
                                bg-emerald-600
                                hover:bg-emerald-700
                                shadow-lg
                                shadow-emerald-600/25
                                hover:shadow-xl
                                transition-all
                                hover:-translate-y-0.5
                                cursor-pointer
                                disabled:opacity-60
                                flex
                                items-center
                                justify-center
                                gap-2
                                text-base
                            "
                        >

                            <PlusCircle
                                className="w-5 h-5"
                            />

                            {loading
                                ? 'Submitting Property...'
                                : 'Publish Property Listing'}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}