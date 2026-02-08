'use client';

import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/admin-guard';
import { api } from '@/lib/api';
import { IdentityUser, GetUsersResponse } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminUsersPage() {
    return (
        <AdminGuard>
            <UsersContent />
        </AdminGuard>
    );
}

function UsersContent() {
    const [users, setUsers] = useState<IdentityUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 20;

    // State update modal
    const [stateModal, setStateModal] = useState<{ userId: string; userName: string } | null>(null);
    const [newState, setNewState] = useState('Active');
    const [stateLoading, setStateLoading] = useState(false);
    const [stateMessage, setStateMessage] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get<GetUsersResponse>(
                `/api/v1/identity/users?Page=${page}&PageSize=${pageSize}`
            );
            setUsers(response.data.identityUsers?.items || []);
        } catch (err) {
            console.error('Failed to fetch users', err);
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateState = async () => {
        if (!stateModal) return;
        setStateLoading(true);
        setStateMessage('');
        try {
            await api.put(`/api/v1/identity/users/${stateModal.userId}/state`, {
                userState: newState,
            });
            setStateMessage('User state updated successfully.');
            fetchUsers();
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'Failed to update user state.';
            setStateMessage(msg);
        } finally {
            setStateLoading(false);
        }
    };

    const userStateLabels: Record<number, string> = { 1: 'Active', 2: 'Inactive', 3: 'Locked' };

    const stateBadge = (state: string | number) => {
        const label = typeof state === 'number' ? (userStateLabels[state] || `State ${state}`) : state;
        const lower = label?.toLowerCase();
        if (lower === 'active')
            return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Active</span>;
        if (lower === 'inactive' || lower === 'locked')
            return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">{label}</span>;
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">{label || '—'}</span>;
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage identity user accounts and states.</p>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.userName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{u.firstName} {u.lastName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                                        <td className="px-6 py-4 text-sm">{stateBadge(u.userState)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setStateModal({ userId: u.id, userName: u.userName });
                                                    setNewState(u.userState || 'Active');
                                                    setStateMessage('');
                                                }}
                                            >
                                                Change State
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No users found.</td>
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
                        <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={users.length < pageSize}>
                            Next
                        </Button>
                    </div>
                </>
            )}

            {/* State Update Modal */}
            {stateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Update User State</h2>
                        <p className="text-sm text-gray-500 mb-4">User: {stateModal.userName}</p>

                        <div className="space-y-4">
                            <select
                                value={newState}
                                onChange={(e) => setNewState(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Locked">Locked</option>
                            </select>

                            {stateMessage && (
                                <p className={`text-sm ${stateMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                    {stateMessage}
                                </p>
                            )}

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setStateModal(null)}>Cancel</Button>
                                <Button onClick={handleUpdateState} disabled={stateLoading}>
                                    {stateLoading ? 'Updating...' : 'Update State'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
