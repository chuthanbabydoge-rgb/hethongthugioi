import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, Sparkles } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";
import { useWebGLSupported } from "@/hooks/useWebGLSupported";

function SceneElements() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <>
      <fogExp2 attach="fog" args={["#1a0a2e", 0.008]} />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      
      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <pointLight color="#f59e0b" intensity={2} distance={50} position={[10, 5, 0]} />
        </Float>
        <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1}>
          <pointLight color="#ef4444" intensity={2} distance={50} position={[-10, -5, 0]} />
        </Float>
      </group>
      
      <Sparkles count={100} scale={20} size={2} speed={0.4} opacity={0.2} color="#f59e0b" />
      <ambientLight intensity={0.2} />
    </>
  );
}

export function SpatialScene() {
  const webGLSupported = useWebGLSupported();
  const [contextLost, setContextLost] = useState(false);

  if (!webGLSupported || contextLost) return null;

  return (
    <CanvasErrorBoundary>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Canvas
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0, 15], fov: 60 }}
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            const handleLost = (e: Event) => {
              e.preventDefault();
              setContextLost(true);
            };
            canvas.addEventListener("webglcontextlost", handleLost, false);
          }}
        >
          <Suspense fallback={null}>
            <SceneElements />
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
