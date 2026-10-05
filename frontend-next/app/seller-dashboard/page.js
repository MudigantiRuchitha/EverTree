// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import Link from 'next/link';
// import {
//     Building2,
//     Users,
//     MessageSquare,
//     Bell,
//     PlusCircle,
//     ArrowRight,
//     RefreshCw,
//     Clock3,
//     UserPlus,
//     X
// } from 'lucide-react';
// import { propertyAPI, serviceAPI } from '../../services/api';
// import { useAuth } from '../../context/AuthContext';
// import { useSocket } from '../../context/SocketContext';
// import PropertyCard from '../../components/PropertyCard';

// export default function SellerDashboard() {
//     const { user } = useAuth();
//     const { socket } = useSocket();
//     const [myListings, setMyListings] = useState([]);
//     const [enquiries, setEnquiries] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
//     const [brokerMessage, setBrokerMessage] = useState("");
//     const [isSubmittingBroker, setIsSubmittingBroker] = useState(false);
//     const [brokerSuccessMessage, setBrokerSuccessMessage] = useState("");

//     // Notification state
//     const [notifications, setNotifications] = useState([]);
//     const [showNotifications, setShowNotifications] = useState(false);
//     const notifRef = useRef(null);

//     // Listen for incoming socket messages and turn them into notifications
//     useEffect(() => {
//         if (!socket) return;

//         const handleReceiveMessage = (msg) => {
//             setNotifications(prev => [{
//                 id: msg.id || Date.now(),
//                 sender_name: msg.sender_name || 'Someone',
//                 message: msg.message || '📎 Attachment',
//                 time: new Date(),
//                 sender_id: msg.sender_id
//             }, ...prev.slice(0, 19)]); // keep max 20
//         };

//         socket.on('receive_message', handleReceiveMessage);
//         return () => socket.off('receive_message', handleReceiveMessage);
//     }, [socket]);

//     // Close dropdown when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (e) => {
//             if (notifRef.current && !notifRef.current.contains(e.target)) {
//                 setShowNotifications(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const unreadCount = notifications.length;

//     const clearNotifications = () => setNotifications([]);

//     const formatNotifTime = (date) => {
//         if (!date) return '';
//         const d = new Date(date);
//         const now = new Date();
//         const diffMs = now - d;
//         const diffMin = Math.floor(diffMs / 60000);
//         if (diffMin < 1) return 'just now';
//         if (diffMin < 60) return `${diffMin}m ago`;
//         return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     };

//     const handleBrokerSubmit = async (e) => {
//         e.preventDefault();
//         if (!brokerMessage.trim()) return;

//         setIsSubmittingBroker(true);
//         try {
//             await serviceAPI.submitLead({
//                 service_type: 'broker',
//                 details: { message: brokerMessage }
//             });
//             setBrokerSuccessMessage('Broker request submitted successfully!');
//             setTimeout(() => {
//                 setIsBrokerModalOpen(false);
//                 setBrokerSuccessMessage('');
//                 setBrokerMessage('');
//             }, 2000);
//         } catch (err) {
//             console.error('Failed to submit broker request:', err);
//             alert('Failed to submit broker request. Please try again.');
//         } finally {
//             setIsSubmittingBroker(false);
//         }
//     };

//     const loadSellerData = async () => {
//         if (!user) return;
//         setLoading(true);
//         try {
//             const isSellerOrBroker = user?.role === 'seller' || user?.role === 'broker';
//             const [listingsRes, enquiriesRes] = await Promise.all([
//                 isSellerOrBroker ? propertyAPI.getMyListings().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
//                 propertyAPI.getEnquiries().catch(() => ({ data: [] }))
//             ]);
//             setMyListings(Array.isArray(listingsRes.data) ? listingsRes.data : []);
//             setEnquiries(Array.isArray(enquiriesRes.data) ? enquiriesRes.data : []);
//         } catch (err) {
//             console.error('Failed to load seller dashboard data:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadSellerData();
//     }, [user]);

