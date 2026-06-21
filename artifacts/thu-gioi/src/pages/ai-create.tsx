import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCreateBeast } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Save, RotateCcw, Wand2 } from "lucide-react";

/* ─── AI Generator logic ─── */
const FIRE   = ["lửa","fire","hỏa","flame","dragon","rồng","phượng","phoenix","sun","mặt trời","nóng","đỏ","red","crimson"];
const ICE    = ["băng","ice","tuyết","snow","frost","lạnh","blue","xanh lam","water","nước","biển","ocean"];
const DARK   = ["đen","black","dark","tối","shadow","bóng","ác","demon","quỷ","địa ngục","hell","death","chết"];
const LIGHT  = ["trắng","white","light","ánh sáng","holy","thánh","golden","vàng","gold","angel","thiên"];
const PLANT  = ["xanh lá","green","rừng","forest","plant","cây","rắn","nature","gỗ","wind","gió"];
const THUNDER= ["sấm","thunder","bolt","lightning","điện","electric","bão","storm","tím","purple","violet"];

const WING_KW  = ["cánh","wing","bay","fly","bird","chim","eagle","hawk","phượng","phoenix","garuda","dragon","rồng"];
const HORN_KW  = ["sừng","horn","unicorn","kỳ lân","rhinoceros","tê giác","bull","trâu","deer","hươu"];
const TAIL_KW  = ["đuôi","tail","rắn","snake","dragon","rồng","fox","cáo","cat","mèo","lion","sư tử"];
const SPIKE_KW = ["gai","spike","thorns","porcupine","nhím","sharp","nhọn","spiny","armor","giáp"];
const LEGEND_KW= ["thần","divine","legendary","huyền thoại","ancient","cổ đại","titan","god","thánh","immortal","bất tử"];
const BIG_KW   = ["khổng lồ","giant","huge","lớn","big","great","enormous","macro","giga","mega","vua","king","lord"];

function matches(text: string, kws: string[]) { const l = text.toLowerCase(); return kws.some(k => l.includes(k)); }
function score(text: string, kws: string[])   { const l = text.toLowerCase(); return kws.filter(k => l.includes(k)).length; }
function hashStr(s: string) { let h=0; for(let i=0;i<s.length;i++) h=(Math.imul(31,h)+s.charCodeAt(i))|0; return Math.abs(h); }
function seeded(seed: number, idx: number) { return ((seed*(idx+1)*2654435761)>>>0)/0xffffffff; }

interface AICreature {
  name: string; description: string; power: number; rarity: string; tier: number;
  bodyColor: string; accentColor: string; glowColor: string; particleColor: string;
  emissiveIntensity: number; hasWings: boolean; wingSpan: number; hasTail: boolean;
  tailLength: number; hasHorns: boolean; hornCount: number; hasSpikes: boolean;
  legCount: number; headScale: number; bodyScale: [number,number,number];
  auraScale: number; particleCount: number;
  abilities: string[]; origin: string; raceCategory: string; speciesId: number;
}

