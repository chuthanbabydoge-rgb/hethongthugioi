import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

const TIER_COLORS: Record<number, string> = {
  1: "#8c8c8c", 2: "#8c8c8c",
  3: "#4ade80", 4: "#4ade80",
  5: "#facc15", 6: "#facc15",
  7: "#c084fc", 8: "#c084fc",
  9: "#22d3ee",
  10: "#fbbf24",
  11: "#991b1b",
};

function getTierColor(tier: number) {
  return TIER_COLORS[tier] ?? "#8c8c8c";
}

interface OrbProps {
  color: string;
  angle: number;
  radius: number;
  phase: number;
  size: number;
  emissiveIntensity: number;
}

function SpiralOrb({ color, angle, radius, phase, size, emissiveIntensity }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const c = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const a = angle + t * 1.4 + phase;
    const r = radius * Math.max(0.05, 1 - t * 0.18);
    const y = Math.sin(t * 0.8 + phase) * 0.4;

    if (meshRef.current) {
      meshRef.current.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      meshRef.current.rotation.x += 0.05;
      meshRef.current.rotation.y += 0.07;
      const pulse = 1 + Math.sin(t * 3 + phase) * 0.12;
      meshRef.current.scale.setScalar(pulse);
    }
    if (trailRef.current) {
      trailRef.current.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      const trailPulse = 1.6 + Math.sin(t * 4 + phase) * 0.3;
      trailRef.current.scale.setScalar(trailPulse);
    }
  });

  return (
    <>
      <mesh ref={trailRef}>
        <sphereGeometry args={[size * 1.5, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.12} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.1}
          metalness={0.9}
        />
        <pointLight color={color} intensity={4} distance={5} decay={2} />
      </mesh>
    </>
  );
}

function VortexRing({ color, index }: { color: string; index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime;
      ref.current.rotation.x = t * (0.4 + index * 0.15);
      ref.current.rotation.z = t * (0.3 + index * 0.1);
      const s = 1 + 0.15 * Math.sin(t * 2 + index);
      ref.current.scale.setScalar(s);
    }
  });
  const radius = 1.5 + index * 0.6;
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.04, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.5 - index * 0.1} />
    </mesh>
  );
}

function ExplosionParticles({ active, color }: { active: boolean; color: string }) {
  const ref = useRef<THREE.Points>(null);
  const count = 200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * 5;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const speeds = useMemo(() => Array.from({ length: count }, () => 0.5 + Math.random() * 2), []);

  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    const t = clock.elapsedTime % 2;
    const geo = ref.current.geometry as THREE.BufferGeometry;
    const pos = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const phi = Math.acos(1 - 2 * (i / count));
      const r = t * speeds[i];
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    geo.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.08} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function CoreFlash({ tierAColor, tierBColor }: { tierAColor: string; tierBColor: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime;
      const s = 0.4 + Math.sin(t * 5) * 0.2;
      ref.current.scale.setScalar(s);
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 2 + Math.sin(t * 8) * 1;
    }
  });

  const blended = useMemo(() => {
    const a = new THREE.Color(tierAColor);
    const b = new THREE.Color(tierBColor);
    return a.lerp(b, 0.5);
  }, [tierAColor, tierBColor]);

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshStandardMaterial color={blended} emissive={blended} emissiveIntensity={3} roughness={0} metalness={1} />
      <pointLight color={blended} intensity={8} distance={12} decay={2} />
    </mesh>
  );
}

interface BreedingPortalSceneProps {
  tierA: number;
  tierB: number;
  phase: "spiraling" | "merged";
}

export function BreedingPortalScene({ tierA, tierB, phase }: BreedingPortalSceneProps) {
  const colorA = getTierColor(tierA);
  const colorB = getTierColor(tierB);
  const blendColor = useMemo(() => {
    const a = new THREE.Color(colorA);
    return a.lerp(new THREE.Color(colorB), 0.5).getStyle();
  }, [colorA, colorB]);

  return (
    <>
      <ambientLight intensity={0.2} />

      {[0, 1, 2].map((i) => (
        <VortexRing key={i} color={i % 2 === 0 ? colorA : colorB} index={i} />
      ))}

      {phase === "spiraling" && (
        <>
          <SpiralOrb color={colorA} angle={0} radius={3.5} phase={0} size={0.5} emissiveIntensity={2} />
          <SpiralOrb color={colorB} angle={Math.PI} radius={3.5} phase={Math.PI} size={0.5} emissiveIntensity={2} />
          <Sparkles count={120} scale={7} size={1.5} speed={0.4} opacity={0.6} color={colorA} />
          <Sparkles count={120} scale={7} size={1.5} speed={0.4} opacity={0.6} color={colorB} />
        </>
      )}

      {phase === "merged" && (
        <>
          <CoreFlash tierAColor={colorA} tierBColor={colorB} />
          <ExplosionParticles active color={blendColor} />
          <Sparkles count={300} scale={10} size={3} speed={1} opacity={0.9} color={blendColor} />
        </>
      )}
    </>
  );
}
