import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { studyLogs } from "./schema";

// Drizzle schemas
export const insertStudyLogSchema = createInsertSchema(studyLogs);
export const selectStudyLogSchema = createSelectSchema(studyLogs);

// Validation schemas
export const analyticsSummarySchema = z.object({
  totalTimeMs: z.number().int().min(0),
  averageWpmByMode: z.record(z.string(), z.number().int()),
  averageScorePercent: z.number().int().min(0).max(100),
  sessionsCount: z.number().int().min(0),
});

// Types
export type StudyLog = z.infer<typeof selectStudyLogSchema>;
export type NewStudyLog = z.infer<typeof insertStudyLogSchema>;
export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>;
