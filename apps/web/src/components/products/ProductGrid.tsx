import { Product } from '@/src/services/products';
import { ProductCard } from './ProductCard';
import { Loader2 } from 'lucide-react';

const Loader2Icon = Loader2 as any;

interface ProductGridProps {
    products: Product[];
    isLoading: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2Icon className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
                <p className="text-slate-400">
                    Try adjusting your filters or search terms
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
