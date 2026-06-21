import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const breedingRecordsTable = pgTable("breeding_records", {
  id: serial("id").primaryKey(),
  parentAId: integer("parent_a_id").notNull(),
  parentAName: text("parent_a_name"),
  parentBId: integer("parent_b_id").notNull(),
  parentBName: text("parent_b_name"),
  offspringId: integer("offspring_id"),
  offspringName: text("offspring_name"),
  success: boolean("success").notNull().default(true),
  resultTier: integer("result_tier"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBreedingRecordSchema = createInsertSchema(breedingRecordsTable).omit({ id: true, createdAt: true });
export type InsertBreedingRecord = z.infer<typeof insertBreedingRecordSchema>;
export type BreedingRecord = typeof breedingRecordsTable.$inferSelect;
