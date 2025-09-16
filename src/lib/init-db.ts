import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

/**
 * Initialize database and run migrations
 */
export async function initializeDatabase(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  console.log("Initializing database connection...");

  // Create migration client
  const migrationClient = postgres(connectionString, { max: 1 });
  const migrationDb = drizzle(migrationClient);

  try {
    console.log("Running database migrations...");
    await migrate(migrationDb, { migrationsFolder: "./drizzle" });
    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Database migration failed:", error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL environment variable is missing");
    return false;
  }

  const testClient = postgres(connectionString, { max: 1 });

  try {
    await testClient`SELECT 1`;
    console.log("Database connection test successful");
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  } finally {
    await testClient.end();
  }
}
