import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { comprehensionResults } from "./schema";

// Drizzle schemas
export const insertComprehensionResultSchema =
  createInsertSchema(comprehensionResults);
export const selectComprehensionResultSchema =
  createSelectSchema(comprehensionResults);

// Validation schemas
export const submitAnswersSchema = z.object({
  sessionId: z.string().min(1),
  answers: z.array(z.number().int().min(0).max(3)).length(5),
});

// Types
export type ComprehensionResult = z.infer<
  typeof selectComprehensionResultSchema
>;
export type NewComprehensionResult = z.infer<
  typeof insertComprehensionResultSchema
>;
export type SubmitAnswersRequest = z.infer<typeof submitAnswersSchema>;
