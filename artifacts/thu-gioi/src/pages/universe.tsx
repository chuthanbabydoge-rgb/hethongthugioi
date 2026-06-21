import { useListBeasts } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Universe() {
  const { data, isLoading } = useListBeasts({ limit: 50 });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-serif text-primary mb-2">Vạn Thú Giới</h1>
        <p className="text-muted-foreground">Tất cả những sinh linh đã được thức tỉnh trong vũ trụ.</p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl border border-border/50 bg-card/20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.beasts.map((beast) => (
            <Card key={beast.id} className="bg-card/40 border-border/50 overflow-hidden hover:border-primary/50 transition-all group backdrop-blur">
              <div className="aspect-square bg-muted/30 relative flex items-center justify-center overflow-hidden">
                {beast.imageUrl ? (
                  <img src={beast.imageUrl} alt={beast.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="text-4xl opacity-20 font-serif font-black">{beast.name.charAt(0)}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <Badge variant="outline" className="absolute top-3 left-3 bg-background/80 backdrop-blur border-primary/30 text-primary font-serif">
                  {beast.tierName}
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-serif font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{beast.name}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{beast.raceCategory}</span>
                  <span className="text-accent">Lực: {beast.power}</span>
                </div>
                {beast.description && (
                  <p className="text-xs text-muted-foreground/80 line-clamp-2">{beast.description}</p>
                )}
              </div>
            </Card>
          ))}
          {(!data?.beasts || data.beasts.length === 0) && (
            <div className="col-span-full py-20 text-center text-muted-foreground font-serif">
              Chưa có linh thú nào xuất hiện. Hãy vào Tế Đàn để bồi dưỡng.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
