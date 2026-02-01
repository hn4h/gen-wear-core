'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { productsAPI, Product } from '@/src/services/products';
import { useCartStore } from '@/src/lib/useCartStore';
import { Star, ShoppingBag, ArrowLeft, Share2, Heart } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';

// Cast icons to any
const StarIcon = Star as any;
const ShoppingBagIcon = ShoppingBag as any;
const ArrowLeftIcon = ArrowLeft as any;
const ShareIcon = Share2 as any;
const HeartIcon = Heart as any;

export default function ProductDetailPage() {
    const params = useParams();
    const { addItem } = useCartStore();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('M');
    
    useEffect(() => {
        const fetchProduct = async () => {
            if (!params.id) return;
            try {
                const data = await productsAPI.getProduct(params.id as string);
                setProduct(data);
            } catch (error) {
                console.error('Failed to load product:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">Product not found</h1>
                <Link href="/products" className="text-purple-400 hover:text-purple-300">
                    &larr; Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <Header />
            
            <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Breadcrumb / Back */}
                <div className="mb-8">
                    <Link 
                        href="/products" 
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Products
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-[4/5] bg-slate-800 rounded-2xl overflow-hidden border border-white/5">
                            {product.image_url ? (
                                <img 
                                    src={product.image_url} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl">
                                    👕
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-purple-400 font-medium tracking-wider uppercase text-sm">
                                    {product.category?.name || 'Collection'}
                                </span>
                                <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded max-w-fit">
                                    <StarIcon className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-bold">4.8</span>
                                    <span className="text-slate-500 text-sm ml-1">(120 reviews)</span>
                                </div>
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{product.name}</h1>
                            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                ${product.price.toLocaleString()}
                            </p>
                        </div>

                        <div className="prose prose-invert max-w-none text-slate-300">
                            <p>{product.description || "Experience the future of fashion using our AI-generated patterns. Each piece is unique and crafted with high-quality materials."}</p>
                        </div>

                        {/* Sizes */}
                        <div>
                            <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Size</h3>
                            <div className="flex flex-wrap gap-3">
                                {['S', 'M', 'L', 'XL'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-12 h-12 rounded-xl border flex items-center justify-center font-medium transition-all ${
                                            selectedSize === size
                                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                                : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t border-white/10">
                            <button 
                                onClick={() => addItem(product)}
                                className="flex-1 bg-white text-slate-900 h-14 rounded-xl font-bold text-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingBagIcon className="w-5 h-5" />
                                Add to Cart
                            </button>
                            <button className="h-14 w-14 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                <HeartIcon className="w-6 h-6" />
                            </button>
                            <button className="h-14 w-14 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                <ShareIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                            <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                <span className="block text-slate-500 text-xs uppercase mb-1">Stock Status</span>
                                <span className={product.stock > 0 ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                                </span>
                            </div>
                            <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                <span className="block text-slate-500 text-xs uppercase mb-1">Delivery</span>
                                <span className="text-white font-medium">2-4 Business Days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
