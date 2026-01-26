import { Product } from '@/src/services/products';
import { ShoppingBag, Star } from 'lucide-react';
import Link from 'next/link';

// Cast icons to any to avoid type errors
const ShoppingBagIcon = ShoppingBag as any;
const StarIcon = Star as any;

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group bg-slate-800/50 rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-700">
                {product.image_url ? (
                    <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-600">
                        <span className="text-4xl">👕</span>
                    </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button className="p-3 bg-white text-slate-900 rounded-full hover:bg-purple-50 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <ShoppingBagIcon className="w-5 h-5" />
                    </button>
                    <Link 
                        href={`/products/${product.id}`}
                        className="p-3 bg-white text-slate-900 rounded-full hover:bg-purple-50 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
                    >
                        View
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                        <StarIcon className="w-4 h-4 fill-current" />
                        <span>4.5</span>
                    </div>
                </div>
                
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {product.description || "No description available"}
                </p>
                
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-slate-500 text-xs uppercase tracking-wider">Price</span>
                        <span className="text-xl font-bold text-white">
                            ${product.price.toLocaleString()}
                        </span>
                    </div>
                    
                    {product.category && (
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300 border border-white/10">
                            {product.category.name}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
