"use client";

import Link from "next/link";
import { Loader2, Sparkles, Wand2, Eye, ShoppingCart } from "lucide-react";
import { RegionSelection } from "../hooks/useRegionEdit";

// Cast icons to any to avoid type errors
const Loader2Icon = Loader2 as any;
const SparklesIcon = Sparkles as any;
const Wand2Icon = Wand2 as any;
const EyeIcon = Eye as any;
const ShoppingCartIcon = ShoppingCart as any;
import { Save } from "lucide-react";
const SaveIcon = Save as any;

interface StudioLeftPanelProps {
    // Generation
    designPrompt: string;
    setDesignPrompt: (value: string) => void;
    selectedStyle: string;
    setSelectedStyle: (value: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    generatedPrompt: string;
    // Region Edit
    editPrompt: string;
    setEditPrompt: (value: string) => void;
    region: RegionSelection | null;
    hasMask: boolean;
    onApplyEdit: () => void;
    isApplying: boolean;
    hasImage: boolean;
    // Complete
    onComplete: () => void;
    // Order Design
    onOrderDesign: () => void;
    // Save Design
    onSaveDesign: () => void;
    isSaving?: boolean;
}

const STYLE_OPTIONS = [
    { value: "", label: "Tự động" },
    { value: "traditional", label: "Truyền thống" },
    { value: "modern", label: "Hiện đại" },
    { value: "artistic", label: "Nghệ thuật" },
    { value: "minimalist", label: "Tối giản" },
    { value: "vintage", label: "Retro / Vintage" },
    { value: "geometric", label: "Hình học" },
];

import { useAuthStore } from "@/src/lib/useAuthStore";

export function StudioLeftPanel({
    designPrompt,
    setDesignPrompt,
    selectedStyle,
    setSelectedStyle,
    onGenerate,
    isGenerating,
    generatedPrompt,
    editPrompt,
    setEditPrompt,
    region,
    hasMask,
    onApplyEdit,
    isApplying,
    hasImage,
    onComplete,
    onOrderDesign,
    onSaveDesign,
    isSaving = false,
}: StudioLeftPanelProps) {
    const { user } = useAuthStore();
    
    // console.log('[StudioLeftPanel] Current user:', user);
    // console.log('[StudioLeftPanel] daily_credits_remaining:', user?.daily_credits_remaining);
    
    const canGenerate = designPrompt.trim().length > 0 && !isGenerating;
    const canApplyEdit = hasImage && hasMask && editPrompt.trim().length > 0 && !isApplying;
    const isFreeTier = !user || user.account_tier === "FREE" || user.account_tier === undefined;
    const isOutOfCredits = user?.daily_credits_remaining !== undefined && user.daily_credits_remaining <= 0;
    
    // console.log('[StudioLeftPanel] isOutOfCredits:', isOutOfCredits);

    return (
        <div className="w-full lg:w-[400px] flex-shrink-0 bg-slate-800/50 backdrop-blur-sm border-r border-white/10 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        AI Studio
                    </h1>
                    {user && user.daily_credits_remaining !== undefined && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
                            <SparklesIcon className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-semibold text-purple-300">
                                {user.daily_credits_remaining} credits
                            </span>
                        </div>
                    )}
                </div>
                <p className="text-gray-400 mt-1 text-sm">
                    Tạo và chỉnh sửa thiết kế khăn của bạn
                </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Generation Section */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <SparklesIcon className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-semibold text-white">Tạo thiết kế mới</h2>
                    </div>

                    {/* Out of credits banner */}
                    {isOutOfCredits && (
                        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                            <p className="text-sm text-red-400 font-medium mb-2">Bạn đã hết lượt tạo hoặc chỉnh sửa</p>
                            {isFreeTier ? (
                                <Link 
                                    href="/pricing"
                                    className="inline-block py-1.5 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition"
                                >
                                    Nâng cấp ngay
                                </Link>
                            ) : (
                                <Link 
                                    href="/pricing"
                                    className="inline-block py-1.5 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition"
                                >
                                    Mua thêm Credit
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Design Idea Textarea */}
                    <div className="space-y-2 mb-4">
                        <label className="block text-sm font-medium text-gray-300">
                            Ý tưởng thiết kế
                        </label>
                        <textarea
                            value={designPrompt}
                            onChange={(e) => setDesignPrompt(e.target.value)}
                            placeholder="Mô tả ý tưởng thiết kế của bạn... Ví dụ: Họa tiết hoa sen truyền thống với màu đỏ và vàng"
                            disabled={isOutOfCredits}
                            className="w-full h-32 px-4 py-3 rounded-xl bg-slate-700/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Style Select */}
                    <div className="space-y-2 mb-4">
                        <label className="block text-sm font-medium text-gray-300">
                            Phong cách (tùy chọn)
                        </label>
                        <select
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                            disabled={isOutOfCredits}
                            className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {STYLE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value} className="bg-slate-800">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={onGenerate}
                        disabled={!canGenerate || isOutOfCredits}
                        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2Icon className="w-5 h-5 animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                Tạo thiết kế
                            </>
                        )}
                    </button>

                    {/* Generated Prompt Display */}
                    {generatedPrompt && (
                        <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <p className="text-xs text-purple-300 font-medium mb-1">Prompt đã được tối ưu:</p>
                            <p className="text-sm text-gray-300">{generatedPrompt}</p>
                        </div>
                    )}
                </div>

                {/* Divider */}
                {!isFreeTier && (
                    <div className="px-6">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                )}

                {/* Region Edit Section */}
                {!isFreeTier && (
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Wand2Icon className="w-5 h-5 text-pink-400" />
                            <h2 className="text-lg font-semibold text-white">Chỉnh sửa theo vùng</h2>
                        </div>

                        {!hasImage ? (
                            <p className="text-sm text-gray-500 italic">
                                Tạo thiết kế trước để có thể chỉnh sửa
                            </p>
                        ) : (
                            <>
                                {/* Region Status */}
                                <div className="mb-4 p-3 rounded-lg bg-slate-700/30 border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${hasMask ? "bg-green-400" : "bg-gray-500"}`} />
                                        <span className="text-sm text-gray-300">
                                            {hasMask 
                                                ? "Đã chọn vùng - Sẵn sàng chỉnh sửa"
                                                : "Chưa chọn vùng - Vẽ trên ảnh để chọn"
                                            }
                                        </span>
                                    </div>
                                </div>

                                {/* Edit Prompt Textarea */}
                                <div className="space-y-2 mb-4">
                                    <label className="block text-sm font-medium text-gray-300">
                                        Yêu cầu chỉnh sửa
                                    </label>
                                    <textarea
                                        value={editPrompt}
                                        onChange={(e) => setEditPrompt(e.target.value)}
                                        placeholder="Mô tả thay đổi cho vùng đã chọn... Ví dụ: Thay đổi thành hoa cúc màu trắng"
                                        disabled={!hasMask || isOutOfCredits}
                                        className="w-full h-24 px-4 py-3 rounded-xl bg-slate-700/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Apply Edit Button */}
                                <button
                                    onClick={onApplyEdit}
                                    disabled={!canApplyEdit || isOutOfCredits}
                                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-pink-600 to-orange-600 text-white font-semibold hover:from-pink-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25"
                                >
                                    {isApplying ? (
                                        <>
                                            <Loader2Icon className="w-5 h-5 animate-spin" />
                                            Đang áp dụng...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2Icon className="w-5 h-5" />
                                            Áp dụng chỉnh sửa
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Divider */}
                {hasImage && (
                    <>
                        <div className="px-6">
                            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>

                        {/* Complete Section */}
                        <div className="p-6 space-y-3">
                            {/* 3D Preview - Temporarily disabled due to CORS issues */}
                            {/* <button
                                onClick={onComplete}
                                className="w-full py-3 px-6 rounded-xl border-2 border-emerald-500 text-emerald-400 font-semibold hover:bg-emerald-500/10 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <EyeIcon className="w-5 h-5" />
                                Xem trước 3D
                            </button> */}
                            
                            {/* Order Design Button */}
                            <button
                                onClick={onOrderDesign}
                                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                            >
                                <ShoppingCartIcon className="w-5 h-5" />
                                Đặt hàng thiết kế này
                            </button>

                            {/* Save Design Button */}
                            <button
                                onClick={onSaveDesign}
                                disabled={isSaving}
                                className="w-full py-3 px-6 rounded-xl border border-white/10 text-white font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2Icon className="w-5 h-5 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <SaveIcon className="w-5 h-5" />
                                        Lưu thiết kế
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                Đặt khăn in với thiết kế AI của bạn
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

