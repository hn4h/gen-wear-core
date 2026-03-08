import { useState, useCallback } from "react";
import { useAuthStore } from "@/src/lib/useAuthStore";
import { authAPI } from "@/src/services/auth";
import { toast } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.genwear.io.vn';

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

    const { token, setUser } = useAuthStore();

    const clearRegion = useCallback(() => {
        setRegion(null);
    }, []);

    const applyEdit = useCallback(async (imageBase64: string, maskBase64: string): Promise<string | null> => {
        if (!editPrompt || !imageBase64 || !maskBase64) return null;
        
        if (!token) {
            console.error("No auth token found");
            return null;
        }

        setIsApplying(true);
        try {
            const response = await fetch(`${API_URL}/api/generation/edit`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    image_base64: imageBase64,
                    mask_base64: maskBase64,
                    prompt: editPrompt,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Edit API Error:", response.status, errorText);
                let errorMessage = "Lỗi khi chỉnh sửa.";
                try {
                    const parsedError = JSON.parse(errorText);
                    if (parsedError.detail) {
                        errorMessage = parsedError.detail;
                    }
                } catch (e) {
                    // ignore
                }
                toast.error(errorMessage);
                throw new Error(`API responded with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            
            // Refresh user credits
            if (data.url) {
                try {
                    const updatedUser = await authAPI.getCurrentUser();
                    setUser(updatedUser);
                } catch (e) {
                    console.error("Failed to refresh user data:", e);
                }
            }
            
            return data.url || null;
        } catch (error) {
            console.error("Failed to apply edit:", error);
            // For MVP, return null on error - frontend will handle gracefully
            return null;
        } finally {
            setIsApplying(false);
        }
    }, [editPrompt, token, setUser]);

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