function generate(rawInput: string): AICreature {
  const text = rawInput.trim() || "sinh vật bí ẩn";
  const seed = hashStr(text);
  const r = (i: number) => seeded(seed, i);

  const isFire=score(text,FIRE)>0, isIce=score(text,ICE)>0, isDark=score(text,DARK)>0;
  const isLight=score(text,LIGHT)>0, isPlant=score(text,PLANT)>0, isThunder=score(text,THUNDER)>0;

  let bodyColor="#1a0a2e", accentColor="#7c3aed", glowColor="#a855f7", particleColor="#c084fc";
  if(isFire)    { bodyColor="#3b0a0a"; accentColor="#dc2626"; glowColor="#f97316"; particleColor="#fbbf24"; }
  else if(isIce){ bodyColor="#0a1a3b"; accentColor="#3b82f6"; glowColor="#7dd3fc"; particleColor="#bfdbfe"; }
  else if(isDark){ bodyColor="#0a0a0a"; accentColor="#7f1d1d"; glowColor="#ef4444"; particleColor="#fca5a5"; }
  else if(isLight){ bodyColor="#2a1a05"; accentColor="#fbbf24"; glowColor="#fde68a"; particleColor="#fef9c3"; }
  else if(isPlant){ bodyColor="#0a2012"; accentColor="#16a34a"; glowColor="#4ade80"; particleColor="#bbf7d0"; }
  else if(isThunder){ bodyColor="#1e1b4b"; accentColor="#7c3aed"; glowColor="#c084fc"; particleColor="#e9d5ff"; }
  else { const hues=[300,260,200,30,160,280,15,190]; const h=hues[seed%hues.length]; bodyColor=`hsl(${h},60%,10%)`; accentColor=`hsl(${h},80%,40%)`; glowColor=`hsl(${h},80%,60%)`; particleColor=`hsl(${h},70%,75%)`; }

  const hasWings=matches(text,WING_KW)||r(10)>0.7;
  const hasHorns=matches(text,HORN_KW)||r(11)>0.72;
  const hasTail=matches(text,TAIL_KW)||r(12)>0.4;
  const hasSpikes=matches(text,SPIKE_KW)||r(13)>0.65;
  const isLarge=matches(text,BIG_KW), isLegend=matches(text,LEGEND_KW);
  const legOptions=[4,4,4,2,2,0,8]; const legCount=legOptions[seed%legOptions.length];

  const basePower=3000+Math.round(r(20)*5000);
  const power=Math.min(9999, basePower+(isLegend?2000:0));
  const rarity=power>9000?"Thần Thánh":power>7500?"Huyền Thoại":power>5500?"Sử Thi":power>3500?"Hiếm":"Thường";
  const tier=power>9000?9:power>7500?7:power>5500?5:power>3500?3:1;

  const raceCategory=isLegend?"Thần Thoại":isDark?"Huyền Ảo":(isFire||isIce||isThunder)?"Huyền Thoại":"Dân Gian";
  const speciesId=isLegend?3:isDark?4:(isFire||isThunder)?1:(isIce||isPlant)?5:1;

  const scaleBase=isLarge?1.5:1.0+r(30)*0.4;
  const bodyScale:[number,number,number]=[scaleBase+r(31)*0.3, 0.6+r(32)*0.3, 0.6+r(33)*0.3];

  const allAbilities=[
    ["Lửa Thiêng","Hơi Thở Lửa","Bão Lửa","Thiêu Rụi"],
    ["Băng Hà","Cơn Bão Tuyết","Đóng Băng","Ngọn Lạnh"],
    ["Bóng Tối","Hấp Thụ Linh Hồn","Bóng Ma","Ma Thuật Hắc Ám"],
    ["Ánh Sáng Thánh","Chữa Lành","Hào Quang","Phán Xét"],
    ["Cuồng Phong","Mũi Tên Gió","Lốc Xoáy","Tốc Độ Tối Thượng"],
    ["Sấm Sét","Điện Năng","Bão Điện","Chuỗi Sét"],
    ["Tái Sinh","Tiên Tri","Biến Hình","Gọi Đàn"],
    ["Hơi Độc","Bẫy Đất","Ngủ Đông","Tấn Công Thần Tốc"],
  ];
  const abilitySet=allAbilities[seed%allAbilities.length];
  const abilities=abilitySet.slice(0,2+Math.round(r(40)*2));

  const origins=["Việt Nam","Trung Hoa","Hy Lạp","Ấn Độ","Ai Cập","Norse","Nhật Bản","Babylon"];
  const origin=origins[seed%origins.length];

  const parts=text.trim().split(/\s+/);
  const prefixes=["Thần","Huyền","Cổ","Thiên","Địa","Hắc","Bạch","Kim","Ngọc","Linh"];
  const suffixes=["Vương","Hoàng","Thú","Thần","Long","Lân","Hổ","Phụng","Điểu","Giáp"];
  let name: string;
  if(parts.length===1&&text.length<6){ const pI=seed%prefixes.length; const sI=(seed*7)%suffixes.length; name=`${prefixes[pI]} ${text.charAt(0).toUpperCase()}${text.slice(1)} ${suffixes[sI]}`; }
  else { name=parts.map(p=>p.charAt(0).toUpperCase()+p.slice(1)).join(" "); }

  const element=isFire?"lửa thiêng":isIce?"băng tuyết":isDark?"bóng tối":isLight?"ánh sáng":isPlant?"thiên nhiên":isThunder?"sấm sét":"năng lượng huyền bí";
  const fly=hasWings?" Đôi cánh rộng lớn cho phép nó bay vút lên tầng mây.":"";
  const leg=isLegend?" Đây là sinh vật thần thánh hiếm gặp nhất, chỉ xuất hiện khi thiên địa biến động.":"";
  const description=`Sinh vật bí ẩn được triệu hồi từ "${text}". Cơ thể toát ra ${element}.${fly}${leg} Sức mạnh của nó vượt xa mọi sinh vật thông thường.`;

  return { name, description, power, rarity, tier, bodyColor, accentColor, glowColor, particleColor,
    emissiveIntensity:0.4+r(50)*0.8, bodyScale, headScale:0.5+r(51)*0.2, hasWings, wingSpan:hasWings?2.5+r(52)*2:0,
    hasTail, tailLength:hasTail?0.8+r(53)*1.5:0, hasHorns, hornCount:hasHorns?(r(54)>0.5?2:1):0,
    hasSpikes, legCount, auraScale:1.2+r(63)*1.2, particleCount:30+Math.round(r(62)*70),
    abilities, origin, raceCategory, speciesId };
}

