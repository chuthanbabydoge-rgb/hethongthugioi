import { useState } from "react";
import { useListBeasts } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { BeastOrb } from "@/components/spatial/BeastOrb";
import { TierRing } from "@/components/spatial/TierRing";
import { useXRStore } from "@/components/spatial/XRButton";
import { XR } from "@react-three/xr";
import { CanvasErrorBoundary } from "@/components/spatial/CanvasErrorBoundary";
import { useWebGLSupported } from "@/hooks/useWebGLSupported";

// Fibonacci sphere distribution for orbs
const getFibonacciSpherePoint = (i: number, n: number, radius: number): [number, number, number] => {
  const phi = Math.acos(1 - 2 * (i + 0.5) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
  
  return [
    radius * Math.cos(theta) * Math.sin(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(phi)
  ];
};

export default function Universe() {
  const webGLSupported = useWebGLSupported();
  const xrStore = useXRStore(webGLSupported);
  const [viewMode, setViewMode] = useState<"3d" | "list">("3d");
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  
  const params = selectedTier ? { tier: selectedTier, limit: 100 } : { limit: 100 };
  const { data, isLoading } = useListBeasts(params);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-full flex flex-col">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-primary mb-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">Vạn Thú Giới</h1>
          <p className="text-muted-foreground font-serif tracking-wider">Tất cả những sinh linh đã được thức tỉnh trong vũ trụ.</p>
        </div>
        <div className="flex gap-4">
          {selectedTier && (
            <Button variant="outline" onClick={() => setSelectedTier(null)} className="border-primary/50 text-primary">
              Xóa Bộ Lọc
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => setViewMode(viewMode === "3d" ? "list" : "3d")}
            className="border-primary/50 font-serif tracking-widest text-primary hover:bg-primary/20"
          >
            {viewMode === "3d" ? "Xem Danh Sách" : "Xem 3D"}
          </Button>
        </div>
      </header>

      {viewMode === "3d" ? (
        <div className="flex-1 w-full relative min-h-[600px] border border-primary/20 rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm shadow-[0_0_30px_rgba(234,179,8,0.1)]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-primary font-serif animate-pulse">
              Đang kiến tạo không gian...
            </div>
          ) : webGLSupported ? (
            <CanvasErrorBoundary fallback={
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-serif text-sm">
                WebGL không khả dụng — chuyển sang danh sách 2D
              </div>
            }>
              <Canvas gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 25], fov: 60 }} style={{ background: 'transparent' }}>
                {xrStore ? (
                  <XR store={xrStore}>
                    <Suspense fallback={null}>
                      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[10, 10, 5]} intensity={1} />
                      <TierRing onSelectTier={setSelectedTier} />
                      <group>
                        {data?.beasts.map((beast, i) => {
                          const pos = getFibonacciSpherePoint(i, data.beasts.length, 12);
                          return <BeastOrb key={beast.id} beast={beast} position={pos} />;
                        })}
                      </group>
                    </Suspense>
                  </XR>
                ) : (
                  <Suspense fallback={null}>
                    <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <TierRing onSelectTier={setSelectedTier} />
                    <group>
                      {data?.beasts.map((beast, i) => {
                        const pos = getFibonacciSpherePoint(i, data.beasts.length, 12);
                        return <BeastOrb key={beast.id} beast={beast} position={pos} />;
                      })}
                    </group>
                  </Suspense>
                )}
              </Canvas>
            </CanvasErrorBoundary>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-serif text-sm flex-col gap-3">
              <span className="text-primary text-2xl font-serif">Vũ Trụ 3D</span>
              <span>Thiết bị không hỗ trợ WebGL — dùng chế độ Danh Sách bên trên</span>
            </div>
          )}
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground font-mono bg-black/50 p-2 rounded backdrop-blur">
            Kéo chuột để xoay góc nhìn. Cuộn để thu phóng không gian. Nhấn vào linh thú để xem thông tin.
          </div>
        </div>
      ) : (
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl border border-primary/20 bg-card/20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data?.beasts.map((beast) => (
                <Card key={beast.id} className="bg-card/40 border-primary/20 overflow-hidden hover:border-primary/50 transition-all group backdrop-blur shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <div className="aspect-square bg-black/50 relative flex items-center justify-center overflow-hidden">
                    {beast.imageUrl ? (
                      <img src={beast.imageUrl} alt={beast.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
                    ) : (
                      <div className="text-6xl opacity-20 font-serif font-black text-primary">{beast.name.charAt(0)}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    <Badge variant="outline" className="absolute top-3 left-3 bg-black/60 backdrop-blur border-primary/50 text-primary font-serif tracking-widest shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                      {beast.tierName}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">{beast.name}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3 font-mono">
                      <span>{beast.raceCategory}</span>
                      <span className="text-accent">Lực: {beast.power}</span>
                    </div>
                    {beast.description && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">{beast.description}</p>
                    )}
                  </div>
                </Card>
              ))}
              {(!data?.beasts || data.beasts.length === 0) && (
                <div className="col-span-full py-20 text-center text-muted-foreground font-serif tracking-widest">
                  Chưa có linh thú nào trong không gian này.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
