import { useState, useEffect } from "react";
import { useListBeasts, useBreedBeasts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { CanvasErrorBoundary } from "@/components/spatial/CanvasErrorBoundary";
import { BreedingPortalScene } from "@/components/spatial/BreedingPortal";
import { useWebGLSupported } from "@/hooks/useWebGLSupported";

export default function Breed() {
  const { data: beastsData } = useListBeasts({ limit: 100 });
  const breedBeasts = useBreedBeasts();
  const webGLSupported = useWebGLSupported();

  const [parentA, setParentA] = useState<number | null>(null);
  const [parentB, setParentB] = useState<number | null>(null);
  const [offspringName, setOffspringName] = useState("Vô Danh");
  const [ritualState, setRitualState] = useState<"idle" | "breeding" | "result">("idle");
  const [portalPhase, setPortalPhase] = useState<"spiraling" | "merged">("spiraling");
  const [result, setResult] = useState<any>(null);

  const handleBreed = () => {
    if (!parentA || !parentB || !offspringName) {
      toast.error("Thiếu thông tin nghi thức!");
      return;
    }

    setRitualState("breeding");
    setPortalPhase("spiraling");

    breedBeasts.mutate({
      data: { parentAId: parentA, parentBId: parentB, offspringName }
    }, {
      onSuccess: (res) => {
        setPortalPhase("merged");
        setTimeout(() => {
          setResult(res);
          setRitualState("result");
          if (res.success) {
            toast.success("Nghi thức thành công!");
          } else {
            toast.error("Nghi thức thất bại. " + res.message);
          }
        }, 1800);
      },
      onError: () => {
        setRitualState("idle");
        toast.error("Lỗi khi thực hiện nghi thức");
      }
    });
  };

  const resetRitual = () => {
    setParentA(null);
    setParentB(null);
    setOffspringName("Vô Danh");
    setResult(null);
    setRitualState("idle");
    setPortalPhase("spiraling");
  };

  const beasts = beastsData?.beasts || [];
  const beastA = beasts.find(b => b.id === parentA);
  const beastB = beasts.find(b => b.id === parentB);
  const tierA = beastA?.tier ?? 1;
  const tierB = beastB?.tier ?? 1;

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-[85vh] flex flex-col justify-center relative">
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-5xl font-serif text-accent mb-4 drop-shadow-[0_0_10px_rgba(234,88,12,0.8)]">Tế Đàn Phối Giống</h1>
        <p className="text-lg text-muted-foreground font-serif tracking-widest">Hòa quyện huyết mạch, đánh thức tiềm năng tối cổ.</p>
      </div>

      <AnimatePresence mode="wait">
        {ritualState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10"
          >
            {/* Parent A */}
            <Card className="p-6 bg-card/40 border-border/40 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
              {parentA ? (
                <div className="text-center z-10">
                  <h3 className="font-serif text-3xl text-primary drop-shadow-sm mb-2">{beastA?.name}</h3>
                  <p className="text-muted-foreground text-sm uppercase tracking-widest">{beastA?.tierName}</p>
                  <p className="text-accent/80 text-xs mt-2 font-mono">Lực: {beastA?.power}</p>
                  <Button variant="outline" size="sm" onClick={() => setParentA(null)} className="mt-8 border-primary/30 text-primary hover:bg-primary/20">Chọn Tế Phẩm Khác</Button>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-2 max-h-[350px] overflow-auto custom-scrollbar z-10 pr-2">
                  <h3 className="text-center font-serif text-muted-foreground mb-4 uppercase tracking-widest text-sm border-b border-border/30 pb-2">Chọn Huyết Mạch 1</h3>
                  {beasts.map(b => (
                    <button key={b.id} onClick={() => setParentA(b.id)} disabled={b.id === parentB}
                      className="text-left px-4 py-3 bg-black/20 hover:bg-primary/10 rounded text-sm font-serif border border-border/20 hover:border-primary/50 disabled:opacity-30 transition-all flex justify-between items-center group">
                      <span className="group-hover:text-primary transition-colors">{b.name}</span>
                      <span className="text-xs text-muted-foreground">{b.tierName}</span>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Center */}
            <div className="flex flex-col items-center justify-center gap-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border border-accent flex items-center justify-center bg-accent/5 shadow-[0_0_30px_rgba(234,88,12,0.3)] z-10 relative">
                  <span className="text-4xl font-serif text-accent drop-shadow-[0_0_5px_rgba(234,88,12,1)]">☨</span>
                </div>
                <div className="absolute inset-0 rounded-full border border-primary/50 animate-ping opacity-20" />
              </div>
              <div className="w-full px-4">
                <label className="text-xs text-muted-foreground font-serif uppercase tracking-widest text-center block mb-2">Định Danh Sinh Linh Mới</label>
                <input
                  type="text"
                  value={offspringName}
                  onChange={e => setOffspringName(e.target.value)}
                  className="bg-black/40 border border-border/50 rounded-md px-4 py-3 text-center font-serif text-xl text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all w-full backdrop-blur-sm"
                  placeholder="Tên huyết mạch mới"
                />
              </div>
              <Button
                onClick={handleBreed}
                disabled={!parentA || !parentB || !offspringName}
                className="w-full bg-accent/20 text-accent hover:bg-accent hover:text-white border border-accent/50 font-serif tracking-widest text-lg py-8 uppercase shadow-[0_0_15px_rgba(234,88,12,0.2)] disabled:opacity-50 disabled:shadow-none transition-all"
              >
                Tiến Hành Tế Lễ
              </Button>
            </div>

            {/* Parent B */}
            <Card className="p-6 bg-card/40 border-border/40 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
              {parentB ? (
                <div className="text-center z-10">
                  <h3 className="font-serif text-3xl text-primary drop-shadow-sm mb-2">{beastB?.name}</h3>
                  <p className="text-muted-foreground text-sm uppercase tracking-widest">{beastB?.tierName}</p>
                  <p className="text-accent/80 text-xs mt-2 font-mono">Lực: {beastB?.power}</p>
                  <Button variant="outline" size="sm" onClick={() => setParentB(null)} className="mt-8 border-primary/30 text-primary hover:bg-primary/20">Chọn Tế Phẩm Khác</Button>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-2 max-h-[350px] overflow-auto custom-scrollbar z-10 pr-2">
                  <h3 className="text-center font-serif text-muted-foreground mb-4 uppercase tracking-widest text-sm border-b border-border/30 pb-2">Chọn Huyết Mạch 2</h3>
                  {beasts.map(b => (
                    <button key={b.id} onClick={() => setParentB(b.id)} disabled={b.id === parentA}
                      className="text-left px-4 py-3 bg-black/20 hover:bg-primary/10 rounded text-sm font-serif border border-border/20 hover:border-primary/50 disabled:opacity-30 transition-all flex justify-between items-center group">
                      <span className="group-hover:text-primary transition-colors">{b.name}</span>
                      <span className="text-xs text-muted-foreground">{b.tierName}</span>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {ritualState === "breeding" && (
          <motion.div
            key="breeding"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-4 relative z-10"
          >
            {webGLSupported ? (
              <div className="w-full" style={{ height: "420px" }}>
                <CanvasErrorBoundary fallback={
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="w-16 h-16 text-accent animate-spin mb-6" />
                    <h2 className="text-2xl font-serif text-primary animate-pulse tracking-widest">Đang Luyện Hóa Huyết Mạch...</h2>
                  </div>
                }>
                  <Canvas gl={{ antialias: true, alpha: true }} camera={{ position: [0, 2, 10], fov: 55 }} style={{ background: "transparent" }}>
                    <BreedingPortalScene tierA={tierA} tierB={tierB} phase={portalPhase} />
                  </Canvas>
                </CanvasErrorBoundary>
                <div className="text-center mt-2">
                  <p className="text-xl font-serif text-primary animate-pulse tracking-widest">
                    {portalPhase === "spiraling" ? "Đang Luyện Hóa Huyết Mạch..." : "Huyết Mạch Hội Tụ!"}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1 font-serif">
                    {portalPhase === "spiraling" ? "Trời đất chấn động, sấm chớp rền vang..." : "Sinh linh mới đang thức tỉnh..."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-24 h-24 text-accent animate-spin mb-8" />
                <h2 className="text-3xl font-serif text-primary animate-pulse tracking-widest">Đang Luyện Hóa Huyết Mạch...</h2>
                <p className="text-muted-foreground mt-4 font-serif">Trời đất chấn động, sấm chớp rền vang...</p>
              </div>
            )}
          </motion.div>
        )}

        {ritualState === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto w-full relative z-10"
          >
            <Card className="bg-card/60 backdrop-blur-xl border-accent/50 overflow-hidden shadow-[0_0_50px_rgba(234,88,12,0.2)]">
              <div className="p-10 text-center">
                <div className="mb-6 inline-block rounded-full bg-accent/20 text-accent px-4 py-1 text-sm font-serif border border-accent/30 tracking-widest">
                  {result.success ? "Niết Bàn Thành Công" : "Nghi Thức Thất Bại"}
                </div>

                {result.success ? (
                  <>
                    <h2 className="text-5xl font-serif text-primary mb-4">{result.offspring.name}</h2>
                    <p className="text-2xl text-foreground font-serif mb-6">{result.offspring.tierName}</p>
                    <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-10 font-mono">
                      <span className="bg-black/30 px-3 py-1 rounded">Lực Chiến: {result.offspring.power}</span>
                      <span className="bg-black/30 px-3 py-1 rounded">Hệ: {result.offspring.raceCategory}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-serif text-destructive mb-6">Huyết Mạch Tương Tranh</h2>
                    <p className="text-muted-foreground">{result.message}</p>
                  </>
                )}

                <Button
                  onClick={resetRitual}
                  className="bg-primary/20 text-primary hover:bg-primary hover:text-black border border-primary/50 font-serif tracking-widest px-8"
                >
                  Tế Lễ Lần Nữa
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