//     const formatDate = (date) => {
//         if (!date) return 'Recently';
//         const parsed = new Date(date);
//         if (isNaN(parsed.getTime())) return 'Recently';
//         return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(parsed);
//     };

//     return (
//         <main className="min-h-screen bg-slate-50">

//             {/* HEADER */}
//             <section className="bg-white border-b border-slate-200">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                     <div>
//                         <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
//                             SELLER PORTAL
//                         </p>
//                         <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
//                             Welcome back, {user?.name || 'Seller'} 👋
//                         </h1>
//                         <p className="mt-1 text-xs sm:text-sm text-slate-500">
//                             Manage your property listings and stay connected with interested buyers.
//                         </p>
//                     </div>

//                     <div className="flex items-center gap-3">
//                         <button
//                             type="button"
//                             onClick={loadSellerData}
//                             disabled={loading}
//                             className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
//                             title="Refresh"
//                         >
//                             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//                         </button>

//                         {/* Notification Bell */}
//                         <div className="relative" ref={notifRef}>
//                             <button
//                                 type="button"
//                                 onClick={() => setShowNotifications(v => !v)}
//                                 className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
//                                 title="Notifications"
//                             >
//                                 <Bell className="w-4 h-4" />
//                                 {unreadCount > 0 && (
//                                     <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
//                                         {unreadCount > 9 ? '9+' : unreadCount}
//                                     </span>
//                                 )}
//                             </button>

//                             {/* Dropdown */}
//                             {showNotifications && (
//                                 <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
//                                     {/* Header */}
//                                     <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
//                                         <span className="text-sm font-black text-slate-900">Notifications</span>
//                                         <div className="flex items-center gap-2">
//                                             {notifications.length > 0 && (
//                                                 <button
//                                                     onClick={clearNotifications}
//                                                     className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
//                                                 >
//                                                     Clear all
//                                                 </button>
//                                             )}
//                                             <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-slate-200 rounded-lg">
//                                                 <X className="w-3.5 h-3.5 text-slate-500" />
//                                             </button>
//                                         </div>
//                                     </div>

//                                     {/* List */}
//                                     <div className="max-h-80 overflow-y-auto">
//                                         {notifications.length === 0 ? (
//                                             <div className="flex flex-col items-center justify-center py-10 text-center px-4">
//                                                 <Bell className="w-8 h-8 text-slate-200 mb-2" />
//                                                 <p className="text-sm font-semibold text-slate-500">No new notifications</p>
//                                                 <p className="text-xs text-slate-400 mt-1">New chat messages will appear here.</p>
//                                             </div>
//                                         ) : (
//                                             notifications.map((notif, i) => (
//                                                 <Link
//                                                     key={notif.id || i}
//                                                     href={`/messages?userId=${notif.sender_id}&name=${encodeURIComponent(notif.sender_name)}`}
//                                                     onClick={() => setShowNotifications(false)}
//                                                     className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 transition-colors"
//                                                 >
//                                                     {/* Avatar */}
//                                                     <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 font-bold text-emerald-700 text-sm">
//                                                         {notif.sender_name.charAt(0).toUpperCase()}
//                                                     </div>
//                                                     {/* Content */}
//                                                     <div className="flex-1 min-w-0">
//                                                         <p className="text-xs font-bold text-slate-900 truncate">{notif.sender_name}</p>
//                                                         <p className="text-xs text-slate-500 truncate mt-0.5">{notif.message}</p>
//                                                     </div>
//                                                     {/* Time */}
//                                                     <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{formatNotifTime(notif.time)}</span>
//                                                 </Link>
//                                             ))
//                                         )}
//                                     </div>

//                                     {/* Footer */}
//                                     {notifications.length > 0 && (
//                                         <Link
//                                             href="/messages"
//                                             onClick={() => setShowNotifications(false)}
//                                             className="block text-center py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 border-t border-slate-100 transition-colors"
//                                         >
//                                             Open Messages →
//                                         </Link>
//                                     )}
//                                 </div>
//                             )}
//                         </div>

