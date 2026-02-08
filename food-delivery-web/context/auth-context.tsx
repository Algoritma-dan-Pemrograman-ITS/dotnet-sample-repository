'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AuthResponse, User } from '@/types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: AuthResponse) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        let token = localStorage.getItem('accessToken');

        // Handle legacy tokens stored with JSON.stringify
        if (token && token.startsWith('"') && token.endsWith('"')) {
            token = token.slice(1, -1);
            localStorage.setItem('accessToken', token);
        }

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (data: AuthResponse) => {
        console.log('[AuthContext] Login called with:', data);

        if (!data.accessToken) {
            console.error('[AuthContext] Missing accessToken in login response!', data);
            return;
        }

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        const userData: User = {
            id: data.userId,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            email: '', // Email is not returned in login response currently, mostly used for display
        };

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        router.push('/products');
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
