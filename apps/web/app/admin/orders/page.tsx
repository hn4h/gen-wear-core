'use client';

import { useEffect, useState } from 'react';
import { ordersAPI, Order } from '@/src/services/orders';
import { Loader2, Package, Search, Filter, ChevronLeft, ChevronRight, MoreVertical, X, Check } from 'lucide-react';
import { useAuthStore } from '@/src/lib/useAuthStore';
import { useRouter } from 'next/navigation';

// Cast icons
const Loader2Icon = Loader2 as any;
const SearchIcon = Search as any;
const FilterIcon = Filter as any;
const ChevronLeftIcon = ChevronLeft as any;
const ChevronRightIcon = ChevronRight as any;
const MoreVerticalIcon = MoreVertical as any;
const XIcon = X as any;
const CheckIcon = Check as any;
const PackageIcon = Package as any;

export default function AdminOrdersPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        // Protect Route
        if (user && user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, router]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await ordersAPI.getAllOrders(page, statusFilter);
            setOrders(data.orders);
            setTotalPages(data.total_pages);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchOrders();
        }
    }, [page, statusFilter, user]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await ordersAPI.updateOrderStatus(orderId, newStatus);
            // Refresh list or update local state
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status");
        }
    };

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

    if (!user || user.role !== 'ADMIN') {
        return null; 
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-white">Order Management</h1>
                
                <div className="flex items-center gap-4">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-800 border border-white/10 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Orders List */}
                <div className="lg:col-span-1 bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                    <div className="p-4 border-b border-white/5 bg-slate-800/80">
                        <h2 className="font-bold text-white">Orders List</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2Icon className="w-6 h-6 text-purple-500 animate-spin" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No orders found</div>
                        ) : (
                            orders.map(order => (
                                <div 
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`p-4 rounded-xl cursor-pointer transition-colors border ${
                                        selectedOrder?.id === order.id 
                                            ? 'bg-purple-600/20 border-purple-500/50' 
                                            : 'bg-slate-800 border-white/5 hover:bg-slate-700'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono text-sm text-slate-300">#{order.id.slice(0, 8)}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-white font-medium text-sm">{order.full_name}</p>
                                            <p className="text-slate-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <p className="text-purple-400 font-bold">${order.total_amount.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-white/5 bg-slate-800/80 flex justify-between items-center">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeftIcon className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRightIcon className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Order Details */}
                <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden h-[calc(100vh-200px)] overflow-y-auto">
                    {selectedOrder ? (
                        <div className="p-6 md:p-8 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold text-white">Order #{selectedOrder.id}</h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-400">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                                
                                <div className="flex gap-2">
                                    {/* Status Actions */}
                                    {selectedOrder.status === 'PENDING' && (
                                        <>
                                            <button 
                                                onClick={() => handleStatusUpdate(selectedOrder.id, 'CONFIRMED')}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors"
                                            >
                                                Confirm
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(selectedOrder.id, 'CANCELLED')}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    {selectedOrder.status === 'CONFIRMED' && (
                                        <button 
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'SHIPPED')}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm transition-colors"
                                        >
                                            Mark Shipped
                                        </button>
                                    )}
                                    {selectedOrder.status === 'SHIPPED' && (
                                        <button 
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'DELIVERED')}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition-colors"
                                        >
                                            Mark Delivered
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Customer Info</h3>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <span className="text-slate-400">Name:</span>
                                        <span className="text-white col-span-2 font-medium">{selectedOrder.full_name}</span>
                                        
                                        <span className="text-slate-400">Email:</span>
                                        <span className="text-white col-span-2 font-medium">{selectedOrder.email}</span>
                                        
                                        <span className="text-slate-400">Phone:</span>
                                        <span className="text-white col-span-2 font-medium">{selectedOrder.phone_number}</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Shipping Info</h3>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <span className="text-slate-400">Address:</span>
                                        <span className="text-white col-span-2 font-medium">{selectedOrder.address}</span>
                                        
                                        <span className="text-slate-400">City:</span>
                                        <span className="text-white col-span-2 font-medium">{selectedOrder.city}</span>
                                        
                                        <span className="text-slate-400">Payment:</span>
                                        <span className="text-white col-span-2 font-medium">{selectedOrder.payment_method}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Order Items</h3>
                                <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-white/5">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-800 text-slate-400 font-medium">
                                            <tr>
                                                <th className="p-4">Product</th>
                                                <th className="p-4 text-center">Qty</th>
                                                <th className="p-4 text-right">Price</th>
                                                <th className="p-4 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {selectedOrder.items.map(item => (
                                                <tr key={item.id} className="text-white">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-slate-800 rounded mb-0 flex-shrink-0 overflow-hidden">
                                                                {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover"/>}
                                                            </div>
                                                            <span className="font-medium">{item.product_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">{item.quantity}</td>
                                                    <td className="p-4 text-right">${item.price.toLocaleString()}</td>
                                                    <td className="p-4 text-right text-purple-400 font-bold">${(item.quantity * item.price).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-800/50 font-bold text-white">
                                            <tr>
                                                <td colSpan={3} className="p-4 text-right">Total Amount</td>
                                                <td className="p-4 text-right text-lg">${selectedOrder.total_amount.toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <PackageIcon className="w-16 h-16 opacity-20 mb-4" />
                            <p>Select an order to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
