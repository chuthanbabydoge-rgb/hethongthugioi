import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { UniverseMap } from "@workspace/api-client-react";

interface MapZone3DProps {
  zone: UniverseMap;
  index: number;
  total: number;
  onSelect: (zone: UniverseMap) => void;
}

export function MapZone3D({ zone, index, total, onSelect }: MapZone3DProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  const islandRef = useRef<THREE.Mesh>(null);

  const angle = index * ((Math.PI * 2) / total) * 3;
  const radius = 6 + (index % 4) * 2;
  const y = (index - total / 2) * 1.5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame(() => {
    if (islandRef.current) {
      islandRef.current.rotation.y += 0.005;
      if (hovered) {
        islandRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
      } else {
        islandRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const baseColor = zone.dangerLevel > 7 ? "#991b1b" : zone.dangerLevel > 4 ? "#ca8a04" : "#166534";

  return (
    <Float speed={1} floatIntensity={0.5} rotationIntensity={0.2}>
      <group position={[x, y, z]} ref={meshRef}>
        <mesh
          ref={islandRef}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
          onClick={(e) => { e.stopPropagation(); onSelect(zone); }}
        >
          <boxGeometry args={[4, 0.5, 4]} />
          <meshStandardMaterial 
            color={baseColor}
            roughness={0.9}
            metalness={0.1}
            emissive={baseColor}
            emissiveIntensity={hovered ? 0.3 : 0.05}
          />
        </mesh>

        <mesh position={[0, -0.5, 0]}>
          <coneGeometry args={[2.8, 1, 4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={1} />
        </mesh>

        <Text
          position={[0, 1.5, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="black"
        >
          {zone.zoneName}
        </Text>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.3}
          color={baseColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {zone.tierName}
        </Text>

        <Sparkles 
          count={zone.dangerLevel * 5} 
          scale={5} 
          size={1.5} 
          speed={0.6} 
          color={zone.dangerLevel > 7 ? "#ef4444" : "#facc15"} 
        />
      </group>
    </Float>
  );
}
