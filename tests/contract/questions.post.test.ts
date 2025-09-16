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
      text: "The quick brown fox jumps over the lazy dog. This is a classic pangram used in typography and keyboard testing. It contains every letter of the English alphabet at least once, making it perfect for testing fonts and keyboard layouts.",
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

test("POST /questions - generates 5 comprehension questions for session", async () => {
  const { session } = await createSession();

  const request = {
    sessionId: session.id,
  };

  const response = await fetch(`${BASE_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data).toMatchObject({
    sessionId: session.id,
    questions: expect.any(Array),
  });

  expect(data.questions).toHaveLength(5);

  // Validate question structure
  data.questions.forEach((question: any, index: number) => {
    expect(question).toMatchObject({
      index: index + 1,
      prompt: expect.any(String),
      options: expect.any(Array),
      correctIndex: expect.any(Number),
    });

    expect(question.options).toHaveLength(4);
    expect(question.correctIndex).toBeGreaterThanOrEqual(0);
    expect(question.correctIndex).toBeLessThanOrEqual(3);
    expect(question.prompt.length).toBeGreaterThan(10);
  });
});

test("POST /questions - generates custom count of questions", async () => {
  const { session } = await createSession();

  const request = {
    sessionId: session.id,
    count: 3,
  };

  const response = await fetch(`${BASE_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data.questions).toHaveLength(3);
});

test("POST /questions - validates session exists", async () => {
  const request = {
    sessionId: "non-existent-session",
  };

  const response = await fetch(`${BASE_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(404);
});

test("POST /questions - validates required fields", async () => {
  const response = await fetch(`${BASE_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  expect(response.status).toBe(400);
});
