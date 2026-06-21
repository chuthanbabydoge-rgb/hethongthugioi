import { CreatureModel, CreatureCategory } from "../data/creatures";

function blendColor(a: string, b: string, t = 0.5): string {
  const parseHex = (h: string) => {
    const hex = h.replace("#", "");
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  };
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  const [r1, g1, b1] = parseHex(a);
  const [r2, g2, b2] = parseHex(b);
  return `#${toHex(r1 * (1 - t) + r2 * t)}${toHex(g1 * (1 - t) + g2 * t)}${toHex(b1 * (1 - t) + b2 * t)}`;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const RARITY_RANK: Record<string, number> = {
  "Thường": 1, "Hiếm": 2, "Sử Thi": 3, "Huyền Thoại": 4, "Thần Thánh": 5,
};
const RARITY_BY_RANK: Record<number, CreatureModel["rarity"]> = {
  1: "Thường", 2: "Hiếm", 3: "Sử Thi", 4: "Huyền Thoại", 5: "Thần Thánh",
};

const CATEGORY_PRIORITY: CreatureCategory[] = ["Thần Thú", "Huyền Thoại", "Yêu Quái", "Động Vật"];

export function breedCreatures(parentA: CreatureModel, parentB: CreatureModel): CreatureModel {
  const avgPower = Math.round((parentA.power + parentB.power) / 2);
  const bonus = Math.random() > 0.7 ? Math.round(avgPower * 0.05) : 0;
  const finalPower = Math.min(9999, avgPower + bonus);

  const rarA = RARITY_RANK[parentA.rarity];
  const rarB = RARITY_RANK[parentB.rarity];
  const avgRar = Math.round((rarA + rarB) / 2 + (Math.random() > 0.8 ? 1 : 0));
  const rarity = RARITY_BY_RANK[Math.min(5, avgRar)] ?? "Hiếm";

  const category: CreatureCategory =
    CATEGORY_PRIORITY.find(
      (c) => c === parentA.category || c === parentB.category
    ) ?? parentA.category;

  const name = generateHybridName(parentA, parentB);

  const bodyColor = blendColor(parentA.bodyColor, parentB.bodyColor, 0.5);
  const accentColor = blendColor(parentA.accentColor, parentB.accentColor, 0.5);
  const glowColor = blendColor(parentA.glowColor, parentB.glowColor, 0.5);

  const bodyScale: [number, number, number] = [
    (parentA.bodyScale[0] + parentB.bodyScale[0]) / 2,
    (parentA.bodyScale[1] + parentB.bodyScale[1]) / 2,
    (parentA.bodyScale[2] + parentB.bodyScale[2]) / 2,
  ];

  const mixedAbilities = [
    ...parentA.abilities.slice(0, 2),
    ...parentB.abilities.slice(0, 2),
  ].slice(0, 4);

  const hybrid: CreatureModel = {
    id: `hybrid_${parentA.id}_${parentB.id}_${Date.now()}`,
    name,
    nameEn: `${parentA.nameEn} × ${parentB.nameEn}`,
    category,
    description: `Hậu duệ huyền bí được tạo ra từ sự kết hợp giữa ${parentA.name} và ${parentB.name}. Mang trong mình sức mạnh của cả hai dòng máu, sinh vật này vừa hùng mạnh vừa bí ẩn, chưa từng xuất hiện trong bất kỳ thư tịch cổ nào.`,
    origin: `${parentA.origin} × ${parentB.origin}`,
    power: finalPower,
    rarity,
    bodyColor,
    accentColor,
    glowColor,
    emissiveIntensity: (parentA.emissiveIntensity + parentB.emissiveIntensity) / 2,
    bodyScale,
    headScale: (parentA.headScale + parentB.headScale) / 2,
    hasWings: parentA.hasWings || parentB.hasWings,
    wingSpan: Math.max(parentA.wingSpan, parentB.wingSpan) * 0.85,
    hasTail: parentA.hasTail || parentB.hasTail,
    tailLength: (parentA.tailLength + parentB.tailLength) / 2,
    hasHorns: parentA.hasHorns || parentB.hasHorns,
    hornCount: Math.max(parentA.hornCount, parentB.hornCount),
    hasSpikes: parentA.hasSpikes || parentB.hasSpikes,
    legCount: pickRandom([parentA.legCount, parentB.legCount]),
    roughness: (parentA.roughness + parentB.roughness) / 2,
    metalness: (parentA.metalness + parentB.metalness) / 2,
    particleColor: blendColor(parentA.particleColor, parentB.particleColor, 0.5),
    particleCount: Math.round((parentA.particleCount + parentB.particleCount) / 2),
    auraScale: Math.max(parentA.auraScale, parentB.auraScale) * 0.9,
    abilities: mixedAbilities,
  };

  return hybrid;
}

function generateHybridName(a: CreatureModel, b: CreatureModel): string {
  const prefixes = ["Huyền", "Thần", "Cổ", "Hắc", "Bạch", "Kim", "Ngọc", "Thiên", "Địa", "Linh"];
  const aSplit = a.name.split(" ");
  const bSplit = b.name.split(" ");
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const partA = aSplit[aSplit.length - 1];
  const partB = bSplit[bSplit.length - 1];

  const templates = [
    `${prefix} ${partA} ${partB}`,
    `${partA} Long ${partB}`,
    `Cổ Thần ${partA}`,
    `${prefix} ${partB} Vương`,
    `Huyết ${partA} Thần ${partB}`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}
