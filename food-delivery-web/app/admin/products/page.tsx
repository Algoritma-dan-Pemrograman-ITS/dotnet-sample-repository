'use client';

import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/admin-guard';
import { api } from '@/lib/api';
import { ProductSummary, GetProductsResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

// Enums from backend
const PRODUCT_COLORS = [
    { value: 0, label: 'Black' },
    { value: 1, label: 'White' },
    { value: 2, label: 'Red' },
    { value: 3, label: 'Blue' },
    { value: 4, label: 'Green' },
    { value: 5, label: 'Yellow' },
];

const PRODUCT_TYPES = [
    { value: 1, label: 'Food' },
    { value: 2, label: 'Drink' },
];

// Seeded categories (from data seeder)
const CATEGORIES = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Books' },
];

export default function AdminProductsPage() {
    return (
        <AdminGuard>
            <ProductsContent />
        </AdminGuard>
    );
}

interface ProductFormData {
    name: string;
    price: string;
    stock: string;
    restockThreshold: string;
    maxStockThreshold: string;
    productType: number;
    height: string;
    width: string;
    depth: string;
    size: string;
    productColor: number;
    categoryId: string;
    supplierId: string;
    brandId: string;
    description: string;
}

const defaultFormData: ProductFormData = {
    name: '',
    price: '',
    stock: '10',
    restockThreshold: '5',
    maxStockThreshold: '100',
    productType: 1,
    height: '10',
    width: '10',
    depth: '10',
    size: 'Medium',
    productColor: 0,
    categoryId: '1',
    supplierId: '1',
    brandId: '1',
    description: '',
};

