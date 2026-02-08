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
            // Map string labels back to their numeric enum values
            // 1: Active, 2: Locked (based on UserState.cs backend)
            const stateValue = newState === 'Active' ? 1 : 2;

            await api.put(`/api/v1/identity/users/${stateModal.userId}/state`, {
                userState: stateValue,
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

    const userStateLabels: Record<number, string> = { 1: 'Active', 2: 'Locked' };

    const stateBadge = (state: string | number) => {
        const label = typeof state === 'number' ? (userStateLabels[state] || `State ${state}`) : state;
        const lower = label?.toLowerCase();
        if (lower === 'active')
            return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Active</span>;
        if (lower === 'locked')
            return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Locked</span>;
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">{label || '—'}</span>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-800 text-white relative overflow-hidden">
            {/* Decorative shapes from homepage */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
                    <div>
                        <div className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-sm border border-white/20 text-yellow-300 mb-4">
                            Identity Management
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                            Admin <span className="text-yellow-400">Users</span>
                        </h1>
                        <p className="mt-2 text-lg text-purple-100 max-w-2xl">
                            Manage identity user accounts and platform permissions.
                        </p>
                    </div>
                    <Link href="/admin/dashboard">
                        <Button variant="outline" size="lg" className="border-white/20 text-white bg-white/10 hover:bg-white/20 hover:text-white rounded-full backdrop-blur-sm">
                            &larr; Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {error && (
                    <div className="rounded-2xl bg-red-500/20 border border-red-500/30 p-4 mb-8 text-sm text-red-100 backdrop-blur-md">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-white/10 h-16 rounded-3xl border border-white/20 backdrop-blur-md" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="overflow-hidden bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-white/10">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Username</th>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Name</th>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Email</th>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Role</th>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">State</th>
                                            <th className="px-8 py-5 text-right text-xs font-bold text-yellow-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-white/5 transition-colors duration-200">
                                                <td className="px-8 py-5 text-sm font-bold text-white whitespace-nowrap">{u.userName}</td>
                                                <td className="px-8 py-5 text-sm text-purple-100 whitespace-nowrap">{u.firstName} {u.lastName}</td>
                                                <td className="px-8 py-5 text-sm text-purple-100 whitespace-nowrap">{u.email}</td>
                                                <td className="px-8 py-5 text-sm whitespace-nowrap">
                                                    <div className="flex flex-wrap gap-1">
                                                        {u.roles && u.roles.length > 0 ? u.roles.map(role => (
                                                            <span key={role} className="inline-flex items-center rounded-full bg-yellow-400/10 px-2.5 py-0.5 text-xs font-bold text-yellow-400 border border-yellow-400/20">
                                                                {role}
                                                            </span>
                                                        )) : <span className="text-purple-300 italic text-xs">No roles</span>}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-sm whitespace-nowrap">{stateBadge(u.userState)}</td>
                                                <td className="px-8 py-5 text-right whitespace-nowrap">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-yellow-400/30 text-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20 hover:text-yellow-200 rounded-full"
                                                        onClick={() => {
                                                            setStateModal({ userId: u.id, userName: u.userName });
                                                            const currentLabel = typeof u.userState === 'number' ? (userStateLabels[u.userState] || 'Active') : u.userState;
                                                            setNewState(currentLabel || 'Active');
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
                                                <td colSpan={6} className="px-8 py-16 text-center text-purple-200 font-medium italic">No users found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-center items-center gap-6">
                            <Button
                                variant="outline"
                                className="border-white/20 text-white bg-white/10 hover:bg-white/20 hover:text-white rounded-full backdrop-blur-sm min-w-[120px]"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-bold bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
                                Page <span className="text-yellow-400">{page}</span>
                            </span>
                            <Button
                                variant="outline"
                                className="border-white/20 text-white bg-white/10 hover:bg-white/20 hover:text-white rounded-full backdrop-blur-sm min-w-[120px]"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={users.length < pageSize}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* State Update Modal */}
            {stateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/60 backdrop-blur-md">
                    <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-3xl border border-white/20 shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

                        <h2 className="text-2xl font-extrabold text-white mb-2">Update User State</h2>
                        <p className="text-purple-200 font-medium mb-6">User: <span className="text-yellow-400">{stateModal.userName}</span></p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-purple-200 ml-1">New Account Status</label>
                                <select
                                    value={newState}
                                    onChange={(e) => setNewState(e.target.value)}
                                    className="flex h-12 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 backdrop-blur-sm appearance-none"
                                >
                                    <option value="Active" className="bg-purple-900">Active</option>
                                    <option value="Locked" className="bg-purple-900">Locked</option>
                                </select>
                            </div>

                            {stateMessage && (
                                <p className={`text-sm font-bold text-center p-3 rounded-2xl ${stateMessage.includes('success') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                    {stateMessage}
                                </p>
                            )}

                            <div className="flex justify-end gap-4 pt-4">
                                <Button variant="ghost" className="text-purple-100 hover:bg-white/10 rounded-full" onClick={() => setStateModal(null)}>Cancel</Button>
                                <Button
                                    className="bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-bold rounded-full px-8 shadow-lg shadow-yellow-400/20"
                                    onClick={handleUpdateState}
                                    disabled={stateLoading}
                                >
                                    {stateLoading ? 'Updating...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
