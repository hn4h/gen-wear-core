"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const BandanaViewer = dynamic(
    () => import("@/components/canvas/BandanaViewer"),
    { ssr: false }
);

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [textureUrl, setTextureUrl] = useState<string | undefined>();

    const handleGenerate = async () => {
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

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Gen Wear</h1>
                    <p className="text-muted-foreground mt-2">AI-Powered Pattern Generation & 3D Visualization</p>
                </div>
            </div>

            <div className="w-full h-[600px] border rounded-lg shadow-sm overflow-hidden bg-slate-50 relative group">
                <BandanaViewer textureUrl={textureUrl} />

                {/* UI Overlay */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/90 dark:bg-black/90 backdrop-blur p-4 rounded-xl shadow-lg border transition-all duration-300">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your bandana pattern..."
                            className="flex-1 px-4 py-2 rounded-md bg-transparent border border-input text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>Use your mouse to rotate the view. Scroll to zoom.</p>
            </div>
        </main>
    );
}
