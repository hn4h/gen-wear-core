"use client";

import dynamic from "next/dynamic";
import { DesignControls, useDesignGeneration } from "../src/features/design-studio";

const BandanaViewer = dynamic(
    () => import("../src/features/design-studio").then((mod) => mod.BandanaViewer),
    { ssr: false }
);

export default function Home() {
    const { prompt, setPrompt, generatedPrompt, isLoading, textureUrl, generatePattern } = useDesignGeneration();

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
                <DesignControls
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onGenerate={generatePattern}
                    isLoading={isLoading}
                />
            </div>



            {generatedPrompt && (
                <div className="w-full max-w-5xl mt-6 p-6 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Refined Prompt</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-mono text-sm">{generatedPrompt}</p>
                </div>
            )}

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>Use your mouse to rotate the view. Scroll to zoom.</p>
            </div>
        </main>
    );
}
