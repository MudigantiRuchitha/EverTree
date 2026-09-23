'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({
    cartItems: [],
    addToCart: () => {},
    removeFromCart: () => {},
    isInCart: () => false,
    clearCart: () => {},
    cartCount: 0
});

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('evertree_cart');
                if (saved) {
                    setCartItems(JSON.parse(saved));
                }
            } catch (err) {
                console.error('Failed to load cart from localStorage:', err);
            }
        }
    }, []);

    const saveCart = (items) => {
        setCartItems(items);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('evertree_cart', JSON.stringify(items));
            } catch (err) {
                console.error('Failed to save cart to localStorage:', err);
            }
        }
    };

    const addToCart = (property) => {
        if (!property || !property.id) return;
        const exists = cartItems.some((item) => String(item.id) === String(property.id));
        if (!exists) {
            const updated = [...cartItems, property];
            saveCart(updated);
        }
    };

    const removeFromCart = (propertyId) => {
        const updated = cartItems.filter((item) => String(item.id) !== String(propertyId));
        saveCart(updated);
    };

    const isInCart = (propertyId) => {
        return cartItems.some((item) => String(item.id) !== null && String(item.id) === String(propertyId));
    };

    const clearCart = () => {
        saveCart([]);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                isInCart,
                clearCart,
                cartCount: cartItems.length
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
