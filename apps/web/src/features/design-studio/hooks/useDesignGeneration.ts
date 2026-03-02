import { useState, useCallback } from "react";
import { useAuthStore } from "@/src/lib/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface GenResponse {
    url: string;
    prompt: string;
}

interface UseDesignGenerationReturn {
    prompt: string;
    setPrompt: (prompt: string) => void;
    generatedPrompt: string;
    isLoading: boolean;
    textureUrl: string | undefined;
    generatePattern: () => Promise<void>;
}

export function useDesignGeneration(): UseDesignGenerationReturn {
    const [prompt, setPrompt] = useState("");
    const [generatedPrompt, setGeneratedPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [textureUrl, setTextureUrl] = useState<string | undefined>();

    const { token } = useAuthStore();

    const generatePattern = useCallback(async () => {
        if (!prompt) {
            console.warn("[useDesignGeneration] No prompt, skipping.");
            return;
        }

        if (!token) {
            console.error("[useDesignGeneration] No auth token found");
            return;
        }

        setIsLoading(true);
        setTextureUrl(undefined);   // clear ảnh cũ để force re-render khi có ảnh mới
        setGeneratedPrompt("");

        try {
            console.log("[useDesignGeneration] Calling API:", `${API_URL}/api/generation`);
            const response = await fetch(`${API_URL}/api/generation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ prompt }),
            });

            console.log("[useDesignGeneration] Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("[useDesignGeneration] API Error:", response.status, errorText);
                throw new Error(`API responded with status ${response.status}: ${errorText}`);
            }

            const data: GenResponse = await response.json();
            console.log("[useDesignGeneration] data keys:", Object.keys(data));
            console.log("[useDesignGeneration] data.url length:", data.url?.length ?? "undefined");

            if (data.url) {
                console.log("[useDesignGeneration] Setting textureUrl, prefix:", data.url.slice(0, 30));
                setTextureUrl(data.url);
            } else {
                console.warn("[useDesignGeneration] data.url is empty or missing:", data);
            }

            if (data.prompt) {
                setGeneratedPrompt(data.prompt);
            }
        } catch (error) {
            console.error("[useDesignGeneration] Failed to generate:", error);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, token]);

    return {
        prompt,
        setPrompt,
        generatedPrompt,
        isLoading,
        textureUrl,
        generatePattern,
    };
}
