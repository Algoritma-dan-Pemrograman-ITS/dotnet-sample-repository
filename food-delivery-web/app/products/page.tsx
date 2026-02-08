'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ProductSummary, GetProductsResponse } from '@/types';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 12;

    useEffect(() => {
        fetchProducts();
    }, [page]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // The backend endpoint is /api/v1/catalogs/products-view/{page}/{pageSize}
            // Response is expected to be { products: [...] } based on GetProductsViewResponse
            const response = await api.get<GetProductsResponse>(`/api/v1/catalogs/products-view/${page}/${pageSize}`);
            setProducts(response.data.products || []);
        } catch (err) {
            console.error('Failed to fetch products', err);
            setError('Failed to load products. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-purple-50">
            {/* Header Section */}
            <div className="relative w-full py-16 md:py-24 overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-800 text-white mb-10 shadow-lg">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Our Menu</h1>
                    <p className="text-purple-100 max-w-2xl mx-auto text-lg">Explore our delicious selection of fresh meals delivered to your door.</p>
                </div>
            </div>

            <main>
                <div className="mx-auto max-w-7xl pb-20 px-4 sm:px-6 lg:px-8">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 mb-6">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse bg-white p-4 rounded-3xl h-64 shadow-md"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {products.length === 0 && !loading && !error && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No products found.</p>
                                </div>
                            )}

                            <div className="mt-8 flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || loading}
                                    className="rounded-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-900"
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center text-sm text-gray-600">
                                    Page {page}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={products.length < pageSize || loading}
                                    className="rounded-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-900"
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
