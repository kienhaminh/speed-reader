import { test, expect } from "vitest";

const BASE_URL = "http://localhost:3000/api";

test("GET /analytics/summary - returns analytics summary", async () => {
  const response = await fetch(`${BASE_URL}/analytics/summary`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data).toMatchObject({
    totalTimeMs: expect.any(Number),
    averageWpmByMode: expect.any(Object),
    averageScorePercent: expect.any(Number),
    sessionsCount: expect.any(Number),
  });

  expect(data.totalTimeMs).toBeGreaterThanOrEqual(0);
  expect(data.averageScorePercent).toBeGreaterThanOrEqual(0);
  expect(data.averageScorePercent).toBeLessThanOrEqual(100);
  expect(data.sessionsCount).toBeGreaterThanOrEqual(0);

  // Validate averageWpmByMode structure
  expect(typeof data.averageWpmByMode).toBe("object");
  Object.values(data.averageWpmByMode).forEach((wpm: any) => {
    expect(typeof wpm).toBe("number");
    expect(wpm).toBeGreaterThanOrEqual(0);
  });
});

test("GET /analytics/summary - returns zero values for new user", async () => {
  // This test assumes a fresh user/device with no data
  const response = await fetch(`${BASE_URL}/analytics/summary`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Device-ID": "new-test-device-id", // Simulate new device
    },
  });

  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data.totalTimeMs).toBe(0);
  expect(data.averageScorePercent).toBe(0);
  expect(data.sessionsCount).toBe(0);
  expect(Object.keys(data.averageWpmByMode)).toHaveLength(0);
});

// Helper to create a complete session flow for testing analytics
async function createCompleteSession() {
  // Create content
  const contentResponse = await fetch(`${BASE_URL}/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: "en",
      source: "paste",
      text: "Analytics test content with sufficient length for meaningful reading metrics and comprehension testing.",
    }),
  });
  const content = await contentResponse.json();

  // Create session
  const sessionResponse = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentId: content.id,
      mode: "word",
      paceWpm: 300,
    }),
  });
  const session = await sessionResponse.json();

  // Complete session
  await fetch(`${BASE_URL}/sessions/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: session.id,
      wordsRead: 15,
      durationMs: 3000,
    }),
  });

  // Generate and answer questions
  const questionsResponse = await fetch(`${BASE_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: session.id,
    }),
  });
  const questions = await questionsResponse.json();

  await fetch(`${BASE_URL}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: session.id,
      answers: [0, 1, 2, 3, 0], // Some answers
    }),
  });

  return { content, session, questions };
}

test("GET /analytics/summary - reflects completed session data", async () => {
  await createCompleteSession();

  const response = await fetch(`${BASE_URL}/analytics/summary`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data.totalTimeMs).toBeGreaterThan(0);
  expect(data.sessionsCount).toBeGreaterThan(0);
  expect(data.averageWpmByMode.word).toBeGreaterThan(0);
  expect(data.averageScorePercent).toBeGreaterThanOrEqual(0);
  expect(data.averageScorePercent).toBeLessThanOrEqual(100);
});
