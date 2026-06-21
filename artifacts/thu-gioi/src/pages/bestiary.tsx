import { useState } from "react";
import { useListBeasts } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function Bestiary() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const { data, isLoading } = useListBeasts({ 
    limit: 100, 
    search: debouncedSearch || undefined 
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif text-primary mb-2">Thú Ký</h1>
          <p className="text-muted-foreground">Tàng thư ghi chép mọi sinh linh trong Vạn Thú Giới.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm danh xưng..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card/40 border-border/50 font-serif"
          />
        </div>
      </header>

      <div className="border border-border/50 rounded-xl overflow-hidden bg-card/30 backdrop-blur-md shadow-lg">
        <Table>
          <TableHeader className="bg-black/40">
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="font-serif text-primary tracking-wider">Danh Xưng</TableHead>
              <TableHead className="font-serif text-primary tracking-wider">Cảnh Giới</TableHead>
              <TableHead className="font-serif text-primary tracking-wider">Huyết Mạch</TableHead>
              <TableHead className="font-serif text-primary text-right tracking-wider">Lực Chiến</TableHead>
              <TableHead className="font-serif text-primary text-right tracking-wider">Tọa Độ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-serif">Đang lật giở tàng thư...</TableCell>
              </TableRow>
            ) : data?.beasts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-serif">Không tìm thấy ghi chép nào phù hợp.</TableCell>
              </TableRow>
            ) : (
              data?.beasts.map((beast) => (
                <TableRow key={beast.id} className="border-border/20 hover:bg-primary/5 transition-colors group">
                  <TableCell className="font-serif font-medium text-lg group-hover:text-primary transition-colors">{beast.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/30 text-primary/80 bg-primary/5">
                      {beast.tierName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-serif">{beast.speciesName}</TableCell>
                  <TableCell className="text-right text-accent font-mono">{beast.power.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground/60">{beast.mapZone || "Vô định"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {!isLoading && data && data.total > data.beasts.length && (
        <div className="mt-6 text-center text-sm text-muted-foreground font-serif">
          Hiển thị {data.beasts.length} / {data.total} ghi chép.
        </div>
      )}
    </div>
  );
}
