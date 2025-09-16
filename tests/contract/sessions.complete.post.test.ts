import { test, expect } from "vitest";

const BASE_URL = "http://localhost:3000/api";

// Helper to create content and session
async function createSession() {
  // Create content
  const contentResponse = await fetch(`${BASE_URL}/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: "en",
      source: "paste",
      text: "Sample text for session completion testing with enough words to calculate reading metrics.",
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
      paceWpm: 250,
    }),
  });
  const session = await sessionResponse.json();

  return { content, session };
}

test("POST /sessions/complete - completes session and computes metrics", async () => {
  const { session } = await createSession();

  const request = {
    sessionId: session.id,
    wordsRead: 12,
    durationMs: 3000, // 3 seconds
  };

  const response = await fetch(`${BASE_URL}/sessions/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data).toMatchObject({
    id: session.id,
    contentId: session.contentId,
    mode: "word",
    paceWpm: 250,
    startedAt: expect.any(String),
    endedAt: expect.any(String),
    durationMs: 3000,
    wordsRead: 12,
    computedWpm: expect.any(Number),
  });

  // Verify computed WPM calculation: (12 words / 3000ms) * 60000ms = 240 WPM
  expect(data.computedWpm).toBe(240);
});

test("POST /sessions/complete - handles different word counts and durations", async () => {
  const { session } = await createSession();

  const request = {
    sessionId: session.id,
    wordsRead: 50,
    durationMs: 12000, // 12 seconds
  };

  const response = await fetch(`${BASE_URL}/sessions/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data.wordsRead).toBe(50);
  expect(data.durationMs).toBe(12000);
  // (50 words / 12000ms) * 60000ms = 250 WPM
  expect(data.computedWpm).toBe(250);
});

test("POST /sessions/complete - validates required fields", async () => {
  const response = await fetch(`${BASE_URL}/sessions/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  expect(response.status).toBe(400);
});

test("POST /sessions/complete - validates session exists", async () => {
  const request = {
    sessionId: "non-existent-session",
    wordsRead: 10,
    durationMs: 1000,
  };

  const response = await fetch(`${BASE_URL}/sessions/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(404);
});