//                         <button
//                             onClick={() => setIsBrokerModalOpen(true)}
//                             className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors"
//                         >
//                             <UserPlus className="w-4 h-4" /> Connect as Broker Request
//                         </button>
//                         <Link
//                             href="/add-property"
//                             className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-sm"
//                         >
//                             <PlusCircle className="w-4 h-4" /> Post Property
//                         </Link>
//                     </div>
//                 </div>
//             </section>

//             {/* DASHBOARD CONTENT */}
//             <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

//                 {/* STATS */}
//                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
//                     <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
//                         <Building2 className="w-6 h-6 text-emerald-600 mb-3" />
//                         <p className="text-xs font-bold text-slate-500 uppercase">My Listings</p>
//                         <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
//                             {myListings.length}
//                         </h2>
//                         <p className="mt-0.5 text-xs text-slate-400">10 free listings</p>
//                     </div>

//                     <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
//                         <Users className="w-6 h-6 text-blue-600 mb-3" />
//                         <p className="text-xs font-bold text-slate-500 uppercase">Buyer Enquiries</p>
//                         <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
//                             {enquiries.length}
//                         </h2>
//                         <p className="mt-0.5 text-xs text-slate-400">Received requests</p>
//                     </div>

//                     <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
//                         <MessageSquare className="w-6 h-6 text-purple-600 mb-3" />
//                         <p className="text-xs font-bold text-slate-500 uppercase">Account Status</p>
//                         <h2 className="mt-1 text-lg sm:text-xl font-black text-slate-900 capitalize">
//                             {(user?.approval_status || 'Approved').replace(/_/g, ' ')}
//                         </h2>
//                         <p className="mt-0.5 text-xs text-slate-400">Verification status</p>
//                     </div>

//                     <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
//                         <Bell className="w-6 h-6 text-amber-600 mb-3" />
//                         <p className="text-xs font-bold text-slate-500 uppercase">Verification ID</p>
//                         <h2 className="mt-1 text-sm font-bold text-slate-900 truncate">
//                             {user?.verification_id || 'Active Seller'}
//                         </h2>
//                         <p className="mt-0.5 text-xs text-emerald-600 font-semibold">Verified Partner</p>
//                     </div>
//                 </div>

//                 {/* MY LISTINGS SECTION */}
//                 <div className="space-y-4">
//                     <div className="flex items-center justify-between pb-3 border-b border-slate-200">
//                         <div>
//                             <h2 className="text-xl font-black text-slate-900 tracking-tight">My Active Properties</h2>
//                             <p className="text-xs text-slate-500">Properties you have listed on Evertree.</p>
//                         </div>
//                         <Link href="/my-listing" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
//                             View All ({myListings.length}) <ArrowRight className="w-3.5 h-3.5" />
//                         </Link>
//                     </div>

//                     {loading ? (
//                         <div className="text-center py-12 text-slate-400 text-sm">Loading listings...</div>
//                     ) : myListings.length === 0 ? (
//                         <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto shadow-xs">
//                             <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
//                             <h3 className="font-bold text-slate-900">No properties listed yet</h3>
//                             <p className="text-xs text-slate-500 mt-1 mb-4">Post your first property to connect with buyers.</p>
//                             <Link href="/add-property" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
//                                 <PlusCircle className="w-4 h-4" /> Post Property Now
//                             </Link>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
//                             {myListings.slice(0, 4).map(property => (
//                                 <PropertyCard key={property.id} property={property} />
//                             ))}
//                         </div>
//                     )}
//                 </div>

//                 {/* RECENT BUYER REQUESTS SECTION */}
//                 <div className="space-y-4">
//                     <div className="flex items-center justify-between pb-3 border-b border-slate-200">
//                         <div>
//                             <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Buyer Enquiries</h2>
//                             <p className="text-xs text-slate-500">Buyers interested in your properties.</p>
//                         </div>
//                         {enquiries.length > 0 && (
//                             <Link href="/buyer-requests" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
//                                 View all <ArrowRight className="w-3.5 h-3.5" />
//                             </Link>
//                         )}
//                     </div>

