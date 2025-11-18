import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { users, xpTransactions } from "@/models/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const API_BASE = "http://localhost:3000";

describe("GET /api/user/profile", () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create test user
    testUserId = nanoid();
    await db.insert(users).values({
      id: testUserId,
      email: `test-${testUserId}@example.com`,
      passwordHash: "hashed_password",
      name: "Test User",
      level: 3,
      totalXp: 850,
      streakDays: 5,
      lastStreakDate: new Date(),
      preferences: {
        defaultMode: "word",
        defaultWPM: 300,
      },
    });

    // Create some XP transactions
    await db.insert(xpTransactions).values([
      {
        id: nanoid(),
        userId: testUserId,
        amount: 15,
        eventType: "session",
        description: "Reading session completed",
        createdAt: new Date(),
      },
      {
        id: nanoid(),
        userId: testUserId,
        amount: 25,
        eventType: "quiz",
        description: "Perfect quiz score",
        createdAt: new Date(),
      },
    ]);
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(xpTransactions).where(eq(xpTransactions.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should return user profile with XP stats", async () => {
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      headers: {
        "x-user-id": testUserId,
      },
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.user).toBeDefined();
    expect(data.data.user.id).toBe(testUserId);
    expect(data.data.user.level).toBe(3);
    expect(data.data.user.totalXp).toBe(850);
    expect(data.data.levelProgress).toBeDefined();
    expect(data.data.levelProgress.level).toBe(3);
    expect(data.data.recentTransactions).toBeDefined();
    expect(data.data.recentTransactions.length).toBeGreaterThan(0);
  });

  it("should return 404 for non-existent user", async () => {
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      headers: {
        "x-user-id": "non-existent-user-id",
      },
    });

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("User not found");
  });
});

describe("PATCH /api/user/profile", () => {
  let testUserId: string;

  beforeAll(async () => {
    testUserId = nanoid();
    await db.insert(users).values({
      id: testUserId,
      email: `test-${testUserId}@example.com`,
      passwordHash: "hashed_password",
      name: "Test User",
      level: 1,
      totalXp: 0,
    });
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should update user name", async () => {
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
      },
      body: JSON.stringify({
        name: "Updated Name",
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.name).toBe("Updated Name");
  });

  it("should update user preferences", async () => {
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
      },
      body: JSON.stringify({
        preferences: {
          defaultMode: "chunk",
          defaultWPM: 400,
          autoStart: true,
        },
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.preferences).toBeDefined();
    expect(data.data.preferences.defaultMode).toBe("chunk");
    expect(data.data.preferences.defaultWPM).toBe(400);
    expect(data.data.preferences.autoStart).toBe(true);
  });

  it("should return 400 when no updates provided", async () => {
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("No updates provided");
  });

  it("should return 404 for non-existent user", async () => {
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "non-existent-user-id",
      },
      body: JSON.stringify({
        name: "New Name",
      }),
    });

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("User not found");
  });
});
