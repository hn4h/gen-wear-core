'use client';

import { useState, useEffect } from 'react';
import { productsAPI, Category, Collection, Tag } from '@/src/services/products';
import { Loader2, Plus, X, Trash2, Pencil } from 'lucide-react';

const Loader2Icon = Loader2 as any;
const PlusIcon = Plus as any;
const XIcon = X as any;
const Trash2Icon = Trash2 as any;
const PencilIcon = Pencil as any;

export default function AdminCategoriesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Category & Metadata Management</h1>
                <p className="text-slate-400">Manage categories, collections, and tags</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Categories */}
                <ManageSection 
                    title="Categories" 
                    fetcher={productsAPI.getCategories}
                    creator={productsAPI.createCategory}
                    updater={productsAPI.updateCategory}
                    deleter={productsAPI.deleteCategory}
                    hasDescription
                />

                {/* Collections */}
                <ManageSection 
                    title="Collections" 
                    fetcher={productsAPI.getCollections}
                    creator={productsAPI.createCollection}
                    updater={productsAPI.updateCollection}
                    deleter={productsAPI.deleteCollection}
                    hasDescription
                />

                {/* Tags */}
                <ManageSection 
                    title="Tags" 
                    fetcher={productsAPI.getTags}
                    creator={productsAPI.createTag}
                    updater={productsAPI.updateTag}
                    deleter={productsAPI.deleteTag}
                    hasDescription={false}
                />
            </div>
        </div>
    );
}

function ManageSection({ 
    title, 
    fetcher, 
    creator,
    updater,
    deleter,
    hasDescription = false
}: { 
    title: string;
    fetcher: () => Promise<any[]>;
    creator: (name: string, description?: string) => Promise<any>;
    updater: (id: string, name: string, description?: string) => Promise<any>;
    deleter: (id: string) => Promise<void>;
    hasDescription?: boolean;
}) {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingItem, setDeletingItem] = useState<{id: string, name: string} | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const loadItems = async () => {
        try {
            const data = await fetcher();
            setItems(data);
        } catch (e) {
            console.error(e);
            setError('Failed to load items');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, [fetcher]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const openCreateModal = () => {
        setEditingItem(null);
        setName('');
        setDescription('');
        setError(null);
        setShowModal(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setName(item.name);
        setDescription(item.description || '');
        setError(null);
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            if (editingItem) {
                await updater(editingItem.id, name, hasDescription ? description : undefined);
            } else {
                await creator(name, hasDescription ? description : undefined);
            }
            
            setName('');
            setDescription('');
            setEditingItem(null);
            setShowModal(false);
            setSuccess(editingItem ? 'Item updated successfully' : 'Item created successfully');
            loadItems();
        } catch (error: any) {
            console.error('Submit error:', error);
            setError(error.response?.data?.detail || 'Failed to submit');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id: string, itemName: string) => {
        setDeletingItem({ id, name: itemName });
        setError(null);
    };

    const executeDelete = async () => {
        if (!deletingItem) return;

        setIsDeleting(true);
        setError(null);
        try {
            await deleter(deletingItem.id);
            setSuccess(`"${deletingItem.name}" deleted successfully`);
            setDeletingItem(null);
            loadItems();
        } catch (error: any) {
            console.error('Delete error:', error);
            // Show error in the modal
            setError(error.response?.data?.detail || 'Failed to delete. The item might be in use.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 h-[500px] flex flex-col relative">
                {/* Success Message */}
                {success && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-green-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-fade-in-down">
                        {success}
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button 
                        onClick={openCreateModal}
                        className="p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2Icon className="w-6 h-6 animate-spin text-purple-600" />
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center group hover:border-purple-500/30 transition-colors">
                                <div className="flex-1">
                                    <span className="text-slate-300 font-medium">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-500/20 rounded-lg transition-all"
                                    >
                                        <PencilIcon className="w-4 h-4 text-blue-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(item.id, item.name)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                                    >
                                        <Trash2Icon className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    {!isLoading && items.length === 0 && (
                        <p className="text-slate-500 text-center py-4">No items found</p>
                    )}
                </div>
            </div>

            {/* Edit/Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">
                                {editingItem ? 'Edit ' : 'Add '}{title.slice(0, -1)}
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Error within modal */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="Enter name..."
                                />
                            </div>

                            {hasDescription && (
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Description (Optional)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-24"
                                        placeholder="Enter description..."
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
                            <button 
                                onClick={() => setDeletingItem(null)}
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="mb-8">
                            <p className="text-slate-300">
                                Are you sure you want to delete <span className="text-white font-semibold">"{deletingItem.name}"</span>?
                                <br />
                                <span className="text-sm text-red-400 mt-2 block">This action cannot be undone.</span>
                            </p>
                        </div>

                        {/* Error within modal */}
                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingItem(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50 shadow-lg shadow-red-900/20"
                            >
                                {isDeleting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2Icon className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </span>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
