import { Router } from "express";
import { db } from "@workspace/db";
import { beastsTable, breedingRecordsTable, speciesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { BreedBeastsBody } from "@workspace/api-zod";

const router = Router();

const TIER_NAMES: Record<number, string> = {
  1: "Động vật bình thường",
  2: "Dã thú",
  3: "Linh thú",
  4: "Hoang thú",
  5: "Hoàng thú",
  6: "Vương thú",
  7: "Tôn thú",
  8: "Đế thú",
  9: "Thánh thú",
  10: "Thần thú",
  11: "Hung thú",
};

function computeOffspringTier(tierA: number, tierB: number): number {
  const base = Math.floor((tierA + tierB) / 2);
  const bonus = Math.random() < 0.15 ? 1 : 0;
  return Math.min(base + bonus, 11);
}

router.get("/breeding", async (req, res) => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "20"), 10);
  const offset = (page - 1) * limit;
  const records = await db.select().from(breedingRecordsTable)
    .orderBy(desc(breedingRecordsTable.createdAt))
    .limit(limit)
    .offset(offset);
  res.json(records.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/breeding", async (req, res) => {
  const data = BreedBeastsBody.parse(req.body);

  const [parentA] = await db.select().from(beastsTable).where(eq(beastsTable.id, data.parentAId));
  const [parentB] = await db.select().from(beastsTable).where(eq(beastsTable.id, data.parentBId));

  if (!parentA || !parentB) {
    return res.status(404).json({ error: "One or both parent beasts not found" });
  }

  const offspringTier = computeOffspringTier(parentA.tier, parentB.tier);
  const offspringTierName = TIER_NAMES[offspringTier] ?? "Không rõ";
  const offspringPower = Math.floor((parentA.power + parentB.power) / 2 * (1 + Math.random() * 0.3));

  // Pick species from one of the parents
  const speciesId = Math.random() < 0.5 ? parentA.speciesId : parentB.speciesId;
  const speciesName = Math.random() < 0.5 ? parentA.speciesName : parentB.speciesName;
  const raceCategory = Math.random() < 0.5 ? parentA.raceCategory : parentB.raceCategory;

  const [offspring] = await db.insert(beastsTable).values({
    name: data.offspringName,
    tier: offspringTier,
    tierName: offspringTierName,
    speciesId,
    speciesName,
    raceCategory,
    power: offspringPower,
    parentAId: data.parentAId,
    parentBId: data.parentBId,
    isLegendary: offspringTier === 10,
    isDarkLegendary: offspringTier === 11,
    description: `Hậu duệ của ${parentA.name} và ${parentB.name}, sinh ra với sức mạnh ${offspringPower}.`,
  }).returning();

  const [record] = await db.insert(breedingRecordsTable).values({
    parentAId: data.parentAId,
    parentAName: parentA.name,
    parentBId: data.parentBId,
    parentBName: parentB.name,
    offspringId: offspring.id,
    offspringName: offspring.name,
    success: true,
    resultTier: offspringTier,
  }).returning();

  const message = offspringTier > Math.max(parentA.tier, parentB.tier)
    ? `Phi thường! ${offspring.name} đã vượt qua cả hai cha mẹ!`
    : `Lai tạo thành công! ${offspring.name} thuộc cấp ${offspringTierName}.`;

  return res.status(201).json({
    record: { ...record, createdAt: record.createdAt.toISOString() },
    offspring: { ...offspring, createdAt: offspring.createdAt.toISOString() },
    success: true,
    message,
  });
});

export default router;
