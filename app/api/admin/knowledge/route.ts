import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  createKnowledgeItemSchema,
  listKnowledgeItemsSchema,
} from "@/schemas";
import {
  createKnowledgeItem,
  listKnowledgeItems,
} from "@/services/knowledgeService";

/**
 * POST /api/admin/knowledge
 * Create new knowledge item from pasted content
 */
export async function POST(request: NextRequest) {
  const context = { endpoint: "/api/admin/knowledge", method: "POST" };

  try {
    logger.apiRequest("POST", "/api/admin/knowledge", context);

    const body = await request.json();
    const validated = createKnowledgeItemSchema.parse(body);

    // TODO: Get userId from session when auth is implemented
    const userId = undefined;

    const knowledgeItem = await createKnowledgeItem(validated, userId);

    logger.info("Knowledge item created successfully", {
      ...context,
      id: knowledgeItem.id,
      contentType: knowledgeItem.contentType,
    });

    return NextResponse.json(knowledgeItem, { status: 201 });
  } catch (error) {
    logger.apiError("POST", "/api/admin/knowledge", error, context);

    if (error instanceof Error) {
      if (error.message.includes("Invalid")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes("parse")) {
        return NextResponse.json(
          { error: "Invalid request data", details: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create knowledge item" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/knowledge
 * List all knowledge items with pagination and filtering
 */
export async function GET(request: NextRequest) {
  const context = { endpoint: "/api/admin/knowledge", method: "GET" };

  try {
    logger.apiRequest("GET", "/api/admin/knowledge", context);

    const searchParams = request.nextUrl.searchParams;
    const query = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      contentType: searchParams.get("contentType") || undefined,
      search: searchParams.get("search") || undefined,
    };

    const validated = listKnowledgeItemsSchema.parse(query);
    const result = await listKnowledgeItems(validated);

    logger.info("Knowledge items retrieved", {
      ...context,
      total: result.total,
      page: result.page,
      returned: result.items.length,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    logger.apiError("GET", "/api/admin/knowledge", error, context);

    if (error instanceof Error && error.message.includes("parse")) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to retrieve knowledge items" },
      { status: 500 }
    );
  }
}
