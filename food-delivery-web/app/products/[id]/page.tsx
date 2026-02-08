'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProduct();
    }, [unwrappedParams.id]);

    const fetchProduct = async () => {
        try {
            // The endpoint is /api/v1/catalogs/products/{id} based on GetProductById
            // Response is { product: ... } based on GetProductByIdResponse
            const response = await api.get<{ product: Product }>(`/api/v1/catalogs/products/${unwrappedParams.id}`);
            setProduct(response.data.product);
        } catch (err) {
            console.error('Failed to fetch product', err);
            setError('Failed to load product details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-purple-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Product not found'}</h2>
                <Link href="/products">
                    <Button>Back to Menu</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link href="/products" className="text-purple-600 hover:text-purple-800 flex items-center gap-2 font-medium transition-colors">
                        &larr; Back to Menu
                    </Link>
                </div>

                <div className="bg-white shadow-xl rounded-3xl overflow-hidden border-none">
                    <div className="md:flex">
                        {/* Image Section */}
                        <div className="md:w-1/2 bg-gradient-to-br from-orange-50 to-yellow-50 h-[500px] flex items-center justify-center text-gray-400 relative">
                            <span className="text-9xl drop-shadow-md">🍽️</span>
                            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-purple-700 shadow-md">
                                Premium Quality
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-10 md:w-1/2 flex flex-col justify-center">
                            <div className="mb-2">
                                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${product.availableStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {product.availableStock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>

                            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">{product.name}</h1>

                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                {product.description || 'Experience the taste of perfection with our carefully crafted dish. Fresh ingredients, authentic spices, and made with love.'}
                            </p>

                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-5xl font-bold text-purple-700">${product.price}</span>
                                <span className="text-gray-400 text-lg">/ serving</span>
                            </div>

                            <div className="border-t border-gray-100 py-6 mb-6">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="font-medium">4.8 (120 reviews)</span>
                                    <span className="mx-2 text-gray-300">•</span>
                                    <span className="font-medium text-gray-900">{product.availableStock} units left</span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <Button className="w-full md:w-auto px-8 py-6 text-lg rounded-full bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-bold shadow-lg flex items-center justify-center gap-2" disabled={product.availableStock <= 0}>
                                    Add to Cart
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                                </Button>
                                <p className="text-center md:text-left text-sm text-gray-400 mt-3 font-medium">Free delivery on orders over $30</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
