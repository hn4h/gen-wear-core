'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '@/src/lib/useAuthStore';
import { 
    Star, 
    Trash2, 
    Search,
    ChevronLeft,
    ChevronRight,
    User,
    Phone,
    Mail,
    Calendar,
    MessageSquare,
    Filter,
    BarChart3
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.genwear.io.vn';

// Cast icons
const StarIcon = Star as any;
const Trash2Icon = Trash2 as any;
const SearchIcon = Search as any;
const ChevronLeftIcon = ChevronLeft as any;
const ChevronRightIcon = ChevronRight as any;
const UserIcon = User as any;
const PhoneIcon = Phone as any;
const MailIcon = Mail as any;
const CalendarIcon = Calendar as any;
const MessageSquareIcon = MessageSquare as any;
const FilterIcon = Filter as any;
const BarChart3Icon = BarChart3 as any;

interface SurveyResponse {
    id: string;
    survey_id: string;
    user_id: string | null;
    question_1_answer: string | null;
    question_2_answer: string | null;
    question_3_answer: string | null;
    rating: number | null;
    feedback: string | null;
    created_at: string;
    user_name: string | null;
    user_phone: string | null;
    user_email: string | null;
}

interface PaginatedResponse {
    responses: SurveyResponse[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export default function SurveysPage() {
    const [data, setData] = useState<PaginatedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [minRating, setMinRating] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    const loadSurveys = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const params = new URLSearchParams({ page: page.toString(), page_size: '20' });
            if (minRating) params.append('min_rating', minRating.toString());
            
            const res = await axios.get(`${API_URL}/api/admin/surveys?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (e) {
            console.error('Failed to load surveys', e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa khảo sát này?')) return;
        
        try {
            setDeleting(id);
            const token = getAuthToken();
            await axios.delete(`${API_URL}/api/admin/surveys/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await loadSurveys();
        } catch (e) {
            console.error('Failed to delete survey', e);
            alert('Xóa thất bại. Vui lòng thử lại.');
        } finally {
            setDeleting(null);
        }
    };

    useEffect(() => {
        loadSurveys();
    }, [page, minRating]);

    const renderStars = (rating: number | null) => {
        if (!rating) return <span className="text-slate-500 text-sm">Chưa đánh giá</span>;
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                    />
                ))}
            </div>
        );
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Đang tải khảo sát...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Khảo sát của người dùng</h1>
                    <p className="text-slate-400 text-sm">
                        Tổng số: {data?.total || 0} khảo sát
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/surveys/analytics"
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all flex items-center gap-2"
                    >
                        <BarChart3Icon className="w-4 h-4" />
                        Xem thống kê
                    </Link>
                    <button 
                        onClick={() => loadSurveys()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                    >
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-4">
                    <FilterIcon className="w-5 h-5 text-slate-400" />
                    <div className="flex items-center gap-2">
                        <label className="text-slate-400 text-sm">Lọc theo rating:</label>
                        <select
                            value={minRating || ''}
                            onChange={(e) => {
                                setMinRating(e.target.value ? parseInt(e.target.value) : null);
                                setPage(1);
                            }}
                            className="bg-slate-700 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm"
                        >
                            <option value="">Tất cả</option>
                            <option value="5">⭐ 5 sao</option>
                            <option value="4">⭐ 4 sao trở lên</option>
                            <option value="3">⭐ 3 sao trở lên</option>
                            <option value="2">⭐ 2 sao trở lên</option>
                            <option value="1">⭐ 1 sao trở lên</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Survey List */}
            <div className="space-y-4">
                {data?.responses.map((survey) => (
                    <div
                        key={survey.id}
                        className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-slate-400" />
                                        <span className="text-white font-medium">
                                            {survey.user_name || 'Anonymous'}
                                        </span>
                                    </div>
                                    {survey.user_phone && (
                                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                                            <PhoneIcon className="w-3.5 h-3.5" />
                                            {survey.user_phone}
                                        </div>
                                    )}
                                    {survey.user_email && (
                                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                                            <MailIcon className="w-3.5 h-3.5" />
                                            {survey.user_email}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        {new Date(survey.created_at).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {renderStars(survey.rating)}
                                <button
                                    onClick={() => handleDelete(survey.id)}
                                    disabled={deleting === survey.id}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Trash2Icon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Answers */}
                        <div className="space-y-3 border-t border-white/10 pt-4">
                            {survey.question_1_answer && (
                                <div>
                                    <p className="text-slate-400 text-xs mb-1">Câu hỏi 1:</p>
                                    <p className="text-white text-sm">{survey.question_1_answer}</p>
                                </div>
                            )}
                            {survey.question_2_answer && (
                                <div>
                                    <p className="text-slate-400 text-xs mb-1">Câu hỏi 2:</p>
                                    <p className="text-white text-sm">{survey.question_2_answer}</p>
                                </div>
                            )}
                            {survey.question_3_answer && (
                                <div>
                                    <p className="text-slate-400 text-xs mb-1">Câu hỏi 3:</p>
                                    <p className="text-white text-sm">{survey.question_3_answer}</p>
                                </div>
                            )}
                            {survey.feedback && (
                                <div>
                                    <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                                        <MessageSquareIcon className="w-3 h-3" />
                                        Feedback:
                                    </p>
                                    <p className="text-white text-sm italic">{survey.feedback}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {data?.responses.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        Chưa có khảo sát nào{minRating ? ` với rating ${minRating} sao trở lên` : ''}.
                    </div>
                )}
            </div>

            {/* Pagination */}
            {data && data.total_pages > 1 && (
                <div className="flex items-center justify-between bg-slate-800/60 border border-white/10 rounded-2xl p-4">
                    <div className="text-sm text-slate-400">
                        Trang {data.page} / {data.total_pages} · Tổng {data.total} khảo sát
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                            disabled={page === data.total_pages}
                            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
