import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float } from "@react-three/drei";
import * as THREE from "three";
import { CreatureModel } from "../data/creatures";

/* ─── WebGL support check ─── */
function checkWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

/* ─── Wing ─── */
function Wing({
  position, rotation, color, span,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  span: number;
}) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(span * 0.5, span * 0.4, span, 0);
    s.quadraticCurveTo(span * 0.6, -span * 0.3, span * 0.3, -span * 0.5);
    s.quadraticCurveTo(span * 0.1, -span * 0.2, 0, 0);
    return s;
  }, [span]);
  const geo = useMemo(() => new THREE.ShapeGeometry(shape), [shape]);
  return (
    <mesh position={position} rotation={rotation} geometry={geo}>
      <meshStandardMaterial color={color} transparent opacity={0.72} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─── Horn ─── */
function Horn({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={position}>
      <coneGeometry args={[0.05, 0.4, 6]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.1} />
    </mesh>
  );
}

/* ─── Spike ─── */
function Spike({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <mesh position={position} scale={[scale, scale, scale]}>
      <coneGeometry args={[0.04, 0.25, 4]} />
      <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.3} />
    </mesh>
  );
}

/* ─── Particles ─── */
function ParticleSystem({ color, count, auraScale }: { color: string; count: number; auraScale: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = auraScale * (0.8 + Math.random() * 0.4);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count, auraScale]);

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.3;
      ref.current.rotation.x += dt * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.05} transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

/* ─── Creature mesh ─── */
function CreatureMesh({ creature }: { creature: CreatureModel }) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.2) * 0.3;
    }
  });

  const [bx, by, bz] = creature.bodyScale;
  const hs = creature.headScale;

  const bodyMat = {
    color: creature.bodyColor,
    roughness: creature.roughness,
    metalness: creature.metalness,
    emissive: creature.glowColor,
    emissiveIntensity: creature.emissiveIntensity * 0.15,
  };

  return (
    <group ref={groupRef}>
      {/* Aura shell */}
      <mesh>
        <sphereGeometry args={[creature.auraScale * 0.8, 16, 16]} />
        <meshStandardMaterial
          color={creature.glowColor}
          transparent
          opacity={0.05}
          emissive={creature.glowColor}
          emissiveIntensity={creature.emissiveIntensity * 0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>
      <mesh scale={[bx, by, bz]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial {...bodyMat} emissiveIntensity={creature.emissiveIntensity * 0.1} />
      </mesh>

      {/* Chest accent */}
      <mesh position={[0, 0, 0.4]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color={creature.accentColor}
          roughness={creature.roughness + 0.1}
          metalness={creature.metalness}
          emissive={creature.accentColor}
          emissiveIntensity={creature.emissiveIntensity * 0.2}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.55, 0.5]}>
        <sphereGeometry args={[hs, 24, 24]} />
        <meshStandardMaterial {...bodyMat} emissiveIntensity={creature.emissiveIntensity * 0.2} />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 0.45, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[hs * 0.3, hs * 0.4, 0.35, 12]} />
        <meshStandardMaterial color={creature.bodyColor} roughness={creature.roughness} metalness={creature.metalness} />
      </mesh>

      {/* Eyes */}
      {[hs * 0.4, -hs * 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.62, 0.82]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={creature.glowColor} emissive={creature.glowColor} emissiveIntensity={2} />
        </mesh>
      ))}

      {/* Horns */}
      {creature.hasHorns && (
        <>
          <Horn position={[hs * 0.22, 1.05, 0.55]} color={creature.accentColor} />
          {creature.hornCount >= 2 && (
            <Horn position={[-hs * 0.22, 1.05, 0.55]} color={creature.accentColor} />
          )}
        </>
      )}

      {/* Wings */}
      {creature.hasWings && (
        <>
          <Wing position={[0.65, 0.1, -0.1]} rotation={[-0.2, -0.3, 0.2]} color={creature.accentColor} span={creature.wingSpan * 0.55} />
          <Wing position={[-0.65, 0.1, -0.1]} rotation={[-0.2, 0.3, -0.2]} color={creature.accentColor} span={creature.wingSpan * 0.55} />
        </>
      )}

      {/* Tail */}
      {creature.hasTail && (
        <mesh ref={tailRef} position={[0, -0.1, -0.75]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.04, creature.tailLength, 8]} />
          <meshStandardMaterial color={creature.bodyColor} roughness={creature.roughness} metalness={creature.metalness} />
        </mesh>
      )}

      {/* Spikes */}
      {creature.hasSpikes &&
        [-0.3, -0.1, 0.1, 0.3].map((z, i) => (
          <Spike key={i} position={[0, 0.65 + i * 0.04, z]} scale={0.8 - i * 0.1} />
        ))}

      {/* Legs */}
      {creature.legCount === 4 &&
        ([
          [0.4, -0.45, 0.3],
          [-0.4, -0.45, 0.3],
          [0.35, -0.45, -0.25],
          [-0.35, -0.45, -0.25],
        ] as [number, number, number][]).map((pos, i) => (
          <mesh key={i} position={pos} rotation={[0.3, 0, i < 2 ? 0.2 * (i === 0 ? 1 : -1) : 0]}>
            <cylinderGeometry args={[0.1, 0.07, 0.55, 8]} />
            <meshStandardMaterial color={creature.bodyColor} roughness={creature.roughness} metalness={creature.metalness} />
          </mesh>
        ))}
      {creature.legCount === 2 &&
        ([
          [0.25, -0.55, 0.1],
          [-0.25, -0.55, 0.1],
        ] as [number, number, number][]).map((pos, i) => (
          <mesh key={i} position={pos} rotation={[0.2, 0, i === 0 ? 0.15 : -0.15]}>
            <cylinderGeometry args={[0.1, 0.07, 0.5, 8]} />
            <meshStandardMaterial color={creature.bodyColor} roughness={creature.roughness} metalness={creature.metalness} />
          </mesh>
        ))}
      {creature.legCount === 8 &&
        Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.7, -0.3, Math.sin(angle) * 0.7]} rotation={[0, angle, 0.6]}>
              <cylinderGeometry args={[0.07, 0.04, 0.7, 6]} />
              <meshStandardMaterial color={creature.bodyColor} roughness={creature.roughness} metalness={creature.metalness} />
            </mesh>
          );
        })}

      <ParticleSystem color={creature.particleColor} count={creature.particleCount} auraScale={creature.auraScale} />
    </group>
  );
}

