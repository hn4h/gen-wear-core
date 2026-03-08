'use client';

import { Check, X, Sparkles, Zap, Shield, Image as ImageIcon, Loader2, Crown } from "lucide-react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { creditsAPI } from "@/src/services/credits";
import { authAPI } from "@/src/services/auth";
import { useAuthStore } from "@/src/lib/useAuthStore";

interface CreditPackage {
    id: number;
    credits: number;
    price: number;
    price_per_credit: number;
    discount_percentage: number;
}

export default function PricingPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(false);

    const isPro = user?.account_tier === 'PRO';

    useEffect(() => {
        if (isPro) {
            loadCreditPackages();
        }
    }, [isPro]);

    const loadCreditPackages = async () => {
        try {
            setLoadingPackages(true);
            const data = await creditsAPI.getPackages();
            setCreditPackages(data.packages || []);
        } catch (error) {
            console.error("Error loading packages:", error);
        } finally {
            setLoadingPackages(false);
        }
    };

    const handleUpgradeToPro = async () => {
        if (!user) {
            router.push('/login?redirect=/pricing');
            return;
        }
        
        setIsProcessing(true);
        try {
            const baseUrl = window.location.origin;
            const res = await authAPI.upgradeToPro(
                `${baseUrl}/profile`,
                `${baseUrl}/pricing`
            );
            
            if (res.checkout_url) {
                window.location.href = res.checkout_url;
            }
        } catch (error: any) {
            console.error("Error creating PRO upgrade payment:", error);
            alert(error.response?.data?.detail || "Có lỗi xảy ra khi tạo giao dịch. Vui lòng thử lại sau.");
            setIsProcessing(false);
        }
    };

    const handleUpgradeToUltra = async () => {
        if (!user) {
            router.push('/login?redirect=/pricing');
            return;
        }
        
        setIsProcessing(true);
        try {
            const baseUrl = window.location.origin;
            const res = await authAPI.upgradeToUltra(
                `${baseUrl}/profile`,
                `${baseUrl}/pricing`
            );
            
            if (res.checkout_url) {
                window.location.href = res.checkout_url;
            }
        } catch (error: any) {
            console.error("Error creating ULTRA upgrade payment:", error);
            alert(error.response?.data?.detail || "Có lỗi xảy ra khi tạo giao dịch. Vui lòng thử lại sau.");
            setIsProcessing(false);
        }
    };

    const handlePurchaseCredits = async (packageId: number) => {
        if (!user) {
            router.push('/login?redirect=/pricing');
            return;
        }

        if (!isPro) {
            alert("Bạn cần nâng cấp lên PRO trước để mua gói credits!");
            return;
        }
        
        setIsProcessing(true);
        try {
            const baseUrl = window.location.origin;
            const res = await creditsAPI.purchase({
                package_id: packageId,
                return_url: `${baseUrl}/profile`,
                cancel_url: `${baseUrl}/pricing`
            });
            
            if (res.checkout_url) {
                window.location.href = res.checkout_url;
            }
        } catch (error: any) {
            console.error("Error creating payment link:", error);
            alert(error.response?.data?.detail || "Có lỗi xảy ra khi tạo giao dịch. Vui lòng thử lại sau.");
            setIsProcessing(false);
        }
    };
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 text-slate-200 selection:bg-purple-500/30 font-sans">
            <Header />
            
            <div className="relative py-24 sm:py-32 overflow-hidden pt-32">
                {/* Background glowing effects to match Hero */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30"></div>
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute top-40 -left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
                
                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 mt-10">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-base font-semibold leading-7 text-pink-400 uppercase tracking-widest">Nâng cấp trải nghiệm</h2>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            {isPro ? 'Mua thêm Credits' : 'Chọn gói AI phù hợp'}
                        </p>
                        <p className="mt-6 text-lg leading-8 text-slate-300">
                            {isPro 
                                ? 'Bạn đã là thành viên PRO! Mua thêm credits để tiếp tục sáng tạo không giới hạn.'
                                : 'Khơi nguồn sáng tạo không giới hạn với công nghệ AI tạo sinh của Gen Wear. Bắt đầu miễn phí hoặc nâng cấp để mở khóa toàn bộ tính năng cao cấp.'
                            }
                        </p>
                    </div>

                    {!isPro ? (
                        /* Free vs Pro vs Ultra comparison */
                        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-7xl lg:grid-cols-3 lg:gap-x-6">
                        {/* Free Tier */}
                        <div className="flex flex-col justify-between rounded-3xl bg-slate-800/40 p-8 ring-1 ring-white/10 xl:p-10 backdrop-blur-md transition-all hover:bg-slate-800/60 duration-300">
                            <div>
                                <div className="flex items-center justify-between gap-x-4">
                                    <h3 className="text-2xl font-semibold leading-8 text-white">Khởi đầu</h3>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-slate-400">
                                    Hoàn hảo để trải nghiệm và khám phá sức mạnh của AI.
                                </p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-white">Miễn phí</span>
                                </p>
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-300">
                                    <li className="flex gap-x-3 items-center">
                                        <Check className="h-5 w-5 flex-none text-purple-400" aria-hidden="true" />
                                        <span><strong className="text-white">5 Credits</strong> mỗi ngày</span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <Check className="h-5 w-5 flex-none text-purple-400" aria-hidden="true" />
                                        <span>Độ phân giải tiêu chuẩn (1K)</span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <Check className="h-5 w-5 flex-none text-purple-400" aria-hidden="true" />
                                        <span>Tạo ảnh cơ bản từ văn bản</span>
                                    </li>
                                    <li className="flex gap-x-3 items-center text-slate-500">
                                        <X className="h-5 w-5 flex-none" aria-hidden="true" />
                                        <span className="line-through">Không có dấu bản quyền (Watermark)</span>
                                    </li>
                                    <li className="flex gap-x-3 items-center text-slate-500">
                                        <X className="h-5 w-5 flex-none" aria-hidden="true" />
                                        <span className="line-through">Chỉnh sửa vùng (Inpainting)</span>
                                    </li>
                                    <li className="flex gap-x-3 items-center text-slate-500">
                                        <X className="h-5 w-5 flex-none" aria-hidden="true" />
                                        <span className="line-through">Hàng đợi AI ưu tiên</span>
                                    </li>
                                </ul>
                            </div>
                            <Link
                                href="/studio"
                                className="mt-8 block rounded-xl bg-white/5 px-3 py-3 text-center text-sm font-semibold leading-6 text-white hover:bg-white/10 ring-1 ring-white/10 transition-all duration-200"
                            >
                                Bắt đầu ngay
                            </Link>
                        </div>

                        {/* Pro Tier */}
                        <div className="flex flex-col justify-between rounded-3xl bg-purple-900/40 p-8 ring-2 ring-purple-500 xl:p-10 relative overflow-hidden backdrop-blur-md shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-[40px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between gap-x-4">
                                    <h3 className="flex items-center gap-2 text-2xl font-semibold leading-8 text-white">
                                        <Sparkles className="h-6 w-6 text-pink-400" />
                                        Pro
                                    </h3>
                                    <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold leading-5 text-purple-300 ring-1 ring-inset ring-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                        Khuyên dùng
                                    </span>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-slate-300">
                                    Dành cho nhà thiết kế và nhà kinh doanh chuyên nghiệp.
                                </p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-white">99.000đ</span>
                                    <span className="text-sm font-semibold leading-6 text-slate-400">/ 30 ngày</span>
                                </p>
                                <p className="mt-2 text-xs text-purple-300/80 uppercase tracking-wide">20 credits miễn phí mỗi ngày</p>
                                
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-200">
                                    <li className="flex gap-x-3 items-center">
                                        <Check className="h-5 w-5 flex-none text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" aria-hidden="true" />
                                        <span><strong className="text-white">20 credits miễn phí</strong> mỗi ngày</span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <Check className="h-5 w-5 flex-none text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" aria-hidden="true" />
                                        <span>Mở khóa <strong className="text-white">Full toàn bộ tính năng</strong></span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <Zap className="h-5 w-5 flex-none text-purple-400" aria-hidden="true" />
                                        <span>Độ phân giải siêu nét (Hỗ trợ <strong className="text-white">2K, 4K</strong>)</span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <Shield className="h-5 w-5 flex-none text-purple-400" aria-hidden="true" />
                                        <span>Hoàn toàn <strong className="text-white">không có dấu bản quyền</strong></span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <ImageIcon className="h-5 w-5 flex-none text-purple-400" aria-hidden="true" />
                                        <span>Hỗ trợ <strong className="text-white">Chỉnh sửa vùng ảnh</strong> (Inpainting) chuyên sâu</span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <Check className="h-5 w-5 flex-none text-purple-400" aria-hidden="true" />
                                        <span>Máy chủ cấu hình cao, tạo ảnh được ưu tiên</span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <Crown className="h-5 w-5 flex-none text-purple-400" aria-hidden="true" />
                                        <span>Có thể <strong className="text-white">mua thêm gói credits</strong> không giới hạn</span>
                                    </li>
                                </ul>
                            </div>
                            <button
                                onClick={handleUpgradeToPro}
                                disabled={isProcessing}
                                className="mt-8 flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-3 text-center text-sm font-bold leading-6 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:from-purple-700 hover:to-pink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 transition-all duration-200 relative z-10 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    'Nâng cấp PRO ngay'
                                )}
                            </button>
                        </div>

                        {/* Ultra Tier */}
                        <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-orange-900/50 via-red-900/50 to-pink-900/50 p-8 ring-2 ring-orange-500 xl:p-10 relative overflow-hidden backdrop-blur-md shadow-[0_0_50px_-10px_rgba(249,115,22,0.4)]">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/30 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/30 blur-[50px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between gap-x-4">
                                    <h3 className="flex items-center gap-2 text-2xl font-semibold leading-8 text-white">
                                        Ultra 🔥
                                    </h3>
                                    <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold leading-5 text-orange-200 ring-1 ring-inset ring-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                                        Best Value
                                    </span>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-slate-200">
                                    Dành cho creator & studio chuyên nghiệp.
                                </p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-white">299.000đ</span>
                                    <span className="text-sm font-semibold leading-6 text-slate-300">/ 30 ngày</span>
                                </p>
                                <p className="mt-2 text-xs text-orange-300/80 uppercase tracking-wide">100 credits miễn phí mỗi ngày</p>
                                
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-200">
                                    <li className="flex gap-x-3 items-center">
                                        <Check className="h-5 w-5 flex-none text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" aria-hidden="true" />
                                        <span><strong className="text-white">100 credits miễn phí</strong> mỗi ngày</span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <Zap className="h-5 w-5 flex-none text-orange-400" aria-hidden="true" />
                                        <span>Render <strong className="text-white">tốc độ cao nhất</strong></span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <Check className="h-5 w-5 flex-none text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" aria-hidden="true" />
                                        <span>Upscale <strong className="text-white">8K siêu nét</strong></span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <ImageIcon className="h-5 w-5 flex-none text-orange-400" aria-hidden="true" />
                                        <span><strong className="text-white">Outpainting & Remove Object AI</strong></span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <Check className="h-5 w-5 flex-none text-orange-400" aria-hidden="true" />
                                        <span>Lưu <strong className="text-white">prompt & workflow</strong></span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <Sparkles className="h-5 w-5 flex-none text-orange-400" aria-hidden="true" />
                                        <span>Truy cập <strong className="text-white">AI model mới sớm nhất</strong></span>
                                    </li>
                                    <li className="flex gap-x-3 items-center">
                                        <Crown className="h-5 w-5 flex-none text-orange-400" aria-hidden="true" />
                                        <span>Toàn bộ tính năng <strong className="text-white">Pro + Advanced</strong></span>
                                    </li>
                                </ul>
                            </div>
                            <button
                                onClick={handleUpgradeToUltra}
                                disabled={isProcessing}
                                className="mt-8 flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-3 py-3 text-center text-sm font-bold leading-6 text-white shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:shadow-[0_0_30px_rgba(249,115,22,0.7)] hover:from-orange-700 hover:to-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 transition-all duration-200 relative z-10 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    'Nâng cấp Ultra ngay'
                                )}
                            </button>
                        </div>
                    </div>
                    ) : (
                        /* Credit Packages for PRO users */
                        <div className="mx-auto mt-16 max-w-7xl">
                            {/* Ultra Upgrade Card for PRO users */}
                            <div className="mb-12 mx-auto max-w-3xl">
                                <div className="rounded-3xl bg-gradient-to-br from-orange-900/50 via-red-900/50 to-pink-900/50 p-8 ring-2 ring-orange-500 backdrop-blur-md shadow-[0_0_50px_-10px_rgba(249,115,22,0.4)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/30 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/30 blur-[50px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
                                    
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-2xl font-bold text-white">Nâng cấp lên Ultra 🔥</h3>
                                                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-200 ring-1 ring-inset ring-orange-500/30">
                                                    Giảm giá đặc biệt
                                                </span>
                                            </div>
                                            <p className="text-slate-200 mb-4">
                                                Mở khóa toàn bộ tính năng cao cấp với <strong className="text-white">100 credits miễn phí mỗi ngày</strong>
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="h-4 w-4 text-orange-400" />
                                                    <span className="text-slate-200">Render siêu nhanh</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-orange-400" />
                                                    <span className="text-slate-200">Upscale 8K</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ImageIcon className="h-4 w-4 text-orange-400" />
                                                    <span className="text-slate-200">AI Tools nâng cao</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4 text-orange-400" />
                                                    <span className="text-slate-200">AI model mới nhất</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center md:items-end gap-3">
                                            <div className="text-center md:text-right">
                                                <p className="text-3xl font-bold text-white">299.000đ</p>
                                                <p className="text-sm text-slate-300">/ 30 ngày</p>
                                            </div>
                                            <button
                                                onClick={handleUpgradeToUltra}
                                                disabled={isProcessing}
                                                className="whitespace-nowrap rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:shadow-[0_0_30px_rgba(249,115,22,0.7)] hover:from-orange-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    'Nâng cấp ngay'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Credit Packages Section */}
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">Hoặc mua thêm Credits</h3>
                                <p className="text-slate-400">Tăng thêm credits để tiếp tục sáng tạo</p>
                            </div>
                            
                            {loadingPackages ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {creditPackages.map((pkg) => (
                                        <div key={pkg.id} className="flex flex-col justify-between rounded-3xl bg-slate-800/40 p-6 ring-1 ring-white/10 backdrop-blur-md hover:bg-slate-800/60 transition-all duration-300 relative overflow-hidden">
                                            {pkg.discount_percentage > 0 && (
                                                <div className="absolute top-4 right-4 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    -{pkg.discount_percentage}%
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-2">
                                                    {pkg.credits} Credits
                                                </h3>
                                                <p className="text-3xl font-bold text-white mb-1">
                                                    {pkg.price.toLocaleString('vi-VN')}đ
                                                </p>
                                                <p className="text-sm text-slate-400 mb-4">
                                                    {pkg.price_per_credit.toLocaleString('vi-VN')}đ/credit
                                                </p>
                                                <p className="text-xs text-purple-300/80 mb-6">
                                                    Thời hạn: 30 ngày
                                                </p>
                                                <ul className="space-y-2 text-sm text-slate-300">
                                                    <li className="flex items-center gap-2">
                                                        <Check className="h-4 w-4 text-purple-400" />
                                                        <span>{pkg.credits} lượt tạo ảnh</span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <Check className="h-4 w-4 text-purple-400" />
                                                        <span>Không giới hạn độ phân giải</span>
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <Check className="h-4 w-4 text-purple-400" />
                                                        <span>Không có watermark</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <button
                                                onClick={() => handlePurchaseCredits(pkg.id)}
                                                disabled={isProcessing}
                                                className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-bold text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    'Mua gói ngay'
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* FAQ Area */}
                    <div className="mt-32 mx-auto max-w-4xl text-center pb-16">
                        <div className="bg-slate-800/30 rounded-3xl p-8 ring-1 ring-white/10 backdrop-blur-md">
                            <h3 className="text-xl font-bold text-white mb-6">
                                {isPro ? 'Credits PRO hoạt động như thế nào?' : 'Trợ lý Tín dụng hoạt động như thế nào?'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-sm">
                                <div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 ring-1 ring-pink-500/20 mb-4">
                                        <Zap className="h-5 w-5 text-pink-400 flex-shrink-0" />
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Chi phí thực thi AI</h4>
                                    <p className="text-slate-400">Mỗi yêu cầu tạo mẫu thiết kế hoặc chỉnh sửa chi tiết sẽ sử dụng 1 credit trên hệ thống.</p>
                                </div>
                                <div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 ring-1 ring-purple-500/20 mb-4">
                                        <Check className="h-5 w-5 text-purple-400 flex-shrink-0" />
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Credits miễn phí</h4>
                                    <p className="text-slate-400">
                                        {isPro 
                                            ? 'PRO users được cấp 20 credits mỗi ngày (reset 0:00). Credits miễn phí không tích lũy.'
                                            : 'Tài khoản mặc định được cấp 5 lượt mỗi ngày (làm mới lúc 0:00). Lượt miễn phí không được tích lũy cộng dồn.'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 ring-1 ring-purple-500/20 mb-4">
                                        <Shield className="h-5 w-5 text-purple-400 flex-shrink-0" />
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Quyền lợi Pro</h4>
                                    <p className="text-slate-400">
                                        {isPro
                                            ? 'Credits gói mua có thời hạn 30 ngày, mở khóa toàn bộ sức mạnh AI với ảnh nét hơn, không logo.'
                                            : 'Credits gói Pro có thời hạn trong 30 ngày và mở khóa toàn bộ sức mạnh AI với ảnh nét hơn, không bị đóng logo.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}
