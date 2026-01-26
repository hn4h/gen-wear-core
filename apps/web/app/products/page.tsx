'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import { ProductFilters } from '@/src/components/products/ProductFilters';
import { ProductGrid } from '@/src/components/products/ProductGrid';
import { productsAPI, Product, Category, Collection, Tag } from '@/src/services/products';
import { Filter } from 'lucide-react';

const FilterIcon = Filter as any;

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filters state
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch initial data
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [cats, cols, tgs] = await Promise.all([
                    productsAPI.getCategories(),
                    productsAPI.getCollections(),
                    productsAPI.getTags()
                ]);
                setCategories(cats);
                setCollections(cols);
                setTags(tgs);
            } catch (error) {
                console.error('Failed to fetch metadata:', error);
            }
        };
        fetchMetadata();
    }, []);

    // Fetch products when filters change
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const [sortField, sortOrder] = sortBy === 'newest' 
                    ? ['created_at', 'desc']
                    : sortBy === 'price_asc'
                        ? ['price', 'asc']
                        : sortBy === 'price_desc'
                            ? ['price', 'desc']
                            : ['name', 'asc'];

                const data = await productsAPI.getProducts({
                    category_id: selectedCategory || undefined,
                    collection_id: selectedCollection || undefined,
                    tag: selectedTag || undefined,
                    min_price: priceRange[0],
                    max_price: priceRange[1],
                    search: searchTerm || undefined,
                    sort_by: sortField,
                    sort_order: sortOrder as 'asc' | 'desc',
                    page,
                    page_size: 12
                });

                setProducts(data.products);
                setTotalPages(data.total_pages);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchProducts, 500);
        return () => clearTimeout(debounceTimer);
    }, [selectedCategory, selectedCollection, selectedTag, priceRange, searchTerm, sortBy, page]);

    return (
        <main className="min-h-screen bg-slate-900">
            <Header />
            
            <div className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Our Collection</h1>
                            <p className="text-slate-400">Discover unique AI-generated fashion designs</p>
                        </div>
                        
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg border border-white/10"
                        >
                            <FilterIcon className="w-5 h-5" />
                            Filters
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24">
                                <ProductFilters
                                    categories={categories}
                                    collections={collections}
                                    tags={tags}
                                    selectedCategory={selectedCategory}
                                    onCategoryChange={setSelectedCategory}
                                    selectedCollection={selectedCollection}
                                    onCollectionChange={setSelectedCollection}
                                    selectedTag={selectedTag}
                                    onTagChange={setSelectedTag}
                                    priceRange={priceRange}
                                    onPriceRangeChange={setPriceRange}
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    sortBy={sortBy}
                                    onSortChange={setSortBy}
                                />
                            </div>
                        </aside>

                        {/* Product Grid */}
                        <div className="flex-1">
                            <ProductGrid products={products} isLoading={isLoading} />
                            
                            {/* Pagination */}
                            {!isLoading && totalPages > 1 && (
                                <div className="mt-8 flex justify-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                                page === p
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
