export interface User {
    id: string | number;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export interface ProductSummary {
    id: string;
    name: string;
    categoryName: string;
    supplierName: string;
    itemCount: number;
}

export interface ProductImage {
    imageUrl: string;
    isMain: boolean;
}

export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    categoryName: string;
    supplierId: number;
    supplierName: string;
    brandId: number;
    brandName: string;
    availableStock: number;
    restockThreshold: number;
    maxStockThreshold: number;
    productStatus: string; // Enum as string
    productColor: string; // Enum as string
    size: string;
    height: number;
    width: number;
    depth: number;
    images?: ProductImage[];
}

export interface GetProductsResponse {
    products: ProductSummary[];
}
