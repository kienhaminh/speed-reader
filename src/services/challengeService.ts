import { db } from "@/lib/db";
import { storyChallenges, challengeAttempts, users } from "@/models/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { logger } from "@/lib/logger";
import { awardXP } from "./xpService";

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

/**
 * Get all active challenges
 */
export async function getAllChallenges(userId?: string): Promise<
  Array<
    typeof storyChallenges.$inferSelect & {
      isLocked?: boolean;
      userAttempts?: number;
      bestScore?: number;
      completed?: boolean;
    }
  >
> {
  try {
    logger.serviceOperation("challengeService", "getAllChallenges", { userId });

    const challenges = await db
      .select()
      .from(storyChallenges)
      .where(eq(storyChallenges.isActive, 1))
      .orderBy(storyChallenges.requiredLevel, storyChallenges.xpReward);

    if (!userId) {
      return challenges;
    }

    // Get user's level to determine locked challenges
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's attempts for each challenge
    const attempts = await db
      .select({
        challengeId: challengeAttempts.challengeId,
        count: sql<number>`count(*)::int`,
        bestScore: sql<number>`max(${challengeAttempts.scorePercent})::int`,
      })
      .from(challengeAttempts)
      .where(eq(challengeAttempts.userId, userId))
      .groupBy(challengeAttempts.challengeId);

    const attemptsMap = new Map(
      attempts.map((a) => [a.challengeId, { count: a.count, bestScore: a.bestScore }])
    );

    return challenges.map((challenge) => {
      const userStats = attemptsMap.get(challenge.id);
      return {
        ...challenge,
        isLocked: user.level < challenge.requiredLevel,
        userAttempts: userStats?.count || 0,
        bestScore: userStats?.bestScore || undefined,
        completed: (userStats?.count || 0) > 0,
      };
    });
  } catch (error) {
    logger.serviceError("challengeService", "getAllChallenges", error, { userId });
    throw error;
  }
}

/**
 * Get challenge by ID
 */
export async function getChallengeById(
  challengeId: string,
  userId?: string
): Promise<
  | (typeof storyChallenges.$inferSelect & {
      isLocked?: boolean;
      userAttempts?: Array<typeof challengeAttempts.$inferSelect>;
      bestScore?: number;
    })
  | null
> {
  try {
    logger.serviceOperation("challengeService", "getChallengeById", { challengeId, userId });

    const [challenge] = await db
      .select()
      .from(storyChallenges)
      .where(and(eq(storyChallenges.id, challengeId), eq(storyChallenges.isActive, 1)));

    if (!challenge) {
      return null;
    }

    if (!userId) {
      return challenge;
    }

    // Get user's level
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's attempts
    const attempts = await db
      .select()
      .from(challengeAttempts)
      .where(
        and(eq(challengeAttempts.userId, userId), eq(challengeAttempts.challengeId, challengeId))
      )
      .orderBy(desc(challengeAttempts.completedAt));

    const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.scorePercent)) : undefined;

    return {
      ...challenge,
      isLocked: user.level < challenge.requiredLevel,
      userAttempts: attempts,
      bestScore,
    };
  } catch (error) {
    logger.serviceError("challengeService", "getChallengeById", error, { challengeId, userId });
    throw error;
  }
}

/**
 * Record a challenge attempt
 */
export async function recordChallengeAttempt(
  userId: string,
  challengeId: string,
  sessionId: string | null,
  scorePercent: number,
  wpm: number
): Promise<{
  attempt: typeof challengeAttempts.$inferSelect;
  xpAwarded: number;
  levelUp: boolean;
  newLevel: number;
}> {
  try {
    logger.serviceOperation("challengeService", "recordChallengeAttempt", {
      userId,
      challengeId,
      scorePercent,
      wpm,
    });

    // Verify challenge exists and user has access
    const challenge = await getChallengeById(challengeId, userId);
    if (!challenge) {
      throw new Error("Challenge not found");
    }
    if (challenge.isLocked) {
      throw new Error("Challenge is locked");
    }

    // Calculate XP based on score and difficulty
    const baseXP = challenge.xpReward;
    const scoreBonus = scorePercent === 100 ? 0.5 : scorePercent >= 90 ? 0.25 : 0;
    const xpAwarded = Math.floor(baseXP * (1 + scoreBonus));

    // Record attempt
    const [attempt] = await db
      .insert(challengeAttempts)
      .values({
        id: nanoid(),
        userId,
        challengeId,
        sessionId,
        scorePercent,
        wpm,
        xpAwarded,
      })
      .returning();

    // Award XP
    const xpResult = await awardXP(
      userId,
      xpAwarded,
      "challenge",
      `Completed: ${challenge.title} (${scorePercent}%)`,
      {
        challengeId,
        challengeTitle: challenge.title,
        difficulty: challenge.difficulty,
        scorePercent,
        wpm,
      }
    );

    logger.info("Challenge attempt recorded", {
      userId,
      challengeId,
      scorePercent,
      wpm,
      xpAwarded,
      levelUp: xpResult.levelUp,
    });

    return {
      attempt,
      xpAwarded,
      levelUp: xpResult.levelUp,
      newLevel: xpResult.newLevel,
    };
  } catch (error) {
    logger.serviceError("challengeService", "recordChallengeAttempt", error, {
      userId,
      challengeId,
    });
    throw error;
  }
}

