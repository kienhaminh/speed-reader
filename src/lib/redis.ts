import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * Redis client for distributed caching and rate limiting
 * Falls back to in-memory store if Redis is not available
 */

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, exSeconds?: number): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  del(key: string): Promise<void>;
  connected: boolean;
}

class InMemoryRedis implements RedisClient {
  private store = new Map<string, { value: string; expireAt?: number }>();
  connected = true;

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;

    // Check if expired
    if (item.expireAt && item.expireAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, exSeconds?: number): Promise<void> {
    const expireAt = exSeconds ? Date.now() + exSeconds * 1000 : undefined;
    this.store.set(key, { value, expireAt });
  }

  async incr(key: string): Promise<number> {
    const item = this.store.get(key);
    if (!item) {
      this.store.set(key, { value: "1" });
      return 1;
    }

    const value = parseInt(item.value, 10) || 0;
    const newValue = value + 1;
    this.store.set(key, { value: String(newValue), expireAt: item.expireAt });
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const item = this.store.get(key);
    if (item) {
      this.store.set(key, {
        value: item.value,
        expireAt: Date.now() + seconds * 1000,
      });
    }
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

/**
 * Try to create a Redis client, fallback to in-memory
 */
function createRedisClient(): RedisClient {
  // For now, always use in-memory
  // In production, this would connect to actual Redis
  if (env.REDIS_URL) {
    logger.info("Redis URL configured, using in-memory fallback for now");
  }

  return new InMemoryRedis();
}

// Export Redis client instance - lazy initialization
let redisInstance: RedisClient | null = null;

function getRedis() {
  if (!redisInstance) {
    redisInstance = createRedisClient();
  }
  return redisInstance;
}

// Export redis as a proxy for lazy initialization
export const redis = new Proxy({} as RedisClient, {
  get(target, prop) {
    return getRedis()[prop as keyof RedisClient];
  },
});
