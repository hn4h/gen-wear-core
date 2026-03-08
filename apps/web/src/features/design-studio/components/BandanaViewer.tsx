import { useRef, Suspense, useEffect, useState, Component, ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Center, Environment } from "@react-three/drei";
import * as THREE from "three";

class ErrorBoundary extends Component<{ children: ReactNode, fallback?: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: any) { console.error("BandanaViewer error:", error); }
    render() {
        if (this.state.hasError) return this.props.fallback || null;
        return this.props.children;
    }
}

function BandanaMesh({ textureUrl }: { textureUrl?: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load texture manually — handles both data URI (base64) and regular URLs.
    // THREE.TextureLoader uses XHR internally which fails on data URIs in some browsers.
    useEffect(() => {
        let disposed = false;
        let currentTexture: THREE.Texture | null = null;

        const loadFromSrc = (src: string): Promise<THREE.Texture> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                
                // Important: Set crossOrigin before setting src
                // For data URLs, this should be empty string or not set
                if (!src.startsWith('data:')) {
                    img.crossOrigin = 'anonymous';
                }
                
                img.onload = () => {
                    console.log('[BandanaMesh] Image loaded successfully, dimensions:', img.width, 'x', img.height);
                    const tex = new THREE.Texture(img);
                    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                    tex.colorSpace = THREE.SRGBColorSpace;
                    tex.needsUpdate = true;
                    resolve(tex);
                };
                
                img.onerror = (e) => {
                    console.error('[BandanaMesh] Image failed to load:', e);
                    reject(e);
                };
                
                // Set src after setting up handlers
                img.src = src;
            });
        };

        const run = async () => {
            setIsLoading(true);
            const src = textureUrl || '/textures/bandana_placeholder.png';
            console.log('[BandanaMesh] Loading texture from:', src.startsWith('data:') ? 'data URL' : src);
            
            try {
                const tex = await loadFromSrc(src);
                if (!disposed) {
                    currentTexture = tex;
                    setTexture(tex);
                    setIsLoading(false);
                    console.log('[BandanaMesh] Texture set successfully');
                }
            } catch (err) {
                console.error("[BandanaMesh] Failed to load texture:", err);
                // Fallback to placeholder
                try {
                    const fallback = await loadFromSrc('/textures/bandana_placeholder.png');
                    if (!disposed) {
                        currentTexture = fallback;
                        setTexture(fallback);
                        setIsLoading(false);
                    }
                } catch (_) { 
                    console.error('[BandanaMesh] Failed to load fallback texture');
                    setIsLoading(false);
                }
            }
        };

        run();

        return () => {
            disposed = true;
            if (currentTexture) {
                currentTexture.dispose();
            }
        };
    }, [textureUrl]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Subtle idle rotation
            // meshRef.current.rotation.y += delta * 0.05; 
        }
    });

    // Show a loading state or placeholder while texture is loading
    if (isLoading) {
        return (
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[4, 4]} />
                <meshStandardMaterial
                    color="#444444"
                    side={THREE.DoubleSide}
                />
            </mesh>
        );
    }

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4, 4]} />
            <meshStandardMaterial
                map={texture}
                side={THREE.DoubleSide}
                color={texture ? undefined : "#666666"}
                transparent={false}
            />
        </mesh>
    );
}

export function BandanaViewer({ textureUrl }: { textureUrl?: string }) {
    const [loadError, setLoadError] = useState(false);
    
    useEffect(() => {
        console.log('[BandanaViewer] textureUrl changed:', textureUrl ? (textureUrl.startsWith('data:') ? 'data URL (' + textureUrl.length + ' chars)' : textureUrl) : 'undefined');
        setLoadError(false);
    }, [textureUrl]);
    
    return (
        <div className="w-full h-full bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden relative">
            {loadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 z-10">
                    <div className="text-center p-4">
                        <p className="text-red-400 font-semibold">Không thể tải ảnh texture</p>
                        <p className="text-red-300 text-sm mt-2">Vui lòng thử lại</p>
                    </div>
                </div>
            )}
            
            <Canvas camera={{ position: [0, 5, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
                <Center>
                    <Suspense fallback={
                        <mesh rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[4, 4]} />
                            <meshStandardMaterial color="#333333" />
                        </mesh>
                    }>
                        <ErrorBoundary 
                            fallback={
                                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                                    <planeGeometry args={[4, 4]} />
                                    <meshStandardMaterial color="#ef4444" />
                                </mesh>
                            }
                        >
                            <BandanaMesh key={textureUrl} textureUrl={textureUrl} />
                        </ErrorBoundary>
                    </Suspense>
                </Center>
                <Environment preset="city" />
            </Canvas>

            <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-black/80 backdrop-blur px-3 py-1 rounded text-xs font-mono">
                Drag to rotate • Scroll to zoom
            </div>
            
            {!textureUrl && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500/80 backdrop-blur px-4 py-2 rounded text-xs font-medium text-black">
                    Chưa có ảnh texture
                </div>
            )}
        </div>
    );
}
