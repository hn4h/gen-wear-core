import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

const XCircleIcon = XCircle as any;

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-2xl border border-white/10 max-w-md w-full text-center shadow-xl">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircleIcon className="w-8 h-8 text-red-500" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-white mb-2">Thanh toán đã bị hủy</h1>
                    <p className="text-slate-400 mb-8">
                        Rất tiếc quá trình thanh toán qua PayOS đã bị hủy bỏ hoặc thất bại. 
                        Đơn hàng của bạn sẽ vẫn được lưu ở trạng thái chờ thanh toán.
                    </p>
                    
                    <div className="space-y-3">
                        <Link
                            href="/checkout"
                            className="block w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors"
                        >
                            Thử lại
                        </Link>
                        <Link
                            href="/orders"
                            className="block w-full py-3 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-colors"
                        >
                            Xem đơn hàng
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
