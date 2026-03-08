'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, Category, Collection, Tag } from '@/src/services/products';
import { adminProductsAPI } from '@/src/services/admin-products';
import { Loader2, Save, X, Plus, Upload } from 'lucide-react';

const Loader2Icon = Loader2 as any;
const SaveIcon = Save as any;
const XIcon = X as any;
const PlusIcon = Plus as any;
const UploadIcon = Upload as any;

interface ProductFormProps {
    initialData?: Product;
    categories: Category[];
    collections: Collection[];
    availableTags: Tag[];
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
}

export function ProductForm({ 
    initialData, 
    categories, 
    collections, 
    availableTags,
    onSave, 
    onCancel 
}: ProductFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price || 0,
        category_id: initialData?.category_id || '',
        collection_id: initialData?.collection_id || '',
        image_url: initialData?.image_url || '',
        stock: initialData?.stock || 0,
        tags: initialData?.tags?.map(t => t.name) || []
    });
    
    const [newTag, setNewTag] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const { url } = await adminProductsAPI.uploadImage(file);
            setFormData(prev => ({ ...prev, image_url: url }));
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTag = () => {
        if (newTag && !formData.tags.includes(newTag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({ 
            ...prev, 
            tags: prev.tags.filter(tag => tag !== tagToRemove) 
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                    {initialData ? 'Edit Product' : 'New Product'}
                </h3>
                <button 
                    type="button" 
                    onClick={onCancel}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <XIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-32"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Price</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Stock</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Product Image</label>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label 
                                    htmlFor="image-upload"
                                    className={`w-full flex items-center justify-center gap-2 border border-white/10 rounded-xl px-4 py-3 text-white transition-colors ${
                                        isUploadingImage 
                                            ? 'bg-slate-800 cursor-not-allowed opacity-70' 
                                            : 'bg-slate-900 hover:bg-slate-800 cursor-pointer focus-within:ring-2 focus-within:ring-purple-500/50'
                                    }`}
                                >
                                    {isUploadingImage ? (
                                        <>
                                            <Loader2Icon className="w-5 h-5 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <UploadIcon className="w-5 h-5 text-slate-400" />
                                            {formData.image_url ? 'Change Image' : 'Upload Image'}
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                        {formData.image_url && (
                            <img 
                                src={formData.image_url} 
                                alt="Preview" 
                                className="mt-4 w-full h-48 object-cover rounded-xl border border-white/10"
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Category</label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Collection</label>
                            <select
                                value={formData.collection_id}
                                onChange={(e) => setFormData({...formData, collection_id: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option value="">Select Collection</option>
                                {collections.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Tags</label>
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {formData.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg text-sm">
                                    {tag}
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveTag(tag)}
                                        className="hover:text-white"
                                    >
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add custom tag..."
                                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                             <select
                                onChange={(e) => {
                                    if(e.target.value) {
                                        setFormData(prev => {
                                            if(!prev.tags.includes(e.target.value)) {
                                                return { ...prev, tags: [...prev.tags, e.target.value] };
                                            }
                                            return prev;
                                        });
                                        e.target.value = '';
                                    }
                                }}
                                className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option value="">Or select existing...</option>
                                {availableTags.filter(t => !formData.tags.includes(t.name)).map(t => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="p-2 bg-purple-600 rounded-xl text-white hover:bg-purple-500"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <Loader2Icon className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <SaveIcon className="w-4 h-4" />
                            Save Product
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
