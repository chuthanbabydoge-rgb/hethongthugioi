import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Stars, Float } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { XR } from "@react-three/xr";
import { useXRStore } from "@/components/spatial/XRButton";
import { CanvasErrorBoundary } from "@/components/spatial/CanvasErrorBoundary";
import { useWebGLSupported } from "@/hooks/useWebGLSupported";

function HeroModel() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[3, 1, 200, 32]} />
        <meshStandardMaterial 
          color="#f59e0b" 
          metalness={0.8} 
          roughness={0.2} 
          wireframe={true}
          emissive="#f59e0b"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

export default function Home() {
  const webGLSupported = useWebGLSupported();
  const xrStore = useXRStore(webGLSupported);
  return (
    <div className="min-h-full flex flex-col items-center relative">
      {/* 3D Hero Section */}
      <section className="w-full relative h-[80vh] flex flex-col items-center justify-center overflow-hidden border-b border-primary/20">
        <div className="absolute inset-0 z-0">
          {webGLSupported && (
            <CanvasErrorBoundary>
              <Canvas gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 15], fov: 60 }} style={{ background: 'transparent' }}>
                {xrStore ? (
                  <XR store={xrStore}>
                    <Suspense fallback={null}>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[10, 10, 5]} intensity={1} color="#f59e0b" />
                      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#c084fc" />
                      <Stars radius={50} depth={20} count={1000} factor={4} saturation={1} fade speed={2} />
                      <Sparkles count={200} scale={15} size={2} speed={0.5} opacity={0.5} color="#f59e0b" />
                      <HeroModel />
                    </Suspense>
                  </XR>
                ) : (
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} color="#f59e0b" />
                    <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#c084fc" />
                    <Stars radius={50} depth={20} count={1000} factor={4} saturation={1} fade speed={2} />
                    <Sparkles count={200} scale={15} size={2} speed={0.5} opacity={0.5} color="#f59e0b" />
                    <HeroModel />
                  </Suspense>
                )}
              </Canvas>
            </CanvasErrorBoundary>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90 pointer-events-none" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-20 text-center max-w-4xl pointer-events-none mt-20"
        >
          <h1 className="text-7xl md:text-9xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary/80 to-accent mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]">
            THÚ GIỚI
          </h1>
          <p className="text-xl md:text-2xl text-foreground font-serif tracking-widest mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Nơi vạn thú thức tỉnh, truyền thuyết xoay vần. Khám phá vũ trụ không gian ba chiều kỳ ảo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pointer-events-auto">
            <Link href="/universe" className="group">
              <Button size="lg" className="bg-[#050514]/60 backdrop-blur-md text-primary border border-primary/50 text-lg px-10 py-7 h-auto font-serif tracking-widest hover:bg-primary/20 hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all duration-500 w-full sm:w-auto">
                BƯỚC VÀO VŨ TRỤ
              </Button>
            </Link>
            <Link href="/breed" className="group">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 h-auto font-serif tracking-widest hover:border-accent hover:text-accent transition-all duration-500 w-full sm:w-auto bg-black/40 backdrop-blur-md border-white/20">
                BỒI DƯỠNG THẦN THÚ
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Tiers overview */}
      <section className="w-full max-w-7xl mx-auto py-32 px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-serif text-primary mb-6 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">Cấp Bậc Không Gian</h2>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/80 to-transparent mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { tier: "Cấp 1-4", title: "Phàm Thú", desc: "Động vật bình thường đến linh thú sơ khai." },
            { tier: "Cấp 5-8", title: "Linh Tướng", desc: "Sở hữu linh trí, thống lĩnh vạn thú." },
            { tier: "Cấp 9", title: "Thánh Thú", desc: "Cảnh giới tối cao của sinh linh." },
            { tier: "Truyền Thuyết", title: "Thần Thú", desc: "Sức mạnh vô lượng, tạo hóa vạn vật." },
            { tier: "Hắc Ám", title: "Hung Thú", desc: "Hủy diệt cực hạn, đối nghịch tạo hóa." },
            { tier: "Tiến Hóa", title: "Niết Bàn", desc: "Vượt qua sinh tử, lột xác thành thần." }
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="p-10 border border-primary/20 bg-[#050514]/60 backdrop-blur-xl rounded-2xl hover:border-primary/60 transition-all duration-500 group relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]"
            >
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
              <div className="text-primary/70 font-mono text-sm mb-4 tracking-widest uppercase">{t.tier}</div>
              <h3 className="text-3xl font-serif text-foreground mb-4 group-hover:text-primary transition-colors duration-300 relative z-10">{t.title}</h3>
              <p className="text-muted-foreground relative z-10 leading-relaxed text-base">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lore Section */}
      <section className="w-full relative py-40 px-8 overflow-hidden bg-[#02020a]/80 border-t border-primary/20">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('/galaxy-bg.png')] bg-cover bg-center mix-blend-screen" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
           <h2 className="text-5xl font-serif text-primary mb-10 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">Vũ Trụ Nguyên Thủy</h2>
           <p className="text-xl text-muted-foreground font-serif leading-loose mb-16 px-4">
             Từ thuở hỗn mang, vạn vật được sinh ra từ những không gian đa chiều. Sử Thi hào hùng, Truyền Thuyết bi tráng, Huyền Thoại xa xăm. Mỗi linh thú đều mang trong mình một mảnh vỡ của tạo hóa. Nay, bạn có thể chiêm ngưỡng chúng qua góc nhìn không gian ba chiều.
           </p>
           <Link href="/bestiary">
            <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/20 font-serif tracking-widest px-10 py-6 text-lg h-auto bg-black/40 backdrop-blur-sm">
              MỞ THÚ KÝ
            </Button>
           </Link>
        </div>
      </section>
    </div>
  );
}
