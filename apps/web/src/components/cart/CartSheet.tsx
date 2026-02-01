'use client';

import { useCartStore } from '@/src/lib/useCartStore';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Cast icons
const XIcon = X as any;
const PlusIcon = Plus as any;
const MinusIcon = Minus as any;
const TrashIcon = Trash2 as any;

export function CartSheet() {
    const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">Your Cart ({items.length})</h2>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl">
                                    🛒
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-white">Your cart is empty</h3>
                                    <p className="text-slate-400 mt-1">Looks like you haven't added anything yet.</p>
                                </div>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    {/* Image */}
                                    <div className="w-20 h-24 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">👕</div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-medium text-white line-clamp-1">{item.name}</h3>
                                            <p className="text-sm text-slate-400">${item.price.toLocaleString()}</p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-1">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded"
                                                >
                                                    <MinusIcon className="w-3 h-3" />
                                                </button>
                                                <span className="text-sm font-medium text-white w-4 text-center">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded"
                                                >
                                                    <PlusIcon className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <button 
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="p-6 bg-slate-800/50 border-t border-white/10 space-y-4">
                            <div className="flex items-center justify-between text-lg font-bold text-white">
                                <span>Total</span>
                                <span>${totalPrice().toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsOpen(false);
                                    window.location.href = '/checkout';
                                }}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                            >
                                Checkout
                            </button>
                            <p className="text-xs text-center text-slate-500">
                                Shipping & taxes calculated at checkout
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
