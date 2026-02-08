'use client';

import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/admin-guard';
import { api } from '@/lib/api';
import { RestockSubscription, GetRestockSubscriptionsResponse } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminRestockSubscriptionsPage() {
    return (
        <AdminGuard>
            <RestockContent />
        </AdminGuard>
    );
}

function RestockContent() {
    const [subscriptions, setSubscriptions] = useState<RestockSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 20;

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState('');

    useEffect(() => {
        fetchSubscriptions();
    }, [page]);

    const fetchSubscriptions = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get<GetRestockSubscriptionsResponse>(
                `/api/v1/customers/restock-subscriptions?Page=${page}&PageSize=${pageSize}`
            );
            setSubscriptions(response.data.restockSubscriptions?.items || response.data.restockSubscriptions || []);
        } catch (err) {
            console.error('Failed to fetch restock subscriptions', err);
            setError('Failed to load restock subscriptions.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        setActionMessage('');
        try {
            await api.delete(`/api/v1/customers/restock-subscriptions/${deleteTarget.id}`);
            setActionMessage('Subscription deleted successfully.');
            setDeleteTarget(null);
            fetchSubscriptions();
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'Failed to delete subscription.';
            setActionMessage(msg);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Restock Subscriptions</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage customer restock notification subscriptions.
                    </p>
                </div>
                <Link href="/admin/dashboard">
                    <Button variant="outline" size="sm">&larr; Dashboard</Button>
                </Link>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6 text-sm text-red-700">{error}</div>
            )}

            {actionMessage && !deleteTarget && (
                <div className={`rounded-md p-4 mb-6 text-sm ${actionMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {actionMessage}
                </div>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subscriptions.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{s.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{s.productName}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {s.processed ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Yes</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">No</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setDeleteTarget({ id: s.id, email: s.email });
                                                    setActionMessage('');
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {subscriptions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No restock subscriptions found.</td>
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
                        <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={subscriptions.length < pageSize}>
                            Next
                        </Button>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Delete Subscription</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Are you sure you want to delete the restock subscription for <strong>{deleteTarget.email}</strong>?
                        </p>

                        {actionMessage && (
                            <p className="text-sm text-red-600 mb-4">{actionMessage}</p>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                            <Button onClick={handleDelete} disabled={deleteLoading}>
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
