import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

/**
 * Initialize database and run migrations
 */
export async function initializeDatabase(): Promise<void> {
  logger.info("Initializing database connection...");

  // Create migration client
  const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
  const migrationDb = drizzle(migrationClient);

  try {
    logger.info("Running database migrations...");
    await migrate(migrationDb, { migrationsFolder: "./drizzle" });
    logger.info("Database migrations completed successfully");
  } catch (error) {
    logger.error(
      "Database migration failed",
      {},
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  } finally {
    await migrationClient.end();
  }
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  const testClient = postgres(env.DATABASE_URL, { max: 1 });

  try {
    await testClient`SELECT 1`;
    logger.info("Database connection test successful");
    return true;
  } catch (error) {
    logger.error(
      "Database connection test failed",
      {},
      error instanceof Error ? error : new Error(String(error))
    );
    return false;
  } finally {
    await testClient.end();
  }
}
