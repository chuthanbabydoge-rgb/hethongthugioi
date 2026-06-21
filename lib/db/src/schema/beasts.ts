import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const beastsTable = pgTable("beasts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tier: integer("tier").notNull().default(1),
  tierName: text("tier_name").notNull().default("Động vật bình thường"),
  speciesId: integer("species_id").notNull(),
  speciesName: text("species_name").notNull(),
  raceCategory: text("race_category").notNull(),
  power: integer("power").notNull().default(100),
  description: text("description"),
  imageUrl: text("image_url"),
  parentAId: integer("parent_a_id"),
  parentBId: integer("parent_b_id"),
  abilities: text("abilities"),
  subordinateCount: integer("subordinate_count").notNull().default(0),
  isLegendary: boolean("is_legendary").notNull().default(false),
  isDarkLegendary: boolean("is_dark_legendary").notNull().default(false),
  mapZone: text("map_zone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBeastSchema = createInsertSchema(beastsTable).omit({
  id: true,
  subordinateCount: true,
  isLegendary: true,
  isDarkLegendary: true,
  createdAt: true,
});
export type InsertBeast = z.infer<typeof insertBeastSchema>;
export type Beast = typeof beastsTable.$inferSelect;
