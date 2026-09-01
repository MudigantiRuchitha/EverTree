'use client';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { ChatProvider, useChat } from '../context/ChatContext';
import Navbar from './Navbar';
import Footer from './Footer';

function LayoutInner({ children }) {
    const { openChat } = useChat();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar onOpenChat={() => openChat(null)} />
            <main style={{ flex: 1 }}>
                {children}
            </main>
            <Footer />
        </div>
    );
}

export default function ClientLayout({ children }) {
    return (
        <AuthProvider>
            <SocketProvider>
                <ChatProvider>
                    <LayoutInner>
                        {children}
                    </LayoutInner>
                </ChatProvider>
            </SocketProvider>
        </AuthProvider>
    );
}
