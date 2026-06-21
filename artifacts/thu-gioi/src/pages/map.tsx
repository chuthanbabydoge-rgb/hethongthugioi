import { useState } from "react";
import { useListMaps } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { MapZone3D } from "@/components/spatial/MapZone3D";
import { useXRStore } from "@/components/spatial/XRButton";
import { XR } from "@react-three/xr";
import { CanvasErrorBoundary } from "@/components/spatial/CanvasErrorBoundary";
import { useWebGLSupported } from "@/hooks/useWebGLSupported";

export default function Map() {
  const webGLSupported = useWebGLSupported();
  const xrStore = useXRStore(webGLSupported);
  const { data: maps, isLoading } = useListMaps();
  const [viewMode, setViewMode] = useState<"3d" | "list">("3d");
  const [selectedMap, setSelectedMap] = useState<any | null>(null);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-full flex flex-col">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-primary mb-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">Bản Đồ Vũ Trụ</h1>
          <p className="text-muted-foreground font-serif tracking-wider">Các tinh vực và vùng đất bí ẩn nơi vạn thú sinh sống.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => setViewMode(viewMode === "3d" ? "list" : "3d")}
            className="border-primary/50 font-serif tracking-widest text-primary hover:bg-primary/20"
          >
            {viewMode === "3d" ? "Danh Sách Vùng" : "Bản Đồ 3D"}
          </Button>
        </div>
      </header>

      {viewMode === "3d" ? (
        <div className="flex-1 flex flex-col gap-6 relative">
          <div className="w-full h-[60vh] border border-primary/20 rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm shadow-[0_0_30px_rgba(234,179,8,0.1)]">
            {isLoading ? (
               <div className="w-full h-full flex items-center justify-center text-primary font-serif animate-pulse">
                 Đang mở cổng không gian...
               </div>
            ) : webGLSupported ? (
              <CanvasErrorBoundary fallback={
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif text-sm">
                  WebGL không khả dụng — xem danh sách vùng bên dưới
                </div>
              }>
                <Canvas gl={{ antialias: true, alpha: true }} camera={{ position: [0, 5, 25], fov: 60 }} style={{ background: 'transparent' }}>
                  {xrStore ? (
                    <XR store={xrStore}>
                      <Suspense fallback={null}>
                        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 20, 10]} intensity={1} />
                        <group>
                          {maps?.map((map, i) => (
                            <MapZone3D
                              key={map.id}
                              zone={map}
                              index={i}
                              total={maps.length}
                              onSelect={setSelectedMap}
                            />
                          ))}
                        </group>
                      </Suspense>
                    </XR>
                  ) : (
                    <Suspense fallback={null}>
                      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[10, 20, 10]} intensity={1} />
                      <group>
                        {maps?.map((map, i) => (
                          <MapZone3D
                            key={map.id}
                            zone={map}
                            index={i}
                            total={maps.length}
                            onSelect={setSelectedMap}
                          />
                        ))}
                      </group>
                    </Suspense>
                  )}
                </Canvas>
              </CanvasErrorBoundary>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif text-sm flex-col gap-3">
                <span className="text-primary text-2xl font-serif">Bản Đồ Vũ Trụ 3D</span>
                <span>Thiết bị không hỗ trợ WebGL — xem danh sách vùng bên dưới</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 text-xs text-muted-foreground font-mono bg-black/50 p-2 rounded backdrop-blur">
              Kéo chuột để xoay góc nhìn.
            </div>
          </div>

          {selectedMap && (
            <Card className="bg-[#050514]/90 border-primary/50 p-6 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-3xl font-serif text-primary drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">{selectedMap.zoneName}</h3>
                  <p className="text-sm text-primary/60 font-mono mt-1 tracking-widest uppercase">{selectedMap.tierName}</p>
                </div>
                <div className="bg-black/80 px-4 py-2 rounded-md border border-accent/50 text-sm font-mono shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  Mức nguy hiểm: <span className="text-accent font-bold">{selectedMap.dangerLevel}/10</span>
                </div>
              </div>
              <p className="text-muted-foreground text-base mb-6 leading-relaxed border-l-2 border-primary/30 pl-4">{selectedMap.description}</p>
              <div className="flex gap-8 text-sm text-muted-foreground bg-white/5 p-4 rounded-md border border-white/10">
                <span className="flex flex-col"><span className="text-xs uppercase tracking-widest opacity-50 mb-1">Khí hậu</span> <span className="text-foreground">{selectedMap.climate}</span></span>
                <span className="flex flex-col"><span className="text-xs uppercase tracking-widest opacity-50 mb-1">Sinh linh</span> <span className="text-primary font-mono">{selectedMap.beastCount || 0}</span></span>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {isLoading ? (
            [1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-xl bg-card/20 border-primary/20" />)
          ) : (
            maps?.map(map => (
              <Card key={map.id} className="bg-card/40 border-primary/20 p-6 flex flex-col justify-between group hover:border-primary/50 transition-all duration-500 backdrop-blur shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(234,179,8,0.15)] relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-serif text-foreground group-hover:text-primary transition-colors">{map.zoneName}</h3>
                      <p className="text-sm text-primary/60 font-mono mt-1 uppercase tracking-wider">{map.tierName}</p>
                    </div>
                    <div className="bg-background/80 px-3 py-1 rounded border border-border/50 text-xs">
                      Nguy hiểm: <span className="text-accent">{map.dangerLevel}/10</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{map.description}</p>
                  <div className="flex gap-6 text-xs text-muted-foreground font-mono">
                    <span>Khí hậu: {map.climate}</span>
                    <span>Sinh linh: {map.beastCount || 0}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
          {(!maps || maps.length === 0) && (
            <div className="col-span-2 py-20 text-center text-muted-foreground font-serif tracking-widest">
              Bản đồ đang trong sương mù, chưa thể nhìn thấu.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
