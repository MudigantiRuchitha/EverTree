'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Send,
    Paperclip,
    Mic,
    Check,
    CheckCheck,
    MessageSquare,
    Search,
    X,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatAPI } from '../../services/api';

export default function MessagesPage() {
    const { user } = useAuth();
    const { socket, onlineUsers } = useSocket();
    const searchParams = useSearchParams();

    const [conversations, setConversations] = useState([]);
    const [activePartner, setActivePartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [convSearch, setConvSearch] = useState('');
    const [showMobileChat, setShowMobileChat] = useState(false);

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // ─── Load conversations ────────────────────────────────────────
    const loadConversations = useCallback(async () => {
        if (!user) return;
        setLoadingConvs(true);
        try {
            const res = await chatAPI.getConversations();
            const convList = Array.isArray(res.data)
                ? res.data
                : (res.data?.conversations || []);
            setConversations(convList);
            return convList;
        } catch (err) {
            console.error('Error loading conversations:', err);
            return [];
        } finally {
            setLoadingConvs(false);
        }
    }, [user]);

    // ─── Load messages for active partner ─────────────────────────
    const loadMessages = useCallback(async (partnerId) => {
        if (!partnerId || !user) return;
        setLoadingMsgs(true);
        try {
            const res = await chatAPI.getMessages(partnerId);
            const msgList = Array.isArray(res.data)
                ? res.data
                : (res.data?.messages || []);
            setMessages(msgList);
            if (socket && user) {
                socket.emit('mark_read', { sender_id: partnerId, receiver_id: user.id });
            }
        } catch (err) {
            console.error('Error loading messages:', err);
        } finally {
            setLoadingMsgs(false);
        }
    }, [user, socket]);

    // ─── Initial load ─────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        loadConversations().then((convList) => {
            const userId = searchParams?.get('userId');
            const userName = searchParams?.get('name');

            if (userId) {
                // Try to find existing conversation with this user
                const existing = (convList || []).find(
                    c => String(c.partner_id || c.id) === String(userId)
                );
                if (existing) {
                    setActivePartner(existing);
                } else {
                    // Create a synthetic partner entry so we can start chatting
                    const syntheticPartner = {
                        partner_id: Number(userId),
                        partner_name: userName || 'User',
                        partner_avatar: null,
                        last_message: 'New conversation',
                        unread_count: 0
                    };
                    setActivePartner(syntheticPartner);
                    // Prepend to sidebar so user sees them listed
                    setConversations(prev => {
                        const alreadyIn = prev.some(c => String(c.partner_id || c.id) === String(userId));
                        return alreadyIn ? prev : [syntheticPartner, ...prev];
                    });
                }
                setShowMobileChat(true);
            } else if (convList && convList.length > 0 && !activePartner) {
                setActivePartner(convList[0]);
                setShowMobileChat(true);
            }
        });
    }, [user]);

    // ─── Load messages when active partner changes ─────────────────
    useEffect(() => {
        if (activePartner) {
            loadMessages(activePartner.partner_id || activePartner.id);
        }
    }, [activePartner]);

    // ─── Socket real-time events ───────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (msg) => {
            if (activePartner &&
                msg.sender_id === (activePartner.partner_id || activePartner.id)) {
                setMessages(prev => [...prev, msg]);
                socket.emit('mark_read', {
                    sender_id: msg.sender_id,
                    receiver_id: user.id
                });
            }
            loadConversations();
        };

        const handleMessageSent = (msg) => {
            if (activePartner &&
                msg.receiver_id === (activePartner.partner_id || activePartner.id)) {
                setMessages(prev => [...prev, msg]);
            }
            loadConversations();
        };

        const handleReadReceipt = ({ readerId }) => {
            if (activePartner &&
                (activePartner.partner_id || activePartner.id) === readerId) {
                setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('message_sent', handleMessageSent);
        socket.on('messages_read', handleReadReceipt);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('message_sent', handleMessageSent);
            socket.off('messages_read', handleReadReceipt);
        };
    }, [socket, activePartner, user]);

    // ─── Scroll to bottom on new messages ─────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ─── Send message ──────────────────────────────────────────────
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!inputMessage.trim() && !mediaFile) || !activePartner || !user) return;

        let mediaUrl = null;
        let mediaType = 'text';

        if (mediaFile) {
            try {
                const formData = new FormData();
                formData.append('file', mediaFile);
                const uploadRes = await chatAPI.uploadChatFile(formData);
                mediaUrl = uploadRes.data.file_url || uploadRes.data.url;
                mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'voice';
            } catch (err) {
                console.error('Media upload failed:', err);
            }
        }

        const payload = {
            sender_id: user.id,
            receiver_id: activePartner.partner_id || activePartner.id,
            message: inputMessage,
            media_url: mediaUrl,
            media_type: mediaType
        };

        if (socket) {
            socket.emit('send_message', payload);
        }

        setInputMessage('');
        setMediaFile(null);
    };

    const handleVoiceNote = () => {
        setIsRecordingVoice(true);
        setTimeout(() => {
            setIsRecordingVoice(false);
            if (socket && activePartner && user) {
                socket.emit('send_message', {
                    sender_id: user.id,
                    receiver_id: activePartner.partner_id || activePartner.id,
                    message: '🎙️ Voice Note (0:08)',
                    media_url: null,
                    media_type: 'voice'
                });
            }
        }, 1200);
    };

    const selectPartner = (conv) => {
        setActivePartner(conv);
        setShowMobileChat(true);
    };

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d)) return '';
        const now = new Date();
        const diffDays = Math.floor((now - d) / 86400000);
        if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Yesterday';
        return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    };

    const filteredConversations = conversations.filter(c =>
        c.partner_name?.toLowerCase().includes(convSearch.toLowerCase())
    );

    const currentPartnerId = activePartner
        ? (activePartner.partner_id || activePartner.id)
        : null;
    const isPartnerOnline = currentPartnerId && onlineUsers?.has(Number(currentPartnerId));

    // ─── Not logged in ─────────────────────────────────────────────
    if (!user) {
        return (
            <main className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-xl font-black text-slate-900">Sign in to view messages</h1>
                    <p className="mt-2 text-sm text-slate-500">Your conversations with sellers and buyers will appear here.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="h-[calc(100vh-80px)] flex bg-slate-50">

            {/* ═══════════════════════════════════════════════════
                SIDEBAR — Conversations list
            ═══════════════════════════════════════════════════ */}
            <aside className={`
                w-full sm:w-80 lg:w-96 flex flex-col border-r border-slate-200 bg-white shrink-0
                ${showMobileChat ? 'hidden sm:flex' : 'flex'}
            `}>

                {/* Sidebar header */}
                <div className="px-4 pt-5 pb-3 border-b border-slate-100">
                    <h1 className="text-xl font-black text-slate-900 mb-3">Messages</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={convSearch}
                            onChange={(e) => setConvSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                        />
                        {convSearch && (
                            <button
                                type="button"
                                onClick={() => setConvSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Conversations list */}
                <div className="flex-1 overflow-y-auto">
                    {loadingConvs ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                                <MessageSquare className="w-7 h-7 text-emerald-600" />
                            </div>
                            <p className="text-sm font-bold text-slate-700">No conversations yet</p>
                            <p className="text-xs text-slate-500 mt-1">
                                Start chatting with a seller by clicking the Chat button on any property.
                            </p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const convPartnerId = conv.partner_id || conv.id;
                            const isOnline = onlineUsers?.has(Number(convPartnerId));
                            const isActive = activePartner &&
                                (activePartner.partner_id || activePartner.id) === convPartnerId;

                            return (
                                <button
                                    key={convPartnerId}
                                    type="button"
                                    onClick={() => selectPartner(conv)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-slate-50 ${
                                        isActive
                                            ? 'bg-emerald-50 border-l-2 border-l-emerald-500'
                                            : 'hover:bg-slate-50'
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-11 h-11 rounded-full bg-emerald-100 overflow-hidden ring-1 ring-slate-200">
                                            {conv.partner_avatar ? (
                                                <img
                                                    src={conv.partner_avatar}
                                                    alt={conv.partner_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-emerald-700 text-base">
                                                    {(conv.partner_name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                                            isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-bold text-slate-900 truncate">
                                                {conv.partner_name || 'User'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 shrink-0">
                                                {formatTime(conv.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-0.5">
                                            <p className="text-xs text-slate-500 truncate">
                                                {conv.last_message
                                                    ? (conv.media_type === 'image' ? '📷 Image' :
                                                       conv.media_type === 'voice' ? '🎙️ Voice note' :
                                                       conv.last_message)
                                                    : 'Start a conversation'}
                                            </p>
                                            {!conv.is_read && !isActive && (
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* ═══════════════════════════════════════════════════
                MAIN CHAT PANEL
            ═══════════════════════════════════════════════════ */}
            <section className={`
                flex-1 flex flex-col min-w-0
                ${!showMobileChat ? 'hidden sm:flex' : 'flex'}
            `}>

                {activePartner ? (
                    <>
                        {/* Chat header */}
                        <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0 shadow-sm">

                            {/* Mobile back button */}
                            <button
                                type="button"
                                onClick={() => setShowMobileChat(false)}
                                className="sm:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Partner avatar */}
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 overflow-hidden ring-1 ring-slate-200">
                                    {activePartner.partner_avatar || activePartner.avatar_url ? (
                                        <img
                                            src={activePartner.partner_avatar || activePartner.avatar_url}
                                            alt={activePartner.partner_name || activePartner.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-emerald-700">
                                            {((activePartner.partner_name || activePartner.name) || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                                    isPartnerOnline ? 'bg-emerald-500' : 'bg-slate-300'
                                }`} />
                            </div>

                            {/* Partner info */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-900 truncate">
                                    {activePartner.partner_name || activePartner.name || 'User'}
                                </div>
                                <div className={`text-xs font-semibold ${
                                    isPartnerOnline ? 'text-emerald-600' : 'text-slate-400'
                                }`}>
                                    {isPartnerOnline ? 'Online' : (activePartner.partner_role || activePartner.role || 'Offline')}
                                </div>
                            </div>
                        </div>

                        {/* Messages area */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-2.5 bg-slate-50">
                            {loadingMsgs ? (
                                <div className="m-auto flex items-center gap-2 text-slate-400 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading messages...
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="m-auto text-center">
                                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                                        <MessageSquare className="w-7 h-7 text-emerald-500" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600">No messages yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Say hello to get the conversation started!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div
                                            key={msg.id || idx}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm shadow-xs ${
                                                isMe
                                                    ? 'bg-emerald-600 text-white rounded-br-sm'
                                                    : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-sm'
                                            }`}>
                                                {/* Image attachment */}
                                                {msg.media_type === 'image' && msg.media_url && (
                                                    <img
                                                        src={msg.media_url.startsWith('/') ? `http://localhost:5000${msg.media_url}` : msg.media_url}
                                                        alt="Attachment"
                                                        className="w-full rounded-lg mb-2 max-h-60 object-cover"
                                                    />
                                                )}
                                                {/* Voice note */}
                                                {msg.media_type === 'voice' && (
                                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg mb-1 text-xs ${
                                                        isMe ? 'bg-black/15' : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        <Mic className="w-3.5 h-3.5 text-amber-500" />
                                                        <span>{msg.message || 'Voice Message'}</span>
                                                    </div>
                                                )}
                                                {/* Text */}
                                                {msg.message && msg.media_type !== 'voice' && (
                                                    <p className="leading-relaxed break-words">{msg.message}</p>
                                                )}
                                                {/* Timestamp + read receipt */}
                                                <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                                                    isMe ? 'text-white/70' : 'text-slate-400'
                                                }`}>
                                                    <span>{formatTime(msg.created_at)}</span>
                                                    {isMe && (
                                                        msg.is_read
                                                            ? <CheckCheck className="w-3 h-3 text-blue-200" />
                                                            : <Check className="w-3 h-3" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* File upload preview */}
                        {mediaFile && (
                            <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-800 shrink-0">
                                <span className="truncate">📎 {mediaFile.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setMediaFile(null)}
                                    className="ml-2 p-1 text-rose-500 hover:bg-emerald-100 rounded-full"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Input bar */}
                        <form
                            onSubmit={handleSendMessage}
                            className="px-4 py-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={(e) => setMediaFile(e.target.files[0])}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                title="Attach file"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleVoiceNote}
                                className={`p-2 rounded-xl transition-colors ${
                                    isRecordingVoice
                                        ? 'text-rose-600 bg-rose-50 animate-pulse'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                }`}
                                title="Voice note"
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                            <button
                                type="submit"
                                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm hover:scale-105 transition-all"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </>
                ) : (
                    /* Empty state when no conversation selected */
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
                            <MessageSquare className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">Your Inbox</h2>
                        <p className="mt-2 text-sm text-slate-500 max-w-sm">
                            Select a conversation on the left to read and reply to messages from sellers and buyers.
                        </p>
                        {conversations.length === 0 && !loadingConvs && (
                            <p className="mt-4 text-xs text-slate-400">
                                No conversations yet — start a chat from any property listing.
                            </p>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}