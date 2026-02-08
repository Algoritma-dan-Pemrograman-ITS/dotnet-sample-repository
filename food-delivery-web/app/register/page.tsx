'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthResponse } from '@/types';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // 1. Register
            await api.post('/api/v1/identity/users', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                userName: formData.userName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                roles: ['user']
            });

            // 2. Auto-login on success
            const loginResponse = await api.post<AuthResponse>('/api/v1/identity/login', {
                userNameOrEmail: formData.email,
                password: formData.password,
            });

            login(loginResponse.data);

        } catch (err: any) {
            console.error('Registration failed', err);
            const message = err.response?.data?.detail || 'Registration failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-purple-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 -mt-20 -ml-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-lg space-y-8 bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-2xl relative z-10 border border-white/50">
                <div className="text-center">
                    <div className="inline-block p-3 rounded-full bg-yellow-100 text-3xl mb-4">
                        👋
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-purple-900">
                        Join FoodDelivery
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                            Sign in to existing account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1 ml-1">First Name</label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-200 py-6 bg-white/50"
                                />
                            </div>
                            <div className="group">
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1 ml-1">Last Name</label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-200 py-6 bg-white/50"
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1 ml-1">Username</label>
                            <Input
                                id="userName"
                                name="userName"
                                type="text"
                                required
                                placeholder="johndoe123"
                                value={formData.userName}
                                onChange={handleChange}
                                className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-200 py-6 bg-white/50"
                            />
                        </div>
                        <div className="group">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email address</label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-200 py-6 bg-white/50"
                            />
                        </div>
                        <div className="group">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 ml-1">Password</label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-200 py-6 bg-white/50"
                            />
                        </div>
                        <div className="group">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 ml-1">Confirm Password</label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-200 py-6 bg-white/50"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm text-center border border-red-100 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            className="w-full py-6 text-lg font-bold rounded-full bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
