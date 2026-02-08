'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getRolesFromToken } from '@/lib/jwt';
import { AuthResponse, User } from '@/types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: AuthResponse) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
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
            const parsed = JSON.parse(storedUser);
            // Re-derive roles from the stored token so they're always in sync
            if (!parsed.roles || parsed.roles.length === 0) {
                parsed.roles = getRolesFromToken(token);
            }
            setUser(parsed);
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

        const roles = getRolesFromToken(data.accessToken);

        const userData: User = {
            id: data.userId,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            email: '', // Email is not returned in login response currently, mostly used for display
            roles,
        };

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        // Redirect admins to the admin dashboard, regular users to products
        if (roles.includes('admin')) {
            router.push('/admin/dashboard');
        } else {
            router.push('/products');
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user, isAdmin: user?.roles?.includes('admin') ?? false }}>
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
