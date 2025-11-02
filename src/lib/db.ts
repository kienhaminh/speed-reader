import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/models/schema";
import { env } from "@/lib/env";

// Disable prefetch as it's not supported for "Transaction" pool mode
let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getClient() {
  if (!client) {
    client = postgres(env.DATABASE_URL, { prepare: false });
  }
  return client;
}

function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getClient(), { schema });
  }
  return dbInstance;
}

// Export db as a proxy for lazy initialization
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

// Cleanup function for tests and graceful shutdown
export async function closeDbConnection() {
  if (client) {
    await client.end();
    client = null;
    dbInstance = null;
  }
}
