'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '@/src/lib/useAuthStore';
import {
    Users, ShoppingBag, TrendingUp, Cpu, FileText,
    Heart, MessageCircle, Package, DollarSign, Activity,
    ArrowUp, ArrowDown, Clock
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─── Icon casts ───────────────────────────────────────────────────────────────
const UsersIcon = Users as any;
const ShoppingBagIcon = ShoppingBag as any;
const TrendingUpIcon = TrendingUp as any;
const CpuIcon = Cpu as any;
const FileTextIcon = FileText as any;
const HeartIcon = Heart as any;
const MessageIcon = MessageCircle as any;
const PackageIcon = Package as any;
const DollarSignIcon = DollarSign as any;
const ActivityIcon = Activity as any;
const ArrowUpIcon = ArrowUp as any;
const ClockIcon = Clock as any;

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
    label, value, subLabel, subValue, icon: Icon, gradient, iconColor,
}: {
    label: string; value: string | number; subLabel?: string; subValue?: string | number;
    icon: any; gradient: string; iconColor: string;
}) {
    return (
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${gradient}`} />
            <div className="relative">
                <div className={`inline-flex p-2.5 rounded-xl ${gradient} bg-opacity-20 mb-3`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {subLabel && (
                    <p className="text-xs text-slate-500 mt-1">
                        <span className="text-emerald-400">{subValue}</span> {subLabel}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Mini Sparkline SVG ───────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data, 1);
    const w = 100; const h = 40;
    const step = w / (data.length - 1);
    const pts = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
    const fillPts = `0,${h} ${pts} ${(data.length - 1) * step},${h}`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
            <polygon points={fillPts} fill={color} fillOpacity="0.15" />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, labels, color, unit = '' }: {
    data: number[]; labels: string[]; color: string; unit?: string;
}) {
    const max = Math.max(...data, 1);
    const step = Math.max(1, Math.ceil(data.length / 8));
    const visLabels = labels.filter((_, i) => i % step === 0);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-end gap-0.5 h-36 w-full">
                {data.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end group relative">
                        <div
                            className="rounded-t transition-all duration-300 hover:opacity-80"
                            style={{ height: `${Math.max((v / max) * 100, v > 0 ? 4 : 0)}%`, background: color, opacity: 0.8 }}
                        />
                        {v > 0 && (
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-700 text-xs px-1.5 py-0.5 rounded text-white whitespace-nowrap opacity-0 group-hover:opacity-100 z-10 pointer-events-none">
                                {unit}{v.toLocaleString('vi-VN')}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-slate-600">
                {visLabels.map((l, i) => <span key={i}>{l.slice(5)}</span>)}
            </div>
        </div>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING:   { label: 'Chờ xử lý', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    SHIPPED:   { label: 'Đang giao', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    DELIVERED: { label: 'Đã giao', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    CANCELLED: { label: 'Đã hủy', color: 'text-red-400', bg: 'bg-red-500/10' },
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
    const r = 40; const cx = 50; const cy = 50;
    let angle = -Math.PI / 2;
    const paths = segments.map((seg) => {
        const pct = seg.value / total;
        const endAngle = angle + pct * 2 * Math.PI;
        const x1 = cx + r * Math.cos(angle); const y1 = cy + r * Math.sin(angle);
        const x2 = cx + r * Math.cos(endAngle); const y2 = cy + r * Math.sin(endAngle);
        const largeArc = pct > 0.5 ? 1 : 0;
        const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        const result = { d, color: seg.color };
        angle = endAngle;
        return result;
    });

    return (
        <div className="flex items-center gap-4">
            <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
                {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} opacity={0.85} />)}
                <circle cx={cx} cy={cy} r={24} fill="#1e293b" />
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">{total}</text>
            </svg>
            <div className="space-y-1.5 flex-1">
                {segments.map((seg, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                            <span className="text-slate-400">{seg.label}</span>
                        </div>
                        <span className="text-white font-medium">{seg.value} <span className="text-slate-500">({Math.round(seg.value / total * 100)}%)</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Stats {
    total_users: number; new_users_today: number;
    total_products: number; total_orders: number;
    total_revenue: number; revenue_today: number;
    orders_by_status: Record<string, number>;
    total_ai_generations: number; ai_generations_today: number;
    total_blog_posts: number; total_comments: number; total_likes: number;
    chart_days: string[]; chart_new_users: number[]; chart_orders: number[];
    chart_revenue: number[]; chart_ai_gens: number[];
}

type ChartTab = 'revenue' | 'orders' | 'users' | 'ai';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartTab, setChartTab] = useState<ChartTab>('revenue');
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const loadStats = async () => {
        try {
            const token = getAuthToken();
            const res = await axios.get(`${API_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
            setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
        } catch (e) {
            console.error('Failed to load stats', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 60_000); // auto-refresh every 60s
        return () => clearInterval(interval);
    }, []);

    const fmtCurrency = (n: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Đang tải dữ liệu thống kê...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-20 text-slate-400">
                Không thể tải dữ liệu. Vui lòng thử lại.
            </div>
        );
    }

    const orderDonut = Object.entries(stats.orders_by_status).map(([status, count]) => ({
        label: STATUS_CONFIG[status]?.label || status,
        value: count,
        color: status === 'PENDING' ? '#facc15' : status === 'CONFIRMED' ? '#60a5fa'
            : status === 'SHIPPED' ? '#a78bfa' : status === 'DELIVERED' ? '#34d399'
            : '#f87171',
    }));

    const chartData: Record<ChartTab, { data: number[]; color: string; label: string; unit?: string }> = {
        revenue: { data: stats.chart_revenue, color: '#a855f7', label: 'Doanh thu (VND)', unit: '₫' },
        orders: { data: stats.chart_orders, color: '#3b82f6', label: 'Số đơn hàng', unit: '' },
        users: { data: stats.chart_new_users, color: '#10b981', label: 'Người dùng mới', unit: '' },
        ai: { data: stats.chart_ai_gens, color: '#f59e0b', label: 'Lượt gen AI', unit: '' },
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Tổng quan hệ thống</h1>
                    <p className="text-slate-400 text-sm flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5" />
                        Cập nhật lúc {lastUpdated} · Tự động làm mới mỗi 60 giây
                    </p>
                </div>
                <button onClick={loadStats} className="px-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-slate-300 hover:border-purple-500/50 hover:text-white transition-all text-sm flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4" /> Làm mới
                </button>
            </div>

            {/* ── Stat Cards Row 1: Core Metrics ── */}
            <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-widest mb-3">Chỉ số cốt lõi</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Người dùng" value={stats.total_users.toLocaleString('vi-VN')}
                        subLabel="đăng ký hôm nay" subValue={`+${stats.new_users_today}`}
                        icon={UsersIcon} gradient="bg-blue-500" iconColor="text-blue-400" />
                    <StatCard label="Tổng doanh thu" value={fmtCurrency(stats.total_revenue)}
                        subLabel="hôm nay" subValue={fmtCurrency(stats.revenue_today)}
                        icon={DollarSignIcon} gradient="bg-purple-500" iconColor="text-purple-400" />
                    <StatCard label="Tổng đơn hàng" value={stats.total_orders.toLocaleString('vi-VN')}
                        subLabel="trạng thái pending" subValue={stats.orders_by_status['PENDING'] || 0}
                        icon={PackageIcon} gradient="bg-pink-500" iconColor="text-pink-400" />
                    <StatCard label="Sản phẩm" value={stats.total_products.toLocaleString('vi-VN')}
                        icon={ShoppingBagIcon} gradient="bg-emerald-500" iconColor="text-emerald-400" />
                </div>
            </div>

            {/* ── Stat Cards Row 2: AI + Blog ── */}
            <div>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-widest mb-3">Tương tác & Nội dung</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Lượt gen AI" value={stats.total_ai_generations.toLocaleString('vi-VN')}
                        subLabel="lượt hôm nay" subValue={`+${stats.ai_generations_today}`}
                        icon={CpuIcon} gradient="bg-amber-500" iconColor="text-amber-400" />
                    <StatCard label="Bài Blog" value={stats.total_blog_posts.toLocaleString('vi-VN')}
                        icon={FileTextIcon} gradient="bg-cyan-500" iconColor="text-cyan-400" />
                    <StatCard label="Bình luận" value={stats.total_comments.toLocaleString('vi-VN')}
                        icon={MessageIcon} gradient="bg-indigo-500" iconColor="text-indigo-400" />
                    <StatCard label="Lượt Thích" value={stats.total_likes.toLocaleString('vi-VN')}
                        icon={HeartIcon} gradient="bg-rose-500" iconColor="text-rose-400" />
                </div>
            </div>

            {/* ── Main Chart: 30-day Activity ── */}
            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <h3 className="text-lg font-semibold text-white">Hoạt động 30 ngày qua</h3>
                    <div className="flex gap-1.5">
                        {(Object.keys(chartData) as ChartTab[]).map(tab => (
                            <button key={tab} onClick={() => setChartTab(tab)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    chartTab === tab
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                                }`}>
                                {chartData[tab].label}
                            </button>
                        ))}
                    </div>
                </div>
                <BarChart
                    data={chartData[chartTab].data}
                    labels={stats.chart_days}
                    color={chartData[chartTab].color}
                    unit={chartData[chartTab].unit}
                />
            </div>

            {/* ── Second Row: Order status + Sparklines ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Breakdown */}
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-5">Trạng thái đơn hàng</h3>
                    {orderDonut.length > 0 ? (
                        <DonutChart segments={orderDonut} />
                    ) : (
                        <p className="text-slate-500 text-center py-8">Chưa có đơn hàng nào</p>
                    )}
                </div>

                {/* Platform Highlights */}
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-5">Hoạt động nền tảng</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Người dùng mới', data: stats.chart_new_users, color: '#10b981', total: stats.total_users },
                            { label: 'Đơn hàng mới', data: stats.chart_orders, color: '#3b82f6', total: stats.total_orders },
                            { label: 'Lượt gen AI', data: stats.chart_ai_gens, color: '#f59e0b', total: stats.total_ai_generations },
                        ].map(item => {
                            const sum30 = item.data.reduce((a, b) => a + b, 0);
                            return (
                                <div key={item.label} className="bg-slate-700/30 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-300 font-medium">{item.label}</span>
                                        <div className="text-right">
                                            <span className="text-white font-bold text-sm">{sum30}</span>
                                            <span className="text-slate-500 text-xs ml-1">/ 30 ngày</span>
                                        </div>
                                    </div>
                                    <Sparkline data={item.data} color={item.color} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Engagement Summary ── */}
            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-5">Tổng kết tương tác Blog</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                        { label: 'Bài đăng', value: stats.total_blog_posts, icon: FileTextIcon, color: 'text-cyan-400', bar: 'bg-cyan-500' },
                        { label: 'Bình luận', value: stats.total_comments, icon: MessageIcon, color: 'text-indigo-400', bar: 'bg-indigo-500' },
                        { label: 'Lượt thích', value: stats.total_likes, icon: HeartIcon, color: 'text-rose-400', bar: 'bg-rose-500' },
                    ].map(item => {
                        const maxVal = Math.max(stats.total_blog_posts, stats.total_comments, stats.total_likes, 1);
                        return (
                            <div key={item.label} className="bg-slate-700/30 rounded-xl p-4">
                                <item.icon className={`w-6 h-6 ${item.color} mx-auto mb-2`} />
                                <p className="text-2xl font-bold text-white">{item.value.toLocaleString('vi-VN')}</p>
                                <p className="text-slate-500 text-xs mt-1">{item.label}</p>
                                <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.bar} rounded-full transition-all duration-700`}
                                        style={{ width: `${(item.value / maxVal) * 100}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
