import { useRef, Suspense, useEffect, Component, ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Center, Environment, useTexture } from "@react-three/drei";
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
    // Use textureUrl if available, otherwise fallback to placeholder
    const texturePath = textureUrl || '/textures/bandana_placeholder.png';
    const texture = useTexture(texturePath);

    // Configure texture
    useEffect(() => {
        if (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.center.set(0.5, 0.5);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;
        }
    }, [texture]);

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
