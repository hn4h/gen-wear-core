"use client";

import dynamic from "next/dynamic";
import { DesignControls, useDesignGeneration } from "../src/features/design-studio";

const BandanaViewer = dynamic(
    () => import("../src/features/design-studio").then((mod) => mod.BandanaViewer),
    { ssr: false }
);

export default function Home() {
    const { prompt, setPrompt, isLoading, textureUrl, generatePattern } = useDesignGeneration();

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

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>Use your mouse to rotate the view. Scroll to zoom.</p>
            </div>
        </main>
    );
}
