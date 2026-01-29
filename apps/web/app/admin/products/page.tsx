'use client';

import { useState, useEffect } from 'react';
import { productsAPI, Product, Category, Collection, Tag } from '@/src/services/products';
import { adminProductsAPI } from '@/src/services/admin-products';
import { ProductForm } from '@/src/components/admin/products/ProductForm';
import { Search, Plus, Pencil, Trash2, Filter } from 'lucide-react';

const SearchIcon = Search as any;
const PlusIcon = Plus as any;
const PencilIcon = Pencil as any;
const TrashIcon = Trash2 as any;
const FilterIcon = Filter as any;

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    
    // Notifications
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch metadata if needed
            if (categories.length === 0) {
                const [cats, cols, tgs] = await Promise.all([
                    productsAPI.getCategories(),
                    productsAPI.getCollections(),
                    productsAPI.getTags()
                ]);
                setCategories(cats);
                setCollections(cols);
                setTags(tgs);
            }

            const data = await productsAPI.getProducts({
                page,
                page_size: 20,
                search: searchTerm,
                category_id: selectedCategory || undefined
            });
            setProducts(data.products);
            setTotalPages(data.total_pages);
        } catch (error: any) {
            console.error('Failed to fetch data:', error);
            setError(error.response?.data?.detail || 'Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, searchTerm, selectedCategory]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleSave = async (data: any) => {
        try {
            setError(null);
            if (editingProduct) {
                await adminProductsAPI.updateProduct(editingProduct.id, data);
                setSuccess('Product updated successfully');
            } else {
                await adminProductsAPI.createProduct(data);
                setSuccess('Product created successfully');
            }
            setIsEditing(false);
            setEditingProduct(undefined);
            fetchData();
        } catch (error: any) {
            console.error('Failed to save:', error);
            setError(error.response?.data?.detail || 'Failed to save product');
            throw error;
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                setError(null);
                await adminProductsAPI.deleteProduct(id);
                setSuccess('Product deleted successfully');
                fetchData();
            } catch (error: any) {
                console.error('Failed to delete:', error);
                setError(error.response?.data?.detail || 'Failed to delete product');
            }
        }
    };

    if (isEditing) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <button 
                        onClick={() => {
                            setIsEditing(false);
                            setEditingProduct(undefined);
                            setError(null);
                        }}
                        className="text-slate-400 hover:text-white"
                    >
                        &larr; Back to Products
                    </button>
                </div>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                        {error}
                    </div>
                )}

                <ProductForm
                    initialData={editingProduct}
                    categories={categories}
                    collections={collections}
                    availableTags={tags}
                    onSave={handleSave}
                    onCancel={() => {
                        setIsEditing(false);
                        setEditingProduct(undefined);
                        setError(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div>
            {/* Notifications */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                        <span className="sr-only">Dismiss</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
            
            {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex justify-between items-center animate-fade-in-down">
                    <span>{success}</span>
                    <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300">
                        <span className="sr-only">Dismiss</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Product Management</h1>
                    <p className="text-slate-400">Create, edit, and organize products</p>
                </div>
                
                <button
                    onClick={() => {
                        setEditingProduct(undefined);
                        setIsEditing(true);
                        setError(null);
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    New Product
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-4 text-sm font-medium text-slate-400">Product</th>
                                <th className="p-4 text-sm font-medium text-slate-400">Category</th>
                                <th className="p-4 text-sm font-medium text-slate-400">Price</th>
                                <th className="p-4 text-sm font-medium text-slate-400">Stock</th>
                                <th className="p-4 text-sm font-medium text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
                                                {product.image_url ? (
                                                     <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">👕</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{product.name}</p>
                                                <div className="flex gap-1 mt-1">
                                                    {product.tags?.slice(0, 2).map(tag => (
                                                        <span key={tag.id} className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-slate-400">
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                    {product.tags && product.tags.length > 2 && (
                                                        <span className="text-xs text-slate-500">+{product.tags.length - 2}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        {categories.find(c => c.id === product.category_id)?.name || 'Uncategorized'}
                                    </td>
                                    <td className="p-4 text-white font-medium">${product.price.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            product.stock > 10 ? 'bg-green-500/10 text-green-400' : 
                                            product.stock > 0 ? 'bg-orange-500/10 text-orange-400' : 
                                            'bg-red-500/10 text-red-400'
                                        }`}>
                                            {product.stock} in stock
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingProduct(product);
                                                    setIsEditing(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="p-4 border-t border-white/5 flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-white bg-white/5 rounded-lg">
                        Page {page} of {Math.max(1, totalPages)}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
