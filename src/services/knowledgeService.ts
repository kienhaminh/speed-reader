import { db } from "@/lib/db";
import { knowledgeItems } from "@/models/schema";
import {
  type CreateKnowledgeItemRequest,
  type ExtractedKnowledge,
  type KnowledgeItem,
  type ListKnowledgeItemsRequest,
  type PaginatedKnowledgeItems,
} from "@/models/knowledgeItem";
import { logger } from "@/lib/logger";
import { eq, like, and, desc, count } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * Mock knowledge extraction from URL
 * Extracts hostname and path as keywords, creates summary
 */
async function extractFromUrl(url: string): Promise<ExtractedKnowledge> {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const pathParts = parsed.pathname
      .split("/")
      .filter((p) => p && p.length > 0);

    const extractedText = `Content from ${hostname}`;
    const keywords = [hostname, ...pathParts].slice(0, 5);
    const summary = `Web content from ${url}`;

    logger.serviceOperation("knowledgeService", "extractFromUrl", {
      url,
      hostname,
      keywordsCount: keywords.length,
    });

    return {
      extractedText,
      keywords,
      summary,
      metadata: {
        language: "en",
        wordCount: extractedText.split(/\s+/).length,
      },
    };
  } catch (error) {
    logger.serviceError("knowledgeService", "extractFromUrl", error);
    throw new Error("Invalid URL format");
  }
}

/**
 * Mock knowledge extraction from text
 * Counts words, extracts first 5 words as keywords, first sentence as summary
 */
async function extractFromText(text: string): Promise<ExtractedKnowledge> {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const keywords = words.slice(0, 5);
  const firstSentence = text.split(/[.!?]/)[0];
  const summary =
    firstSentence.length > 100
      ? firstSentence.substring(0, 97) + "..."
      : firstSentence;

  logger.serviceOperation("knowledgeService", "extractFromText", {
    wordCount,
    keywordsCount: keywords.length,
  });

  return {
    extractedText: text,
    keywords,
    summary,
    metadata: {
      language: "en",
      wordCount,
    },
  };
}

/**
 * Mock knowledge extraction from image (Mock OCR)
 * Returns placeholder text with mock keywords
 */
async function extractFromImage(
  imageData: string,
  fileName: string
): Promise<ExtractedKnowledge> {
  // Extract file size from base64 data
  const base64Length = imageData.length - (imageData.indexOf(",") + 1);
  const fileSize = Math.floor((base64Length * 3) / 4);

  // Mock OCR result
  const extractedText = `Mock OCR result from image: ${fileName}. This is a placeholder text representing extracted content from the image.`;
  const keywords = ["image", "visual", "content", fileName.replace(/\.[^/.]+$/, "")];
  const summary = `Image file: ${fileName} (${Math.round(fileSize / 1024)} KB)`;

  logger.serviceOperation("knowledgeService", "extractFromImage", {
    fileName,
    fileSize,
    keywordsCount: keywords.length,
  });

  return {
    extractedText,
    keywords,
    summary,
    metadata: {
      fileSize,
      mimeType: "image/*",
      imageWidth: 800,
      imageHeight: 600,
      wordCount: extractedText.split(/\s+/).length,
    },
  };
}

/**
 * Mock knowledge extraction from PDF
 * Returns mock extracted text with random page count
 */
async function extractFromPdf(
  pdfData: string,
  fileName: string
): Promise<ExtractedKnowledge> {
  // Extract file size from base64 data
  const base64Length = pdfData.length - (pdfData.indexOf(",") + 1);
  const fileSize = Math.floor((base64Length * 3) / 4);

  // Mock PDF extraction
  const pageCount = Math.floor(Math.random() * 10) + 1;
  const extractedText = `Mock PDF content from ${fileName} (${pageCount} pages). This is a placeholder representing the extracted text content from the PDF document. It would normally contain the actual text from all pages.`;
  const keywords = [
    "document",
    "pdf",
    fileName.replace(".pdf", ""),
    `${pageCount}pages`,
  ];
  const summary = `PDF document: ${fileName} with ${pageCount} pages (${Math.round(fileSize / 1024)} KB)`;

  logger.serviceOperation("knowledgeService", "extractFromPdf", {
    fileName,
    fileSize,
    pageCount,
    keywordsCount: keywords.length,
  });

  return {
    extractedText,
    keywords,
    summary,
    metadata: {
      fileSize,
      mimeType: "application/pdf",
      pageCount,
      wordCount: extractedText.split(/\s+/).length,
    },
  };
}

