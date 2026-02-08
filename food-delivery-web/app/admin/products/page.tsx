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
            const response = await api.get<GetProductsResponse>(
                `/api/v1/catalogs/products-view/${page}/${pageSize}`
            );
            setProducts(response.data.products || []);
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
                    restockThreshold: Number(formData.restockThreshold),
                    maxStockThreshold: Number(formData.maxStockThreshold),
                    productType: formData.productType,
                    height: Number(formData.height),
                    width: Number(formData.width),
                    depth: Number(formData.depth),
                    size: formData.size,
                    productColor: formData.productColor,
                    categoryId: Number(formData.categoryId),
                    supplierId: Number(formData.supplierId),
                    brandId: Number(formData.brandId),
                    description: formData.description || null,
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
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View product catalog, manage stock levels, create and edit products.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={openCreateModal}>+ New Product</Button>
                    <Link href="/admin/dashboard">
                        <Button variant="outline" size="sm">&larr; Dashboard</Button>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6 text-sm text-red-700">{error}</div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white h-16 rounded-lg border" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {products.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            <Link href={`/products/${p.id}`} className="text-blue-600 hover:underline">
                                                {p.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{p.categoryName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{p.supplierName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{p.itemCount}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button size="sm" variant="outline" onClick={() => openEditModal(p.id)}>
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
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
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No products found.</td>
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
                        <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={products.length < pageSize}>
                            Next
                        </Button>
                    </div>
                </>
            )}

            {/* Stock Modal */}
            {stockModal?.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            {stockModal.type === 'replenish' ? 'Replenish Stock' : 'Debit Stock'}
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">{stockModal.productName}</p>

                        <div className="space-y-4">
                            <Input
                                type="number"
                                min={1}
                                placeholder="Quantity"
                                value={stockQuantity}
                                onChange={(e) => setStockQuantity(e.target.value)}
                            />

                            {stockMessage && (
                                <p className={`text-sm ${stockMessage.startsWith('Success') ? 'text-green-600' : 'text-red-600'}`}>
                                    {stockMessage}
                                </p>
                            )}

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setStockModal(null)}>Cancel</Button>
                                <Button onClick={handleStockAction} disabled={stockLoading || !stockQuantity}>
                                    {stockLoading ? 'Processing...' : stockModal.type === 'replenish' ? 'Replenish' : 'Debit'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Edit Product Modal */}
            {formModal?.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-10">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {formModal.mode === 'create' ? 'Create Product' : 'Edit Product'}
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <Input value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Product name" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                <Input type="number" min={0} step="0.01" value={formData.price} onChange={(e) => updateField('price', e.target.value)} placeholder="0.00" />
                            </div>

                            {formModal.mode === 'create' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock *</label>
                                    <Input type="number" min={0} value={formData.stock} onChange={(e) => updateField('stock', e.target.value)} />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Restock Threshold</label>
                                <Input type="number" min={0} value={formData.restockThreshold} onChange={(e) => updateField('restockThreshold', e.target.value)} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock Threshold</label>
                                <Input type="number" min={0} value={formData.maxStockThreshold} onChange={(e) => updateField('maxStockThreshold', e.target.value)} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => updateField('categoryId', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier ID *</label>
                                <Input type="number" min={1} max={5} value={formData.supplierId} onChange={(e) => updateField('supplierId', e.target.value)} placeholder="1-5" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand ID *</label>
                                <Input type="number" min={1} max={5} value={formData.brandId} onChange={(e) => updateField('brandId', e.target.value)} placeholder="1-5" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type *</label>
                                <select
                                    value={formData.productType}
                                    onChange={(e) => updateField('productType', Number(e.target.value))}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                >
                                    {PRODUCT_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                <select
                                    value={formData.productColor}
                                    onChange={(e) => updateField('productColor', Number(e.target.value))}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                >
                                    {PRODUCT_COLORS.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                <Input value={formData.size} onChange={(e) => updateField('size', e.target.value)} placeholder="e.g. Medium" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                                <Input type="number" min={0} value={formData.height} onChange={(e) => updateField('height', e.target.value)} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                                <Input type="number" min={0} value={formData.width} onChange={(e) => updateField('width', e.target.value)} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Depth</label>
                                <Input type="number" min={0} value={formData.depth} onChange={(e) => updateField('depth', e.target.value)} />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    rows={3}
                                    placeholder="Optional description"
                                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                />
                            </div>
                        </div>

                        {formMessage && (
                            <p className={`mt-4 text-sm ${formMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                {formMessage}
                            </p>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => setFormModal(null)}>Cancel</Button>
                            <Button onClick={handleFormSubmit} disabled={formLoading || !formData.name || !formData.price}>
                                {formLoading ? 'Saving...' : formModal.mode === 'create' ? 'Create' : 'Update'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
