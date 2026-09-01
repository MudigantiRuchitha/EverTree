'use client';
import React, { createContext, useContext, useState } from 'react';
import ChatDrawer from '../components/ChatDrawer';

const ChatContext = createContext({
    openChat: () => {},
    closeChat: () => {},
    isChatOpen: false
});

export const ChatProvider = ({ children }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatPartner, setChatPartner] = useState(null);

    const openChat = (partnerOrProperty) => {
        if (partnerOrProperty) {
            if (partnerOrProperty.seller_id) {
                setChatPartner({
                    id: partnerOrProperty.seller_id,
                    name: partnerOrProperty.seller_name || 'Seller',
                    avatar_url: partnerOrProperty.seller_avatar
                });
            } else {
                setChatPartner(partnerOrProperty);
            }
        }
        setIsChatOpen(true);
    };

    const closeChat = () => setIsChatOpen(false);

    return (
        <ChatContext.Provider value={{ openChat, closeChat, isChatOpen }}>
            {children}
            <ChatDrawer
                isOpen={isChatOpen}
                onClose={closeChat}
                targetPartner={chatPartner}
            />
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
