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
            icon: '🥡',
            accent: 'bg-yellow-400'
        },
        {
            title: 'Users',
            description: 'View identity accounts and update user state.',
            href: '/admin/users',
            icon: '👤',
            accent: 'bg-pink-400'
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-800 text-white relative overflow-hidden">
            {/* Decorative shapes from homepage */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative z-10">
                <header className="mb-16">
                    <div className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-sm border border-white/20 text-yellow-300 mb-6">
                        Admin Control Center
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl leading-tight">
                        Manage your <span className="text-yellow-400">healthy day</span> platform
                    </h1>
                    <p className="mt-4 text-xl text-purple-100 max-w-2xl">
                        Welcome back, <span className="font-bold text-white">{user?.firstName}</span>.
                        Efficiently control your products and community from one premium interface.
                    </p>
                </header>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl">
                    {cards.map((card) => (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/20 hover:border-white/40"
                        >
                            {/* Accent shape mimicking homepage food icons */}
                            <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-20 transition-transform duration-700 group-hover:scale-150 ${card.accent}`} />

                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-4xl filter drop-shadow-md">{card.icon}</span>
                                <h2 className="text-3xl font-bold text-white">{card.title}</h2>
                            </div>

                            <p className="text-purple-100 text-lg leading-relaxed font-medium mb-8">
                                {card.description}
                            </p>

                            <div className="flex items-center text-sm font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                                <span className="bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/20 group-hover:bg-yellow-400/20 transform transition-transform group-hover:translate-x-2">
                                    Manage Feature
                                    <svg className="inline-block ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
