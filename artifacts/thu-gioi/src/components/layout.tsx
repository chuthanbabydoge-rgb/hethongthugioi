import { Link, useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SpatialScene } from "@/components/spatial/SpatialScene";
import { XRButton } from "@/components/spatial/XRButton";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Cổng Môn" },
    { href: "/universe", label: "Vạn Thú Giới" },
    { href: "/breed", label: "Phối Giống" },
    { href: "/bestiary", label: "Thú Ký" },
    { href: "/map", label: "Bản Đồ" },
    { href: "/ai-create", label: "✨ AI Tạo Thú" },
    { href: "/admin", label: "Quản Trị" },
  ];

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background/0 text-foreground relative">
      <SpatialScene />
      
      <aside className="w-64 border-r border-primary/20 bg-[#050514]/75 backdrop-blur-xl flex flex-col z-40 relative shadow-[2px_0_15px_rgba(234,179,8,0.05)]">
        <div className="absolute inset-0 pointer-events-none animate-pulse-slow border-r-2 border-primary/30 opacity-50"></div>
        <div className="p-6 relative z-10">
          <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/60 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
            Thú Giới
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] mt-2 border-b border-primary/20 pb-4">
            Vạn thú quy tông
          </p>
        </div>
        <ScrollArea className="flex-1 px-4 z-10 relative">
          <nav className="flex flex-col gap-3 mt-4">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-3 rounded-md text-sm font-medium transition-all duration-300 font-serif tracking-wide border",
                    isActive
                      ? "bg-primary/15 text-primary border-primary/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:bg-white/5 hover:border-white/10"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t border-primary/20 z-10 relative">
          <div className="text-xs text-primary/60 text-center font-mono">
            Vũ trụ kỳ ảo - V2.0 Spatial
          </div>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto relative z-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
        {children}
      </main>
      
      <XRButton />
    </div>
  );
}
