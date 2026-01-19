import { useState } from "react";

interface UseDesignGenerationReturn {
    prompt: string;
    setPrompt: (prompt: string) => void;
    isLoading: boolean;
    textureUrl: string | undefined;
    generatePattern: () => Promise<void>;
}

export function useDesignGeneration(): UseDesignGenerationReturn {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [textureUrl, setTextureUrl] = useState<string | undefined>();

    const generatePattern = async () => {
        if (!prompt) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();
            if (data.url) {
                setTextureUrl(data.url);
            }
        } catch (error) {
            console.error("Failed to generate:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        prompt,
        setPrompt,
        isLoading,
        textureUrl,
        generatePattern,
    };
}
