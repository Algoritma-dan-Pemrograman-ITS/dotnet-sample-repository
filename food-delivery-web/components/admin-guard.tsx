'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

/**
 * Wraps admin-only pages. Redirects to /login if not authenticated,
 * or to /products if authenticated but not an admin.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.push('/login');
        } else if (!isAdmin) {
            router.push('/products');
        }
    }, [isAuthenticated, isAdmin, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">Loading…</p>
            </div>
        );
    }

    if (!isAuthenticated || !isAdmin) {
        return null; // will redirect via useEffect
    }

    return <>{children}</>;
}