/* ─── Canvas Renderer ─── */
function hexToRgb(hex: string): [number,number,number] {
  const c=hex.replace("#",""); if(c.length===3) return [parseInt(c[0]+c[0],16),parseInt(c[1]+c[1],16),parseInt(c[2]+c[2],16)];
  return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)];
}
function rgba(hex: string, a: number) { try { const [r,g,b]=hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; } catch { return `rgba(150,100,200,${a})`; } }

function CreatureCanvas({ creature }: { creature: AICreature }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const starsRef  = useRef<{x:number;y:number;size:number;twinkle:number}[]>([]);
  const particlesRef = useRef<{angle:number;radius:number;speed:number;size:number;phase:number}[]>([]);

  useEffect(() => {
    const seed = hashStr(creature.name);
    const rng = (i:number) => Math.abs(Math.sin(seed*(i+1)*127.1))%1;
    starsRef.current = Array.from({length:80},(_,i)=>({ x:rng(i*3)*800, y:rng(i*3+1)*600, size:0.4+rng(i*3+2)*1.2, twinkle:0.3+rng(i*3+3)*1.5 }));
    const count=Math.min(creature.particleCount,50);
    particlesRef.current = Array.from({length:count},(_,i)=>({ angle:rng(i*5)*Math.PI*2, radius:80+rng(i*5+1)*creature.auraScale*50, speed:(0.2+rng(i*5+2)*0.5)*(rng(i*5+3)>0.5?1:-1), size:1.2+rng(i*5+4)*2.5, phase:rng(i*5+5)*Math.PI*2 }));
  }, [creature.name]);

  useEffect(() => {
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext("2d"); if(!ctx) return;
    const startTime = performance.now();

    const resize = () => { const p=canvas.parentElement; if(!p) return; canvas.width=p.clientWidth; canvas.height=p.clientHeight; };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement!);

    const draw = (now: number) => {
      const t=(now-startTime)/1000, W=canvas.width, H=canvas.height, cx=W/2, cy=H/2+10;
      const bg=ctx.createRadialGradient(cx,cy*0.7,30,cx,cy,Math.max(W,H)*0.8);
      bg.addColorStop(0,"#0d0d2b"); bg.addColorStop(1,"#050714");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      // Stars
      starsRef.current.forEach(s => { const a=0.2+0.6*Math.abs(Math.sin(t*s.twinkle)); ctx.beginPath(); ctx.arc(s.x%W,s.y%H,s.size,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${a})`; ctx.fill(); });

      // Particles
      const scale=Math.min(W,H)/480;
      particlesRef.current.forEach(p => { const a=p.angle+t*p.speed; const bob=Math.sin(t*1.5)*8; const x=cx+Math.cos(a)*p.radius*scale; const y=cy+bob+Math.sin(a)*p.radius*0.5*scale; const alpha=0.3+0.5*Math.sin(t*2+p.phase); const sz=p.size*scale*(0.8+0.3*Math.sin(t+p.phase)); ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fillStyle=rgba(creature.particleColor,alpha); ctx.fill(); });

      // Creature
      const bob=Math.sin(t*1.5)*8, sway=Math.sin(t*0.8)*4;
      ctx.save(); ctx.translate(cx+sway,cy+bob); ctx.scale(scale,scale);
      const bc=creature.bodyColor, ac=creature.accentColor, gc=creature.glowColor, ei=creature.emissiveIntensity;

      // Aura
      const auraR=160*creature.auraScale*0.55;
      const aura=ctx.createRadialGradient(0,0,auraR*0.2,0,0,auraR);
      aura.addColorStop(0,rgba(gc,0.18*ei)); aura.addColorStop(0.5,rgba(gc,0.08*ei)); aura.addColorStop(1,rgba(gc,0));
      ctx.beginPath(); ctx.ellipse(0,0,auraR*1.3,auraR,0,0,Math.PI*2); ctx.fillStyle=aura; ctx.fill();

      // Wings
      if(creature.hasWings){ const ws=creature.wingSpan*28; const wf=Math.sin(t*3)*0.15; for(const side of[-1,1]){ ctx.save(); ctx.scale(side,1); ctx.rotate(wf*side); ctx.beginPath(); ctx.moveTo(30,-10); ctx.bezierCurveTo(ws*0.4,-ws*0.35,ws*0.9,-ws*0.1,ws,0); ctx.bezierCurveTo(ws*0.7,ws*0.2,ws*0.3,ws*0.2,20,20); ctx.closePath(); const wg=ctx.createLinearGradient(30,-20,ws,0); wg.addColorStop(0,rgba(ac,0.85)); wg.addColorStop(0.5,rgba(gc,0.5)); wg.addColorStop(1,rgba(gc,0.1)); ctx.fillStyle=wg; ctx.fill(); ctx.strokeStyle=rgba(gc,0.4); ctx.lineWidth=1.5; ctx.stroke(); ctx.restore(); } }

      // Tail
      if(creature.hasTail){ const tl=creature.tailLength*55; const tw=Math.sin(t*2)*18; ctx.beginPath(); ctx.moveTo(-10,40); ctx.quadraticCurveTo(-tl*0.5+tw,60+tl*0.3,-tl+tw*1.5,80+tl*0.5); ctx.lineWidth=14; ctx.strokeStyle=bc; ctx.lineCap="round"; ctx.stroke(); ctx.lineWidth=6; ctx.strokeStyle=rgba(gc,0.4); ctx.stroke(); }

      // Body
      const bx=(creature.bodyScale[0]-1)*30;
      const bodyGrad=ctx.createRadialGradient(-15,-20,5,0,0,90);
      bodyGrad.addColorStop(0,rgba(ac,0.9)); bodyGrad.addColorStop(0.45,bc); bodyGrad.addColorStop(1,rgba(bc,0.7));
      ctx.beginPath(); ctx.ellipse(0,15,75+bx,65,0,0,Math.PI*2); ctx.fillStyle=bodyGrad; ctx.fill();
      ctx.strokeStyle=rgba(gc,0.35+0.15*Math.sin(t*2)); ctx.lineWidth=3; ctx.stroke();

      // Chest
      ctx.beginPath(); ctx.ellipse(0,10,35,30,0,0,Math.PI*2);
      const cg=ctx.createRadialGradient(-8,0,3,0,5,35); cg.addColorStop(0,rgba(ac,0.8)); cg.addColorStop(1,rgba(ac,0.1));
      ctx.fillStyle=cg; ctx.fill();

      // Spikes
      if(creature.hasSpikes){ for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(i*18,-40); ctx.lineTo(i*18-7,-58-Math.abs(i)*4); ctx.lineTo(i*18+7,-58-Math.abs(i)*4); ctx.closePath(); ctx.fillStyle=rgba(gc,0.7); ctx.fill(); } }

      // Neck + Head
      ctx.beginPath(); ctx.ellipse(2,-28,22,18,0.1,0,Math.PI*2); ctx.fillStyle=bc; ctx.fill();
      const hs=creature.headScale*100;
      const hg=ctx.createRadialGradient(-10,-62,5,0,-58,hs*0.7); hg.addColorStop(0,rgba(ac,0.7)); hg.addColorStop(0.6,bc); hg.addColorStop(1,rgba(bc,0.8));
      ctx.beginPath(); ctx.ellipse(0,-58,hs*0.65,hs*0.55,0,0,Math.PI*2); ctx.fillStyle=hg; ctx.fill();
      ctx.strokeStyle=rgba(gc,0.3); ctx.lineWidth=2; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0,-38,16,11,0,0,Math.PI*2); ctx.fillStyle=bc; ctx.fill();

      // Eyes
      const eyeGlow=0.6+0.4*Math.sin(t*2.5);
      [[-18,-62],[18,-62]].forEach(([ex,ey])=>{ ctx.beginPath(); ctx.arc(ex,ey,9,0,Math.PI*2); ctx.fillStyle="#0a0a0a"; ctx.fill(); ctx.beginPath(); ctx.arc(ex,ey,6,0,Math.PI*2); ctx.fillStyle=gc; ctx.fill(); const eg=ctx.createRadialGradient(ex,ey,4,ex,ey,16); eg.addColorStop(0,rgba(gc,eyeGlow*0.9)); eg.addColorStop(1,rgba(gc,0)); ctx.beginPath(); ctx.arc(ex,ey,16,0,Math.PI*2); ctx.fillStyle=eg; ctx.fill(); ctx.beginPath(); ctx.arc(ex-2,ey-2,2,0,Math.PI*2); ctx.fillStyle="rgba(255,255,255,0.9)"; ctx.fill(); });

      // Horns
      if(creature.hasHorns){ const hp=creature.hornCount>=2?[[-20,-82],[20,-82]]:[[0,-88]]; hp.forEach(([hx,hy])=>{ ctx.beginPath(); ctx.moveTo(hx-7,hy+12); ctx.lineTo(hx,hy-22); ctx.lineTo(hx+7,hy+12); ctx.closePath(); const hornG=ctx.createLinearGradient(hx,hy-22,hx,hy+12); hornG.addColorStop(0,gc); hornG.addColorStop(1,ac); ctx.fillStyle=hornG; ctx.fill(); }); }

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, [creature]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display:"block" }} />;
}

/* ─── Rarity config ─── */
const RARITY_CONFIG: Record<string, { color: string; label: string }> = {
  "Thường":     { color: "hsl(215 20% 60%)", label: "Bình thường" },
  "Hiếm":       { color: "hsl(142 70% 45%)", label: "Linh thú" },
  "Sử Thi":     { color: "hsl(217 90% 60%)", label: "Hoàng thú" },
  "Huyền Thoại":{ color: "hsl(270 80% 65%)", label: "Tôn thú" },
  "Thần Thánh": { color: "hsl(43 85% 55%)",  label: "Thánh thú" },
};

const EXAMPLES = ["Rồng lửa khổng lồ","Phượng Hoàng băng giá","Thần Rùa bóng tối","Sói sấm sét","Kỳ Lân ánh sáng","Hắc Long thiên địa"];

/* ─── Main Page ─── */
export default function AICreate() {
  const [prompt, setPrompt]   = useState("");
  const [creature, setCreature] = useState<AICreature | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const createBeast = useCreateBeast();

  const handleGenerate = useCallback((text?: string) => {
    const input = (text ?? prompt).trim();
    if (!input) return;
    setPrompt(input);
    setGenerating(true);
    setSaved(false);
    setTimeout(() => {
      setCreature(generate(input));
      setGenerating(false);
    }, 800);
  }, [prompt]);

  const handleSave = () => {
    if (!creature) return;
    createBeast.mutate({
      data: {
        name: creature.name,
        tier: creature.tier,
        speciesId: creature.speciesId,
        raceCategory: creature.raceCategory,
        power: creature.power,
        description: creature.description,
        abilities: creature.abilities.join(", "),
        mapZone: `Vùng Cấp ${creature.tier}`,
      }
    }, {
      onSuccess: () => {
        setSaved(true);
        toast.success(`"${creature.name}" đã được đưa vào Vạn Thú Giới!`);
      },
      onError: () => toast.error("Lưu thất bại. Thử lại sau."),
    });
  };

  const rarityConf = creature ? (RARITY_CONFIG[creature.rarity] ?? RARITY_CONFIG["Thường"]) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-full">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Wand2 className="text-primary w-6 h-6" />
          <h1 className="text-4xl font-serif text-primary drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">
            AI Tạo Sinh Vật
          </h1>
        </div>
        <p className="text-muted-foreground font-serif tracking-wider text-sm">
          Mô tả linh thú trong tâm trí — AI sẽ triệu hồi nó vào vũ trụ.
        </p>
      </header>

      {/* Prompt area */}
      <div className="mb-4">
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGenerate()}
            placeholder="Nhập mô tả sinh vật... vd: Rồng lửa cánh vàng khổng lồ"
            className="flex-1 px-4 py-3 bg-card/50 border border-primary/20 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all font-serif"
          />
          <Button
            onClick={() => handleGenerate()}
            disabled={generating || !prompt.trim()}
            className="px-6 bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 font-serif tracking-widest"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" />Triệu Hồi</>}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => handleGenerate(ex)}
              disabled={generating}
              className="text-xs px-3 py-1 rounded-full bg-card/40 border border-primary/20 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all font-serif"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {!creature && !generating && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="text-6xl mb-4 opacity-20">🐉</div>
            <p className="text-muted-foreground font-serif tracking-widest text-lg">Nhập mô tả để triệu hồi linh thú</p>
            <p className="text-muted-foreground/50 font-serif text-sm mt-2">AI sẽ phân tích từ khóa và tạo sinh vật phù hợp</p>
          </motion.div>
        )}

        {generating && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="flex gap-3 mb-4">
              {[creature?.bodyColor ?? "#7c3aed", "#fbbf24", creature?.glowColor ?? "#a855f7"].map((c, i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 rounded-full"
                  style={{ background: c }}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
            </div>
            <p className="text-primary font-serif tracking-widest animate-pulse">Đang triệu hồi linh thú...</p>
          </motion.div>
        )}

        {creature && !generating && (
          <motion.div
            key={creature.name}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Viewer */}
            <div
              className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-[0_0_30px_rgba(234,179,8,0.08)]"
              style={{ minHeight: 480, background: "radial-gradient(ellipse at center, #0d0d2b 0%, #050714 70%)" }}
            >
              <CreatureCanvas creature={creature} />

              {/* Name overlay */}
              <div className="absolute top-4 left-0 right-0 text-center pointer-events-none px-8">
                <div
                  className="text-2xl font-black font-serif tracking-wide drop-shadow-lg"
                  style={{ textShadow: `0 0 30px ${creature.glowColor}`, color: creature.glowColor }}
                >
                  {creature.name}
                </div>
              </div>

              {/* Rarity badge */}
              {rarityConf && (
                <div className="absolute top-4 right-4">
                  <Badge
                    className="font-serif text-xs tracking-widest border"
                    style={{ color: rarityConf.color, background: rarityConf.color + "18", borderColor: rarityConf.color + "55" }}
                  >
                    ✦ {creature.rarity}
                  </Badge>
                </div>
              )}

              {/* Bottom hint */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/40 font-mono pointer-events-none whitespace-nowrap">
                Canvas AI · Sinh vật hào quang sống động
              </div>
            </div>

            {/* Info panel */}
            <div className="flex flex-col gap-4">
              {/* Stats */}
              <div className="bg-card/40 border border-primary/20 rounded-2xl p-5 backdrop-blur">
                <h2 className="font-serif text-xl text-foreground mb-4 drop-shadow-[0_0_5px_rgba(234,179,8,0.3)]">
                  {creature.name}
                </h2>

                {/* Power bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground font-serif">Sức Mạnh</span>
                    <span className="font-bold text-primary">{creature.power.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${creature.accentColor}, ${creature.glowColor})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (creature.power / 9999) * 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Traits */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono">
                  {[
                    { label: "Nguồn Gốc", val: creature.origin },
                    { label: "Cấp Bậc", val: rarityConf?.label ?? creature.rarity },
                    { label: "Chủng Loài", val: creature.raceCategory },
                    { label: "Tier", val: `Cấp ${creature.tier}` },
                    { label: "Cánh", val: creature.hasWings ? "Có" : "Không" },
                    { label: "Sừng", val: creature.hasHorns ? `${creature.hornCount} cái` : "Không" },
                    { label: "Đuôi",  val: creature.hasTail ? "Có" : "Không" },
                    { label: "Chân",  val: creature.legCount === 0 ? "Không" : `${creature.legCount} chân` },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-black/30 rounded-lg p-2 border border-primary/10">
                      <div className="text-muted-foreground/60 mb-0.5">{label}</div>
                      <div className="text-foreground font-medium">{val}</div>
                    </div>
                  ))}
                </div>

                {/* Colors */}
                <div className="flex gap-3 mb-4">
                  {[{l:"Thân",c:creature.bodyColor},{l:"Điểm nhấn",c:creature.accentColor},{l:"Hào quang",c:creature.glowColor}].map(({l,c})=>(
                    <div key={l} className="text-center flex-1">
                      <div className="w-8 h-8 rounded-full mx-auto mb-1 border-2 border-white/10" style={{ background:c, boxShadow:`0 0 8px ${c}66` }} />
                      <div className="text-xs text-muted-foreground/60">{l}</div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">{creature.description}</p>
              </div>

              {/* Abilities */}
              <div className="bg-card/40 border border-primary/20 rounded-2xl p-5 backdrop-blur">
                <h3 className="text-sm font-serif text-primary/80 mb-3 tracking-widest uppercase">Kỹ Năng</h3>
                <div className="grid grid-cols-2 gap-2">
                  {creature.abilities.map((ab, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-black/30 rounded-xl px-3 py-2 border border-primary/10"
                    >
                      <span className="text-base">{["⚡","🔥","💧","🌪️","✨","☄️","🌙","⚔️"][i % 8]}</span>
                      <span className="text-xs text-foreground font-medium">{ab}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={createBeast.isPending || saved}
                  className="flex-1 bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 font-serif tracking-widest"
                >
                  {createBeast.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : saved ? (
                    <>✅ Đã Lưu vào Vạn Thú Giới</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" />Lưu vào Vạn Thú Giới</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setCreature(null); setPrompt(""); setSaved(false); }}
                  className="border-primary/20 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
