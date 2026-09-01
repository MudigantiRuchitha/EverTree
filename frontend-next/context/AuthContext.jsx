'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Read token from localStorage (browser only)
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('evertree_token') : null;
        setToken(storedToken);
        if (storedToken) {
            authAPI.getProfile()
                .then(res => setUser(res.data))
                .catch(() => logout())
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        const res = await authAPI.login(credentials);
        const { token, user } = res.data;
        localStorage.setItem('evertree_token', token);
        setToken(token);
        setUser(user);
        return user;
    };

    const register = async (userData) => {
        const res = await authAPI.register(userData);
        const { token, user } = res.data;
        localStorage.setItem('evertree_token', token);
        setToken(token);
        setUser(user);
        return user;
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('evertree_token');
        }
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
