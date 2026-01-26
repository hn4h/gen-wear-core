import { Category, Collection, Tag } from '@/src/services/products';
import { Search, SlidersHorizontal, Tag as TagIcon, Layers } from 'lucide-react';

const SearchIcon = Search as any;
const SlidersIcon = SlidersHorizontal as any;
const TagIconLucide = TagIcon as any;
const LayersIcon = Layers as any;

interface ProductFiltersProps {
    categories: Category[];
    collections: Collection[];
    tags: Tag[];
    selectedCategory: string;
    onCategoryChange: (categoryId: string) => void;
    selectedCollection: string;
    onCollectionChange: (collectionId: string) => void;
    selectedTag: string;
    onTagChange: (tag: string) => void;
    priceRange: [number, number];
    onPriceRangeChange: (range: [number, number]) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
}

export function ProductFilters({
    categories,
    collections,
    tags,
    selectedCategory,
    onCategoryChange,
    selectedCollection,
    onCollectionChange,
    selectedTag,
    onTagChange,
    priceRange,
    onPriceRangeChange,
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange
}: ProductFiltersProps) {
    return (
        <div className="space-y-8">
            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>

            {/* Collections */}
            <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <LayersIcon className="w-5 h-5 text-purple-400" />
                    Collections
                </h3>
                <div className="space-y-2">
                    <button
                        onClick={() => onCollectionChange('')}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                            selectedCollection === '' 
                                ? 'bg-purple-600 text-white' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        All Collections
                    </button>
                    {collections.map((collection) => (
                        <button
                            key={collection.id}
                            onClick={() => onCollectionChange(collection.id)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                selectedCollection === collection.id 
                                    ? 'bg-purple-600 text-white' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {collection.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <SlidersIcon className="w-5 h-5 text-purple-400" />
                    Categories
                </h3>
                <div className="space-y-2">
                    <button
                        onClick={() => onCategoryChange('')}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                            selectedCategory === '' 
                                ? 'bg-purple-600 text-white' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => onCategoryChange(category.id)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                selectedCategory === category.id 
                                    ? 'bg-purple-600 text-white' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tags */}
            <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <TagIconLucide className="w-5 h-5 text-purple-400" />
                    Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onTagChange('')}
                        className={`px-3 py-1 rounded-full text-sm transition-colors border ${
                            selectedTag === ''
                                ? 'bg-purple-600 border-purple-600 text-white'
                                : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                        }`}
                    >
                        All
                    </button>
                    {tags.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => onTagChange(tag.name)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors border ${
                                selectedTag === tag.name
                                    ? 'bg-purple-600 border-purple-600 text-white'
                                    : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                            }`}
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-white font-semibold mb-4">Price Range</h3>
                <div className="space-y-4 px-2">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange[1]}
                        onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                </div>
            </div>

            {/* Sort */}
            <div>
                <h3 className="text-white font-semibold mb-4">Sort By</h3>
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-2 px-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A-Z</option>
                </select>
            </div>
        </div>
    );
}