/**
 * Create knowledge item with extraction based on content type
 */
export async function createKnowledgeItem(
  request: CreateKnowledgeItemRequest,
  userId?: string
): Promise<KnowledgeItem> {
  logger.serviceOperation("knowledgeService", "createKnowledgeItem", {
    contentType: request.contentType,
    userId,
  });

  try {
    let extracted: ExtractedKnowledge;

    // Extract knowledge based on content type
    switch (request.contentType) {
      case "url":
        extracted = await extractFromUrl(request.content);
        break;
      case "text":
        extracted = await extractFromText(request.content);
        break;
      case "image":
        extracted = await extractFromImage(
          request.content,
          request.sourceTitle || "image.png"
        );
        break;
      case "pdf":
        extracted = await extractFromPdf(
          request.content,
          request.sourceTitle || "document.pdf"
        );
        break;
      case "document":
        // Treat document like text for now
        extracted = await extractFromText(request.content);
        break;
      default:
        throw new Error(`Unsupported content type: ${request.contentType}`);
    }

    // Create database record
    const newItem = {
      id: randomUUID(),
      contentType: request.contentType,
      sourceUrl: request.contentType === "url" ? request.content : null,
      sourceTitle: request.sourceTitle || null,
      rawContent: request.content,
      extractedText: extracted.extractedText,
      metadata: extracted.metadata,
      keywords: extracted.keywords,
      summary: extracted.summary,
      createdByUserId: userId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [created] = await db
      .insert(knowledgeItems)
      .values(newItem)
      .returning();

    logger.info("Knowledge item created", {
      id: created.id,
      contentType: created.contentType,
    });

    return created;
  } catch (error) {
    logger.serviceError("knowledgeService", "createKnowledgeItem", error);
    throw error;
  }
}

/**
 * List knowledge items with pagination and filtering
 */
export async function listKnowledgeItems(
  options: ListKnowledgeItemsRequest
): Promise<PaginatedKnowledgeItems> {
  logger.serviceOperation("knowledgeService", "listKnowledgeItems", options);

  try {
    const { page, limit, contentType, search } = options;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];
    if (contentType) {
      conditions.push(eq(knowledgeItems.contentType, contentType));
    }
    if (search) {
      conditions.push(
        like(knowledgeItems.sourceTitle, `%${search}%`)
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(knowledgeItems)
      .where(whereClause);

    // Get paginated items
    const items = await db
      .select()
      .from(knowledgeItems)
      .where(whereClause)
      .orderBy(desc(knowledgeItems.createdAt))
      .limit(limit)
      .offset(offset);

    logger.info("Knowledge items listed", {
      total,
      page,
      limit,
      returned: items.length,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  } catch (error) {
    logger.serviceError("knowledgeService", "listKnowledgeItems", error);
    throw error;
  }
}

/**
 * Delete knowledge item by ID
 */
export async function deleteKnowledgeItem(id: string): Promise<void> {
  logger.serviceOperation("knowledgeService", "deleteKnowledgeItem", { id });

  try {
    const result = await db
      .delete(knowledgeItems)
      .where(eq(knowledgeItems.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Knowledge item not found");
    }

    logger.info("Knowledge item deleted", { id });
  } catch (error) {
    logger.serviceError("knowledgeService", "deleteKnowledgeItem", error);
    throw error;
  }
}
