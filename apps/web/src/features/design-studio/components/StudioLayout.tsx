"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StudioLeftPanel } from "./StudioLeftPanel";
import { StudioCanvas } from "./StudioCanvas";
import { Preview3DModal } from "./Preview3DModal";
import { useDesignGeneration } from "../hooks/useDesignGeneration";
import { useRegionEdit } from "../hooks/useRegionEdit";
import { Header } from "@/src/components/layout/Header";
import { useDesignOrderStore } from "@/src/lib/useDesignOrderStore";
import { designsAPI } from "@/src/services/designs";
import { getAuthToken } from "@/src/lib/useAuthStore";

export function StudioLayout() {
    const router = useRouter();
    const { setDesign } = useDesignOrderStore();
    const [selectedStyle, setSelectedStyle] = useState("");
    const [show3DPreview, setShow3DPreview] = useState(false);
    const [maskBase64, setMaskBase64] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Design generation hook
    const {
        prompt: designPrompt,
        setPrompt: setDesignPrompt,
        generatedPrompt,
        isLoading: isGenerating,
        textureUrl,
        generatePattern,
    } = useDesignGeneration();

    // Region edit hook
    const {
        editPrompt,
        setEditPrompt,
        region,
        setRegion,
        isApplying,
        applyEdit,
        clearRegion,
    } = useRegionEdit();

    // Current displayed image (either original or edited)
    const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>();

    // Update current image when new design is generated
    const handleGenerate = useCallback(async () => {
        await generatePattern();
    }, [generatePattern]);

    // When textureUrl changes, update currentImageUrl
    const displayedImage = textureUrl || currentImageUrl;

    // Handle mask generation from canvas
    const handleMaskGenerated = useCallback((mask: string | null) => {
        setMaskBase64(mask);
    }, []);

    // Handle apply edit - pass image and mask to API
    const handleApplyEdit = useCallback(async () => {
        if (!displayedImage || !maskBase64) return;
        
        // Extract base64 from data URI if needed
        const imageBase64 = displayedImage.includes(",") 
            ? displayedImage.split(",")[1] 
            : displayedImage;
        
        const editedUrl = await applyEdit(imageBase64, maskBase64);
        if (editedUrl) {
            setCurrentImageUrl(editedUrl);
            clearRegion();
            setEditPrompt("");
            setMaskBase64(null);
        }
    }, [displayedImage, maskBase64, applyEdit, clearRegion, setEditPrompt]);

    // Handle 3D preview
    const handleComplete = useCallback(() => {
        setShow3DPreview(true);
    }, []);

    const handleSaveDesign = useCallback(async () => {
        if (!displayedImage) return;

        const token = getAuthToken();
        if (!token) {
            alert("Vui lòng đăng nhập để lưu thiết kế");
            router.push("/login?redirect=/studio");
            return;
        }

        try {
            setIsSaving(true);
            await designsAPI.saveDesign({
                image_url: displayedImage,
                prompt: designPrompt,
            });
            alert("Lưu thiết kế thành công! Bạn có thể xem lại trong mục 'Thiết kế của tôi'");
        } catch (error) {
            console.error("Error saving design:", error);
            alert("Lưu thiết kế thất bại, vui lòng thử lại sau.");
        } finally {
            setIsSaving(false);
        }
    }, [displayedImage, designPrompt, router]);

    const handleOrderDesign = useCallback(() => {
        if (!displayedImage) return;
        setDesign(displayedImage, designPrompt);
        router.push('/checkout?type=design');
    }, [displayedImage, designPrompt, setDesign, router]);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <Header />
            
            {/* Main Content - below fixed header */}
            <div className="flex-1 flex flex-col lg:flex-row pt-20">
                {/* Left Panel - Controls */}
                <StudioLeftPanel
                    designPrompt={designPrompt}
                    setDesignPrompt={setDesignPrompt}
                    selectedStyle={selectedStyle}
                    setSelectedStyle={setSelectedStyle}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    generatedPrompt={generatedPrompt}
                    editPrompt={editPrompt}
                    setEditPrompt={setEditPrompt}
                    region={region}
                    hasMask={!!maskBase64}
                    onApplyEdit={handleApplyEdit}
                    isApplying={isApplying}
                    hasImage={!!displayedImage}
                    onComplete={handleComplete}
                    onOrderDesign={handleOrderDesign}
                    onSaveDesign={handleSaveDesign}
                    isSaving={isSaving}
                />

                {/* Right Panel - Canvas */}
                <StudioCanvas
                    imageUrl={displayedImage}
                    region={region}
                    onRegionChange={setRegion}
                    onMaskGenerated={handleMaskGenerated}
                    isLoading={isGenerating}
                />
            </div>

            {/* 3D Preview Modal */}
            {displayedImage && (
                <Preview3DModal
                    isOpen={show3DPreview}
                    onClose={() => setShow3DPreview(false)}
                    textureUrl={displayedImage}
                    onSave={handleSaveDesign}
                />
            )}
        </div>
    );
}
