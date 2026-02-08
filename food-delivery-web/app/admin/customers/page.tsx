'use client';

import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/admin-guard';
import { api } from '@/lib/api';
import { Customer, GetCustomersResponse } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminCustomersPage() {
    return (
        <AdminGuard>
            <CustomersContent />
        </AdminGuard>
    );
}

function CustomersContent() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        fetchCustomers();
    }, [page]);

    const fetchCustomers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get<GetCustomersResponse>(
                `/api/v1/customers?Page=${page}&PageSize=${pageSize}`
            );
            setCustomers(response.data.customers?.items || response.data.customers || []);
        } catch (err) {
            console.error('Failed to fetch customers', err);
            setError('Failed to load customers.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                    <p className="text-sm text-gray-500 mt-1">View registered customers.</p>
                </div>
                <Link href="/admin/dashboard">
                    <Button variant="outline" size="sm">&larr; Dashboard</Button>
                </Link>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6 text-sm text-red-700">{error}</div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white h-14 rounded-lg border" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {customers.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{c.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400 font-mono">{c.id}</td>
                                    </tr>
                                ))}
                                {customers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No customers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-center gap-4">
                        <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                            Previous
                        </Button>
                        <span className="flex items-center text-sm text-gray-600">Page {page}</span>
                        <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={customers.length < pageSize}>
                            Next
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
