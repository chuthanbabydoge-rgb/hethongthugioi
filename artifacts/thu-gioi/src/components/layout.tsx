import { Link, useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Cổng Môn" },
    { href: "/universe", label: "Vạn Thú Giới" },
    { href: "/breed", label: "Phối Giống" },
    { href: "/bestiary", label: "Thú Ký" },
    { href: "/map", label: "Bản Đồ" },
    { href: "/admin", label: "Quản Trị" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col z-50">
        <div className="p-6">
          <h1 className="text-3xl font-serif font-bold text-primary tracking-widest uppercase">
            Thú Giới
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] mt-1">
            Vạn thú quy tông
          </p>
        </div>
        <ScrollArea className="flex-1 px-4">
          <nav className="flex flex-col gap-2 mt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-3 rounded-md text-sm font-medium transition-all duration-300 font-serif tracking-wide border border-transparent",
                  location === item.href
                    ? "bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:border-border/50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            Vũ trụ kỳ ảo - V1.0
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        {children}
      </main>
    </div>
  );
}
