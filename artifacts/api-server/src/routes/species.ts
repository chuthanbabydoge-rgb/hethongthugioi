import { Router } from "express";
import { db } from "@workspace/db";
import { speciesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateSpeciesBody, UpdateSpeciesBody } from "@workspace/api-zod";

const router = Router();

router.get("/species", async (req, res) => {
  const category = req.query.category as string | undefined;
  let rows;
  if (category) {
    rows = await db.select().from(speciesTable).where(eq(speciesTable.category, category));
  } else {
    rows = await db.select().from(speciesTable);
  }
  res.json(rows);
});

router.post("/species", async (req, res) => {
  const data = CreateSpeciesBody.parse(req.body);
  const [species] = await db.insert(speciesTable).values(data).returning();
  res.status(201).json(species);
});

router.patch("/species/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = UpdateSpeciesBody.parse(req.body);
  const [species] = await db.update(speciesTable).set(data).where(eq(speciesTable.id, id)).returning();
  if (!species) return res.status(404).json({ error: "Species not found" });
  return res.json(species);
});

router.delete("/species/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await db.delete(speciesTable).where(eq(speciesTable.id, id));
  res.status(204).send();
});

export default router;
