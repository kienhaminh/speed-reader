import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { deleteKnowledgeItem } from "@/services/knowledgeService";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * DELETE /api/admin/knowledge/[id]
 * Delete knowledge item by ID
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  const { id } = params;
  const logContext = { endpoint: `/api/admin/knowledge/${id}`, method: "DELETE" };

  try {
    logger.apiRequest("DELETE", `/api/admin/knowledge/${id}`, logContext);

    if (!id) {
      return NextResponse.json(
        { error: "Knowledge item ID is required" },
        { status: 400 }
      );
    }

    await deleteKnowledgeItem(id);

    logger.info("Knowledge item deleted successfully", {
      ...logContext,
      id,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.apiError("DELETE", `/api/admin/knowledge/${id}`, error, logContext);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Knowledge item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete knowledge item" },
      { status: 500 }
    );
  }
}
