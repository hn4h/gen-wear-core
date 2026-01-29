"use client";

import { useEffect, useRef } from "react";
import { X, Download, RotateCcw } from "lucide-react";
import { BandanaViewer } from "./BandanaViewer";

// Cast icons
const XIcon = X as any;
const DownloadIcon = Download as any;
const RotateCcwIcon = RotateCcw as any;

interface Preview3DModalProps {
    isOpen: boolean;
    onClose: () => void;
    textureUrl: string;
    onSave?: () => void;
}

export function Preview3DModal({ isOpen, onClose, textureUrl, onSave }: Preview3DModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    // Close on click outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === modalRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            ref={modalRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
            <div className="relative w-full max-w-5xl h-[80vh] mx-4 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-slate-900 to-transparent">
                    <div>
                        <h2 className="text-xl font-bold text-white">Xem trước 3D</h2>
                        <p className="text-sm text-gray-400">Xoay để xem thiết kế từ các góc độ khác nhau</p>
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* 3D Viewer */}
                <div className="absolute inset-0 pt-20 pb-24">
                    <BandanaViewer textureUrl={textureUrl} />
                </div>

                {/* Footer with actions */}
                <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-4 p-6 bg-gradient-to-t from-slate-900 to-transparent">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-gray-300 hover:text-white border border-white/20 rounded-xl hover:bg-white/5 transition-colors font-medium"
                    >
                        Tiếp tục chỉnh sửa
                    </button>
                    
                    {onSave && (
                        <button
                            onClick={onSave}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold shadow-lg shadow-purple-500/25 flex items-center gap-2"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            Lưu thiết kế
                        </button>
                    )}
                </div>

                {/* Instructions overlay */}
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                        <RotateCcwIcon className="w-4 h-4" />
                        Kéo để xoay • Cuộn để zoom
                    </p>
                </div>
            </div>
        </div>
    );
}
