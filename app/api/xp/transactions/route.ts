import { NextRequest, NextResponse } from "next/server";
import { getXPTransactions } from "@/services/xpService";
import { logger } from "@/lib/logger";

// GET /api/xp/transactions - Get user's XP transaction history
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    logger.apiRequest("GET", "/api/xp/transactions", { userId, limit });

    const transactions = await getXPTransactions(userId, limit);

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    logger.apiError("GET", "/api/xp/transactions", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch XP transactions" },
      { status: 500 }
    );
  }
}
