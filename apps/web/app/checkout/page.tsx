'use client';

import { useCartStore } from '@/src/lib/useCartStore';
import { useDesignOrderStore } from '@/src/lib/useDesignOrderStore';
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Sparkles, ShoppingCart, Minus, Plus } from 'lucide-react';
import { ordersAPI } from '@/src/services/orders';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Cast icons
const Loader2Icon = Loader2 as any;
const CheckCircle2Icon = CheckCircle2 as any;
const SparklesIcon = Sparkles as any;
const ShoppingCartIcon = ShoppingCart as any;
const MinusIcon = Minus as any;
const PlusIcon = Plus as any;

const DESIGN_PRICE = 299000;

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const isDesignOrder = searchParams.get('type') === 'design';
    
    const { items, totalPrice, clearCart } = useCartStore();
    const { designImageUrl, designPrompt, clearDesign } = useDesignOrderStore();
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [designQuantity, setDesignQuantity] = useState(1);
    
    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        paymentMethod: 'cod'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Redirect if design order but no design image
    useEffect(() => {
        if (isDesignOrder && !designImageUrl) {
            window.location.href = '/studio';
        }
    }, [isDesignOrder, designImageUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            if (isDesignOrder && designImageUrl) {
                // Design order
                await ordersAPI.createOrder({
                    full_name: formData.fullName,
                    phone_number: formData.phone,
                    email: formData.email,
                    address: formData.address,
                    city: formData.city,
                    payment_method: formData.paymentMethod,
                    custom_design_url: designImageUrl,
                    custom_design_notes: designPrompt || 'Khăn thiết kế AI',
                    custom_design_price: DESIGN_PRICE,
                    custom_design_quantity: designQuantity,
                });
                clearDesign();
            } else {
                // Normal cart order
                await ordersAPI.createOrder({
                    full_name: formData.fullName,
                    phone_number: formData.phone,
                    email: formData.email,
                    address: formData.address,
                    city: formData.city,
                    payment_method: formData.paymentMethod,
                });
                clearCart();
            }
            setIsSuccess(true);
        } catch (error) {
            console.error('Failed to create order:', error);
            alert('Đặt hàng thất bại. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-slate-800 p-8 rounded-2xl border border-white/10 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2Icon className="w-8 h-8 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Đặt hàng thành công!</h1>
                        <p className="text-slate-400 mb-8">
                            {isDesignOrder
                                ? 'Cảm ơn bạn đã đặt khăn thiết kế AI. Chúng tôi sẽ liên hệ sớm để xác nhận đơn hàng.'
                                : 'Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ sớm để xác nhận đơn hàng.'}
                        </p>
                        <div className="space-y-3">
                            <Link
                                href="/orders"
                                className="block w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors"
                            >
                                Xem đơn hàng của tôi
                            </Link>
                            <Link
                                href="/"
                                className="block w-full py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-colors"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Empty state for normal checkout
    if (!isDesignOrder && items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <ShoppingCartIcon className="w-16 h-16 text-slate-600 mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-4">Giỏ hàng trống</h1>
                    <Link href="/products" className="text-purple-400 hover:text-purple-300">
                        Tiếp tục mua sắm
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const designTotal = DESIGN_PRICE * designQuantity;

    return (
        <div className="min-h-screen bg-slate-900">
            <Header />
            
            <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Page Title */}
                <div className="flex items-center gap-3 mb-8">
                    <h1 className="text-3xl font-bold text-white">Thanh toán</h1>
                    {isDesignOrder && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium">
                            <SparklesIcon className="w-4 h-4" />
                            Thiết kế AI
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Shipping Form */}
                    <div className="lg:col-span-8">
                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                            <h2 className="text-xl font-bold text-white mb-6">Thông tin giao hàng</h2>
                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Họ và tên</label>
                                        <input 
                                            required
                                            type="text" 
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Số điện thoại</label>
                                        <input 
                                            required
                                            type="tel" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                            placeholder="0912 345 678"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Email</label>
                                    <input 
                                        required
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Địa chỉ</label>
                                    <input 
                                        required
                                        type="text" 
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        placeholder="Số nhà, tên đường, phường/xã"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Thành phố</label>
                                        <input 
                                            required
                                            type="text" 
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                            placeholder="Hồ Chí Minh"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Phương thức thanh toán</label>
                                        <select 
                                            name="paymentMethod"
                                            value={formData.paymentMethod}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                        >
                                            <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                                            <option value="bank">Chuyển khoản ngân hàng</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-6">Đơn hàng của bạn</h2>
                            
                            {/* Design Order Summary */}
                            {isDesignOrder && designImageUrl ? (
                                <div className="mb-6 space-y-4">
                                    {/* Design Preview */}
                                    <div className="relative rounded-xl overflow-hidden border border-purple-500/30 bg-slate-900">
                                        <img 
                                            src={designImageUrl} 
                                            alt="Thiết kế AI của bạn" 
                                            className="w-full aspect-square object-cover"
                                        />
                                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-purple-600/90 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                                            <SparklesIcon className="w-3 h-3" />
                                            Thiết kế AI
                                        </div>
                                    </div>
                                    
                                    {/* Design Details */}
                                    <div>
                                        <h4 className="text-white font-medium mb-1">Khăn thiết kế AI</h4>
                                        {designPrompt && (
                                            <p className="text-slate-400 text-sm line-clamp-2">"{designPrompt}"</p>
                                        )}
                                        <p className="text-purple-400 font-semibold mt-1">
                                            {DESIGN_PRICE.toLocaleString('vi-VN')}₫ / cái
                                        </p>
                                    </div>

                                    {/* Quantity Selector */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 text-sm">Số lượng</span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setDesignQuantity(q => Math.max(1, q - 1))}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                                            >
                                                <MinusIcon className="w-4 h-4" />
                                            </button>
                                            <span className="text-white font-bold w-6 text-center">{designQuantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => setDesignQuantity(q => q + 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Cart Order Summary */
                                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">🧣</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-white text-sm font-medium line-clamp-1">{item.name}</h4>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-slate-400 text-sm">x{item.quantity}</span>
                                                    <span className="text-purple-400 font-medium">
                                                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Price Breakdown */}
                            <div className="border-t border-white/10 pt-4 space-y-2 mb-6">
                                <div className="flex justify-between text-slate-400">
                                    <span>Tạm tính</span>
                                    <span>
                                        {isDesignOrder
                                            ? `${designTotal.toLocaleString('vi-VN')}₫`
                                            : `${totalPrice().toLocaleString('vi-VN')}₫`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Vận chuyển</span>
                                    <span className="text-green-400">Miễn phí</span>
                                </div>
                                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10 mt-2">
                                    <span>Tổng cộng</span>
                                    <span className="text-purple-400">
                                        {isDesignOrder
                                            ? `${designTotal.toLocaleString('vi-VN')}₫`
                                            : `${totalPrice().toLocaleString('vi-VN')}₫`}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={isProcessing}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2Icon className="w-5 h-5 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Đặt hàng ngay'
                                )}
                            </button>
                            
                            {isDesignOrder && (
                                <p className="text-xs text-slate-500 text-center mt-3">
                                    Thiết kế AI của bạn sẽ được in trực tiếp lên khăn
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
