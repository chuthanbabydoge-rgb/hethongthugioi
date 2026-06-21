import { Router } from "express";
import { db } from "@workspace/db";
import { beastsTable, speciesTable, breedingRecordsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

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

router.get("/stats/overview", async (req, res) => {
  const [totalBeastsResult] = await db.select({ count: sql<number>`count(*)` }).from(beastsTable);
  const [totalSpeciesResult] = await db.select({ count: sql<number>`count(*)` }).from(speciesTable);
  const [totalBreedingsResult] = await db.select({ count: sql<number>`count(*)` }).from(breedingRecordsTable);
  const [legendaryResult] = await db.select({ count: sql<number>`count(*)` }).from(beastsTable).where(eq(beastsTable.isLegendary, true));
  const [darkResult] = await db.select({ count: sql<number>`count(*)` }).from(beastsTable).where(eq(beastsTable.isDarkLegendary, true));
  const [avgPowerResult] = await db.select({ avg: sql<number>`COALESCE(AVG(power), 0)` }).from(beastsTable);
  const [highestTier] = await db.select().from(beastsTable).orderBy(desc(beastsTable.tier), desc(beastsTable.power)).limit(1);

  res.json({
    totalBeasts: Number(totalBeastsResult.count),
    totalSpecies: Number(totalSpeciesResult.count),
    totalBreedings: Number(totalBreedingsResult.count),
    legendaryCount: Number(legendaryResult.count),
    darkLegendaryCount: Number(darkResult.count),
    averagePower: Math.floor(Number(avgPowerResult.avg)),
    highestTierBeast: highestTier ? { ...highestTier, createdAt: highestTier.createdAt.toISOString() } : null,
  });
});

router.get("/stats/tiers", async (req, res) => {
  const rows = await db
    .select({
      tier: beastsTable.tier,
      count: sql<number>`count(*)`,
      averagePower: sql<number>`COALESCE(AVG(power), 0)`,
    })
    .from(beastsTable)
    .groupBy(beastsTable.tier)
    .orderBy(beastsTable.tier);

  res.json(rows.map((r) => ({
    tier: r.tier,
    tierName: TIER_NAMES[r.tier] ?? "Không rõ",
    count: Number(r.count),
    averagePower: Math.floor(Number(r.averagePower)),
  })));
});

router.get("/stats/species", async (req, res) => {
  const rows = await db
    .select({
      category: beastsTable.raceCategory,
      count: sql<number>`count(*)`,
    })
    .from(beastsTable)
    .groupBy(beastsTable.raceCategory)
    .orderBy(desc(sql`count(*)`));

  res.json(rows.map((r) => ({
    category: r.category,
    count: Number(r.count),
  })));
});

export default router;
