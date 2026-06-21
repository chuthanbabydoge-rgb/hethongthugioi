import { CreatureModel, CreatureCategory } from "../data/creatures";

/* ─── keyword tables ─── */
const FIRE = ["lửa","fire","hỏa","flame","dragon","rồng","phượng","phoenix","sun","mặt trời","nóng","đỏ","red","crimson"];
const ICE  = ["băng","ice","tuyết","snow","frost","lạnh","blue","xanh lam","water","nước","biển","ocean"];
const DARK = ["đen","black","dark","tối","shadow","bóng","ác","demon","quỷ","địa ngục","hell","death","chết"];
const LIGHT= ["trắng","white","light","ánh sáng","holy","thánh","golden","vàng","gold","angel","thiên"];
const PLANT= ["xanh lá","green","rừng","forest","plant","cây","rắn","nature","gỗ","wind","gió"];
const THUNDER=["sấm","thunder","bolt","lightning","điện","electric","bão","storm","tím","purple","violet"];

const WING_KW  = ["cánh","wing","bay","fly","bird","chim","eagle","hawk","phượng","phoenix","garuda","dragon","rồng"];
const HORN_KW  = ["sừng","horn","unicorn","kỳ lân","rhinoceros","tê giác","bull","trâu","deer","hươu"];
const TAIL_KW  = ["đuôi","tail","rắn","snake","dragon","rồng","fox","cáo","cat","mèo","lion","sư tử"];
const SPIKE_KW = ["gai","spike","thorns","porcupine","nhím","sharp","nhọn","spiny","armor","giáp"];
const LEGEND_KW= ["thần","divine","legendary","huyền thoại","ancient","cổ đại","titan","god","thánh","immortal","bất tử"];
const BIG_KW   = ["khổng lồ","giant","huge","lớn","big","great","enormous","macro","giga","mega","vua","king","lord"];

function matches(text: string, kws: string[]): boolean {
  const lower = text.toLowerCase();
  return kws.some(k => lower.includes(k));
}

function score(text: string, kws: string[]): number {
  const lower = text.toLowerCase();
  return kws.filter(k => lower.includes(k)).length;
}

/* Deterministic seed from string */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function seeded(seed: number, idx: number): number {
  return ((seed * (idx + 1) * 2654435761) >>> 0) / 0xffffffff;
}

