'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthToken } from '@/src/lib/useAuthStore';
import {
    Users, ShoppingBag, Cpu, FileText,
    Heart, MessageCircle, Package, DollarSign,
    Activity, Clock, ClipboardCheck, RefreshCw,
    TrendingUp, TrendingDown, Minus,
    BarChart2, ArrowRight,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.genwear.io.vn';

// ─── Icon casts ───────────────────────────────────────────────────────────────
const UsersIcon        = Users as any;
const ShoppingBagIcon  = ShoppingBag as any;
const CpuIcon          = Cpu as any;
const FileTextIcon     = FileText as any;
const HeartIcon        = Heart as any;
const MessageIcon      = MessageCircle as any;
const PackageIcon      = Package as any;
const DollarSignIcon   = DollarSign as any;
const ActivityIcon     = Activity as any;
const ClockIcon        = Clock as any;
const ClipboardCheckIcon = ClipboardCheck as any;
const RefreshCwIcon    = RefreshCw as any;
const TrendingUpIcon   = TrendingUp as any;
const TrendingDownIcon = TrendingDown as any;
const MinusIcon        = Minus as any;
const BarChart2Icon    = BarChart2 as any;
const ArrowRightIcon   = ArrowRight as any;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
    total_users: number;             new_users_today: number;
    total_products: number;          total_orders: number;
    total_revenue: number;           revenue_today: number;
    orders_by_status: Record<string, number>;
    total_ai_generations: number;    ai_generations_today: number;
    total_blog_posts: number;        total_comments: number; total_likes: number;
    total_survey_responses: number;  survey_last_7_days: number;
    survey_last_30_days: number;     avg_survey_rating: number | null;
    chart_days: string[];            chart_new_users: number[];
    chart_orders: number[];          chart_revenue: number[];
    chart_ai_gens: number[];
}

