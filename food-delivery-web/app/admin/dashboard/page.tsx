'use client';

import { AdminGuard } from '@/components/admin-guard';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';

export default function AdminDashboardPage() {
    return (
        <AdminGuard>
            <DashboardContent />
        </AdminGuard>
    );
}

function DashboardContent() {
    const { user } = useAuth();

    const cards = [
        {
            title: 'Products',
            description: 'View catalog, replenish & debit stock.',
            href: '/admin/products',
            color: 'border-blue-200 hover:border-blue-400',
        },
        {
            title: 'Users',
            description: 'View identity accounts and update user state.',
            href: '/admin/users',
            color: 'border-purple-200 hover:border-purple-400',
        },
        {
            title: 'Customers',
            description: 'Browse registered customer profiles.',
            href: '/admin/customers',
            color: 'border-green-200 hover:border-green-400',
        },
        {
            title: 'Restock Subscriptions',
            description: 'Manage restock notification subscriptions.',
            href: '/admin/restock-subscriptions',
            color: 'border-yellow-200 hover:border-yellow-400',
        },
        {
            title: 'Orders',
            description: 'View and manage customer orders.',
            href: '#',
            color: 'border-gray-200 opacity-60 cursor-default',
            comingSoon: true,
        },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
                Welcome back, {user?.firstName}! You are logged in as an administrator.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) =>
                    card.comingSoon ? (
                        <div
                            key={card.title}
                            className={`rounded-lg border bg-white p-6 shadow-sm ${card.color}`}
                        >
                            <h2 className="text-lg font-semibold text-gray-900">{card.title}</h2>
                            <p className="mt-1 text-sm text-gray-500">{card.description}</p>
                            <span className="mt-2 inline-block text-xs text-gray-400">Coming soon</span>
                        </div>
                    ) : (
                        <Link
                            key={card.title}
                            href={card.href}
                            className={`rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow ${card.color}`}
                        >
                            <h2 className="text-lg font-semibold text-gray-900">{card.title}</h2>
                            <p className="mt-1 text-sm text-gray-500">{card.description}</p>
                        </Link>
                    )
                )}
            </div>
        </div>
    );
}
