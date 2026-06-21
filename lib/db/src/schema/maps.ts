import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const universeMapsTable = pgTable("universe_maps", {
  id: serial("id").primaryKey(),
  tier: text("tier").notNull(),
  tierName: text("tier_name").notNull(),
  zoneName: text("zone_name").notNull(),
  description: text("description").notNull(),
  climate: text("climate").notNull(),
  dangerLevel: integer("danger_level").notNull().default(1),
  beastCount: integer("beast_count").notNull().default(0),
  landmarks: text("landmarks"),
  imageUrl: text("image_url"),
});

export const insertUniverseMapSchema = createInsertSchema(universeMapsTable).omit({ id: true });
export type InsertUniverseMap = z.infer<typeof insertUniverseMapSchema>;
export type UniverseMap = typeof universeMapsTable.$inferSelect;
