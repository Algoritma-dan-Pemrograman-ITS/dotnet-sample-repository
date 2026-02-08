'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

export function Navbar() {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    <div className="flex items-center">
                        <Link href="/" className="flex flex-shrink-0 items-center">
                            <span className="text-xl font-bold text-blue-600">FoodDelivery</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/products"
                                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            >
                                Menu
                            </Link>
                            {isAdmin && (
                                <Link
                                    href="/admin/dashboard"
                                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-blue-600 hover:border-blue-300 hover:text-blue-800"
                                >
                                    Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-gray-700 hidden sm:block">
                                    Hello, {user?.firstName}
                                    {isAdmin && (
                                        <span className="ml-1 text-xs text-blue-600 font-semibold">(Admin)</span>
                                    )}
                                </span>
                                <Button variant="outline" size="sm" onClick={logout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Sign up</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