//                     {enquiries.length === 0 ? (
//                         <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
//                             <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
//                             <p className="font-bold text-slate-700">No buyer requests yet</p>
//                             <p className="text-xs text-slate-400 mt-0.5">Enquiries submitted by buyers will appear here automatically.</p>
//                         </div>
//                     ) : (
//                         <div className="grid gap-3">
//                             {enquiries.map(enquiry => (
//                                 <div key={enquiry.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                                     <div>
//                                         <h3 className="font-bold text-slate-900 text-sm">{enquiry.property_title || 'Property enquiry'}</h3>
//                                         <p className="text-xs text-slate-500 mt-1">From: <span className="font-bold text-slate-700">{enquiry.buyer_name || 'Interested Buyer'}</span> ({enquiry.buyer_phone || enquiry.buyer_email || 'Contact provided'})</p>
//                                         <p className="text-xs text-slate-600 mt-1.5 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">"{enquiry.message}"</p>
//                                     </div>
//                                     <div className="shrink-0 flex sm:flex-col items-end justify-between gap-2">
//                                         <span className="text-xs text-slate-400 flex items-center gap-1"><Clock3 className="w-3 h-3" />{formatDate(enquiry.created_at)}</span>
//                                         <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold capitalize">{enquiry.status || 'pending'}</span>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>

//             </section>
            
//             {/* BROKER MODAL */}
//             {isBrokerModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//                     <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
//                         <h3 className="text-xl font-black text-slate-900 mb-2">Request a Broker</h3>
//                         <p className="text-sm text-slate-500 mb-6">Need help managing or selling your properties? Connect with a professional broker.</p>
                        
//                         {brokerSuccessMessage ? (
//                             <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl mb-4 text-center font-medium">
//                                 {brokerSuccessMessage}
//                             </div>
//                         ) : (
//                             <form onSubmit={handleBrokerSubmit}>
//                                 <div className="mb-4">
//                                     <label className="block text-sm font-bold text-slate-700 mb-2">How can a broker help you?</label>
//                                     <textarea
//                                         required
//                                         value={brokerMessage}
//                                         onChange={(e) => setBrokerMessage(e.target.value)}
//                                         rows="4"
//                                         className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
//                                         placeholder="Describe what kind of assistance you need..."
//                                     />
//                                 </div>
//                                 <div className="flex items-center justify-end gap-3 mt-6">
//                                     <button
//                                         type="button"
//                                         onClick={() => setIsBrokerModalOpen(false)}
//                                         className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-sm transition-colors"
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button
//                                         type="submit"
//                                         disabled={isSubmittingBroker}
//                                         className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm shadow-sm transition-colors disabled:opacity-50 inline-flex items-center gap-2"
//                                     >
//                                         {isSubmittingBroker && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
//                                         Submit Request
//                                     </button>
//                                 </div>
//                             </form>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </main>
//     );
// }
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    Building2,
    Users,
    MessageSquare,
    Bell,
    PlusCircle,
    ArrowRight,
    RefreshCw,
    Clock3,
    UserPlus,
    X
} from 'lucide-react';

