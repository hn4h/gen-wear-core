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

    // Load texture manually to handle base64 data URIs
    useEffect(() => {
        const loader = new THREE.TextureLoader();
        const texturePath = textureUrl || '/textures/bandana_placeholder.png';
        
        loader.load(
            texturePath,
            (loadedTexture) => {
                // Configure texture
                loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
                loadedTexture.center.set(0.5, 0.5);
                loadedTexture.colorSpace = THREE.SRGBColorSpace;
                loadedTexture.needsUpdate = true;
                setTexture(loadedTexture);
            },
            undefined,
            (error) => {
                console.error("Failed to load texture:", error);
                // Load fallback on error
                loader.load('/textures/bandana_placeholder.png', (fallback) => {
                    fallback.wrapS = fallback.wrapT = THREE.RepeatWrapping;
                    fallback.colorSpace = THREE.SRGBColorSpace;
                    setTexture(fallback);
                });
            }
        );

        // Cleanup
        return () => {
            if (texture) {
                texture.dispose();
            }
        };
    }, [textureUrl]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Subtle idle rotation
            // meshRef.current.rotation.y += delta * 0.05; 
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4, 4]} />
            <meshStandardMaterial
                map={texture}
                side={THREE.DoubleSide}
                color={texture ? undefined : "#666666"}
            />
        </mesh>
    );
}

export function BandanaViewer({ textureUrl }: { textureUrl?: string }) {
    return (
        <div className="w-full h-full bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden relative">
            <Canvas camera={{ position: [0, 5, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
                <Center>
                    <Suspense fallback={null}>
                        <ErrorBoundary fallback={<mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[4, 4]} /><meshStandardMaterial color="#ef4444" /></mesh>}>
                            <BandanaMesh key={textureUrl} textureUrl={textureUrl} />
                        </ErrorBoundary>
                    </Suspense>
                </Center>
                <Environment preset="city" />
            </Canvas>

            <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-black/80 backdrop-blur px-3 py-1 rounded text-xs font-mono">
                Drag to rotate • Scroll to zoom
            </div>
        </div>
    );
}
