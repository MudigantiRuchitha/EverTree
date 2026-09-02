'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Mic, Check, CheckCheck, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatAPI } from '../services/api';

const ChatDrawer = ({ isOpen, onClose, targetPartner }) => {
    const { user } = useAuth();
    const { socket, onlineUsers } = useSocket();

    const [conversations, setConversations] = useState([]);
    const [activePartner, setActivePartner] = useState(targetPartner || null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (targetPartner) {
            setActivePartner(targetPartner);
        }
        if (user && isOpen) {
            loadConversations();
        }
    }, [isOpen, targetPartner, user]);

    useEffect(() => {
        if (activePartner && user) {
            loadMessages(activePartner.partner_id || activePartner.id);
        }
    }, [activePartner, user]);

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (msg) => {
            if (activePartner && (msg.sender_id === (activePartner.partner_id || activePartner.id))) {
                setMessages(prev => [...prev, msg]);
                socket.emit('mark_read', { sender_id: msg.sender_id, receiver_id: user.id });
            }
            loadConversations();
        };

        const handleMessageSent = (msg) => {
            if (activePartner && (msg.receiver_id === (activePartner.partner_id || activePartner.id))) {
                setMessages(prev => [...prev, msg]);
            }
            loadConversations();
        };

        const handleReadReceipt = ({ readerId }) => {
            if (activePartner && (activePartner.partner_id || activePartner.id) === readerId) {
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const res = await chatAPI.getConversations();
            setConversations(res.data.conversations || []);
            if (!activePartner && res.data.conversations?.length > 0) {
                setActivePartner(res.data.conversations[0]);
            }
        } catch (err) {
            console.error('Error loading conversations:', err);
        }
    };

    const loadMessages = async (partnerId) => {
        try {
            const res = await chatAPI.getMessages(partnerId);
            setMessages(res.data.messages || []);
            if (socket && user) {
                socket.emit('mark_read', { sender_id: partnerId, receiver_id: user.id });
            }
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!inputMessage.trim() && !mediaFile) || !activePartner || !user) return;

        let mediaUrl = null;
        let mediaType = 'text';

        if (mediaFile) {
            try {
                const formData = new FormData();
                formData.append('file', mediaFile);
                const uploadRes = await chatAPI.uploadMedia(formData);
                mediaUrl = uploadRes.data.url;
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

    const handleSendVoiceNote = () => {
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

    if (!isOpen) return null;

    const currentPartnerId = activePartner ? (activePartner.partner_id || activePartner.id) : null;
    const isPartnerOnline = currentPartnerId && onlineUsers.has(Number(currentPartnerId));

    return (
        <div className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-96 md:w-[420px] h-[580px] max-h-[90vh] sm:max-h-[85vh] z-50 flex flex-col bg-white sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            
            {/* Header */}
            <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                {activePartner ? (
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <img
                                src={activePartner.partner_avatar || activePartner.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                                alt={activePartner.partner_name || activePartner.name}
                                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${isPartnerOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-900 leading-tight">
                                {activePartner.partner_name || activePartner.name}
                            </div>
                            <div className="text-[11px] font-semibold text-emerald-600">
                                {isPartnerOnline ? 'Online' : (activePartner.partner_role || activePartner.role || 'User')}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <MessageSquare className="w-4 h-4 text-emerald-600" /> Live Chat
                    </div>
                )}

                <button 
                    onClick={onClose}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Conversation Switcher Tabs */}
            {conversations.length > 1 && (
                <div className="flex gap-1.5 px-3 py-2 bg-slate-50 overflow-x-auto border-b border-slate-200 scrollbar-none shrink-0">
                    {conversations.map(conv => (
                        <button
                            key={conv.partner_id}
                            onClick={() => setActivePartner(conv)}
                            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                (activePartner && (activePartner.partner_id || activePartner.id) === conv.partner_id)
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            {conv.partner_name}
                        </button>
                    ))}
                </div>
            )}

            {/* Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5 bg-slate-50/80">
                {messages.length === 0 ? (
                    <div className="text-center my-auto text-slate-400 text-xs sm:text-sm">
                        💬 Send a message to start conversation!
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <div
                                key={idx}
                                className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm shadow-xs ${
                                    isMe
                                        ? 'self-end bg-emerald-600 text-white rounded-br-xs'
                                        : 'self-start bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs'
                                }`}
                            >
                                {msg.media_type === 'image' && msg.media_url && (
                                    <img src={msg.media_url} alt="Chat media" className="w-full rounded-lg mb-1.5" />
                                )}
                                {msg.media_type === 'voice' && (
                                    <div className={`flex items-center gap-1.5 p-1.5 rounded-lg mb-1 text-xs ${isMe ? 'bg-black/15' : 'bg-slate-100 text-slate-800'}`}>
                                        <Mic className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{msg.message || 'Voice Message'}</span>
                                    </div>
                                )}
                                <div className="leading-relaxed break-words">{msg.message}</div>
                                <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${isMe ? 'text-white/80' : 'text-slate-400'}`}>
                                    <span>{new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isMe && (
                                        msg.is_read ? <CheckCheck className="w-3 h-3 text-blue-200" /> : <Check className="w-3 h-3" />
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Media Upload Preview */}
            {mediaFile && (
                <div className="px-3 py-1.5 bg-emerald-100/80 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-900 shrink-0">
                    <span className="truncate">📎 Attachment: {mediaFile.name}</span>
                    <button onClick={() => setMediaFile(null)} className="p-1 text-rose-600 hover:bg-emerald-200 rounded-full cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5 shrink-0">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => setMediaFile(e.target.files[0])}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Attach File"
                >
                    <Paperclip className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={handleSendVoiceNote}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${isRecordingVoice ? 'text-rose-600 bg-rose-50 animate-pulse' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                    title="Voice Note"
                >
                    <Mic className="w-4 h-4" />
                </button>

                <input
                    type="text"
                    placeholder="Type message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                />

                <button 
                    type="submit" 
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all hover:scale-105 cursor-pointer"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default ChatDrawer;
