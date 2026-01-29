import { Loader2 } from "lucide-react";

// Cast icon to any to avoid "LucideIcon is not a valid JSX element type" error
const Loader2Icon = Loader2 as any;

interface DesignControlsProps {
    prompt: string;
    setPrompt: (value: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    minimal?: boolean;
}

export function DesignControls({ prompt, setPrompt, onGenerate, isLoading, minimal = false }: DesignControlsProps) {
    const containerClasses = minimal 
        ? "w-full bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20"
        : "absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/90 dark:bg-black/90 backdrop-blur p-4 rounded-xl shadow-lg border transition-all duration-300";

    const inputClasses = minimal
        ? "flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
        : "flex-1 px-4 py-2 rounded-md bg-transparent border border-input text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    const buttonClasses = minimal
        ? "inline-flex items-center justify-center rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 h-10 px-4 py-2 disabled:opacity-50"
        : "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2";

    return (
        <div className={containerClasses}>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={minimal ? "Describe pattern..." : "Describe your bandana pattern..."}
                    className={inputClasses}
                    onKeyDown={(e) => e.key === "Enter" && onGenerate()}
                />
                <button
                    onClick={onGenerate}
                    disabled={isLoading || !prompt}
                    className={buttonClasses}
                >
                    {isLoading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : "Generate"}
                </button>
            </div>
        </div>
    );
}
