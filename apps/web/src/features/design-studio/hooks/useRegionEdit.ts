import { useState, useCallback } from "react";

export interface RegionSelection {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface UseRegionEditReturn {
    editPrompt: string;
    setEditPrompt: (prompt: string) => void;
    region: RegionSelection | null;
    setRegion: (region: RegionSelection | null) => void;
    isApplying: boolean;
    applyEdit: (imageBase64: string, maskBase64: string) => Promise<string | null>;
    clearRegion: () => void;
}

export function useRegionEdit(): UseRegionEditReturn {
    const [editPrompt, setEditPrompt] = useState("");
    const [region, setRegion] = useState<RegionSelection | null>(null);
    const [isApplying, setIsApplying] = useState(false);

    const clearRegion = useCallback(() => {
        setRegion(null);
    }, []);

    const applyEdit = useCallback(async (imageBase64: string, maskBase64: string): Promise<string | null> => {
        if (!editPrompt || !imageBase64 || !maskBase64) return null;

        setIsApplying(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generation/edit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image_base64: imageBase64,
                    mask_base64: maskBase64,
                    prompt: editPrompt,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Edit API Error:", response.status, errorText);
                throw new Error(`API responded with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return data.url || null;
        } catch (error) {
            console.error("Failed to apply edit:", error);
            // For MVP, return null on error - frontend will handle gracefully
            return null;
        } finally {
            setIsApplying(false);
        }
    }, [editPrompt]);

    return {
        editPrompt,
        setEditPrompt,
        region,
        setRegion,
        isApplying,
        applyEdit,
        clearRegion,
    };
}