/* ─── Main generator ─── */
export function generateCreatureFromText(rawInput: string): CreatureModel {
  const text = rawInput.trim() || "sinh vật bí ẩn";
  const seed  = hashStr(text);
  const r     = (i: number) => seeded(seed, i);

  /* Element */
  const isFire    = score(text, FIRE)    > 0;
  const isIce     = score(text, ICE)     > 0;
  const isDark    = score(text, DARK)    > 0;
  const isLight   = score(text, LIGHT)   > 0;
  const isPlant   = score(text, PLANT)   > 0;
  const isThunder = score(text, THUNDER) > 0;

  /* Colours by element */
  let bodyColor = "#1a0a2e", accentColor = "#7c3aed", glowColor = "#a855f7", particleColor = "#c084fc";
  if (isFire)    { bodyColor="#3b0a0a"; accentColor="#dc2626"; glowColor="#f97316"; particleColor="#fbbf24"; }
  else if (isIce){ bodyColor="#0a1a3b"; accentColor="#3b82f6"; glowColor="#7dd3fc"; particleColor="#bfdbfe"; }
  else if (isDark){ bodyColor="#0a0a0a"; accentColor="#7f1d1d"; glowColor="#ef4444"; particleColor="#fca5a5"; }
  else if (isLight){ bodyColor="#f8f5e4"; accentColor="#fbbf24"; glowColor="#fde68a"; particleColor="#fef9c3"; }
  else if (isPlant){ bodyColor="#0a2012"; accentColor="#16a34a"; glowColor="#4ade80"; particleColor="#bbf7d0"; }
  else if (isThunder){ bodyColor="#1e1b4b"; accentColor="#7c3aed"; glowColor="#c084fc"; particleColor="#e9d5ff"; }
  else {
    /* random tint from seed */
    const hues = [300,260,200,30,160,280,15,190];
    const h = hues[seed % hues.length];
    bodyColor   = `hsl(${h},60%,10%)`;
    accentColor = `hsl(${h},80%,40%)`;
    glowColor   = `hsl(${h},80%,60%)`;
    particleColor=`hsl(${h},70%,75%)`;
  }

  /* Features */
  const hasWings  = matches(text, WING_KW)  || r(10) > 0.7;
  const hasHorns  = matches(text, HORN_KW)  || r(11) > 0.72;
  const hasTail   = matches(text, TAIL_KW)  || r(12) > 0.4;
  const hasSpikes = matches(text, SPIKE_KW) || r(13) > 0.65;
  const isLarge   = matches(text, BIG_KW);
  const isLegend  = matches(text, LEGEND_KW);

  const legOptions = [4,4,4,2,2,0,8];
  const legCount   = legOptions[seed % legOptions.length];

  /* Power + rarity */
  const basePower = 3000 + Math.round(r(20) * 5000);
  const legendBonus = isLegend ? 2000 : 0;
  const power = Math.min(9999, basePower + legendBonus);
  const rarity = power > 9000 ? "Thần Thánh"
               : power > 7500 ? "Huyền Thoại"
               : power > 5500 ? "Sử Thi"
               : power > 3500 ? "Hiếm"
               : "Thường" as CreatureModel["rarity"];

  /* Category */
  const category: CreatureCategory = isLegend ? "Thần Thú"
                  : isDark           ? "Yêu Quái"
                  : isFire||isIce||isThunder ? "Huyền Thoại"
                  : "Động Vật";

  /* Size */
  const scaleBase = isLarge ? 1.5 : 1.0 + r(30) * 0.4;
  const bodyScale: [number,number,number] = [
    scaleBase + r(31)*0.3,
    0.6 + r(32)*0.3,
    0.6 + r(33)*0.3,
  ];

  /* Abilities */
  const allAbilities: string[][] = [
    ["Lửa Thiêng","Hơi Thở Lửa","Bão Lửa","Thiêu Rụi"],
    ["Băng Hà","Cơn Bão Tuyết","Đóng Băng","Ngọn Lạnh"],
    ["Bóng Tối","Hấp Thụ Linh Hồn","Bóng Ma","Ma Thuật Hắc Ám"],
    ["Ánh Sáng Thánh","Chữa Lành","Hào Quang","Phán Xét"],
    ["Cuồng Phong","Mũi Tên Gió","Lốc Xoáy","Tốc Độ Tối Thượng"],
    ["Sấm Sét","Điện Năng","Bão Điện","Chuỗi Sét"],
    ["Tái Sinh","Tiên Tri","Biến Hình","Gọi Đàn"],
    ["Hơi Độc","Bẫy Đất","Ngủ Đông","Tấn Công Thần Tốc"],
  ];
  const abilitySet = allAbilities[seed % allAbilities.length];
  const abilities = abilitySet.slice(0, 2 + Math.round(r(40) * 2));

  /* Origin */
  const origins = ["Việt Nam","Trung Hoa","Hy Lạp","Ấn Độ","Ai Cập","Norse","Nhật Bản","Babylon","Không rõ"];
  const origin = origins[seed % origins.length];

  return {
    id: `ai_${seed}_${Date.now()}`,
    name: formatName(text),
    nameEn: text.length > 30 ? text.slice(0, 30) + "…" : text,
    category,
    description: buildDescription(text, isFire, isIce, isDark, isLight, isPlant, isThunder, isLegend, hasWings),
    origin,
    power,
    rarity,
    bodyColor,
    accentColor,
    glowColor,
    emissiveIntensity: 0.4 + r(50)*0.8,
    bodyScale,
    headScale: 0.5 + r(51)*0.2,
    hasWings,
    wingSpan: hasWings ? 2.5 + r(52)*2 : 0,
    hasTail,
    tailLength: hasTail ? 0.8 + r(53)*1.5 : 0,
    hasHorns,
    hornCount: hasHorns ? (r(54) > 0.5 ? 2 : 1) : 0,
    hasSpikes,
    legCount,
    roughness: 0.1 + r(60)*0.7,
    metalness: 0.0 + r(61)*0.7,
    particleColor,
    particleCount: 30 + Math.round(r(62)*70),
    auraScale: 1.2 + r(63)*1.2,
    abilities,
  };
}

function formatName(raw: string): string {
  const parts = raw.trim().split(/\s+/);
  const prefixes = ["Thần","Huyền","Cổ","Thiên","Địa","Hắc","Bạch","Kim","Ngọc","Linh"];
  const suffixes = ["Vương","Hoàng","Thú","Thần","Long","Lân","Hổ","Phụng","Điểu","Giáp"];
  if (parts.length === 1 && raw.length < 6) {
    const pIdx = hashStr(raw) % prefixes.length;
    const sIdx = (hashStr(raw) * 7) % suffixes.length;
    return `${prefixes[pIdx]} ${raw.charAt(0).toUpperCase()}${raw.slice(1)} ${suffixes[sIdx]}`;
  }
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function buildDescription(text: string, fire: boolean, ice: boolean, dark: boolean, light: boolean, plant: boolean, thunder: boolean, legend: boolean, wings: boolean): string {
  const element = fire ? "lửa thiêng" : ice ? "băng tuyết" : dark ? "bóng tối" : light ? "ánh sáng" : plant ? "thiên nhiên" : thunder ? "sấm sét" : "năng lượng huyền bí";
  const fly = wings ? " Đôi cánh rộng lớn cho phép nó bay vút lên tầng mây." : "";
  const leg = legend ? " Đây là sinh vật thần thánh hiếm gặp nhất trong vũ trụ, chỉ xuất hiện khi thiên địa biến động." : "";
  return `Sinh vật bí ẩn được triệu hồi từ "${text}". Cơ thể toát ra ${element}${fly}${leg} Sức mạnh của nó vượt xa mọi sinh vật thông thường và chưa từng được ghi chép trong bất kỳ thư tịch cổ nào.`;
}
