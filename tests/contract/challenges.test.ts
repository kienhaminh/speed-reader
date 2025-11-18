import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { users, storyChallenges, challengeAttempts } from "@/models/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const API_BASE = "http://localhost:3000";

describe("GET /api/challenges", () => {
  let testUserId: string;
  let testChallengeId: string;

  beforeAll(async () => {
    // Create test user
    testUserId = nanoid();
    await db.insert(users).values({
      id: testUserId,
      email: `test-${testUserId}@example.com`,
      passwordHash: "hashed_password",
      name: "Test User",
      level: 5,
      totalXp: 1000,
    });

    // Create test challenge
    testChallengeId = nanoid();
    await db.insert(storyChallenges).values({
      id: testChallengeId,
      title: "Test Challenge",
      description: "A test challenge",
      difficulty: "intermediate",
      requiredLevel: 3,
      xpReward: 100,
      content: "This is test content for the challenge.",
      wordCount: 250,
      estimatedTimeMinutes: 5,
      isActive: 1,
    });
  });

  afterAll(async () => {
    await db.delete(storyChallenges).where(eq(storyChallenges.id, testChallengeId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should return all challenges without user context", async () => {
    const response = await fetch(`${API_BASE}/api/challenges`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  });

  it("should return challenges with lock status for authenticated user", async () => {
    const response = await fetch(`${API_BASE}/api/challenges`, {
      headers: {
        "x-user-id": testUserId,
      },
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);

    // Find our test challenge
    const testChallenge = data.data.find((c: any) => c.id === testChallengeId);
    expect(testChallenge).toBeDefined();
    expect(testChallenge.isLocked).toBe(false); // User is level 5, challenge requires level 3
    expect(testChallenge.userAttempts).toBeDefined();
    expect(testChallenge.completed).toBeDefined();
  });
});

describe("GET /api/challenges/[id]", () => {
  let testUserId: string;
  let testChallengeId: string;

  beforeAll(async () => {
    testUserId = nanoid();
    await db.insert(users).values({
      id: testUserId,
      email: `test-${testUserId}@example.com`,
      passwordHash: "hashed_password",
      name: "Test User",
      level: 3,
      totalXp: 500,
    });

    testChallengeId = nanoid();
    await db.insert(storyChallenges).values({
      id: testChallengeId,
      title: "Specific Test Challenge",
      description: "A specific test challenge",
      difficulty: "beginner",
      requiredLevel: 1,
      xpReward: 50,
      content: "Content for specific challenge test.",
      wordCount: 200,
      estimatedTimeMinutes: 3,
      isActive: 1,
    });
  });

  afterAll(async () => {
    await db.delete(storyChallenges).where(eq(storyChallenges.id, testChallengeId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should return challenge by ID", async () => {
    const response = await fetch(`${API_BASE}/api/challenges/${testChallengeId}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.id).toBe(testChallengeId);
    expect(data.data.title).toBe("Specific Test Challenge");
  });

  it("should return 404 for non-existent challenge", async () => {
    const response = await fetch(`${API_BASE}/api/challenges/non-existent-id`);

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Challenge not found");
  });
});

describe("POST /api/challenges/[id]/attempt", () => {
  let testUserId: string;
  let testChallengeId: string;
  let lockedChallengeId: string;

  beforeAll(async () => {
    testUserId = nanoid();
    await db.insert(users).values({
      id: testUserId,
      email: `test-${testUserId}@example.com`,
      passwordHash: "hashed_password",
      name: "Test User",
      level: 3,
      totalXp: 500,
    });

    // Create accessible challenge
    testChallengeId = nanoid();
    await db.insert(storyChallenges).values({
      id: testChallengeId,
      title: "Attempt Test Challenge",
      description: "Challenge for testing attempts",
      difficulty: "beginner",
      requiredLevel: 1,
      xpReward: 50,
      content: "Content for attempt test.",
      wordCount: 200,
      estimatedTimeMinutes: 3,
      isActive: 1,
    });

    // Create locked challenge
    lockedChallengeId = nanoid();
    await db.insert(storyChallenges).values({
      id: lockedChallengeId,
      title: "Locked Challenge",
      description: "Challenge that requires higher level",
      difficulty: "expert",
      requiredLevel: 10,
      xpReward: 200,
      content: "Locked content.",
      wordCount: 500,
      estimatedTimeMinutes: 10,
      isActive: 1,
    });
  });

  afterAll(async () => {
    await db.delete(challengeAttempts).where(eq(challengeAttempts.userId, testUserId));
    await db.delete(storyChallenges).where(eq(storyChallenges.id, testChallengeId));
    await db.delete(storyChallenges).where(eq(storyChallenges.id, lockedChallengeId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should record challenge attempt successfully", async () => {
    const response = await fetch(`${API_BASE}/api/challenges/${testChallengeId}/attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
      },
      body: JSON.stringify({
        scorePercent: 85,
        wpm: 350,
        sessionId: null,
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.attempt).toBeDefined();
    expect(data.data.attempt.scorePercent).toBe(85);
    expect(data.data.attempt.wpm).toBe(350);
    expect(data.data.xpAwarded).toBeGreaterThan(0);
    expect(data.data.levelUp).toBeDefined();
    expect(data.data.newLevel).toBeDefined();
  });

  it("should award bonus XP for perfect score", async () => {
    const response = await fetch(`${API_BASE}/api/challenges/${testChallengeId}/attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
      },
      body: JSON.stringify({
        scorePercent: 100,
        wpm: 400,
        sessionId: null,
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    // Perfect score should award 50% bonus: 50 * 1.5 = 75 XP
    expect(data.data.xpAwarded).toBe(75);
  });

  it("should return 401 without authentication", async () => {
    const response = await fetch(`${API_BASE}/api/challenges/${testChallengeId}/attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scorePercent: 85,
        wpm: 350,
      }),
    });

    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Authentication required");
  });

  it("should return 403 for locked challenge", async () => {
    const response = await fetch(`${API_BASE}/api/challenges/${lockedChallengeId}/attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
      },
      body: JSON.stringify({
        scorePercent: 85,
        wpm: 350,
      }),
    });

    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Challenge is locked");
  });

  it("should return 400 for invalid score", async () => {
    const response = await fetch(`${API_BASE}/api/challenges/${testChallengeId}/attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": testUserId,
      },
      body: JSON.stringify({
        scorePercent: 150, // Invalid: > 100
        wpm: 350,
      }),
    });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid request data");
  });
});

describe("GET /api/xp/transactions", () => {
  let testUserId: string;

  beforeAll(async () => {
    testUserId = nanoid();
    await db.insert(users).values({
      id: testUserId,
      email: `test-${testUserId}@example.com`,
      passwordHash: "hashed_password",
      name: "Test User",
      level: 2,
      totalXp: 300,
    });

    // Create multiple transactions
    await db.insert(xpTransactions).values([
      {
        id: nanoid(),
        userId: testUserId,
        amount: 15,
        eventType: "session",
        description: "Session 1",
        createdAt: new Date(Date.now() - 3000),
      },
      {
        id: nanoid(),
        userId: testUserId,
        amount: 25,
        eventType: "quiz",
        description: "Quiz 1",
        createdAt: new Date(Date.now() - 2000),
      },
      {
        id: nanoid(),
        userId: testUserId,
        amount: 5,
        eventType: "streak",
        description: "Streak 1",
        createdAt: new Date(Date.now() - 1000),
      },
    ]);
  });

  afterAll(async () => {
    await db.delete(xpTransactions).where(eq(xpTransactions.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should return user XP transactions", async () => {
    const response = await fetch(`${API_BASE}/api/xp/transactions`, {
      headers: {
        "x-user-id": testUserId,
      },
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBe(3);

    // Should be ordered by most recent first
    expect(data.data[0].description).toBe("Streak 1");
    expect(data.data[1].description).toBe("Quiz 1");
    expect(data.data[2].description).toBe("Session 1");
  });

  it("should respect limit parameter", async () => {
    const response = await fetch(`${API_BASE}/api/xp/transactions?limit=2`, {
      headers: {
        "x-user-id": testUserId,
      },
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.length).toBe(2);
  });

  it("should return 401 without authentication", async () => {
    const response = await fetch(`${API_BASE}/api/xp/transactions`);

    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe("Authentication required");
  });
});
