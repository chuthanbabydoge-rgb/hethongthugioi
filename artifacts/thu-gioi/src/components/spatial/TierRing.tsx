import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const TIERS = [
  { level: 1, name: "Phàm Thú I", color: "#8c8c8c" },
  { level: 2, name: "Phàm Thú II", color: "#a3a3a3" },
  { level: 3, name: "Linh Thú I", color: "#4ade80" },
  { level: 4, name: "Linh Thú II", color: "#22c55e" },
  { level: 5, name: "Linh Tướng I", color: "#facc15" },
  { level: 6, name: "Linh Tướng II", color: "#eab308" },
  { level: 7, name: "Thánh Thú I", color: "#c084fc" },
  { level: 8, name: "Thánh Thú II", color: "#a855f7" },
  { level: 9, name: "Niết Bàn", color: "#22d3ee" },
  { level: 10, name: "Thần Thú", color: "#fbbf24" },
  { level: 11, name: "Hung Thú", color: "#991b1b" }
];

export function TierRing({ onSelectTier }: { onSelectTier: (tier: number | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  useFrame((state) => {
    if (groupRef.current && hoveredTier === null) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  const radius = 10;

  return (
    <group ref={groupRef} position={[0, -5, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.05, 32, 100]} />
        <meshBasicMaterial color="#eab308" transparent opacity={0.2} />
      </mesh>

      {TIERS.map((tier, index) => {
        const angle = (index / TIERS.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const isHovered = hoveredTier === tier.level;

        return (
          <group key={tier.level} position={[x, 0, z]}>
            <mesh
              onPointerOver={(e) => { e.stopPropagation(); setHoveredTier(tier.level); document.body.style.cursor = 'pointer'; }}
              onPointerOut={(e) => { e.stopPropagation(); setHoveredTier(null); document.body.style.cursor = 'auto'; }}
              onClick={(e) => { e.stopPropagation(); onSelectTier(tier.level); }}
              scale={isHovered ? 1.5 : 1}
            >
              <sphereGeometry args={[0.6, 32, 32]} />
              <meshStandardMaterial 
                color={tier.color}
                emissive={tier.color}
                emissiveIntensity={isHovered ? 1.5 : 0.8}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            
            {(isHovered || tier.level === 10 || tier.level === 11) && (
              <Text
                position={[0, 1.2, 0]}
                fontSize={0.5}
                color={tier.color}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.03}
                outlineColor="black"
                rotation={[0, -angle + Math.PI / 2, 0]}
              >
                {tier.name}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}
