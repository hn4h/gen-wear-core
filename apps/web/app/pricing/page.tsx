import { Check, X, Sparkles, Zap, Shield, Image as ImageIcon } from "lucide-react";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import Link from "next/link";

export default function PricingPage() {
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
                            Chọn gói AI phù hợp
                        </p>
                        <p className="mt-6 text-lg leading-8 text-slate-300">
                            Khơi nguồn sáng tạo không giới hạn với công nghệ AI tạo sinh của Gen Wear. Bắt đầu miễn phí hoặc nâng cấp để mở khóa toàn bộ tính năng cao cấp.
                        </p>
                    </div>

                    <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8">
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
                                    <span className="text-4xl font-bold tracking-tight text-white">100.000đ</span>
                                    <span className="text-sm font-semibold leading-6 text-slate-400">/ 20 credits</span>
                                </p>
                                <p className="mt-2 text-xs text-purple-300/80 uppercase tracking-wide">Thời hạn sử dụng 30 ngày</p>
                                
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-200">
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
                                </ul>
                            </div>
                            <Link
                                href="/checkout/credits"
                                className="mt-8 block rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-3 text-center text-sm font-bold leading-6 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:from-purple-700 hover:to-pink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 transition-all duration-200 relative z-10 transform hover:scale-105"
                            >
                                Mua gói ngay
                            </Link>
                        </div>
                    </div>
                    
                    {/* FAQ Area */}
                    <div className="mt-32 mx-auto max-w-4xl text-center pb-16">
                        <div className="bg-slate-800/30 rounded-3xl p-8 ring-1 ring-white/10 backdrop-blur-md">
                            <h3 className="text-xl font-bold text-white mb-6">Trợ lý Tín dụng hoạt động như thế nào?</h3>
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
                                    <p className="text-slate-400">Tài khoản mặc định được cấp 5 lượt mỗi ngày (làm mới lúc 0:00). Lượt miễn phí không được tích lũy cộng dồn.</p>
                                </div>
                                <div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 ring-1 ring-purple-500/20 mb-4">
                                        <Shield className="h-5 w-5 text-purple-400 flex-shrink-0" />
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">Quyền lợi Pro</h4>
                                    <p className="text-slate-400">Credits gói Pro có thời hạn trong 30 ngày và mở khóa toàn bộ sức mạnh AI với ảnh nét hơn, không bị đóng logo.</p>
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
