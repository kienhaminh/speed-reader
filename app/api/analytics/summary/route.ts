import { NextRequest, NextResponse } from "next/server";
import { generateAnalyticsSummary } from "@/services/analyticsService";

export async function GET(request: NextRequest) {
  try {
    // Extract user ID from headers or session (simplified for now)
    const userId = request.headers.get("x-user-id") || undefined;

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") as
      | "today"
      | "week"
      | "month"
      | "all"
      | null;
    const mode = searchParams.get("mode") || undefined;

    // Calculate date range based on period
    let startDate: Date | undefined;
    if (period) {
      const now = new Date();
      switch (period) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "all":
        default:
          startDate = undefined;
          break;
      }
    }

    // Generate analytics summary using service
    const summary = await generateAnalyticsSummary(
      userId,
      startDate,
      undefined,
      mode
    );

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("Analytics summary error:", error);

    // Return empty summary on error
    const emptySummary = {
      totalTimeMs: 0,
      averageWpmByMode: {},
      averageScorePercent: 0,
      sessionsCount: 0,
    };

    return NextResponse.json(emptySummary, { status: 200 });
  }
}
