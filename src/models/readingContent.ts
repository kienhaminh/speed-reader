import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { readingContent } from "./schema";

// Drizzle schemas
export const insertReadingContentSchema = createInsertSchema(readingContent);
export const selectReadingContentSchema = createSelectSchema(readingContent);

// Validation schemas
export const createReadingContentSchema = z.object({
  language: z.enum(["en", "vi"]),
  source: z.enum(["paste", "upload"]),
  text: z.string().min(1),
  title: z.string().optional(),
});

export const generateContentSchema = z.object({
  language: z.enum(["en", "vi"]),
  topic: z.string().min(1),
  targetWords: z.number().int().min(100).max(2000),
});

// Types
export type ReadingContent = z.infer<typeof selectReadingContentSchema>;
export type NewReadingContent = z.infer<typeof insertReadingContentSchema>;
export type CreateReadingContentRequest = z.infer<
  typeof createReadingContentSchema
>;
export type GenerateContentRequest = z.infer<typeof generateContentSchema>;
