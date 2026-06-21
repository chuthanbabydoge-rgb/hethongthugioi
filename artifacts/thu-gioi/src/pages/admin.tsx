import { useState } from "react";
import { useGetStatsOverview, useListBeasts, useListSpecies } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: beastsData, isLoading: beastsLoading } = useListBeasts({ limit: 50 });
  const { data: speciesData, isLoading: speciesLoading } = useListSpecies({ });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-serif text-primary mb-2">Thiên Đạo Quản Trị</h1>
        <p className="text-muted-foreground">Nơi nắm giữ quy luật của vạn vật và chi phối sinh linh.</p>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-card/40 border border-border/50 mb-8 p-1">
          <TabsTrigger value="overview" className="font-serif tracking-wide data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Đại Cục</TabsTrigger>
          <TabsTrigger value="beasts" className="font-serif tracking-wide data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Quản Lý Sinh Linh</TabsTrigger>
          <TabsTrigger value="species" className="font-serif tracking-wide data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Nguồn Gốc Chủng Tộc</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="p-6 bg-card/30 border-border/50 backdrop-blur shadow-lg">
              <h3 className="text-sm text-muted-foreground font-serif mb-2 tracking-widest uppercase">Tổng Sinh Linh</h3>
              <p className="text-5xl font-mono text-foreground">{statsLoading ? "..." : stats?.totalBeasts || 0}</p>
            </Card>
            <Card className="p-6 bg-card/30 border-border/50 backdrop-blur shadow-lg">
              <h3 className="text-sm text-muted-foreground font-serif mb-2 tracking-widest uppercase">Chủng Tộc</h3>
              <p className="text-5xl font-mono text-primary">{statsLoading ? "..." : stats?.totalSpecies || 0}</p>
            </Card>
            <Card className="p-6 bg-card/30 border-border/50 backdrop-blur shadow-lg">
              <h3 className="text-sm text-muted-foreground font-serif mb-2 tracking-widest uppercase">Nghi Thức</h3>
              <p className="text-5xl font-mono text-accent">{statsLoading ? "..." : stats?.totalBreedings || 0}</p>
            </Card>
            <Card className="p-6 bg-card/30 border-border/50 backdrop-blur shadow-lg">
              <h3 className="text-sm text-muted-foreground font-serif mb-2 tracking-widest uppercase">Thần Thú & Hung Thú</h3>
              <p className="text-5xl font-mono text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.3)]">
                {statsLoading ? "..." : (stats?.legendaryCount || 0) + (stats?.darkLegendaryCount || 0)}
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="beasts">
          <Card className="bg-card/30 border-border/50 backdrop-blur overflow-hidden">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="border-border/30">
                  <TableHead className="font-serif text-primary">ID</TableHead>
                  <TableHead className="font-serif text-primary">Danh Xưng</TableHead>
                  <TableHead className="font-serif text-primary">Cảnh Giới</TableHead>
                  <TableHead className="font-serif text-primary text-right">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beastsLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Đang tải...</TableCell></TableRow>
                ) : beastsData?.beasts?.map((beast) => (
                  <TableRow key={beast.id} className="border-border/20">
                    <TableCell className="font-mono text-muted-foreground">{beast.id}</TableCell>
                    <TableCell className="font-serif font-medium">{beast.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-primary/30 text-primary/80 bg-primary/5">{beast.tierName}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs text-muted-foreground italic">Chỉ xem</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="species">
          <Card className="bg-card/30 border-border/50 backdrop-blur overflow-hidden">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="border-border/30">
                  <TableHead className="font-serif text-primary">ID</TableHead>
                  <TableHead className="font-serif text-primary">Tên Chủng Tộc</TableHead>
                  <TableHead className="font-serif text-primary">Nguồn Gốc</TableHead>
                  <TableHead className="font-serif text-primary text-right">Số Lượng Sinh Linh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {speciesLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Đang tải...</TableCell></TableRow>
                ) : speciesData?.map((sp) => (
                  <TableRow key={sp.id} className="border-border/20">
                    <TableCell className="font-mono text-muted-foreground">{sp.id}</TableCell>
                    <TableCell className="font-serif font-medium text-accent">{sp.name}</TableCell>
                    <TableCell className="text-muted-foreground">{sp.category}</TableCell>
                    <TableCell className="text-right font-mono">{sp.beastCount || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