function ProductsContent() {
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 20;

    // Stock modal state
    const [stockModal, setStockModal] = useState<{
        open: boolean;
        type: 'debit' | 'replenish';
        productId: string;
        productName: string;
    } | null>(null);
    const [stockQuantity, setStockQuantity] = useState('');
    const [stockLoading, setStockLoading] = useState(false);
    const [stockMessage, setStockMessage] = useState('');

    // Create/Edit modal state
    const [formModal, setFormModal] = useState<{ open: boolean; mode: 'create' | 'edit'; productId?: string } | null>(null);
    const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
    const [formLoading, setFormLoading] = useState(false);
    const [formMessage, setFormMessage] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [page]);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            // Using the full products endpoint that contains Price, Description, and Stock
            const response = await api.get<{
                products: {
                    items: any[];
                    totalItems: number;
                    page: number;
                    pageSize: number;
                }
            }>(
                `/api/v1/catalogs/products`, {
                params: {
                    page: page,
                    pageSize: pageSize
                }
            }
            );

            // Mapping the list result to our local state
            // ProductDto uses 'availableStock' instead of 'itemCount'
            const mappedProducts = (response.data.products.items || []).map(p => ({
                id: p.id.toString(),
                name: p.name,
                description: p.description,
                price: Number(p.price || 0),
                itemCount: Number(p.availableStock || 0),
                categoryName: p.categoryName,
                supplierName: p.supplierName
            }));

            setProducts(mappedProducts);
        } catch (err) {
            console.error('Failed to fetch products', err);
            setError('Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    const handleStockAction = async () => {
        if (!stockModal || !stockQuantity) return;
        setStockLoading(true);
        setStockMessage('');
        try {
            const endpoint =
                stockModal.type === 'debit'
                    ? `/api/v1/catalogs/products/${stockModal.productId}/debit-stock`
                    : `/api/v1/catalogs/products/${stockModal.productId}/replenish-stock`;

            await api.post(`${endpoint}?quantity=${Number(stockQuantity)}`);
            setStockMessage(`Successfully ${stockModal.type === 'debit' ? 'debited' : 'replenished'} stock.`);
            setStockQuantity('');
            fetchProducts();
        } catch (err: any) {
            const msg = err.response?.data?.detail || `Failed to ${stockModal.type} stock.`;
            setStockMessage(msg);
        } finally {
            setStockLoading(false);
        }
    };

    const openCreateModal = () => {
        setFormData(defaultFormData);
        setFormMessage('');
        setFormModal({ open: true, mode: 'create' });
    };

    const openEditModal = async (productId: string) => {
        setFormMessage('');
        setFormModal({ open: true, mode: 'edit', productId });
        try {
            const response = await api.get(`/api/v1/catalogs/products/${productId}`);
            const p = response.data.product || response.data;
            setFormData({
                name: p.name || '',
                price: String(p.price || ''),
                stock: String(p.availableStock || '10'),
                restockThreshold: String(p.restockThreshold || '5'),
                maxStockThreshold: String(p.maxStockThreshold || '100'),
                productType: p.productType || 1,
                height: String(p.height || '10'),
                width: String(p.width || '10'),
                depth: String(p.depth || '10'),
                size: p.size || 'Medium',
                productColor: typeof p.productColor === 'number' ? p.productColor : 0,
                categoryId: String(p.categoryId || '1'),
                supplierId: String(p.supplierId || '1'),
                brandId: String(p.brandId || '1'),
                description: p.description || '',
            });
        } catch {
            setFormMessage('Failed to load product details.');
        }
    };

    const handleFormSubmit = async () => {
        if (!formModal) return;
        setFormLoading(true);
        setFormMessage('');
        try {
            if (formModal.mode === 'create') {
                await api.post('/api/v1/catalogs/products', {
                    name: formData.name,
                    price: Number(formData.price),
                    stock: Number(formData.stock),
                    restockThreshold: 10,
                    maxStockThreshold: 1000,
                    description: formData.description || null,
                    categoryId: 1,
                    supplierId: 1,
                    brandId: 1,
                    status: 1, // ProductStatus.Available
                    color: 1, // ProductColor.Black
                    height: 1,
                    width: 1,
                    depth: 1,
                    size: "Standard"
                });
                setFormMessage('Product created successfully!');
            } else {
                await api.post(`/api/v1/catalogs/products/${formModal.productId}`, {
                    name: formData.name,
                    price: Number(formData.price),
                    restockThreshold: Number(formData.restockThreshold),
                    maxStockThreshold: Number(formData.maxStockThreshold),
                    productType: formData.productType,
                    height: Number(formData.height),
                    width: Number(formData.width),
                    depth: Number(formData.depth),
                    size: formData.size,
                    categoryId: Number(formData.categoryId),
                    supplierId: Number(formData.supplierId),
                    brandId: Number(formData.brandId),
                    description: formData.description || null,
                });
                setFormMessage('Product updated successfully!');
            }
            fetchProducts();
        } catch (err: any) {
            const msg = err.response?.data?.detail || err.response?.data?.title || 'Operation failed.';
            setFormMessage(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const updateField = (field: keyof ProductFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
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
                            Inventory Management
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                            Stock <span className="text-yellow-400">Control</span>
                        </h1>
                        <p className="mt-2 text-lg text-purple-100 max-w-2xl">
                            Quickly replenish or debit stock levels for your product catalog.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={openCreateModal}
                            className="bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-bold rounded-full px-8 shadow-lg shadow-yellow-400/20"
                        >
                            + New Product
                        </Button>
                        <Link href="/admin/dashboard">
                            <Button variant="outline" size="lg" className="border-white/20 text-white bg-white/10 hover:bg-white/20 hover:text-white rounded-full backdrop-blur-sm">
                                &larr; Back to Dashboard
                            </Button>
                        </Link>
                    </div>
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
                                            <th className="px-8 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Name</th>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Description</th>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Price</th>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-yellow-400 uppercase tracking-wider">Stock</th>
                                            <th className="px-8 py-5 text-right text-xs font-bold text-yellow-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {products.map((p) => (
                                            <tr key={p.id} className="hover:bg-white/5 transition-colors duration-200">
                                                <td className="px-8 py-5 text-sm font-bold whitespace-nowrap">
                                                    <Link href={`/products/${p.id}`} className="text-white hover:text-yellow-400 transition-colors">
                                                        {p.name}
                                                    </Link>
                                                </td>
                                                <td className="px-8 py-5 text-sm text-purple-100 max-w-xs truncate">
                                                    {p.description || "—"}
                                                </td>
                                                <td className="px-8 py-5 text-sm text-white font-bold whitespace-nowrap">
                                                    ${p.price?.toFixed(2)}
                                                </td>
                                                <td className="px-8 py-5 text-sm text-yellow-400 whitespace-nowrap font-mono font-bold">
                                                    {p.itemCount}
                                                </td>
                                                <td className="px-8 py-5 text-right whitespace-nowrap space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-green-400/30 text-green-300 bg-green-400/10 hover:bg-green-400/20 rounded-full"
                                                        onClick={() => {
                                                            setStockModal({ open: true, type: 'replenish', productId: p.id, productName: p.name });
                                                            setStockMessage('');
                                                            setStockQuantity('');
                                                        }}
                                                    >
                                                        + Replenish
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-400/30 text-red-300 bg-red-400/10 hover:bg-red-400/20 rounded-full"
                                                        onClick={() => {
                                                            setStockModal({ open: true, type: 'debit', productId: p.id, productName: p.name });
                                                            setStockMessage('');
                                                            setStockQuantity('');
                                                        }}
                                                    >
                                                        − Debit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {products.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-16 text-center text-purple-200 font-medium italic">No products found.</td>
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
                                disabled={products.length < pageSize}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Stock Modal */}
            {stockModal?.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/60 backdrop-blur-md">
                    <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-3xl border border-white/20 shadow-2xl p-8 w-full max-w-md relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

                        <h2 className="text-2xl font-extrabold text-white mb-2">
                            {stockModal.type === 'replenish' ? 'Replenish Stock' : 'Debit Stock'}
                        </h2>
                        <p className="text-purple-200 font-medium mb-6">Product: <span className="text-yellow-400">{stockModal.productName}</span></p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-purple-200 ml-1">Quantity</label>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="Enter quantity..."
                                    value={stockQuantity}
                                    onChange={(e) => setStockQuantity(e.target.value)}
                                    className="h-12 rounded-2xl border-white/20 bg-white/10 text-white focus:ring-yellow-400/50 backdrop-blur-sm placeholder:text-purple-300/50"
                                />
                            </div>

                            {stockMessage && (
                                <p className={`text-sm font-bold text-center p-3 rounded-2xl ${stockMessage.startsWith('Success') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                    {stockMessage}
                                </p>
                            )}

                            <div className="flex justify-end gap-4 pt-4">
                                <Button variant="ghost" className="text-purple-100 hover:bg-white/10 rounded-full" onClick={() => setStockModal(null)}>Cancel</Button>
                                <Button
                                    className="bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-bold rounded-full px-8 shadow-lg shadow-yellow-400/20"
                                    onClick={handleStockAction}
                                    disabled={stockLoading || !stockQuantity}
                                >
                                    {stockLoading ? 'Processing...' : stockModal.type === 'replenish' ? 'Confirm Replenish' : 'Confirm Debit'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Simplified Create Product Modal */}
            {formModal?.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/60 backdrop-blur-md overflow-y-auto py-10">
                    <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-[2.5rem] border border-white/20 shadow-2xl p-10 w-full max-w-xl relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

                        <h2 className="text-3xl font-extrabold text-white mb-2">New <span className="text-yellow-400">Product</span></h2>
                        <p className="text-purple-200 font-medium mb-8">Quickly add a new item to your stock control.</p>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-purple-200 ml-1">Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder="Product name..."
                                    className="h-12 rounded-2xl border-white/20 bg-white/10 text-white focus:ring-yellow-400/50 backdrop-blur-sm placeholder:text-purple-300/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-purple-200 ml-1">Price *</label>
                                    <Input type="number" min={0} step="0.01" value={formData.price} onChange={(e) => updateField('price', e.target.value)} placeholder="0.00" className="h-12 rounded-2xl border-white/20 bg-white/10 text-white focus:ring-yellow-400/50 backdrop-blur-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-purple-200 ml-1">Initial Stock *</label>
                                    <Input type="number" min={0} value={formData.stock} onChange={(e) => updateField('stock', e.target.value)} className="h-12 rounded-2xl border-white/20 bg-white/10 text-white focus:ring-yellow-400/50 backdrop-blur-sm" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-purple-200 ml-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    rows={3}
                                    placeholder="Optional product description..."
                                    className="flex w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 backdrop-blur-sm placeholder:text-purple-300/50"
                                />
                            </div>

                            {formMessage && (
                                <div className={`p-4 rounded-2xl text-sm font-bold text-center border ${formMessage.includes('success') ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                                    {formMessage}
                                </div>
                            )}

                            <div className="flex justify-end gap-4 pt-4">
                                <Button variant="ghost" className="text-purple-100 hover:bg-white/10 rounded-full" onClick={() => setFormModal(null)}>Cancel</Button>
                                <Button
                                    className="bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-extrabold rounded-full px-12 h-14 shadow-xl shadow-yellow-400/20 text-lg"
                                    onClick={handleFormSubmit}
                                    disabled={formLoading || !formData.name || !formData.price}
                                >
                                    {formLoading ? 'Creating...' : 'Create Product'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