type ChartTab = 'revenue' | 'orders' | 'users' | 'ai';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const fmtNum = (n: number) => n.toLocaleString('vi-VN');

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; ring: string }> = {
    PENDING:   { label: 'Chờ xử lý',   color: 'text-amber-400',   dot: 'bg-amber-400',   ring: 'ring-amber-400/30' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-400',    dot: 'bg-blue-400',    ring: 'ring-blue-400/30' },
    SHIPPED:   { label: 'Đang giao',   color: 'text-violet-400',  dot: 'bg-violet-400',  ring: 'ring-violet-400/30' },
    DELIVERED: { label: 'Đã giao',     color: 'text-emerald-400', dot: 'bg-emerald-400', ring: 'ring-emerald-400/30' },
    CANCELLED: { label: 'Đã hủy',      color: 'text-red-400',     dot: 'bg-red-400',     ring: 'ring-red-400/30' },
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
    label, value, sub, icon: Icon,
    gradient, glow, trend,
}: {
    label: string; value: string; sub?: string; icon: any;
    gradient: string; glow: string; trend?: 'up' | 'down' | 'neutral';
}) {
    const TrendIcon = trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDownIcon : MinusIcon;
    const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500';

    return (
        <div className={`
            relative overflow-hidden rounded-2xl border border-white/[0.06]
            bg-slate-900/70 backdrop-blur-sm p-5
            hover:border-white/[0.12] hover:shadow-xl transition-all duration-300 group
            ${glow}
        `}>
            {/* BG blob */}
            <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl opacity-[0.12] ${gradient}`} />

            <div className="relative flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient} shadow-lg`}>
                    <Icon size={18} className="text-white" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                        <TrendIcon size={13} />
                        <span>Today</span>
                    </div>
                )}
            </div>

            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{label}</p>
            <p className="text-2xl font-bold text-white leading-none mb-1">{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
    );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data, 1);
    const w = 120; const h = 36;
    const step = w / (data.length - 1);
    const pts = data.map((v, i) => `${i * step},${h - (v / max) * (h - 4)}`).join(' ');
    const fillPts = `0,${h} ${pts} ${(data.length - 1) * step},${h}`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9" preserveAspectRatio="none">
            <defs>
                <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={fillPts} fill={`url(#sg-${color.replace('#', '')})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            {/* Last point dot */}
            {data.length > 0 && (() => {
                const lastX = (data.length - 1) * step;
                const lastY = h - (data[data.length - 1] / max) * (h - 4);
                return <circle cx={lastX} cy={lastY} r="3" fill={color} />;
            })()}
        </svg>
    );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, labels, color, unit = '' }: {
    data: number[]; labels: string[]; color: string; unit?: string;
}) {
    const max = Math.max(...data, 1);
    const total = data.reduce((a, b) => a + b, 0);
    const avg = total / (data.length || 1);

    // show every Nth label
    const step = Math.max(1, Math.ceil(data.length / 7));

    return (
        <div>
            {/* Summary row */}
            <div className="flex gap-6 mb-4 text-xs">
                <div>
                    <span className="text-slate-500">Tổng 30 ngày · </span>
                    <span className="text-white font-semibold">{unit}{fmtNum(total)}</span>
                </div>
                <div>
                    <span className="text-slate-500">TB / ngày · </span>
                    <span className="text-white font-semibold">{unit}{fmtNum(Math.round(avg))}</span>
                </div>
                <div>
                    <span className="text-slate-500">Đỉnh · </span>
                    <span className="text-white font-semibold">{unit}{fmtNum(max)}</span>
                </div>
            </div>

            {/* Bars */}
            <div className="flex items-end gap-[3px] h-40 w-full">
                {data.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end group relative">
                        <div
                            className="rounded-t-[3px] transition-all duration-500"
                            style={{
                                height: `${Math.max((v / max) * 100, v > 0 ? 3 : 0)}%`,
                                background: `linear-gradient(180deg, ${color}ee, ${color}88)`,
                            }}
                        />
                        {v > 0 && (
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-800 border border-white/10 text-[11px] px-2 py-1 rounded-lg text-white whitespace-nowrap opacity-0 group-hover:opacity-100 z-10 pointer-events-none shadow-xl transition-opacity duration-150">
                                <span className="text-slate-400">{labels[i]?.slice(5)}</span>
                                <br />
                                {unit}{fmtNum(v)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* X labels */}
            <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                {labels.filter((_, i) => i % step === 0).map((l, i) => (
                    <span key={i}>{l.slice(5)}</span>
                ))}
            </div>
        </div>
    );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
    const r = 38; const cx = 50; const cy = 50;
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
        <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-28 h-28">
                    {paths.map((p, i) => (
                        <path key={i} d={p.d} fill={p.color} opacity={0.9} />
                    ))}
                    <circle cx={cx} cy={cy} r={22} fill="#0f172a" />
                    <text x={cx} y={cy - 3} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="500">Total</text>
                    <text x={cx} y={cy + 9} textAnchor="middle" fontSize="11" fill="white" fontWeight="700">{fmtNum(total)}</text>
                </svg>
            </div>
            <div className="space-y-2 flex-1">
                {segments.map((seg, i) => {
                    const pct = Math.round(seg.value / total * 100);
                    return (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                            <span className="text-xs text-slate-400 flex-1">{seg.label}</span>
                            <span className="text-xs font-semibold text-white">{fmtNum(seg.value)}</span>
                            <div className="w-14 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: seg.color }} />
                            </div>
                            <span className="text-[10px] text-slate-500 w-6 text-right">{pct}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Panel wrapper ────────────────────────────────────────────────────────────
function Panel({ title, action, children }: {
    title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
    return (
        <div className="bg-slate-900/70 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-violet-500 to-purple-700" />
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">{children}</p>
        </div>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`rounded-lg bg-white/[0.04] animate-pulse ${className}`} />;
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8 pb-8 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
            <Skeleton className="h-72 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-56 rounded-2xl" />
                <Skeleton className="h-56 rounded-2xl" />
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [chartTab, setChartTab] = useState<ChartTab>('revenue');
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const loadStats = useCallback(async (isManual = false) => {
        if (isManual) setRefreshing(true);
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
            if (isManual) setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
        const id = setInterval(() => loadStats(), 60_000);
        return () => clearInterval(id);
    }, [loadStats]);

    if (loading) return <DashboardSkeleton />;

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <ActivityIcon size={22} className="text-red-400" />
                </div>
                <p className="text-slate-400 text-sm">Không thể tải dữ liệu</p>
                <button
                    onClick={() => loadStats(true)}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl transition-colors cursor-pointer"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    // ── Processed data ──
    const fmtK = (n: number) => n >= 1_000_000
        ? `${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

    const orderDonut = Object.entries(stats.orders_by_status)
        .filter(([, v]) => v > 0)
        .map(([status, count]) => ({
            label: STATUS_CONFIG[status]?.label || status,
            value: count,
            color: status === 'PENDING' ? '#f59e0b' : status === 'CONFIRMED' ? '#60a5fa'
                : status === 'SHIPPED' ? '#a78bfa' : status === 'DELIVERED' ? '#34d399' : '#f87171',
        }));

    const chartConfig: Record<ChartTab, { data: number[]; color: string; label: string; unit?: string }> = {
        revenue: { data: stats.chart_revenue,   color: '#8b5cf6', label: 'Doanh thu',    unit: '₫' },
        orders:  { data: stats.chart_orders,    color: '#3b82f6', label: 'Đơn hàng',     unit: '' },
        users:   { data: stats.chart_new_users, color: '#10b981', label: 'Người dùng',   unit: '' },
        ai:      { data: stats.chart_ai_gens,   color: '#f59e0b', label: 'Lượt gen AI',  unit: '' },
    };

    const tabLabels: Record<ChartTab, string> = {
        revenue: 'Doanh thu', orders: 'Đơn hàng', users: 'Người dùng', ai: 'Gen AI',
    };

    return (
        <div className="space-y-8 pb-12">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Tổng quan hệ thống</h1>
                    <p className="text-slate-500 text-xs flex items-center gap-1.5">
                        <ClockIcon size={12} />
                        Cập nhật lúc {lastUpdated || '—'} · Tự động làm mới mỗi 60 giây
                    </p>
                </div>
                <button
                    onClick={() => loadStats(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 border border-white/[0.08] rounded-xl text-slate-300 hover:border-violet-500/40 hover:text-white transition-all duration-200 text-xs font-medium cursor-pointer disabled:opacity-50"
                >
                    <RefreshCwIcon size={13} className={refreshing ? 'animate-spin' : ''} />
                    Làm mới
                </button>
            </div>

            {/* ── Row 1: Core KPIs ── */}
            <div>
                <SectionLabel>Chỉ số cốt lõi</SectionLabel>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        label="Người dùng"
                        value={fmtK(stats.total_users)}
                        sub={`+${stats.new_users_today} đăng ký hôm nay`}
                        icon={UsersIcon}
                        gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
                        glow="hover:shadow-blue-500/10"
                        trend={stats.new_users_today > 0 ? 'up' : 'neutral'}
                    />
                    <KpiCard
                        label="Tổng doanh thu"
                        value={fmtCurrency(stats.total_revenue)}
                        sub={`Hôm nay: ${fmtCurrency(stats.revenue_today)}`}
                        icon={DollarSignIcon}
                        gradient="bg-gradient-to-br from-violet-500 to-purple-700"
                        glow="hover:shadow-violet-500/10"
                        trend={stats.revenue_today > 0 ? 'up' : 'neutral'}
                    />
                    <KpiCard
                        label="Tổng đơn hàng"
                        value={fmtK(stats.total_orders)}
                        sub={`Đang chờ: ${stats.orders_by_status['PENDING'] || 0} đơn`}
                        icon={PackageIcon}
                        gradient="bg-gradient-to-br from-pink-500 to-rose-600"
                        glow="hover:shadow-pink-500/10"
                        trend="neutral"
                    />
                    <KpiCard
                        label="Sản phẩm"
                        value={fmtK(stats.total_products)}
                        icon={ShoppingBagIcon}
                        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                        glow="hover:shadow-emerald-500/10"
                    />
                </div>
            </div>

            {/* ── Row 2: Engagement KPIs ── */}
            <div>
                <SectionLabel>Tương tác & Nội dung</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <KpiCard
                        label="Lượt gen AI"
                        value={fmtK(stats.total_ai_generations)}
                        sub={`+${stats.ai_generations_today} hôm nay`}
                        icon={CpuIcon}
                        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                        glow="hover:shadow-amber-500/10"
                        trend={stats.ai_generations_today > 0 ? 'up' : 'neutral'}
                    />
                    <KpiCard
                        label="Bài Blog"
                        value={fmtK(stats.total_blog_posts)}
                        icon={FileTextIcon}
                        gradient="bg-gradient-to-br from-cyan-500 to-sky-600"
                        glow="hover:shadow-cyan-500/10"
                    />
                    <KpiCard
                        label="Bình luận"
                        value={fmtK(stats.total_comments)}
                        icon={MessageIcon}
                        gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
                        glow="hover:shadow-indigo-500/10"
                    />
                    <KpiCard
                        label="Lượt thích"
                        value={fmtK(stats.total_likes)}
                        icon={HeartIcon}
                        gradient="bg-gradient-to-br from-rose-500 to-pink-600"
                        glow="hover:shadow-rose-500/10"
                    />
                    <KpiCard
                        label="Khảo sát"
                        value={fmtK(stats.total_survey_responses)}
                        sub={stats.avg_survey_rating ? `★ ${stats.avg_survey_rating}/5 trung bình` : 'Chưa có đánh giá'}
                        icon={ClipboardCheckIcon}
                        gradient="bg-gradient-to-br from-purple-500 to-fuchsia-600"
                        glow="hover:shadow-purple-500/10"
                    />
                </div>
            </div>

            {/* ── Main Chart ── */}
            <Panel
                title="Hoạt động 30 ngày qua"
                action={
                    <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                        {(Object.keys(tabLabels) as ChartTab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setChartTab(tab)}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
                                    ${chartTab === tab
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                                        : 'text-slate-500 hover:text-slate-200'
                                    }
                                `}
                            >
                                {tabLabels[tab]}
                            </button>
                        ))}
                    </div>
                }
            >
                <BarChart
                    data={chartConfig[chartTab].data}
                    labels={stats.chart_days}
                    color={chartConfig[chartTab].color}
                    unit={chartConfig[chartTab].unit}
                />
            </Panel>

            {/* ── Row 3: Order Status + Sparklines ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Order Status Donut */}
                <Panel title="Trạng thái đơn hàng">
                    {orderDonut.length > 0 ? (
                        <DonutChart segments={orderDonut} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <PackageIcon size={32} className="text-slate-700" />
                            <p className="text-slate-600 text-sm">Chưa có đơn hàng nào</p>
                        </div>
                    )}
                </Panel>

                {/* Platform Activity Sparklines */}
                <Panel title="Xu hướng nền tảng">
                    <div className="space-y-5">
                        {[
                            { label: 'Người dùng mới / 30 ngày', data: stats.chart_new_users, color: '#10b981', total: stats.total_users },
                            { label: 'Đơn hàng mới / 30 ngày',  data: stats.chart_orders,    color: '#60a5fa', total: stats.total_orders },
                            { label: 'Lượt gen AI / 30 ngày',   data: stats.chart_ai_gens,   color: '#f59e0b', total: stats.total_ai_generations },
                        ].map(item => {
                            const sum30 = item.data.reduce((a, b) => a + b, 0);
                            const pct = item.total > 0 ? Math.round(sum30 / item.total * 100) : 0;
                            return (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                                        <div className="flex items-center gap-2 text-right">
                                            <span className="text-white font-bold text-sm">{fmtNum(sum30)}</span>
                                            <span className="text-[10px] text-slate-600 bg-white/[0.04] px-1.5 py-0.5 rounded-md">{pct}% tổng</span>
                                        </div>
                                    </div>
                                    <Sparkline data={item.data} color={item.color} />
                                </div>
                            );
                        })}
                    </div>
                </Panel>
            </div>

            {/* ── Blog Engagement Summary ── */}
            <Panel title="Tương tác Blog">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Bài đăng', value: stats.total_blog_posts, icon: FileTextIcon, color: '#22d3ee', bar: 'from-cyan-500 to-sky-600' },
                        { label: 'Bình luận', value: stats.total_comments,  icon: MessageIcon,  color: '#818cf8', bar: 'from-indigo-500 to-violet-600' },
                        { label: 'Lượt thích', value: stats.total_likes,    icon: HeartIcon,    color: '#fb7185', bar: 'from-rose-500 to-pink-600' },
                    ].map(item => {
                        const maxVal = Math.max(stats.total_blog_posts, stats.total_comments, stats.total_likes, 1);
                        const pct = Math.round((item.value / maxVal) * 100);
                        return (
                            <div key={item.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 text-center hover:border-white/[0.1] transition-all">
                                <div className="w-9 h-9 rounded-xl mx-auto mb-3 flex items-center justify-center"
                                    style={{ background: `${item.color}18`, borderColor: `${item.color}30`, borderWidth: 1 }}>
                                    <item.icon size={17} style={{ color: item.color }} />
                                </div>
                                <p className="text-xl font-bold text-white mb-0.5">{fmtNum(item.value)}</p>
                                <p className="text-slate-500 text-xs mb-3">{item.label}</p>
                                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${item.bar} transition-all duration-700`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Panel>

            {/* ── AI & Survey Quick Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AI gen rate */}
                <div className="bg-gradient-to-br from-amber-500/[0.08] to-orange-600/[0.04] border border-amber-500/[0.15] rounded-2xl p-5 flex items-center gap-4 hover:border-amber-400/30 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                        <CpuIcon size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-amber-400/80 font-semibold uppercase tracking-wider mb-1">AI Hoje</p>
                        <p className="text-2xl font-bold text-white">{fmtNum(stats.ai_generations_today)}</p>
                        <p className="text-xs text-slate-500 truncate">lượt tạo trong 24h · Tổng: {fmtK(stats.total_ai_generations)}</p>
                    </div>
                    <BarChart2Icon size={28} className="text-amber-500/30 flex-shrink-0" />
                </div>

                {/* Survey stats */}
                <div className="bg-gradient-to-br from-violet-500/[0.08] to-purple-700/[0.04] border border-violet-500/[0.15] rounded-2xl p-5 flex items-center gap-4 hover:border-violet-400/30 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
                        <ClipboardCheckIcon size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-violet-400/80 font-semibold uppercase tracking-wider mb-1">Khảo sát</p>
                        <p className="text-2xl font-bold text-white">
                            {stats.avg_survey_rating ? `★ ${stats.avg_survey_rating}` : '—'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {fmtNum(stats.survey_last_7_days)} phản hồi 7 ngày · {fmtNum(stats.survey_last_30_days)} tháng này
                        </p>
                    </div>
                    <ArrowRightIcon size={18} className="text-violet-500/30 flex-shrink-0" />
                </div>
            </div>

        </div>
    );
}
