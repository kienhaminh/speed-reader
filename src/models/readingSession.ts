import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { readingSessions } from "./schema";

// Drizzle schemas
export const insertReadingSessionSchema = createInsertSchema(readingSessions);
export const selectReadingSessionSchema = createSelectSchema(readingSessions);

// Validation schemas
export const createSessionSchema = z.object({
  userId: z.string().min(1),
  contentId: z.string().min(1),
  mode: z.enum(["word", "chunk", "paragraph"]),
  paceWpm: z.number().int().min(100).max(1200),
  chunkSize: z.number().int().min(2).max(8).optional(),
});

export const completeSessionSchema = z.object({
  sessionId: z.string().min(1),
  wordsRead: z.number().int().min(0),
  durationMs: z.number().int().min(0),
});

// Types
export type ReadingSession = z.infer<typeof selectReadingSessionSchema>;
export type NewReadingSession = z.infer<typeof insertReadingSessionSchema>;
export type CreateSessionRequest = z.infer<typeof createSessionSchema>;
export type CompleteSessionRequest = z.infer<typeof completeSessionSchema>;
