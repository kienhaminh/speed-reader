import { sql, eq, and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  readingSessions,
  comprehensionResults,
  studyLogs,
} from "@/models/schema";
import { type AnalyticsSummary } from "@/models/studyLog";

/**
 * Aggregates reading sessions for analytics
 */
interface SessionAggregation {
  totalSessions: number;
  totalTimeMs: number;
  totalWordsRead: number;
  averageWpmByMode: Record<string, number>;
  scores: number[];
}

/**
 * Gets session data within date range
 */
async function getSessionsInRange(
  startDate?: Date,
  endDate?: Date,
  mode?: string
): Promise<any[]> {
  let query = db
    .select({
      id: readingSessions.id,
      mode: readingSessions.mode,
      durationMs: readingSessions.durationMs,
      wordsRead: readingSessions.wordsRead,
      computedWpm: readingSessions.computedWpm,
      endedAt: readingSessions.endedAt,
      scorePercent: comprehensionResults.scorePercent,
    })
    .from(readingSessions)
    .leftJoin(
      comprehensionResults,
      eq(readingSessions.id, comprehensionResults.sessionId)
    )
    .where(eq(readingSessions.endedAt, null)); // Only completed sessions

  const conditions = [];

  if (startDate) {
    conditions.push(gte(readingSessions.endedAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(readingSessions.endedAt, endDate));
  }

  if (mode) {
    conditions.push(eq(readingSessions.mode, mode));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return await query;
}

/**
 * Aggregates session data for analytics
 */
function aggregateSessionData(sessions: any[]): SessionAggregation {
  const modeStats: Record<string, { totalWpm: number; count: number }> = {};
  const scores: number[] = [];
  let totalTimeMs = 0;
  let totalWordsRead = 0;

  for (const session of sessions) {
    // Skip incomplete sessions
    if (!session.endedAt || session.durationMs <= 0) continue;

    totalTimeMs += session.durationMs;
    totalWordsRead += session.wordsRead;

    // Aggregate by mode
    if (!modeStats[session.mode]) {
      modeStats[session.mode] = { totalWpm: 0, count: 0 };
    }
    modeStats[session.mode].totalWpm += session.computedWpm;
    modeStats[session.mode].count += 1;

    // Collect scores
    if (session.scorePercent !== null && session.scorePercent !== undefined) {
      scores.push(session.scorePercent);
    }
  }

  // Calculate average WPM by mode
  const averageWpmByMode: Record<string, number> = {};
  for (const [mode, stats] of Object.entries(modeStats)) {
    averageWpmByMode[mode] =
      stats.count > 0 ? Math.round(stats.totalWpm / stats.count) : 0;
  }

  return {
    totalSessions: sessions.filter((s) => s.endedAt).length,
    totalTimeMs,
    totalWordsRead,
    averageWpmByMode,
    scores,
  };
}

/**
 * Calculates average score from score array
 */
function calculateAverageScore(scores: number[]): number {
  if (scores.length === 0) return 0;

  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / scores.length);
}

/**
 * Generates analytics summary for all sessions
 */
export async function generateAnalyticsSummary(
  userId?: string,
  startDate?: Date,
  endDate?: Date,
  mode?: string
): Promise<AnalyticsSummary> {
  try {
    // Get session data
    const sessions = await getSessionsInRange(startDate, endDate, mode);

    // Filter by user if specified (would need to add user tracking)
    // For now, we're treating all sessions as for the current user

    // Aggregate data
    const aggregation = aggregateSessionData(sessions);

    const summary: AnalyticsSummary = {
      totalTimeMs: aggregation.totalTimeMs,
      averageWpmByMode: aggregation.averageWpmByMode,
      averageScorePercent: calculateAverageScore(aggregation.scores),
      sessionsCount: aggregation.totalSessions,
    };

    return summary;
  } catch (error) {
    // Return empty summary on error
    return {
      totalTimeMs: 0,
      averageWpmByMode: {},
      averageScorePercent: 0,
      sessionsCount: 0,
    };
  }
}

/**
 * Updates or creates study log entry for user
 */
export async function updateStudyLog(userId: string): Promise<void> {
  try {
    // Generate current analytics
    const summary = await generateAnalyticsSummary(userId);

    // Check if study log exists
    const [existingLog] = await db
      .select()
      .from(studyLogs)
      .where(eq(studyLogs.userId, userId))
      .limit(1);

    const logData = {
      userId,
      totalTimeMs: summary.totalTimeMs,
      averageWpmByMode: summary.averageWpmByMode,
      averageScorePercent: summary.averageScorePercent,
      sessionsCount: summary.sessionsCount,
      updatedAt: new Date(),
    };

    if (existingLog) {
      // Update existing log
      await db
        .update(studyLogs)
        .set(logData)
        .where(eq(studyLogs.userId, userId));
    } else {
      // Create new log
      await db.insert(studyLogs).values({
        id: `log_${userId}_${Date.now()}`,
        ...logData,
      });
    }
  } catch (error) {
    console.error("Failed to update study log:", error);
    // Don't throw - this is a background operation
  }
}

/**
 * Gets detailed analytics with trends
 */
export async function getDetailedAnalytics(
  userId?: string,
  days: number = 30
): Promise<{
  summary: AnalyticsSummary;
  dailyStats: Array<{
    date: string;
    sessionsCount: number;
    totalTimeMs: number;
    averageWpm: number;
    averageScore: number;
  }>;
  modeComparison: Array<{
    mode: string;
    sessionsCount: number;
    averageWpm: number;
    averageScore: number;
    totalTimeMs: number;
  }>;
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get overall summary
  const summary = await generateAnalyticsSummary(userId, startDate, endDate);

  // Get all sessions in range for detailed analysis
  const sessions = await getSessionsInRange(startDate, endDate);

  // Generate daily stats
  const dailyMap = new Map<string, any[]>();
  for (const session of sessions) {
    if (!session.endedAt) continue;

    const dateKey = new Date(session.endedAt).toISOString().split("T")[0];
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, []);
    }
    dailyMap.get(dateKey)!.push(session);
  }

  const dailyStats = Array.from(dailyMap.entries()).map(
    ([date, daySessions]) => {
      const aggregation = aggregateSessionData(daySessions);
      const avgWpm =
        Object.values(aggregation.averageWpmByMode).reduce((a, b) => a + b, 0) /
        Math.max(1, Object.keys(aggregation.averageWpmByMode).length);

      return {
        date,
        sessionsCount: aggregation.totalSessions,
        totalTimeMs: aggregation.totalTimeMs,
        averageWpm: Math.round(avgWpm),
        averageScore: calculateAverageScore(aggregation.scores),
      };
    }
  );

  // Generate mode comparison
  const modeMap = new Map<string, any[]>();
  for (const session of sessions) {
    if (!session.endedAt) continue;

    if (!modeMap.has(session.mode)) {
      modeMap.set(session.mode, []);
    }
    modeMap.get(session.mode)!.push(session);
  }

  const modeComparison = Array.from(modeMap.entries()).map(
    ([mode, modeSessions]) => {
      const aggregation = aggregateSessionData(modeSessions);

      return {
        mode,
        sessionsCount: aggregation.totalSessions,
        averageWpm: aggregation.averageWpmByMode[mode] || 0,
        averageScore: calculateAverageScore(aggregation.scores),
        totalTimeMs: aggregation.totalTimeMs,
      };
    }
  );

  return {
    summary,
    dailyStats: dailyStats.sort((a, b) => a.date.localeCompare(b.date)),
    modeComparison: modeComparison.sort(
      (a, b) => b.sessionsCount - a.sessionsCount
    ),
  };
}

/**
 * Gets analytics for a specific time period
 */
export async function getAnalyticsForPeriod(
  period: "today" | "week" | "month" | "all",
  userId?: string
): Promise<AnalyticsSummary> {
  let startDate: Date | undefined;

  const now = new Date();

  switch (period) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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

  return await generateAnalyticsSummary(userId, startDate);
}

/**
 * Exports analytics data as CSV
 */
export async function exportAnalyticsCSV(userId?: string): Promise<string> {
  const sessions = await getSessionsInRange();

  const csvLines = [
    "Date,Mode,Duration(ms),Words Read,WPM,Score(%)",
    ...sessions
      .filter((s) => s.endedAt)
      .map((s) =>
        [
          new Date(s.endedAt).toISOString().split("T")[0],
          s.mode,
          s.durationMs,
          s.wordsRead,
          s.computedWpm,
          s.scorePercent || "",
        ].join(",")
      ),
  ];

  return csvLines.join("\n");
}
