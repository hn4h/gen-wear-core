import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-2xl border border-white/10 max-w-md w-full text-center shadow-xl">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h1>
                    <p className="text-slate-400 mb-8">
                        Cảm ơn bạn đã tin tưởng Gen Wear. Đơn hàng của bạn đã được thanh toán và đang được chúng tôi xử lý.
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
