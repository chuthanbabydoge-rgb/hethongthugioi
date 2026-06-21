import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const speciesTable = pgTable("species", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  origin: text("origin").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  beastCount: integer("beast_count").notNull().default(0),
});

export const insertSpeciesSchema = createInsertSchema(speciesTable).omit({ id: true, beastCount: true });
export type InsertSpecies = z.infer<typeof insertSpeciesSchema>;
export type Species = typeof speciesTable.$inferSelect;
