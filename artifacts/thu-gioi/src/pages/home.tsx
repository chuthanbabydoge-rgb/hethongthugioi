import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative min-h-[90vh] flex flex-col items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10" />
          <img 
            src="/hero-beast.png" 
            alt="Mythical background" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-20 text-center max-w-4xl"
        >
          <h1 className="text-6xl md:text-8xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary/80 to-accent mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
            THÚ GIỚI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-serif tracking-wider mb-10 max-w-2xl mx-auto leading-relaxed text-shadow-sm">
            Nơi vạn thú thức tỉnh, truyền thuyết xoay vần. Khám phá vũ trụ kỳ ảo và bồi dưỡng những sinh vật huyền thoại từ thưở khai thiên lập địa.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/universe" className="group">
              <Button size="lg" className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 text-lg px-8 py-6 h-auto font-serif tracking-widest group-hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all duration-500 w-full sm:w-auto">
                Bước Vào Vũ Trụ
              </Button>
            </Link>
            <Link href="/breed" className="group">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto font-serif tracking-widest hover:border-accent hover:text-accent transition-all duration-500 w-full sm:w-auto bg-background/50 backdrop-blur-sm">
                Bồi Dưỡng Thần Thú
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Tiers overview */}
      <section className="w-full max-w-6xl mx-auto py-24 px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif text-primary mb-4">Cấp Bậc Linh Thú</h2>
          <div className="h-px w-24 bg-primary/50 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 border border-border/50 bg-card/30 backdrop-blur-md rounded-xl hover:border-primary/50 transition-colors group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
              <div className="text-accent font-mono text-sm mb-3 tracking-widest uppercase">{t.tier}</div>
              <h3 className="text-2xl font-serif text-foreground mb-3 group-hover:text-primary transition-colors relative z-10">{t.title}</h3>
              <p className="text-muted-foreground relative z-10 leading-relaxed">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lore Section */}
      <section className="w-full relative py-32 px-8 overflow-hidden bg-black/50 border-y border-border/30">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/galaxy-bg.png')] bg-cover bg-center mix-blend-screen" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
           <h2 className="text-4xl font-serif text-primary mb-8">Nguồn Gốc Chủng Tộc</h2>
           <p className="text-lg text-muted-foreground font-serif leading-loose mb-12">
             Từ thuở hỗn mang, vạn vật được sinh ra từ những câu chuyện. Sử Thi hào hùng, Truyền Thuyết bi tráng, Huyền Thoại xa xăm, Thần Thoại uy nghiêm, Dân Gian bình dị và Huyền Ảo mộng mị. Mỗi linh thú đều mang trong mình một mảnh vỡ của tạo hóa.
           </p>
           <Link href="/bestiary">
            <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 font-serif tracking-widest">
              Tra Cứu Thú Ký
            </Button>
           </Link>
        </div>
      </section>
    </div>
  );
}
