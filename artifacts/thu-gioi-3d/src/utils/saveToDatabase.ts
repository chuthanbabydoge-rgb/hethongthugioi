import { CreatureModel } from "../data/creatures";

const RARITY_TO_TIER: Record<string, number> = {
  "Thường": 1,
  "Hiếm": 3,
  "Sử Thi": 5,
  "Huyền Thoại": 7,
  "Thần Thánh": 9,
};

const CATEGORY_TO_SPECIES: Record<string, number> = {
  "Huyền Thoại": 1,
  "Thần Thú": 3,
  "Yêu Quái": 4,
  "Động Vật": 5,
};

const CATEGORY_TO_RACE: Record<string, string> = {
  "Huyền Thoại": "Huyền Thoại",
  "Thần Thú": "Thần Thoại",
  "Yêu Quái": "Huyền Ảo",
  "Động Vật": "Dân Gian",
};

export async function saveCreatureToDatabase(creature: CreatureModel): Promise<number | null> {
  const tier = RARITY_TO_TIER[creature.rarity] ?? 1;
  const speciesId = CATEGORY_TO_SPECIES[creature.category] ?? 1;
  const raceCategory = CATEGORY_TO_RACE[creature.category] ?? "Huyền Ảo";

  const body = {
    name: creature.name,
    tier,
    speciesId,
    raceCategory,
    power: creature.power,
    description: creature.description,
    abilities: creature.abilities.join(", "),
    mapZone: `Vùng Cấp ${tier}`,
  };

  const res = await fetch("/api/beasts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Failed to save creature:", await res.text());
    return null;
  }

  const data = await res.json();
  return data.id as number;
}
