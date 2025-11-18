import { db } from "@/lib/db";
import { users, xpTransactions, storyChallenges, challengeAttempts } from "@/models/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";

/**
 * Calculate XP required for a given level
 * Formula: 100 * N^1.5 (exponential curve)
 */
export function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate cumulative XP required to reach a level
 */
export function calculateCumulativeXP(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += calculateXPForLevel(i);
  }
  return total;
}

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXP(totalXP: number): number {
  let level = 1;
  let cumulativeXP = 0;

  while (true) {
    const xpForNextLevel = calculateXPForLevel(level + 1);
    if (cumulativeXP + xpForNextLevel > totalXP) {
      break;
    }
    cumulativeXP += xpForNextLevel;
    level++;
  }

  return level;
}

/**
 * Calculate XP progress for current level
 */
export function calculateLevelProgress(totalXP: number): {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  progress: number;
} {
  const level = calculateLevelFromXP(totalXP);
  const cumulativeXPForCurrentLevel = calculateCumulativeXP(level);
  const currentXP = totalXP - cumulativeXPForCurrentLevel;
  const xpForNextLevel = calculateXPForLevel(level + 1);
  const progress = (currentXP / xpForNextLevel) * 100;

  return {
    level,
    currentXP,
    xpForNextLevel,
    progress: Math.min(progress, 100),
  };
}

export type XPEventType = "session" | "quiz" | "challenge" | "streak" | "milestone";

/**
 * Award XP to a user
 */
export async function awardXP(
  userId: string,
  amount: number,
  eventType: XPEventType,
  description: string,
  metadata?: Record<string, any>
): Promise<{
  success: boolean;
  transaction: typeof xpTransactions.$inferSelect;
  levelUp: boolean;
  oldLevel: number;
  newLevel: number;
  totalXP: number;
}> {
  try {
    logger.serviceOperation("xpService", "awardXP", { userId, amount, eventType });

    // Get current user data
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    const oldLevel = user.level;
    const oldXP = user.totalXp;
    const newTotalXP = oldXP + amount;
    const newLevel = calculateLevelFromXP(newTotalXP);
    const levelUp = newLevel > oldLevel;

    // Create XP transaction
    const transaction = await db
      .insert(xpTransactions)
      .values({
        id: nanoid(),
        userId,
        amount,
        eventType,
        description,
        metadata,
      })
      .returning();

    // Update user's total XP and level
    await db
      .update(users)
      .set({
        totalXp: newTotalXP,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    logger.info("XP awarded", {
      userId,
      amount,
      eventType,
      levelUp,
      oldLevel,
      newLevel,
      totalXP: newTotalXP,
    });

    return {
      success: true,
      transaction: transaction[0],
      levelUp,
      oldLevel,
      newLevel,
      totalXP: newTotalXP,
    };
  } catch (error) {
    logger.serviceError("xpService", "awardXP", error, { userId, amount, eventType });
    throw error;
  }
}

/**
 * Get user's XP transaction history
 */
export async function getXPTransactions(
  userId: string,
  limit: number = 20
): Promise<typeof xpTransactions.$inferSelect[]> {
  try {
    logger.serviceOperation("xpService", "getXPTransactions", { userId, limit });

    const transactions = await db
      .select()
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, userId))
      .orderBy(desc(xpTransactions.createdAt))
      .limit(limit);

    return transactions;
  } catch (error) {
    logger.serviceError("xpService", "getXPTransactions", error, { userId });
    throw error;
  }
}

/**
 * Get user profile with XP stats
 */
export async function getUserProfile(userId: string): Promise<{
  user: typeof users.$inferSelect;
  levelProgress: ReturnType<typeof calculateLevelProgress>;
  recentTransactions: typeof xpTransactions.$inferSelect[];
  totalChallengesCompleted: number;
  totalXPFromChallenges: number;
}> {
  try {
    logger.serviceOperation("xpService", "getUserProfile", { userId });

    // Get user data
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    // Get level progress
    const levelProgress = calculateLevelProgress(user.totalXp);

    // Get recent transactions
    const recentTransactions = await getXPTransactions(userId, 10);

    // Get challenge stats
    const challengeStats = await db
      .select({
        count: sql<number>`count(*)::int`,
        totalXP: sql<number>`sum(${challengeAttempts.xpAwarded})::int`,
      })
      .from(challengeAttempts)
      .where(eq(challengeAttempts.userId, userId));

    return {
      user,
      levelProgress,
      recentTransactions,
      totalChallengesCompleted: challengeStats[0]?.count || 0,
      totalXPFromChallenges: challengeStats[0]?.totalXP || 0,
    };
  } catch (error) {
    logger.serviceError("xpService", "getUserProfile", error, { userId });
    throw error;
  }
}

/**
 * Update user's daily streak
 */
export async function updateStreak(userId: string): Promise<{
  streakContinued: boolean;
  streakBroken: boolean;
  currentStreak: number;
  xpAwarded: number;
}> {
  try {
    logger.serviceOperation("xpService", "updateStreak", { userId });

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStreakDate = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
    lastStreakDate?.setHours(0, 0, 0, 0);

    let streakContinued = false;
    let streakBroken = false;
    let newStreak = user.streakDays;
    let xpAwarded = 0;

    if (!lastStreakDate) {
      // First activity
      newStreak = 1;
      xpAwarded = 5;
      streakContinued = true;
    } else {
      const daysSinceLastActivity = Math.floor(
        (today.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastActivity === 0) {
        // Already counted today
        return {
          streakContinued: false,
          streakBroken: false,
          currentStreak: user.streakDays,
          xpAwarded: 0,
        };
      } else if (daysSinceLastActivity === 1) {
        // Streak continues
        newStreak = user.streakDays + 1;
        xpAwarded = 5;
        streakContinued = true;
      } else {
        // Streak broken
        newStreak = 1;
        xpAwarded = 5;
        streakBroken = true;
      }
    }

    // Update user streak
    await db
      .update(users)
      .set({
        streakDays: newStreak,
        lastStreakDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Award XP
    if (xpAwarded > 0) {
      await awardXP(
        userId,
        xpAwarded,
        "streak",
        streakContinued ? `${newStreak} day streak` : "Streak restarted",
        { streakDays: newStreak, streakBroken }
      );
    }

    logger.info("Streak updated", {
      userId,
      streakContinued,
      streakBroken,
      currentStreak: newStreak,
      xpAwarded,
    });

    return {
      streakContinued,
      streakBroken,
      currentStreak: newStreak,
      xpAwarded,
    };
  } catch (error) {
    logger.serviceError("xpService", "updateStreak", error, { userId });
    throw error;
  }
}
