import { useState } from "react";

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

    const generatePattern = async () => {
        if (!prompt) return;

        setIsLoading(true);
        // Clear previous results while loading
        setGeneratedPrompt("");
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                // console.error("API Error:", response.status, errorText); // Removed console.error as per style guide preference if possible, but kept simple error handling.
                // Keeping it simple as per original code structure but improving types.
                 console.error("API Error:", response.status, errorText);
                throw new Error(`API responded with status ${response.status}: ${errorText}`);
            }

            const data: GenResponse = await response.json();
            if (data.url) {
                setTextureUrl(data.url);
            }
            if (data.prompt) {
                setGeneratedPrompt(data.prompt);
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
        generatedPrompt,
        isLoading,
        textureUrl,
        generatePattern,
    };
}