/* ─── Static 2D fallback card ─── */
function Fallback2D({ creature }: { creature: CreatureModel }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-5 p-8">
        <div
          className="w-40 h-40 rounded-full mx-auto flex items-center justify-center text-7xl shadow-2xl border-4"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${creature.accentColor}, ${creature.bodyColor})`,
            borderColor: creature.glowColor + "66",
            boxShadow: `0 0 40px ${creature.glowColor}55`,
          }}
        >
          {creature.hasWings ? "🐲" : creature.hasHorns ? "🦄" : creature.legCount === 2 ? "🦅" : "🐺"}
        </div>
        <div>
          <p className="text-white font-bold text-xl">{creature.name}</p>
          <p className="text-slate-400 text-sm mt-1">{creature.nameEn}</p>
          <p className="text-xs text-slate-500 mt-3 max-w-xs mx-auto leading-relaxed">
            WebGL không khả dụng trong môi trường này.
            <br />Đang hiển thị biểu tượng thay thế.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          {[creature.bodyColor, creature.accentColor, creature.glowColor].map((c, i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-700" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ─── */
interface CreatureViewerProps {
  creature: CreatureModel;
}

export default function CreatureViewer({ creature }: CreatureViewerProps) {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [contextLost, setContextLost] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setWebglOk(checkWebGL());
  }, []);

  // Handle context restore by remounting
  useEffect(() => {
    if (!contextLost) return;
    const timer = setTimeout(() => setContextLost(false), 2000);
    return () => clearTimeout(timer);
  }, [contextLost]);

  if (webglOk === null) return null; // waiting for check

  if (!webglOk) return <Fallback2D creature={creature} />;

  if (contextLost) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-amber-500/40 border-t-amber-500 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Đang khôi phục WebGL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        key={creature.id}
        camera={{ position: [0, 1, 4], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        }}
        frameloop="always"
        style={{ background: "transparent" }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvasRef.current = canvas;
          canvas.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setContextLost(true);
          });
          canvas.addEventListener("webglcontextrestored", () => {
            setContextLost(false);
          });
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color={creature.glowColor} />
        <pointLight position={[0, 5, 0]} intensity={0.8} color={creature.accentColor} />
        <spotLight
          position={[0, 8, 0]}
          angle={0.4}
          penumbra={0.5}
          intensity={2}
          color={creature.glowColor}
          castShadow={false}
        />

        <Stars radius={80} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <CreatureMesh creature={creature} />
        </Float>

        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={2.5}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI * 0.75}
        />
      </Canvas>
    </div>
  );
}
