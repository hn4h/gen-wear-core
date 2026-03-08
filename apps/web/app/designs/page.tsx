'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/src/lib/useAuthStore';
import { designsAPI, SavedDesign } from '@/src/services/designs';
import { useDesignOrderStore } from '@/src/lib/useDesignOrderStore';
import { Header } from '@/src/components/layout/Header';
import { Loader2, Trash2, ShoppingCart, Image as ImageIconLucide } from 'lucide-react';

const Loader2Icon = Loader2 as any;
const Trash2Icon = Trash2 as any;
const ShoppingCartIcon = ShoppingCart as any;
const ImageIcon = ImageIconLucide as any;

export default function SavedDesignsPage() {
    const router = useRouter();
    const { user, isAuthenticated, hasHydrated } = useAuthStore();
    const { setDesign } = useDesignOrderStore();
    
    const [designs, setDesigns] = useState<SavedDesign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        // Wait for Zustand to hydrate from localStorage
        if (!hasHydrated) return;
        
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            router.push('/login?redirect=/designs');
            return;
        }

        fetchDesigns();
    }, [hasHydrated, isAuthenticated, router]);

    const fetchDesigns = async () => {
        try {
            setIsLoading(true);
            const data = await designsAPI.getMyDesigns();
            setDesigns(data);
        } catch (error) {
            console.error('Error fetching designs:', error);
            alert('Lỗi tải danh sách thiết kế');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Bạn có chắc chắn muốn xóa thiết kế này?')) return;
        
        try {
            setDeletingId(id);
            await designsAPI.deleteDesign(id);
            setDesigns(designs.filter(d => d.id !== id));
            alert('Xóa thiết kế thành công');
        } catch (error) {
            console.error('Error deleting design:', error);
            alert('Xóa thiết kế thất bại');
        } finally {
            setDeletingId(null);
        }
    };

    const handleOrder = (design: SavedDesign) => {
        setDesign(design.image_url, design.prompt || '');
        router.push('/checkout?type=design');
    };

    if (!hasHydrated || isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2Icon className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header />
            
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Thiết kế của tôi</h1>
                        <p className="text-slate-400 mt-1">Quản lý và đặt hàng các thiết kế AI bạn đã lưu</p>
                    </div>
                </div>

                {designs.length === 0 ? (
                    <div className="bg-slate-800/50 rounded-2xl border border-white/10 p-12 text-center">
                        <div className="w-20 h-20 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                            <ImageIcon className="w-10 h-10 text-slate-500" />
                        </div>
                        <h2 className="text-xl font-medium text-white mb-2">Chưa có thiết kế nào</h2>
                        <p className="text-slate-400 mb-6">Bạn chưa lưu bất kỳ thiết kế AI nào.</p>
                        <button
                            onClick={() => router.push('/studio')}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Đến AI Studio ngay
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {designs.map(design => (
                            <div key={design.id} className="bg-slate-800/80 rounded-2xl border border-white/10 overflow-hidden flex flex-col group hover:border-purple-500/50 transition-colors">
                                {/* Image Container */}
                                <div className="relative aspect-square w-full bg-slate-900 p-4 border-b border-white/5">
                                    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner bg-slate-800">
                                        <Image
                                            src={design.image_url}
                                            alt={design.prompt || 'Custom AI Design'}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                    
                                    {/* Delete Button (Hover) */}
                                    <button
                                        onClick={(e) => handleDelete(design.id, e)}
                                        disabled={deletingId === design.id}
                                        className="absolute top-6 right-6 p-2.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 disabled:opacity-50"
                                        title="Xóa thiết kế"
                                    >
                                        {deletingId === design.id ? (
                                            <Loader2Icon className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2Icon className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                
                                {/* Info Container */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <p className="text-slate-300 text-sm line-clamp-2 mb-2 italic bg-slate-900/50 p-3 rounded-lg border border-white/5">
                                            "{design.prompt || 'Không có mô tả'}"
                                        </p>
                                        <p className="text-slate-500 text-xs mt-auto">
                                            Lưu lúc: {new Date(design.created_at).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleOrder(design)}
                                        className="mt-5 w-full py-2.5 px-4 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-medium rounded-xl border border-purple-500/30 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCartIcon className="w-4 h-4" />
                                        Mua thiết kế này
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
