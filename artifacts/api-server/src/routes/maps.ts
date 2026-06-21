import { Router } from "express";
import { db } from "@workspace/db";
import { universeMapsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/maps", async (req, res) => {
  const maps = await db.select().from(universeMapsTable).orderBy(universeMapsTable.id);
  res.json(maps);
});

router.get("/maps/:tier", async (req, res) => {
  const tier = req.params.tier;
  const [map] = await db.select().from(universeMapsTable).where(eq(universeMapsTable.tier, tier));
  if (!map) return res.status(404).json({ error: "Map not found" });
  return res.json(map);
});

export default router;
