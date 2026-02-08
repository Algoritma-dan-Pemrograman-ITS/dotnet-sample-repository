export interface User {
    id: string | number;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    roles: string[];
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

// ── Paginated wrapper returned by list endpoints ──
export interface PaginatedResponse<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
}

// ── Customers ──
export interface Customer {
    id: string;
    identityId: string;
    email: string;
    name: string;
    createdAt: string;
}

export interface GetCustomersResponse {
    customers: Customer[] | PaginatedResponse<Customer>;
}

// ── Restock Subscriptions ──
export interface RestockSubscription {
    id: string;
    customerId: string;
    email: string;
    productName: string;
    processed: boolean;
    createdAt: string;
}

export interface GetRestockSubscriptionsResponse {
    restockSubscriptions: RestockSubscription[] | PaginatedResponse<RestockSubscription>;
}

// ── Identity / Users ──
export interface IdentityUser {
    id: string;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    userState: string | number;
    createdAt: string;
}

export interface GetUsersResponse {
    identityUsers: PaginatedResponse<IdentityUser>;
}
