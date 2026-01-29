"use client";

import { Loader2, Sparkles, Wand2, Eye } from "lucide-react";
import { RegionSelection } from "../hooks/useRegionEdit";

// Cast icons to any to avoid type errors
const Loader2Icon = Loader2 as any;
const SparklesIcon = Sparkles as any;
const Wand2Icon = Wand2 as any;
const EyeIcon = Eye as any;

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
}: StudioLeftPanelProps) {
    const canGenerate = designPrompt.trim().length > 0 && !isGenerating;
    const canApplyEdit = hasImage && hasMask && editPrompt.trim().length > 0 && !isApplying;

    return (
        <div className="w-full lg:w-[400px] flex-shrink-0 bg-slate-800/50 backdrop-blur-sm border-r border-white/10 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    AI Studio
                </h1>
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

                    {/* Design Idea Textarea */}
                    <div className="space-y-2 mb-4">
                        <label className="block text-sm font-medium text-gray-300">
                            Ý tưởng thiết kế
                        </label>
                        <textarea
                            value={designPrompt}
                            onChange={(e) => setDesignPrompt(e.target.value)}
                            placeholder="Mô tả ý tưởng thiết kế của bạn... Ví dụ: Họa tiết hoa sen truyền thống với màu đỏ và vàng"
                            className="w-full h-32 px-4 py-3 rounded-xl bg-slate-700/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
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
                            className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm appearance-none cursor-pointer"
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
                        disabled={!canGenerate}
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
                <div className="px-6">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                {/* Region Edit Section */}
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
                                    disabled={!hasMask}
                                    className="w-full h-24 px-4 py-3 rounded-xl bg-slate-700/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Apply Edit Button */}
                            <button
                                onClick={onApplyEdit}
                                disabled={!canApplyEdit}
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

                {/* Divider */}
                {hasImage && (
                    <>
                        <div className="px-6">
                            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>

                        {/* Complete Section */}
                        <div className="p-6">
                            <button
                                onClick={onComplete}
                                className="w-full py-3 px-6 rounded-xl border-2 border-emerald-500 text-emerald-400 font-semibold hover:bg-emerald-500/10 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <EyeIcon className="w-5 h-5" />
                                Xem trước 3D
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Xem thiết kế của bạn trên mô hình 3D
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

