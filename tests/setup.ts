// Test setup file
import { beforeAll, afterAll } from "vitest";
import { setupMockServer, teardownMockServer } from "./helpers/test-routes";
import { config } from "dotenv";
import { closeDbConnection } from "@/lib/db";

// Load test environment variables
config({ path: ".env.test" });

beforeAll(async () => {
  // Setup mock server for contract tests
  setupMockServer();
});

afterAll(async () => {
  // Cleanup after tests
  teardownMockServer();

  // Close database connection to allow process to exit
  await closeDbConnection();
});
