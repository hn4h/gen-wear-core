'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import { ordersAPI, Order } from '@/src/services/orders';
import { Loader2, Package, Calendar, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Cast icons
const Loader2Icon = Loader2 as any;
const PackageIcon = Package as any;
const CalendarIcon = Calendar as any;
const MapPinIcon = MapPin as any;
const SparklesIcon = Sparkles as any;

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await ordersAPI.getMyOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'CONFIRMED': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'SHIPPED': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
            case 'DELIVERED': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/50';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header />
            
            <main className="flex-1 pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">Đơn hàng của tôi</h1>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2Icon className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-slate-800/50 rounded-2xl p-12 text-center border border-white/5">
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <PackageIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Chưa có đơn hàng</h2>
                        <p className="text-slate-400 mb-8">Bạn chưa đặt hàng nào.</p>
                        <Link 
                            href="/products"
                            className="inline-block px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors"
                        >
                            Mua sắm ngay
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden">
                                {/* Order Header */}
                                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-white">Đơn hàng #{order.id.slice(0, 8)}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                                {(order as any).custom_notes && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs font-medium">
                                                        <SparklesIcon className="w-3 h-3" />
                                                        Thiết kế AI
                                                    </span>
                                                )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="w-4 h-4" />
                                                {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPinIcon className="w-4 h-4" />
                                                {order.city}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm text-slate-400">Tổng tiền</span>
                                        <span className="text-xl font-bold text-purple-400">{order.total_amount.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                                                    {/* For custom design orders, show design image; otherwise product image */}
                                                    {item.design_image_url ? (
                                                        <img src={item.design_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                                    ) : item.product_image ? (
                                                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xl">🧣</div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-white font-medium">{item.product_name}</h4>
                                                        {item.is_custom_design && (
                                                            <SparklesIcon className="w-4 h-4 text-purple-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-slate-400 text-sm">x{item.quantity}</span>
                                                        <span className="text-white text-sm">{item.price.toLocaleString('vi-VN')}₫</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
