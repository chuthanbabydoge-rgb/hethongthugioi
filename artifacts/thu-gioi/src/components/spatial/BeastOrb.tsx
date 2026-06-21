import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Beast } from "@workspace/api-client-react";

interface BeastOrbProps {
  beast: Beast;
  position: [number, number, number];
}

const getTierColor = (tier: number) => {
  if (tier <= 2) return "#8c8c8c";
  if (tier <= 4) return "#4ade80";
  if (tier <= 6) return "#facc15";
  if (tier <= 8) return "#c084fc";
  if (tier <= 9) return "#22d3ee";
  if (tier === 10) return "#fbbf24";
  return "#991b1b";
};

const getEmissiveIntensity = (tier: number) => {
  if (tier >= 10) return 2;
  if (tier >= 7) return 1;
  return 0.5;
};

export function BeastOrb({ beast, position }: BeastOrbProps) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const tierColor = getTierColor(beast.tier || 1);
  const emissiveIntensity = getEmissiveIntensity(beast.tier || 1);

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <Float speed={1.5 + Math.random()} floatIntensity={0.5} rotationIntensity={0.5}>
      <group position={position}>
        <mesh
          ref={meshRef}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
          onClick={(e) => { e.stopPropagation(); setClicked(!clicked); }}
        >
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial 
            color={tierColor}
            emissive={tierColor}
            emissiveIntensity={emissiveIntensity}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        
        {hovered && (
          <Text
            position={[0, 1, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {beast.name}
          </Text>
        )}

        {clicked && (
          <Html position={[0, 0, 0]} center zIndexRange={[100, 0]}>
            <div className="bg-[#050514]/90 backdrop-blur-xl border border-primary/50 p-4 rounded-xl text-foreground w-64 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <h3 className="text-xl font-serif text-primary mb-1">{beast.name}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">{beast.tierName}</p>
              <div className="flex justify-between text-sm border-t border-primary/20 pt-3 mb-2">
                <span className="text-muted-foreground">Chủng tộc:</span>
                <span className="text-right">{beast.raceCategory}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Chiến lực:</span>
                <span className="text-accent">{beast.power}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">Loài:</span>
                <span>{beast.speciesName}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setClicked(false); }}
                className="w-full py-2 text-xs font-serif tracking-widest text-center border border-primary/30 rounded-md hover:bg-primary/10 text-primary transition-colors"
              >
                Đóng
              </button>
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}
