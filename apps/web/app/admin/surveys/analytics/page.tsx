'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '@/src/lib/useAuthStore';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts';
import { TrendingUp, Star, Users, Calendar, BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.genwear.io.vn';

// Cast icons
const TrendingUpIcon = TrendingUp as any;
const StarIcon = Star as any;
const UsersIcon = Users as any;
const CalendarIcon = Calendar as any;
const BarChart3Icon = BarChart3 as any;
const ArrowLeftIcon = ArrowLeft as any;

interface AnalyticsData {
    total_responses: number;
    rating_distribution: Record<string, number>;
    question_1_stats: Record<string, number>;
    question_2_stats: Record<string, number>;
    question_3_stats: Record<string, number>;
    question_titles: Record<string, string>;
    avg_rating: number;
    responses_over_time: Array<{ date: string; count: number }>;
}

// Colors for charts
const COLORS = [
    '#8b5cf6', // purple-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#ef4444', // red-500
    '#6366f1', // indigo-500
    '#14b8a6', // teal-500
];

const RATING_COLORS: Record<string, string> = {
    '1': '#ef4444',
    '2': '#f97316',
    '3': '#f59e0b',
    '4': '#84cc16',
    '5': '#22c55e',
};

export default function SurveyAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const res = await axios.get(`${API_URL}/api/admin/surveys/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (e) {
            console.error('Failed to load analytics', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Đang tải thống kê...</p>
                </div>
            </div>
        );
    }

    // Prepare data for charts
    const ratingData = Object.entries(data.rating_distribution)
        .map(([rating, count]) => ({
            name: `${rating} sao`,
            value: count,
            rating: parseInt(rating)
        }))
        .sort((a, b) => a.rating - b.rating);

    const q1Data = Object.entries(data.question_1_stats)
        .map(([answer, count]) => ({
            name: answer.length > 30 ? answer.substring(0, 30) + '...' : answer,
            value: count,
            fullName: answer
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    const q2Data = Object.entries(data.question_2_stats)
        .map(([answer, count]) => ({
            name: answer.length > 30 ? answer.substring(0, 30) + '...' : answer,
            value: count,
            fullName: answer
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    const q3Data = Object.entries(data.question_3_stats)
        .map(([answer, count]) => ({
            name: answer.length > 30 ? answer.substring(0, 30) + '...' : answer,
            value: count,
            fullName: answer
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    const timelineData = data.responses_over_time;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link 
                            href="/admin/surveys"
                            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Thống kê khảo sát</h1>
                    </div>
                    <p className="text-slate-400 text-sm ml-14">
                        Phân tích chi tiết từ {data.total_responses} phản hồi
                    </p>
                </div>
                <button 
                    onClick={() => loadAnalytics()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                >
                    Làm mới
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <UsersIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-slate-400 text-sm">Tổng phản hồi</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{data.total_responses}</p>
                </div>

                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <StarIcon className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className="text-slate-400 text-sm">Đánh giá TB</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{data.avg_rating.toFixed(1)}/5</p>
                </div>

                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                            <TrendingUpIcon className="w-5 h-5 text-pink-400" />
                        </div>
                        <span className="text-slate-400 text-sm">30 ngày qua</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                        {timelineData.reduce((sum, d) => sum + d.count, 0)}
                    </p>
                </div>

                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <BarChart3Icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-slate-400 text-sm">Câu hỏi đã trả lời</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                        {Object.keys(data.question_1_stats).length + 
                         Object.keys(data.question_2_stats).length + 
                         Object.keys(data.question_3_stats).length}
                    </p>
                </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Phân bố đánh giá</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ratingData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#94a3b8"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis 
                                    stroke="#94a3b8"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1e293b', 
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill="#8b5cf6"
                                    radius={[8, 8, 0, 0]}
                                >
                                    {ratingData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={RATING_COLORS[entry.rating.toString()] || '#8b5cf6'} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={ratingData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => 
                                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {ratingData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={RATING_COLORS[entry.rating.toString()] || '#8b5cf6'} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1e293b', 
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Responses Over Time */}
            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Xu hướng phản hồi (30 ngày qua)</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timelineData}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                            dataKey="date" 
                            stroke="#94a3b8"
                            style={{ fontSize: '10px' }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                        />
                        <YAxis 
                            stroke="#94a3b8"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#1e293b', 
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            labelFormatter={(value) => `Ngày: ${value}`}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#8b5cf6" 
                            fillOpacity={1} 
                            fill="url(#colorCount)"
                            name="Số phản hồi"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Question 1 Statistics */}
            {q1Data.length > 0 && (
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                        Câu hỏi 1: {data.question_titles?.question_1 || 'Câu trả lời phổ biến nhất'}
                    </h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={q1Data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis 
                                type="number"
                                stroke="#94a3b8"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                                type="category"
                                dataKey="name" 
                                stroke="#94a3b8"
                                style={{ fontSize: '11px' }}
                                width={150}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1e293b', 
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                formatter={(value, name, props) => [value, props.payload.fullName]}
                            />
                            <Bar 
                                dataKey="value" 
                                fill="#ec4899"
                                radius={[0, 8, 8, 0]}
                            >
                                {q1Data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Question 2 Statistics */}
            {q2Data.length > 0 && (
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                        Câu hỏi 2: {data.question_titles?.question_2 || 'Câu trả lời phổ biến nhất'}
                    </h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={q2Data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis 
                                type="number"
                                stroke="#94a3b8"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                                type="category"
                                dataKey="name" 
                                stroke="#94a3b8"
                                style={{ fontSize: '11px' }}
                                width={150}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1e293b', 
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                formatter={(value, name, props) => [value, props.payload.fullName]}
                            />
                            <Bar 
                                dataKey="value" 
                                fill="#f59e0b"
                                radius={[0, 8, 8, 0]}
                            >
                                {q2Data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Question 3 Statistics */}
            {q3Data.length > 0 && (
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                        Câu hỏi 3: {data.question_titles?.question_3 || 'Câu trả lời phổ biến nhất'}
                    </h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={q3Data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis 
                                type="number"
                                stroke="#94a3b8"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                                type="category"
                                dataKey="name" 
                                stroke="#94a3b8"
                                style={{ fontSize: '11px' }}
                                width={150}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1e293b', 
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                formatter={(value, name, props) => [value, props.payload.fullName]}
                            />
                            <Bar 
                                dataKey="value" 
                                fill="#10b981"
                                radius={[0, 8, 8, 0]}
                            >
                                {q3Data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* No Data Message */}
            {data.total_responses === 0 && (
                <div className="text-center py-20 text-slate-400 bg-slate-800/60 border border-white/10 rounded-2xl">
                    <BarChart3Icon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Chưa có dữ liệu khảo sát để hiển thị</p>
                </div>
            )}
        </div>
    );
}
