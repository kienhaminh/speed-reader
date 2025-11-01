import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";

/**
 * Rate limiting configuration
 */
const RATE_LIMITS = {
  AI_GENERATION: {
    PER_SESSION: 5, // Max generations per session
    PER_DAY: 20, // Max generations per day per user
    COOLDOWN_MS: 60000, // 1 minute between requests
  },
  API_GENERAL: {
    PER_MINUTE: 60, // Per-user API calls per minute
    PER_HOUR: 1000, // Per-user API calls per hour
  },
};

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  remaining?: number;
  resetAt?: Date;
}

/**
 * Check if user has exceeded AI generation rate limits
 */
export async function checkAIGenerationRateLimit(
  userId: string
): Promise<RateLimitResult> {
  const now = Date.now();
  const today = new Date().toISOString().split("T")[0];

  // Get user's limit state from Redis
  const userLimitKey = `rate_limit:ai:${userId}`;
  const dailyLimitKey = `rate_limit:ai:daily:${userId}:${today}`;
  const cooldownKey = `rate_limit:ai:cooldown:${userId}`;

  // Check daily limit
  const dailyCountStr = await redis.get(dailyLimitKey);
  const dailyCount = dailyCountStr ? parseInt(dailyCountStr, 10) : 0;

  if (dailyCount >= RATE_LIMITS.AI_GENERATION.PER_DAY) {
    logger.warn("Daily AI generation limit exceeded", { userId });
    return {
      allowed: false,
      reason: "Daily generation limit exceeded",
      remaining: 0,
      resetAt: new Date(Date.parse(today) + 24 * 60 * 60 * 1000),
    };
  }

  // Check cooldown
  const lastCooldown = await redis.get(cooldownKey);
  if (lastCooldown) {
    const remainingMs = RATE_LIMITS.AI_GENERATION.COOLDOWN_MS - (now - parseInt(lastCooldown, 10));
    if (remainingMs > 0) {
      logger.warn("AI generation cooldown active", { userId, remainingMs });
      return {
        allowed: false,
        reason: `Please wait ${Math.ceil(remainingMs / 1000)} seconds`,
        remaining: 0,
        resetAt: new Date(now + remainingMs),
      };
    }
  }

  // Check session limit
  const sessionCountStr = await redis.get(userLimitKey);
  const sessionCount = sessionCountStr ? parseInt(sessionCountStr, 10) : 0;
  const sessionExpireStr = await redis.get(`${userLimitKey}:expire`);
  const sessionExpireTime = sessionExpireStr ? parseInt(sessionExpireStr, 10) : now;

  if (sessionExpireTime < now) {
    // Session expired, reset
    await redis.del(userLimitKey);
    await redis.del(`${userLimitKey}:expire`);
  } else if (sessionCount >= RATE_LIMITS.AI_GENERATION.PER_SESSION) {
    const resetAt = new Date(sessionExpireTime);
    logger.warn("Session AI generation limit exceeded", { userId });
    return {
      allowed: false,
      reason: "Session generation limit exceeded",
      remaining: 0,
      resetAt,
    };
  }

  return {
    allowed: true,
    remaining: RATE_LIMITS.AI_GENERATION.PER_DAY - dailyCount - 1,
  };
}

/**
 * Record AI generation request
 */
export async function recordAIGeneration(userId: string): Promise<void> {
  const now = Date.now();
  const today = new Date().toISOString().split("T")[0];

  // Update daily counter (24-hour TTL)
  const dailyLimitKey = `rate_limit:ai:daily:${userId}:${today}`;
  await redis.incr(dailyLimitKey);
  await redis.expire(dailyLimitKey, 24 * 60 * 60);

  // Update session counter (1-hour TTL)
  const userLimitKey = `rate_limit:ai:${userId}`;
  await redis.incr(userLimitKey);
  await redis.expire(userLimitKey, 60 * 60);

  // Store expiration time
  const expireKey = `${userLimitKey}:expire`;
  await redis.set(expireKey, String(now + 60 * 60 * 1000));
  await redis.expire(expireKey, 60 * 60);

  // Set cooldown
  const cooldownKey = `rate_limit:ai:cooldown:${userId}`;
  await redis.set(cooldownKey, String(now));
  await redis.expire(cooldownKey, Math.ceil(RATE_LIMITS.AI_GENERATION.COOLDOWN_MS / 1000));

  logger.debug("AI generation recorded", { userId });
}

/**
 * Get rate limit status for user
 */
export async function getRateLimitStatus(userId: string): Promise<{
  aiGeneration: {
    dailyUsed: number;
    dailyLimit: number;
    sessionUsed: number;
    sessionLimit: number;
    cooldownActive: boolean;
  };
}> {
  const today = new Date().toISOString().split("T")[0];
  const dailyLimitKey = `rate_limit:ai:daily:${userId}:${today}`;
  const userLimitKey = `rate_limit:ai:${userId}`;
  const cooldownKey = `rate_limit:ai:cooldown:${userId}`;

  const dailyUsedStr = await redis.get(dailyLimitKey);
  const sessionUsedStr = await redis.get(userLimitKey);
  const cooldownActive = !!(await redis.get(cooldownKey));

  return {
    aiGeneration: {
      dailyUsed: dailyUsedStr ? parseInt(dailyUsedStr, 10) : 0,
      dailyLimit: RATE_LIMITS.AI_GENERATION.PER_DAY,
      sessionUsed: sessionUsedStr ? parseInt(sessionUsedStr, 10) : 0,
      sessionLimit: RATE_LIMITS.AI_GENERATION.PER_SESSION,
      cooldownActive,
    },
  };
}

/**
 * Reset rate limits for a user (admin function)
 */
export async function resetUserRateLimits(userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  const dailyLimitKey = `rate_limit:ai:daily:${userId}:${today}`;
  const userLimitKey = `rate_limit:ai:${userId}`;
  const cooldownKey = `rate_limit:ai:cooldown:${userId}`;
  const expireKey = `${userLimitKey}:expire`;

  await redis.del(dailyLimitKey);
  await redis.del(userLimitKey);
  await redis.del(cooldownKey);
  await redis.del(expireKey);

  logger.info("Rate limits reset for user", { userId });
}