import { propertyAPI, serviceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import PropertyCard from '../../components/PropertyCard';
import AnimatedAdsBanner from '../../components/AnimatedAdsBanner';
import TopAdTicker from '../../components/TopAdTicker';
import InGridAdCard from '../../components/InGridAdCard';
import SpotlightAdCard from '../../components/SpotlightAdCard';

export default function SellerDashboard() {
    const { user, loading: authLoading } = useAuth();
    const { socket } = useSocket();

    const [myListings, setMyListings] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Delete property state
    const [deletingId, setDeletingId] = useState(null);

    // Broker modal state
    const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
    const [brokerMessage, setBrokerMessage] = useState('');
    const [isSubmittingBroker, setIsSubmittingBroker] = useState(false);
    const [brokerSuccessMessage, setBrokerSuccessMessage] = useState('');

    // Notification state
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);

    // =====================================================
    // SOCKET NOTIFICATIONS
    // =====================================================

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (msg) => {
            setNotifications((prev) => [
                {
                    id: msg.id || Date.now(),
                    sender_name: msg.sender_name || 'Someone',
                    message: msg.message || '📎 Attachment',
                    time: new Date(),
                    sender_id: msg.sender_id
                },
                ...prev.slice(0, 19)
            ]);
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket]);

    // =====================================================
    // CLOSE NOTIFICATION DROPDOWN
    // =====================================================

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                notifRef.current &&
                !notifRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
        };
    }, []);

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    const unreadCount = notifications.length;

    const clearNotifications = () => {
        setNotifications([]);
    };

    const formatNotifTime = (date) => {
        if (!date) return '';

        const d = new Date(date);
        const now = new Date();

        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);

        if (diffMin < 1) {
            return 'just now';
        }

        if (diffMin < 60) {
            return `${diffMin}m ago`;
        }

        return d.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // =====================================================
    // BROKER REQUEST
    // =====================================================

    const handleBrokerSubmit = async (e) => {
        e.preventDefault();

        if (!brokerMessage.trim()) return;

        setIsSubmittingBroker(true);

        try {
            await serviceAPI.submitLead({
                service_type: 'broker',
                details: {
                    message: brokerMessage
                }
            });

            setBrokerSuccessMessage(
                'Broker request submitted successfully!'
            );

            setTimeout(() => {
                setIsBrokerModalOpen(false);
                setBrokerSuccessMessage('');
                setBrokerMessage('');
            }, 2000);

        } catch (err) {
            console.error(
                'Failed to submit broker request:',
                err
            );

            alert(
                'Failed to submit broker request. Please try again.'
            );

        } finally {
            setIsSubmittingBroker(false);
        }
    };

    // =====================================================
    // LOAD SELLER DATA
    // =====================================================

    const loadSellerData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const [
                listingsRes,
                enquiriesRes
            ] = await Promise.all([
                propertyAPI
                    .getMyListings()
                    .catch(() => ({ data: [] })),

                propertyAPI
                    .getEnquiries()
                    .catch(() => ({ data: [] }))
            ]);

            setMyListings(
                Array.isArray(listingsRes?.data)
                    ? listingsRes.data
                    : []
            );

            setEnquiries(
                Array.isArray(enquiriesRes?.data)
                    ? enquiriesRes.data
                    : []
            );

        } catch (err) {
            console.error(
                'Failed to load seller dashboard data:',
                err
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOAD DATA WHEN USER CHANGES
    // =====================================================

    useEffect(() => {
        if (user) {
            loadSellerData();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    // =====================================================
    // DELETE PROPERTY
    // =====================================================

    const handleDeleteProperty = async (propertyId) => {
        if (!propertyId) return;

        const confirmed = window.confirm(
            'Are you sure you want to delete this property? This action cannot be undone.'
        );

        if (!confirmed) return;

        try {
            setDeletingId(propertyId);

            await propertyAPI.deleteProperty(propertyId);

            setMyListings((currentListings) =>
                currentListings.filter(
                    (property) =>
                        Number(property.id) !==
                        Number(propertyId)
                )
            );

        } catch (error) {
            console.error(
                'Delete property error:',
                error
            );

            alert(
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                'Failed to delete property. Please try again.'
            );

        } finally {
            setDeletingId(null);
        }
    };

    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (date) => {
        if (!date) return 'Recently';

        const parsed = new Date(date);

        if (isNaN(parsed.getTime())) {
            return 'Recently';
        }

        return new Intl.DateTimeFormat(
            undefined,
            {
                day: 'numeric',
                month: 'short'
            }
        ).format(parsed);
    };

    // =====================================================
    // UI
    // =====================================================

    if (authLoading) {
        return (
            <main className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-slate-500">Loading your account...</p>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                            <Building2 className="w-7 h-7" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                            Sign in to view your Seller Dashboard
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 leading-6">
                            Your active property listings, buyer enquiries, and sales analytics are available after you sign in.
                        </p>
                        <Link
                            href="/"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 mt-6 px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                        >
                            Return to Home / Sign In
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="bg-white border-b border-slate-200">
                <TopAdTicker />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    <div>

                        <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
                            SELLER PORTAL
                        </p>

                        <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Welcome back, {user?.name || 'Seller'} 👋
                        </h1>

                        <p className="mt-1 text-xs sm:text-sm text-slate-500">
                            Manage your property listings and stay connected with interested buyers.
                        </p>

                    </div>

                    <div className="flex items-center gap-3">

                        {/* Refresh */}

                        <button
                            type="button"
                            onClick={loadSellerData}
                            disabled={loading}
                            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${
                                    loading
                                        ? 'animate-spin'
                                        : ''
                                }`}
                            />
                        </button>

                        {/* Notifications */}

                        <div
                            className="relative"
                            ref={notifRef}
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setShowNotifications(
                                        (v) => !v
                                    )
                                }
                                className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                                title="Notifications"
                            >

                                <Bell className="w-4 h-4" />

                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                        {unreadCount > 9
                                            ? '9+'
                                            : unreadCount}
                                    </span>
                                )}

                            </button>

                            {/* Notification Dropdown */}

                            {showNotifications && (

                                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">

                                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">

                                        <span className="text-sm font-black text-slate-900">
                                            Notifications
                                        </span>

                                        <div className="flex items-center gap-2">

                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={
                                                        clearNotifications
                                                    }
                                                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                                                >
                                                    Clear all
                                                </button>
                                            )}

                                            <button
                                                onClick={() =>
                                                    setShowNotifications(
                                                        false
                                                    )
                                                }
                                                className="p-1 hover:bg-slate-200 rounded-lg"
                                            >
                                                <X className="w-3.5 h-3.5 text-slate-500" />
                                            </button>

                                        </div>

                                    </div>

                                    <div className="max-h-80 overflow-y-auto">

                                        {notifications.length === 0 ? (

                                            <div className="flex flex-col items-center justify-center py-10 text-center px-4">

                                                <Bell className="w-8 h-8 text-slate-200 mb-2" />

                                                <p className="text-sm font-semibold text-slate-500">
                                                    No new notifications
                                                </p>

                                                <p className="text-xs text-slate-400 mt-1">
                                                    New chat messages will appear here.
                                                </p>

                                            </div>

                                        ) : (

                                            notifications.map(
                                                (notif, i) => (

                                                    <Link
                                                        key={
                                                            notif.id ||
                                                            i
                                                        }
                                                        href={`/messages?userId=${notif.sender_id}&name=${encodeURIComponent(
                                                            notif.sender_name
                                                        )}`}
                                                        onClick={() =>
                                                            setShowNotifications(
                                                                false
                                                            )
                                                        }
                                                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 transition-colors"
                                                    >

                                                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 font-bold text-emerald-700 text-sm">
                                                            {notif.sender_name
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="flex-1 min-w-0">

                                                            <p className="text-xs font-bold text-slate-900 truncate">
                                                                {
                                                                    notif.sender_name
                                                                }
                                                            </p>

                                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                                {
                                                                    notif.message
                                                                }
                                                            </p>

                                                        </div>

                                                        <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">
                                                            {formatNotifTime(
                                                                notif.time
                                                            )}
                                                        </span>

                                                    </Link>

                                                )
                                            )

                                        )}

                                    </div>

                                    {notifications.length > 0 && (

                                        <Link
                                            href="/messages"
                                            onClick={() =>
                                                setShowNotifications(
                                                    false
                                                )
                                            }
                                            className="block text-center py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 border-t border-slate-100 transition-colors"
                                        >
                                            Open Messages →
                                        </Link>

                                    )}

                                </div>

                            )}

                        </div>

                        {/* Broker Request */}

                        <button
                            onClick={() =>
                                setIsBrokerModalOpen(true)
                            }
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors"
                        >
                            <UserPlus className="w-4 h-4" />
                            Connect as Broker Request
                        </button>

                        {/* Add Property */}

                        <Link
                            href="/add-property"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-sm"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Post Property
                        </Link>

                    </div>

                </div>

            </section>


            {/* =================================================
                DASHBOARD CONTENT
            ================================================= */}

            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

                {/* =================================================
                    STATS
                ================================================= */}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

                    {/* My Listings */}

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">

                        <Building2 className="w-6 h-6 text-emerald-600 mb-3" />

                        <p className="text-xs font-bold text-slate-500 uppercase">
                            My Listings
                        </p>

                        <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
                            {myListings.length}
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                            10 free listings
                        </p>

                    </div>


                    {/* Buyer Enquiries */}

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">

                        <Users className="w-6 h-6 text-blue-600 mb-3" />

                        <p className="text-xs font-bold text-slate-500 uppercase">
                            Buyer Enquiries
                        </p>

                        <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
                            {enquiries.length}
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Received requests
                        </p>

                    </div>


                    {/* Account Status */}

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">

                        <MessageSquare className="w-6 h-6 text-purple-600 mb-3" />

                        <p className="text-xs font-bold text-slate-500 uppercase">
                            Account Status
                        </p>

                        <h2 className="mt-1 text-lg sm:text-xl font-black text-slate-900 capitalize">
                            {(user?.approval_status ||
                                'Approved').replace(
                                /_/g,
                                ' '
                            )}
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                            Verification status
                        </p>

                    </div>


                    {/* Verification ID */}

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">

                        <Bell className="w-6 h-6 text-amber-600 mb-3" />

                        <p className="text-xs font-bold text-slate-500 uppercase">
                            Verification ID
                        </p>

                        <h2 className="mt-1 text-sm font-bold text-slate-900 truncate">
                            {user?.verification_id ||
                                'Active Seller'}
                        </h2>

                        <p className="mt-0.5 text-xs text-emerald-600 font-semibold">
                            Verified Partner
                        </p>

                    </div>

                </div>

                {/* Animated Featured Partner Spotlight */}
                <div className="my-8">
                    <SpotlightAdCard />
                </div>

                {/* =================================================
                    MY LISTINGS
                ================================================= */}

                <div className="space-y-4">

                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">

                        <div>

                            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                My Active Properties
                            </h2>

                            <p className="text-xs text-slate-500">
                                Properties you have listed on Evertree.
                            </p>

                        </div>

                        <Link
                            href="/my-listing"
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                        >
                            View All ({myListings.length})
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                    </div>


                    {loading ? (

                        <div className="text-center py-12 text-slate-400 text-sm">
                            Loading listings...
                        </div>

                    ) : myListings.length === 0 ? (

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
                                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <h3 className="font-bold text-slate-900">
                                    No properties listed yet
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 mb-4">
                                    Post your first property to connect with buyers.
                                </p>
                                <Link
                                    href="/add-property"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Post Property Now
                                </Link>
                            </div>
                            <InGridAdCard slotIndex={1} />
                        </div>

                    ) : (

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

                            {myListings
                                .slice(0, 3)
                                .map((property) => (

                                    <div
                                        key={property.id}
                                        className="space-y-2"
                                    >

                                        <PropertyCard
                                            property={property}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteProperty(
                                                    property.id
                                                )
                                            }
                                            disabled={
                                                deletingId ===
                                                property.id
                                            }
                                            className="w-full px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                                        >
                                            {deletingId ===
                                            property.id
                                                ? 'Deleting...'
                                                : 'Delete Property'}
                                        </button>

                                    </div>

                                ))}

                            {/* In-Grid Sponsored Partner Ad Card */}
                            <InGridAdCard slotIndex={1} />

                        </div>

                    )}

                </div>


                {/* =================================================
                    BUYER ENQUIRIES
                ================================================= */}

                <div className="space-y-4 mt-16">

    {/* Section Header */}

    <div className="flex items-center justify-between pb-3 border-b border-slate-200">

        <div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Buyer Enquiries
            </h2>

            <p className="text-xs text-slate-500">
                Enquiries received from buyers interested in your properties.
            </p>

        </div>

        {enquiries.length > 0 && (

            <Link
                href="/buyer-requests"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>

        )}

    </div>

                    {/* No enquiries */}

                    {enquiries.length === 0 ? (

                        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">

                            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />

                            <h3 className="font-bold text-slate-700">
                                No buyer enquiries yet
                            </h3>

                            <p className="text-xs text-slate-400 mt-1">
                                Enquiries submitted by buyers will appear here automatically.
                            </p>

                        </div>

                    ) : (

                        /* Buyer enquiry list */

                        <div className="grid gap-4">

                            {enquiries.map((enquiry) => (

                                <div
                                    key={enquiry.id}
                                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-sm transition-shadow"
                                >

                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                                        {/* Buyer information */}

                                        <div className="flex-1 min-w-0">

                                            <div className="flex items-start gap-3">

                                                {/* Buyer avatar */}

                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">

                                                    {(enquiry.buyer_name ||
                                                        'B')
                                                        .charAt(0)
                                                        .toUpperCase()}

                                                </div>


                                                {/* Buyer details */}

                                                <div className="min-w-0">

                                                    <h3 className="font-bold text-slate-900 text-sm">
                                                        {enquiry.buyer_name ||
                                                            'Interested Buyer'}
                                                    </h3>

                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {enquiry.buyer_phone ||
                                                            enquiry.buyer_email ||
                                                            'Contact details not provided'}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* Property */}

                                            <div className="mt-4">

                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                    Property
                                                </p>

                                                <p className="text-sm font-bold text-slate-800 mt-1">
                                                    {enquiry.property_title ||
                                                        'Property enquiry'}
                                                </p>

                                            </div>


                                            {/* Message */}

                                            {enquiry.message && (

                                                <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">

                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                                        Message
                                                    </p>

                                                    <p className="text-xs text-slate-600">
                                                        "{enquiry.message}"
                                                    </p>

                                                </div>

                                            )}

                                        </div>


                                        {/* Status */}

                                        <div className="lg:w-40 shrink-0 flex lg:flex-col lg:items-end justify-between lg:justify-center gap-2">

                                            {/* Date */}

                                            <span className="text-xs text-slate-400 flex items-center gap-1">

                                                <Clock3 className="w-3.5 h-3.5" />

                                                {formatDate(
                                                    enquiry.created_at
                                                )}

                                            </span>


                                            {/* Status */}

                                            <span className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold capitalize">

                                                {enquiry.status ||
                                                    'pending'}

                                            </span>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                    {/* Bottom Partner Privileges Showcase */}
                    <div className="mt-10">
                        <AnimatedAdsBanner variant="dashboard" />
                    </div>

                </div>

            </section>


            {/* =================================================
                BROKER MODAL
            ================================================= */}

            {isBrokerModalOpen && (

                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">

                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">

                        <h3 className="text-xl font-black text-slate-900 mb-2">
                            Request a Broker
                        </h3>

                        <p className="text-sm text-slate-500 mb-6">
                            Need help managing or selling your properties? Connect with a professional broker.
                        </p>


                        {brokerSuccessMessage ? (

                            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl mb-4 text-center font-medium">
                                {brokerSuccessMessage}
                            </div>

                        ) : (

                            <form onSubmit={handleBrokerSubmit}>

                                <div className="mb-4">

                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        How can a broker help you?
                                    </label>

                                    <textarea
                                        required
                                        value={brokerMessage}
                                        onChange={(e) =>
                                            setBrokerMessage(
                                                e.target.value
                                            )
                                        }
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                                        placeholder="Describe what kind of assistance you need..."
                                    />

                                </div>


                                <div className="flex items-center justify-end gap-3 mt-6">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsBrokerModalOpen(
                                                false
                                            )
                                        }
                                        className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        disabled={
                                            isSubmittingBroker
                                        }
                                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm shadow-sm transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                    >

                                        {isSubmittingBroker && (

                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />

                                        )}

                                        Submit Request

                                    </button>

                                </div>

                            </form>

                        )}

                    </div>

                </div>

            )}

        </main>
    );
}