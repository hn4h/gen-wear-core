import { useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Center, Environment } from "@react-three/drei";
import * as THREE from "three";

function BandanaMesh({ textureUrl }: { textureUrl?: string }) {
    const meshRef = useRef<THREE.Mesh>(null);

    const url = textureUrl || "https://placehold.co/1024x1024/ef4444/ffffff/png?text=Gen+Wear";

    // Use explicit loader to handle CORS
    const texture = useLoader(THREE.TextureLoader, url, (loader) => {
        loader.setCrossOrigin("anonymous");
    });

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
                map={textureUrl ? texture : undefined}
                color={!textureUrl ? "#ef4444" : undefined}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

export default function BandanaViewer({ textureUrl }: { textureUrl?: string }) {
    return (
        <div className="w-full h-full bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden relative">
            <Canvas camera={{ position: [0, 5, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
                <Center>
                    <Suspense fallback={null}>
                        <BandanaMesh key={textureUrl} textureUrl={textureUrl} />
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