/**
 * Get user's challenge statistics
 */
export async function getUserChallengeStats(userId: string): Promise<{
  totalAttempts: number;
  totalCompleted: number;
  totalXPEarned: number;
  averageScore: number;
  challengesByDifficulty: Record<
    Difficulty,
    {
      attempted: number;
      completed: number;
      averageScore: number;
    }
  >;
}> {
  try {
    logger.serviceOperation("challengeService", "getUserChallengeStats", { userId });

    // Get all user attempts with challenge data
    const attempts = await db
      .select({
        challengeId: challengeAttempts.challengeId,
        scorePercent: challengeAttempts.scorePercent,
        xpAwarded: challengeAttempts.xpAwarded,
        difficulty: storyChallenges.difficulty,
      })
      .from(challengeAttempts)
      .leftJoin(storyChallenges, eq(challengeAttempts.challengeId, storyChallenges.id))
      .where(eq(challengeAttempts.userId, userId));

    const totalAttempts = attempts.length;
    const uniqueChallenges = new Set(attempts.map((a) => a.challengeId));
    const totalCompleted = uniqueChallenges.size;
    const totalXPEarned = attempts.reduce((sum, a) => sum + a.xpAwarded, 0);
    const averageScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.scorePercent, 0) / attempts.length)
        : 0;

    // Group by difficulty
    const challengesByDifficulty = {
      beginner: { attempted: 0, completed: 0, averageScore: 0 },
      intermediate: { attempted: 0, completed: 0, averageScore: 0 },
      advanced: { attempted: 0, completed: 0, averageScore: 0 },
      expert: { attempted: 0, completed: 0, averageScore: 0 },
    };

    type AttemptWithDifficulty = typeof attempts[number];

    const difficultyGroups = new Map<
      Difficulty,
      { attempts: AttemptWithDifficulty[]; challenges: Set<string> }
    >();

    attempts.forEach((attempt) => {
      const difficulty = (attempt.difficulty || "beginner") as Difficulty;
      if (!difficultyGroups.has(difficulty)) {
        difficultyGroups.set(difficulty, { attempts: [], challenges: new Set() });
      }
      const group = difficultyGroups.get(difficulty)!;
      group.attempts.push(attempt);
      group.challenges.add(attempt.challengeId);
    });

    difficultyGroups.forEach((group, difficulty) => {
      challengesByDifficulty[difficulty] = {
        attempted: group.attempts.length,
        completed: group.challenges.size,
        averageScore:
          group.attempts.length > 0
            ? Math.round(
                group.attempts.reduce((sum, a) => sum + a.scorePercent, 0) / group.attempts.length
              )
            : 0,
      };
    });

    return {
      totalAttempts,
      totalCompleted,
      totalXPEarned,
      averageScore,
      challengesByDifficulty,
    };
  } catch (error) {
    logger.serviceError("challengeService", "getUserChallengeStats", error, { userId });
    throw error;
  }
}

/**
 * Create a new challenge (admin function)
 */
export async function createChallenge(data: {
  title: string;
  description: string;
  difficulty: Difficulty;
  requiredLevel: number;
  xpReward: number;
  content: string;
  wordCount: number;
  estimatedTimeMinutes: number;
}): Promise<typeof storyChallenges.$inferSelect> {
  try {
    logger.serviceOperation("challengeService", "createChallenge", { title: data.title });

    const [challenge] = await db
      .insert(storyChallenges)
      .values({
        id: nanoid(),
        ...data,
        isActive: 1,
      })
      .returning();

    logger.info("Challenge created", { challengeId: challenge.id, title: challenge.title });

    return challenge;
  } catch (error) {
    logger.serviceError("challengeService", "createChallenge", error, { title: data.title });
    throw error;
  }
}
