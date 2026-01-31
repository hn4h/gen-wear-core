"use client";

import { useRef, useState, useCallback, useEffect, MouseEvent } from "react";
import { RegionSelection } from "../hooks/useRegionEdit";
import { Square, PenTool, Trash2 } from "lucide-react";

// Cast icons
const SquareIcon = Square as any;
const PenToolIcon = PenTool as any;
const Trash2Icon = Trash2 as any;

type DrawingMode = "rectangle" | "freeform";

interface Point {
    x: number;
    y: number;
}

interface StudioCanvasProps {
    imageUrl: string | undefined;
    region: RegionSelection | null;
    onRegionChange: (region: RegionSelection | null) => void;
    onMaskGenerated: (maskBase64: string | null) => void;
    isLoading: boolean;
}

export function StudioCanvas({ 
    imageUrl, 
    region, 
    onRegionChange, 
    onMaskGenerated,
    isLoading 
}: StudioCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    
    const [drawingMode, setDrawingMode] = useState<DrawingMode>("freeform");
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<Point | null>(null);
    const [pathPoints, setPathPoints] = useState<Point[]>([]);
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

    // Generate mask as base64
    const generateMaskBase64 = useCallback(() => {
        const maskCanvas = maskCanvasRef.current;
        if (!maskCanvas) return null;

        const ctx = maskCanvas.getContext("2d");
        if (!ctx) return null;

        // Clear mask canvas (black background)
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        if (drawingMode === "rectangle" && region) {
            // Draw white rectangle for mask
            const x = region.x * maskCanvas.width;
            const y = region.y * maskCanvas.height;
            const width = region.width * maskCanvas.width;
            const height = region.height * maskCanvas.height;
            
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(x, y, width, height);
        } else if (drawingMode === "freeform" && pathPoints.length > 2) {
            // Draw white filled path for mask
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.moveTo(pathPoints[0].x * maskCanvas.width, pathPoints[0].y * maskCanvas.height);
            
            for (let i = 1; i < pathPoints.length; i++) {
                ctx.lineTo(pathPoints[i].x * maskCanvas.width, pathPoints[i].y * maskCanvas.height);
            }
            
            ctx.closePath();
            ctx.fill();
        }

        // Return base64 (without data URI prefix for API)
        const dataUrl = maskCanvas.toDataURL("image/png");
        return dataUrl.split(",")[1]; // Remove "data:image/png;base64," prefix
    }, [drawingMode, region, pathPoints]);

    // Update mask when drawing changes
    useEffect(() => {
        const hasSelection = (drawingMode === "rectangle" && region) || 
                            (drawingMode === "freeform" && pathPoints.length > 2);
        
        if (hasSelection) {
            const maskBase64 = generateMaskBase64();
            onMaskGenerated(maskBase64);
        } else {
            onMaskGenerated(null);
        }
    }, [drawingMode, region, pathPoints, generateMaskBase64, onMaskGenerated]);

    // Draw the selection visualization on canvas
    const drawSelection = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageSize) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (drawingMode === "rectangle" && region) {
            // Rectangle mode
            const x = region.x * canvas.width;
            const y = region.y * canvas.height;
            const width = region.width * canvas.width;
            const height = region.height * canvas.height;

            // Draw semi-transparent overlay
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Clear the selected region
            ctx.clearRect(x, y, width, height);

            // Draw border around selection
            ctx.strokeStyle = "#a855f7";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(x, y, width, height);

            // Draw corner handles
            const handleSize = 8;
            ctx.fillStyle = "#a855f7";
            ctx.setLineDash([]);
            ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
            ctx.fillRect(x + width - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
            ctx.fillRect(x - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize);
            ctx.fillRect(x + width - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize);
        } else if (drawingMode === "freeform" && pathPoints.length > 0) {
            // Freeform mode
            // Draw semi-transparent overlay first
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Clear the drawn path area
            if (pathPoints.length > 2) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(pathPoints[0].x * canvas.width, pathPoints[0].y * canvas.height);
                
                for (let i = 1; i < pathPoints.length; i++) {
                    ctx.lineTo(pathPoints[i].x * canvas.width, pathPoints[i].y * canvas.height);
                }
                
                ctx.closePath();
                ctx.clip();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }

            // Draw the path outline
            ctx.strokeStyle = "#ec4899";
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.setLineDash([]);
            
            ctx.beginPath();
            ctx.moveTo(pathPoints[0].x * canvas.width, pathPoints[0].y * canvas.height);
            
            for (let i = 1; i < pathPoints.length; i++) {
                ctx.lineTo(pathPoints[i].x * canvas.width, pathPoints[i].y * canvas.height);
            }
            
            if (!isDrawing && pathPoints.length > 2) {
                ctx.closePath();
            }
            
            ctx.stroke();

            // Draw dots at path points
            ctx.fillStyle = "#ec4899";
            pathPoints.forEach((point, index) => {
                if (index === 0 || index === pathPoints.length - 1) {
                    ctx.beginPath();
                    ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
    }, [region, pathPoints, imageSize, drawingMode, isDrawing]);

    useEffect(() => {
        drawSelection();
    }, [drawSelection]);

    // Handle image load to set canvas size
    const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

        // Update canvas sizes to match displayed image
        const canvas = canvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        if (canvas) {
            canvas.width = img.offsetWidth;
            canvas.height = img.offsetHeight;
        }
        if (maskCanvas) {
            // Mask canvas uses original image dimensions for API
            maskCanvas.width = img.naturalWidth;
            maskCanvas.height = img.naturalHeight;
        }
    }, []);

    // Get mouse position relative to canvas
    const getCanvasPosition = useCallback((e: MouseEvent<HTMLCanvasElement>): Point | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
        };
    }, []);

    const handleMouseDown = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
        const pos = getCanvasPosition(e);
        if (!pos) return;

        setIsDrawing(true);
        
        if (drawingMode === "rectangle") {
            setStartPos(pos);
            onRegionChange(null);
        } else {
            // Freeform - start new path
            setPathPoints([pos]);
        }
    }, [getCanvasPosition, onRegionChange, drawingMode]);

    const handleMouseMove = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const pos = getCanvasPosition(e);
        if (!pos) return;

        if (drawingMode === "rectangle" && startPos) {
            const newRegion: RegionSelection = {
                x: Math.min(startPos.x, pos.x),
                y: Math.min(startPos.y, pos.y),
                width: Math.abs(pos.x - startPos.x),
                height: Math.abs(pos.y - startPos.y),
            };
            onRegionChange(newRegion);
        } else if (drawingMode === "freeform") {
            // Add point to path (throttle to avoid too many points)
            setPathPoints(prev => {
                const lastPoint = prev[prev.length - 1];
                const distance = Math.sqrt(
                    Math.pow(pos.x - lastPoint.x, 2) + Math.pow(pos.y - lastPoint.y, 2)
                );
                // Only add point if far enough from last point
                if (distance > 0.01) {
                    return [...prev, pos];
                }
                return prev;
            });
        }
    }, [isDrawing, startPos, getCanvasPosition, onRegionChange, drawingMode]);

    const handleMouseUp = useCallback(() => {
        setIsDrawing(false);
        setStartPos(null);
    }, []);

    const clearSelection = useCallback(() => {
        onRegionChange(null);
        setPathPoints([]);
        onMaskGenerated(null);
    }, [onRegionChange, onMaskGenerated]);

    // Update canvas size on window resize
    useEffect(() => {
        const handleResize = () => {
            const img = containerRef.current?.querySelector("img");
            const canvas = canvasRef.current;
            if (img && canvas) {
                canvas.width = img.offsetWidth;
                canvas.height = img.offsetHeight;
                drawSelection();
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [drawSelection]);

    const hasSelection = (drawingMode === "rectangle" && region) || 
                        (drawingMode === "freeform" && pathPoints.length > 2);

    return (
        <div className="flex-1 flex flex-col bg-slate-900 rounded-xl overflow-hidden">
            {/* Canvas Header with Tools */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Canvas</h2>
                
                <div className="flex items-center gap-2">
                    {/* Drawing Mode Toggle */}
                    {imageUrl && !isLoading && (
                        <>
                            <div className="flex bg-slate-700/50 rounded-lg p-1 gap-1">
                                <button
                                    onClick={() => { setDrawingMode("rectangle"); clearSelection(); }}
                                    className={`p-2 rounded-md transition-colors ${
                                        drawingMode === "rectangle" 
                                            ? "bg-purple-600 text-white" 
                                            : "text-gray-400 hover:text-white"
                                    }`}
                                    title="Chọn vùng hình chữ nhật"
                                >
                                    <SquareIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { setDrawingMode("freeform"); clearSelection(); }}
                                    className={`p-2 rounded-md transition-colors ${
                                        drawingMode === "freeform" 
                                            ? "bg-pink-600 text-white" 
                                            : "text-gray-400 hover:text-white"
                                    }`}
                                    title="Vẽ tự do"
                                >
                                    <PenToolIcon className="w-4 h-4" />
                                </button>
                            </div>
                            
                            {hasSelection && (
                                <button
                                    onClick={clearSelection}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Xóa vùng chọn"
                                >
                                    <Trash2Icon className="w-4 h-4" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Canvas Area */}
            <div 
                ref={containerRef}
                className="flex-1 flex items-center justify-center p-6 relative"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400">Đang tạo thiết kế...</p>
                    </div>
                ) : imageUrl ? (
                    <div className="relative max-w-full max-h-full">
                        <img
                            src={imageUrl}
                            alt="Generated design"
                            className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl"
                            onLoad={handleImageLoad}
                            crossOrigin="anonymous"
                        />
                        {/* Visible drawing canvas */}
                        <canvas
                            ref={canvasRef}
                            className={`absolute top-0 left-0 w-full h-full rounded-lg ${
                                drawingMode === "freeform" ? "cursor-crosshair" : "cursor-crosshair"
                            }`}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        />
                        {/* Hidden mask canvas for generating mask image */}
                        <canvas
                            ref={maskCanvasRef}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                            <svg className="w-16 h-16 text-purple-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Chưa có thiết kế
                        </h3>
                        <p className="text-gray-400 max-w-sm">
                            Nhập ý tưởng thiết kế ở bên trái và nhấn "Tạo thiết kế" để bắt đầu
                        </p>
                    </div>
                )}
            </div>

            {/* Canvas Footer - Instructions */}
            {imageUrl && !isLoading && (
                <div className="p-4 border-t border-white/10 bg-slate-800/50">
                    <p className="text-sm text-gray-400 text-center">
                        💡 {drawingMode === "rectangle" 
                            ? "Kéo chuột để chọn vùng hình chữ nhật" 
                            : "Vẽ tự do để khoanh vùng cần chỉnh sửa"}
                    </p>
                </div>
            )}
        </div>
    );
}
