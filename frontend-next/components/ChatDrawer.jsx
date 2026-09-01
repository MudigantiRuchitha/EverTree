'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, Mic, Check, CheckCheck } from 'lucide-react';
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
        socket.on('messages_read_receipt', handleReadReceipt);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('message_sent', handleMessageSent);
            socket.off('messages_read_receipt', handleReadReceipt);
        };
    }, [socket, activePartner, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const res = await chatAPI.getConversations();
            setConversations(res.data);
            if (!activePartner && res.data.length > 0) {
                setActivePartner(res.data[0]);
            }
        } catch (err) {
            console.error('Failed to load conversations:', err);
        }
    };

    const loadMessages = async (partnerId) => {
        try {
            const res = await chatAPI.getMessages(partnerId);
            setMessages(res.data);
            if (socket) {
                socket.emit('mark_read', { sender_id: partnerId, receiver_id: user.id });
            }
        } catch (err) {
            console.error('Failed to load message history:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!inputMessage.trim() && !mediaFile) || !activePartner || !user) return;

        const partnerId = activePartner.partner_id || activePartner.id;
        let mediaUrl = null;
        let mediaType = 'text';

        if (mediaFile) {
            const formData = new FormData();
            formData.append('file', mediaFile);
            try {
                const uploadRes = await chatAPI.uploadChatFile(formData);
                mediaUrl = uploadRes.data.file_url;
                mediaType = uploadRes.data.media_type;
            } catch (err) {
                alert('Media upload failed');
                return;
            }
        }

        const msgData = {
            sender_id: user.id,
            receiver_id: partnerId,
            message: inputMessage.trim(),
            media_url: mediaUrl,
            media_type: mediaType
        };

        if (socket) {
            socket.emit('send_message', msgData);
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
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '400px',
            height: '560px',
            maxHeight: '85vh',
            maxWidth: '92vw',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }} className="glass-card">
            
            {/* Header */}
            <div style={{
                padding: '12px 16px',
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {activePartner ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={activePartner.partner_avatar || activePartner.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
                                alt={activePartner.partner_name || activePartner.name}
                                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: isPartnerOnline ? '#10b981' : '#94a3b8',
                                border: '2px solid #ffffff'
                            }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                                {activePartner.partner_name || activePartner.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: isPartnerOnline ? '#059669' : 'var(--text-muted)' }}>
                                {isPartnerOnline ? 'Online' : (activePartner.partner_role || activePartner.role || 'User')}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>Live Chat</div>
                )}

                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={18} />
                </button>
            </div>

            {/* Conversation Bar */}
            {conversations.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', padding: '6px 10px', background: '#f8fafc', overflowX: 'auto', borderBottom: '1px solid #e2e8f0' }}>
                    {conversations.map(conv => (
                        <button
                            key={conv.partner_id}
                            onClick={() => setActivePartner(conv)}
                            style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                border: 'none',
                                cursor: 'pointer',
                                background: (activePartner && (activePartner.partner_id || activePartner.id) === conv.partner_id) ? 'var(--primary-emerald)' : '#e2e8f0',
                                color: (activePartner && (activePartner.partner_id || activePartner.id) === conv.partner_id) ? '#ffffff' : '#0f172a',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {conv.partner_name}
                        </button>
                    ))}
                </div>
            )}

            {/* Messages Thread */}
            <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc' }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        💬 Send a message to start conversation!
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <div
                                key={idx}
                                style={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    background: isMe ? '#059669' : '#ffffff',
                                    color: isMe ? '#ffffff' : '#0f172a',
                                    border: isMe ? 'none' : '1px solid #e2e8f0',
                                    padding: '8px 12px',
                                    borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                                    fontSize: '0.88rem',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                                }}
                            >
                                {msg.media_type === 'image' && msg.media_url && (
                                    <img src={msg.media_url} alt="Chat media" style={{ width: '100%', borderRadius: '6px', marginBottom: '4px' }} />
                                )}
                                {msg.media_type === 'voice' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isMe ? 'rgba(0,0,0,0.15)' : '#f1f5f9', padding: '4px 8px', borderRadius: '12px', marginBottom: '4px' }}>
                                        <Mic size={14} color={isMe ? '#ffffff' : 'var(--accent-gold)'} />
                                        <span>{msg.message || 'Voice Message'}</span>
                                    </div>
                                )}
                                <div>{msg.message}</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', marginTop: '2px' }}>
                                    {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && (
                                        msg.is_read ? <CheckCheck size={12} color="#93c5fd" /> : <Check size={12} />
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
                <div style={{ padding: '6px 10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#15803d' }}>
                    <span>📎 Attachment: {mediaFile.name}</span>
                    <button onClick={() => setMediaFile(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <X size={12} />
                    </button>
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} style={{ padding: '10px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => setMediaFile(e.target.files[0])}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <Paperclip size={16} />
                </button>

                <button
                    type="button"
                    onClick={handleSendVoiceNote}
                    style={{ background: 'transparent', border: 'none', color: isRecordingVoice ? '#ef4444' : 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <Mic size={16} />
                </button>

                <input
                    type="text"
                    className="form-control"
                    placeholder="Type message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem' }}
                />

                <button type="submit" className="btn btn-primary" style={{ padding: '6px 10px' }}>
                    <Send size={14} />
                </button>
            </form>
        </div>
    );
};

export default ChatDrawer;
