import Link from 'next/link';
import { ProductSummary } from '@/types';
import { Button } from './ui/button';

interface ProductCardProps {
    product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-md transition-all hover:shadow-xl hover:-translate-y-1 border-none h-full">
            {/* Placeholder Image Area */}
            <div className="h-48 bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center text-7xl group-hover:scale-105 transition-transform duration-500 relative">
                <span className="drop-shadow-sm">🍽️</span>
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-purple-700 shadow-sm">
                    Premium
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                    <Link href={`/products/${product.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                    </Link>
                </h3>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                    <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full group-hover:bg-purple-100 transition-colors">
                        View Details
                    </span>
                    <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center text-purple-900 shadow-sm group-hover:bg-yellow-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
