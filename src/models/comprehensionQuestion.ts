import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { comprehensionQuestions } from "./schema";

// Drizzle schemas
export const insertComprehensionQuestionSchema = createInsertSchema(
  comprehensionQuestions
);
export const selectComprehensionQuestionSchema = createSelectSchema(
  comprehensionQuestions
);

// Validation schemas
export const generateQuestionsSchema = z.object({
  sessionId: z.string().min(1),
  count: z.number().int().min(1).max(10).default(5),
});

export const questionSchema = z.object({
  index: z.number().int().min(1),
  prompt: z.string().min(1),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
});

export const questionsResponseSchema = z.object({
  sessionId: z.string().min(1),
  questions: z.array(questionSchema),
});

// Types
export type ComprehensionQuestion = z.infer<
  typeof selectComprehensionQuestionSchema
>;
export type NewComprehensionQuestion = z.infer<
  typeof insertComprehensionQuestionSchema
>;
export type GenerateQuestionsRequest = z.infer<typeof generateQuestionsSchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuestionsResponse = z.infer<typeof questionsResponseSchema>;
