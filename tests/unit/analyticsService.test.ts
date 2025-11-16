import { describe, it, expect } from "vitest";

/**
 * Helper function to calculate average score from score array
 * Extracted from analyticsService for testing
 */
function calculateAverageScore(scores: number[]): number {
  if (scores.length === 0) return 0;

  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / scores.length);
}

/**
 * Helper function to aggregate session data for analytics
 * Extracted from analyticsService for testing
 */
function aggregateSessionData(sessions: Array<{
  id: string;
  mode: string;
  durationMs: number;
  wordsRead: number;
  computedWpm: number;
  endedAt: Date | null;
  scorePercent: number | null;
}>): {
  totalSessions: number;
  totalTimeMs: number;
  totalWordsRead: number;
  averageWpmByMode: Record<string, number>;
  scores: number[];
} {
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

describe("analyticsService", () => {
  describe("calculateAverageScore", () => {
    it("should return 0 for empty array", () => {
      expect(calculateAverageScore([])).toBe(0);
    });

    it("should calculate average of single score", () => {
      expect(calculateAverageScore([85])).toBe(85);
    });

    it("should calculate average of multiple scores", () => {
      expect(calculateAverageScore([80, 90, 100])).toBe(90);
    });

    it("should round the average", () => {
      expect(calculateAverageScore([80, 85, 90])).toBe(85);
      expect(calculateAverageScore([81, 82, 83])).toBe(82);
    });

    it("should handle decimal scores", () => {
      expect(calculateAverageScore([75.5, 80.5, 85.5])).toBe(81);
    });
  });

  describe("aggregateSessionData", () => {
    it("should return zero values for empty sessions", () => {
      const result = aggregateSessionData([]);

      expect(result.totalSessions).toBe(0);
      expect(result.totalTimeMs).toBe(0);
      expect(result.totalWordsRead).toBe(0);
      expect(result.averageWpmByMode).toEqual({});
      expect(result.scores).toEqual([]);
    });

    it("should skip incomplete sessions", () => {
      const sessions = [
        {
          id: "session1",
          mode: "word",
          durationMs: 60000,
          wordsRead: 300,
          computedWpm: 300,
          endedAt: null,
          scorePercent: 85,
        },
      ];

      const result = aggregateSessionData(sessions);

      expect(result.totalSessions).toBe(0);
      expect(result.totalTimeMs).toBe(0);
    });

    it("should aggregate single session", () => {
      const sessions = [
        {
          id: "session1",
          mode: "word",
          durationMs: 60000,
          wordsRead: 300,
          computedWpm: 300,
          endedAt: new Date(),
          scorePercent: 85,
        },
      ];

      const result = aggregateSessionData(sessions);

      expect(result.totalSessions).toBe(1);
      expect(result.totalTimeMs).toBe(60000);
      expect(result.totalWordsRead).toBe(300);
      expect(result.averageWpmByMode).toEqual({ word: 300 });
      expect(result.scores).toEqual([85]);
    });

    it("should aggregate multiple sessions of same mode", () => {
      const sessions = [
        {
          id: "session1",
          mode: "word",
          durationMs: 60000,
          wordsRead: 300,
          computedWpm: 300,
          endedAt: new Date(),
          scorePercent: 85,
        },
        {
          id: "session2",
          mode: "word",
          durationMs: 60000,
          wordsRead: 400,
          computedWpm: 400,
          endedAt: new Date(),
          scorePercent: 90,
        },
      ];

      const result = aggregateSessionData(sessions);

      expect(result.totalSessions).toBe(2);
      expect(result.totalTimeMs).toBe(120000);
      expect(result.totalWordsRead).toBe(700);
      expect(result.averageWpmByMode).toEqual({ word: 350 }); // (300 + 400) / 2
      expect(result.scores).toEqual([85, 90]);
    });

    it("should aggregate multiple sessions of different modes", () => {
      const sessions = [
        {
          id: "session1",
          mode: "word",
          durationMs: 60000,
          wordsRead: 300,
          computedWpm: 300,
          endedAt: new Date(),
          scorePercent: 85,
        },
        {
          id: "session2",
          mode: "chunk",
          durationMs: 60000,
          wordsRead: 350,
          computedWpm: 350,
          endedAt: new Date(),
          scorePercent: 90,
        },
        {
          id: "session3",
          mode: "paragraph",
          durationMs: 60000,
          wordsRead: 250,
          computedWpm: 250,
          endedAt: new Date(),
          scorePercent: 80,
        },
      ];

      const result = aggregateSessionData(sessions);

      expect(result.totalSessions).toBe(3);
      expect(result.totalTimeMs).toBe(180000);
      expect(result.totalWordsRead).toBe(900);
      expect(result.averageWpmByMode).toEqual({
        word: 300,
        chunk: 350,
        paragraph: 250,
      });
      expect(result.scores).toEqual([85, 90, 80]);
    });

    it("should handle sessions without scores", () => {
      const sessions = [
        {
          id: "session1",
          mode: "word",
          durationMs: 60000,
          wordsRead: 300,
          computedWpm: 300,
          endedAt: new Date(),
          scorePercent: null,
        },
        {
          id: "session2",
          mode: "word",
          durationMs: 60000,
          wordsRead: 400,
          computedWpm: 400,
          endedAt: new Date(),
          scorePercent: 90,
        },
      ];

      const result = aggregateSessionData(sessions);

      expect(result.totalSessions).toBe(2);
      expect(result.scores).toEqual([90]); // Only non-null score
    });

    it("should skip sessions with invalid duration", () => {
      const sessions = [
        {
          id: "session1",
          mode: "word",
          durationMs: 0,
          wordsRead: 300,
          computedWpm: 300,
          endedAt: new Date(),
          scorePercent: 85,
        },
        {
          id: "session2",
          mode: "word",
          durationMs: -100,
          wordsRead: 400,
          computedWpm: 400,
          endedAt: new Date(),
          scorePercent: 90,
        },
        {
          id: "session3",
          mode: "word",
          durationMs: 60000,
          wordsRead: 500,
          computedWpm: 500,
          endedAt: new Date(),
          scorePercent: 95,
        },
      ];

      const result = aggregateSessionData(sessions);

      // All 3 sessions have endedAt, so totalSessions is 3
      // But only session3 has valid durationMs > 0
      expect(result.totalSessions).toBe(3);
      expect(result.totalTimeMs).toBe(60000); // Only session3's duration
      expect(result.averageWpmByMode).toEqual({ word: 500 }); // Only session3's WPM
      expect(result.scores).toEqual([95]); // Only session3's score
    });
  });
});
