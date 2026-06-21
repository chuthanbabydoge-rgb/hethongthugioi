import { Router } from "express";
import { db } from "@workspace/db";
import { beastsTable, speciesTable } from "@workspace/db";
import { eq, like, and, desc, SQL } from "drizzle-orm";
import {
  ListBeastsQueryParams,
  CreateBeastBody,
  UpdateBeastBody,
} from "@workspace/api-zod";

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

function getTierName(tier: number): string {
  return TIER_NAMES[tier] ?? "Không rõ";
}

function isLegendaryTier(tier: number) {
  return tier === 10;
}

function isDarkLegendaryTier(tier: number) {
  return tier === 11;
}

router.get("/beasts", async (req, res) => {
  const query = ListBeastsQueryParams.parse(req.query);
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];
  if (query.tier != null) conditions.push(eq(beastsTable.tier, query.tier));
  if (query.species) conditions.push(eq(beastsTable.speciesName, query.species));
  if (query.raceCategory) conditions.push(eq(beastsTable.raceCategory, query.raceCategory));
  if (query.search) conditions.push(like(beastsTable.name, `%${query.search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [beasts, totalRows] = await Promise.all([
    db.select().from(beastsTable).where(where).orderBy(desc(beastsTable.createdAt)).limit(limit).offset(offset),
    db.select().from(beastsTable).where(where),
  ]);

  res.json({
    beasts: beasts.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() })),
    total: totalRows.length,
    page,
    limit,
  });
});

router.post("/beasts", async (req, res) => {
  const data = CreateBeastBody.parse(req.body);
  const tierName = getTierName(data.tier);
  const [species] = await db.select().from(speciesTable).where(eq(speciesTable.id, data.speciesId));
  const speciesName = species?.name ?? "Không rõ";
  const [beast] = await db.insert(beastsTable).values({
    name: data.name,
    tier: data.tier,
    tierName,
    speciesId: data.speciesId,
    speciesName,
    raceCategory: data.raceCategory,
    power: data.power,
    description: data.description,
    imageUrl: data.imageUrl,
    abilities: data.abilities,
    mapZone: data.mapZone,
    isLegendary: isLegendaryTier(data.tier),
    isDarkLegendary: isDarkLegendaryTier(data.tier),
  }).returning();
  res.status(201).json({ ...beast, createdAt: beast.createdAt.toISOString() });
});

router.get("/beasts/legendary", async (req, res) => {
  const beasts = await db.select().from(beastsTable)
    .where(and(eq(beastsTable.isLegendary, true)))
    .orderBy(desc(beastsTable.power));
  const dark = await db.select().from(beastsTable)
    .where(eq(beastsTable.isDarkLegendary, true))
    .orderBy(desc(beastsTable.power));
  const all = [...beasts, ...dark];
  res.json(all.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() })));
});

router.get("/beasts/recent", async (req, res) => {
  const limit = parseInt(String(req.query.limit ?? "10"), 10);
  const beasts = await db.select().from(beastsTable).orderBy(desc(beastsTable.createdAt)).limit(limit);
  res.json(beasts.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() })));
});

router.get("/beasts/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [beast] = await db.select().from(beastsTable).where(eq(beastsTable.id, id));
  if (!beast) return res.status(404).json({ error: "Beast not found" });
  return res.json({ ...beast, createdAt: beast.createdAt.toISOString() });
});

router.patch("/beasts/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = UpdateBeastBody.parse(req.body);
  const updates: Partial<typeof beastsTable.$inferInsert> = { ...data };
  if (data.tier != null) {
    updates.tierName = getTierName(data.tier);
    updates.isLegendary = isLegendaryTier(data.tier);
    updates.isDarkLegendary = isDarkLegendaryTier(data.tier);
  }
  const [beast] = await db.update(beastsTable).set(updates).where(eq(beastsTable.id, id)).returning();
  if (!beast) return res.status(404).json({ error: "Beast not found" });
  return res.json({ ...beast, createdAt: beast.createdAt.toISOString() });
});

router.delete("/beasts/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await db.delete(beastsTable).where(eq(beastsTable.id, id));
  res.status(204).send();
});

router.post("/beasts/:id/evolve", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [beast] = await db.select().from(beastsTable).where(eq(beastsTable.id, id));
  if (!beast) return res.status(404).json({ error: "Beast not found" });
  const newTier = Math.min(beast.tier + 1, 11);
  const tierName = getTierName(newTier);
  const [evolved] = await db.update(beastsTable)
    .set({
      tier: newTier,
      tierName,
      power: Math.floor(beast.power * 1.5),
      isLegendary: isLegendaryTier(newTier),
      isDarkLegendary: isDarkLegendaryTier(newTier),
    })
    .where(eq(beastsTable.id, id))
    .returning();
  return res.json({ ...evolved, createdAt: evolved.createdAt.toISOString() });
});

export default router;
