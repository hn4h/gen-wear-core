import { Loader2 } from "lucide-react";

interface DesignControlsProps {
    prompt: string;
    setPrompt: (value: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

export function DesignControls({ prompt, setPrompt, onGenerate, isLoading }: DesignControlsProps) {
    return (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/90 dark:bg-black/90 backdrop-blur p-4 rounded-xl shadow-lg border transition-all duration-300">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your bandana pattern..."
                    className="flex-1 px-4 py-2 rounded-md bg-transparent border border-input text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onKeyDown={(e) => e.key === "Enter" && onGenerate()}
                />
                <button
                    onClick={onGenerate}
                    disabled={isLoading || !prompt}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
                </button>
            </div>
        </div>
    );
}
