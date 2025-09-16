import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { readingContent } from "@/models/schema";
import {
  type CreateReadingContentRequest,
  type ReadingContent,
  createReadingContentSchema,
} from "@/models/readingContent";

/**
 * Counts words in text using whitespace and punctuation boundaries
 */
export function countWords(text: string): number {
  if (!text.trim()) return 0;

  // Split by whitespace and filter out empty strings
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  return words.length;
}

/**
 * Creates reading content from user input (paste/upload)
 */
export async function createContent(
  request: CreateReadingContentRequest,
  createdByUserId?: string
): Promise<ReadingContent> {
  // Validate input
  const validatedRequest = createReadingContentSchema.parse(request);

  // Count words in the text
  const wordCount = countWords(validatedRequest.text);

  if (wordCount === 0) {
    throw new Error("Content must contain at least one word");
  }

  // Generate unique ID
  const id = `content_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  // Create content record
  const newContent = {
    id,
    language: validatedRequest.language,
    source: validatedRequest.source,
    text: validatedRequest.text,
    title: validatedRequest.title || null,
    wordCount,
    createdByUserId: createdByUserId || null,
    createdAt: new Date(),
  };

  // Insert into database
  const [insertedContent] = await db
    .insert(readingContent)
    .values(newContent)
    .returning();

  if (!insertedContent) {
    throw new Error("Failed to create content");
  }

  return insertedContent;
}

/**
 * Retrieves reading content by ID
 */
export async function getContentById(
  contentId: string
): Promise<ReadingContent | null> {
  const [content] = await db
    .select()
    .from(readingContent)
    .where(eq(readingContent.id, contentId))
    .limit(1);

  return content || null;
}

/**
 * Retrieves recent content for a user
 */
export async function getRecentContent(
  userId?: string,
  limit: number = 10
): Promise<ReadingContent[]> {
  const query = db
    .select()
    .from(readingContent)
    .orderBy(readingContent.createdAt)
    .limit(limit);

  if (userId) {
    query.where(eq(readingContent.createdByUserId, userId));
  }

  return await query;
}

/**
 * Validates content text length and structure
 */
export function validateContentText(
  text: string,
  minWords: number = 1
): boolean {
  const wordCount = countWords(text);
  return wordCount >= minWords;
}

/**
 * Extracts title from content if not provided
 */
export function extractTitleFromContent(
  text: string,
  maxLength: number = 50
): string {
  const firstSentence = text.split(/[.!?]/)[0]?.trim();

  if (!firstSentence) {
    return "Untitled Content";
  }

  if (firstSentence.length <= maxLength) {
    return firstSentence;
  }

  // Truncate to maxLength and add ellipsis
  return firstSentence.substring(0, maxLength - 3) + "...";
}
