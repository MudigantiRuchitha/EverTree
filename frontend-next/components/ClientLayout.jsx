'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { ChatProvider, useChat } from '../context/ChatContext';
import { CartProvider } from '../context/CartContext';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollButton from './ScrollButton';

function LayoutInner({ children }) {
    const { openChat } = useChat();
    const pathname = usePathname();

    // Hide public Navbar and Footer on admin pages
    const isAdminRoute = pathname?.startsWith('/evertree/secure');

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">

            {!isAdminRoute && (
                <Navbar onOpenChat={() => openChat(null)} />
            )}

            <main className="flex-1 w-full">
                {children}
            </main>

            {!isAdminRoute && <Footer />}
            
            <ScrollButton />

        </div>
    );
}

export default function ClientLayout({ children }) {
    return (
        <AuthProvider>
            <SocketProvider>
                <ChatProvider>
                    <CartProvider>
                        <LayoutInner>
                            {children}
                        </LayoutInner>
                    </CartProvider>
                </ChatProvider>
            </SocketProvider>
        </AuthProvider>
    );
}
