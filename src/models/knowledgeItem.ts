import { z } from "zod";
import { knowledgeItems } from "./schema";

// Type from Drizzle schema
export type KnowledgeItem = typeof knowledgeItems.$inferSelect;
export type NewKnowledgeItem = typeof knowledgeItems.$inferInsert;

// Content type enum
export const contentTypeValues = [
  "url",
  "text",
  "image",
  "pdf",
  "document",
] as const;

// Metadata type
export type KnowledgeMetadata = {
  fileSize?: number;
  mimeType?: string;
  imageWidth?: number;
  imageHeight?: number;
  pageCount?: number;
  language?: string;
  wordCount?: number;
  [key: string]: unknown;
};

// Request/Response schemas
export const createKnowledgeItemSchema = z.object({
  contentType: z.enum(contentTypeValues),
  content: z.string().min(1, "Content required"),
  sourceTitle: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateKnowledgeItemRequest = z.infer<
  typeof createKnowledgeItemSchema
>;

export const listKnowledgeItemsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  contentType: z.enum(contentTypeValues).optional(),
  search: z.string().optional(),
});

export type ListKnowledgeItemsRequest = z.infer<
  typeof listKnowledgeItemsSchema
>;

export const paginatedKnowledgeItemsSchema = z.object({
  items: z.array(z.custom<KnowledgeItem>()),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export type PaginatedKnowledgeItems = z.infer<
  typeof paginatedKnowledgeItemsSchema
>;

// Extracted knowledge structure
export type ExtractedKnowledge = {
  extractedText: string;
  keywords: string[];
  summary: string;
  metadata: KnowledgeMetadata;
};
