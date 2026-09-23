'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, MessageSquare, Clock3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatAPI } from '../../services/api';

export default function NotificationsPage() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        // 1. Fetch unread conversations to use as initial notifications
        const loadUnreadChats = async () => {
            try {
                const res = await chatAPI.getConversations();
                const convs = Array.isArray(res.data) ? res.data : (res.data?.conversations || []);
                
                // Filter ones that are unread
                const unread = convs.filter(c => !c.is_read);
                
                const notifs = unread.map(c => ({
                    id: c.id,
                    type: 'chat',
                    sender_id: c.partner_id || c.id,
                    sender_name: c.partner_name || 'User',
                    message: c.last_message || 'New message',
                    time: new Date(c.created_at)
                }));
                
                setNotifications(notifs);
            } catch (err) {
                console.error("Failed to load chats for notifications", err);
            } finally {
                setLoading(false);
            }
        };
        
        loadUnreadChats();
    }, [user]);

    // 2. Listen for real-time socket messages
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (msg) => {
            setNotifications(prev => {
                const newNotif = {
                    id: msg.id || Date.now(),
                    type: 'chat',
                    sender_id: msg.sender_id,
                    sender_name: msg.sender_name || 'Someone',
                    message: msg.message || '📎 Attachment',
                    time: new Date()
                };
                return [newNotif, ...prev];
            });
        };

        socket.on('receive_message', handleReceiveMessage);
        return () => socket.off('receive_message', handleReceiveMessage);
    }, [socket]);

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d)) return '';
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
                <Bell className="w-16 h-16 text-slate-200 mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Sign in to view notifications</h2>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
                        <p className="text-sm text-slate-500">Stay updated on your chats and property activities.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
                        <p className="text-sm text-slate-500 mt-1">You have no new notifications right now.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {notifications.map((notif, idx) => (
                                <Link
                                    key={notif.id || idx}
                                    href={`/messages?userId=${notif.sender_id}&name=${encodeURIComponent(notif.sender_name)}`}
                                    className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 group-hover:scale-105 transition-transform">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-bold text-slate-900">
                                                New message from {notif.sender_name}
                                            </p>
                                            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                                                <Clock3 className="w-3.5 h-3.5" />
                                                {formatTime(notif.time)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                            "{notif.message}"
                                        </p>
                                        <p className="text-xs font-bold text-emerald-600 mt-2">
                                            Reply in Chat →
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}