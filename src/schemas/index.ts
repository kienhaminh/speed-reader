// Re-export all validation schemas from models for centralized access

// Content schemas
export {
  createReadingContentSchema,
  generateContentSchema,
  type CreateReadingContentRequest,
  type GenerateContentRequest,
} from "@/models/readingContent";

// Session schemas
export {
  createSessionSchema,
  completeSessionSchema,
  type CreateSessionRequest,
  type CompleteSessionRequest,
} from "@/models/readingSession";

// Question schemas
export {
  generateQuestionsSchema,
  questionSchema,
  questionsResponseSchema,
  type GenerateQuestionsRequest,
  type Question,
  type QuestionsResponse,
} from "@/models/comprehensionQuestion";

// Result schemas
export {
  submitAnswersSchema,
  type SubmitAnswersRequest,
} from "@/models/comprehensionResult";

// Analytics schemas
export {
  analyticsSummarySchema,
  type AnalyticsSummary,
} from "@/models/studyLog";

// User schemas
export {
  signupSchema,
  loginSchema,
  passwordSchema,
  type SignupRequest,
  type LoginRequest,
  type User,
  type UserProfile,
} from "@/models/user";

// Additional validation helpers
import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const languageSchema = z.enum(["en", "vi"]);
export const readingModeSchema = z.enum(["word", "chunk", "paragraph"]);
export const contentSourceSchema = z.enum(["paste", "upload", "ai"]);

export const timeFilterSchema = z.enum(["today", "week", "month", "all"]);

export const userIdSchema = z.string().min(1);
export const sessionIdSchema = z.string().min(1);
export const contentIdSchema = z.string().min(1);

export type PaginationRequest = z.infer<typeof paginationSchema>;
export type Language = z.infer<typeof languageSchema>;
export type ReadingMode = z.infer<typeof readingModeSchema>;
export type ContentSource = z.infer<typeof contentSourceSchema>;
export type TimeFilter = z.infer<typeof timeFilterSchema>;
