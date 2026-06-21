import { useListMaps } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Map() {
  const { data: maps, isLoading } = useListMaps();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-serif text-primary mb-2">Bản Đồ Vũ Trụ</h1>
        <p className="text-muted-foreground">Các tinh vực và vùng đất bí ẩn nơi vạn thú sinh sống.</p>
      </header>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-xl bg-card/20" />)}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {maps?.map(map => (
            <Card key={map.id} className="bg-card/40 border-border/50 p-6 flex flex-col justify-between group hover:border-primary/30 transition-colors backdrop-blur relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-serif text-foreground group-hover:text-primary transition-colors">{map.zoneName}</h3>
                    <p className="text-sm text-primary/60 font-mono mt-1">{map.tierName}</p>
                  </div>
                  <div className="bg-background/80 px-3 py-1 rounded border border-border/50 text-xs">
                    Nguy hiểm: <span className="text-accent">{map.dangerLevel}/10</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-6">{map.description}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Khí hậu: {map.climate}</span>
                  <span>Sinh linh: {map.beastCount || 0}</span>
                </div>
              </div>
            </Card>
          ))}
          {(!maps || maps.length === 0) && (
            <div className="col-span-2 py-20 text-center text-muted-foreground font-serif">
              Bản đồ đang trong sương mù, chưa thể nhìn thấu.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
