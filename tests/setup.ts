// Test setup file
import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL =
    "postgresql://test:test@localhost:5432/speedreader_test";
  process.env.GEMINI_API_KEY = "test-key";
});

afterAll(async () => {
  // Cleanup after tests
});
