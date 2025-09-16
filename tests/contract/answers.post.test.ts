import { test, expect } from "vitest";

const BASE_URL = "http://localhost:3000/api";

// Helper to create content, session, and questions
async function createSessionWithQuestions() {
  // Create content
  const contentResponse = await fetch(`${BASE_URL}/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: "en",
      source: "paste",
      text: "Climate change refers to long-term shifts in global temperatures and weather patterns. While climate variations are natural, human activities have been the main driver of climate change since the 1800s.",
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

  // Generate questions
  const questionsResponse = await fetch(`${BASE_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: session.id,
    }),
  });
  const questions = await questionsResponse.json();

  return { content, session, questions };
}

test("POST /answers - submits answers and calculates score", async () => {
  const { session } = await createSessionWithQuestions();

  const request = {
    sessionId: session.id,
    answers: [0, 1, 2, 3, 0], // 5 answers as required
  };

  const response = await fetch(`${BASE_URL}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data).toMatchObject({
    id: expect.any(String),
    sessionId: session.id,
    answers: [0, 1, 2, 3, 0],
    scorePercent: expect.any(Number),
    completedAt: expect.any(String),
  });

  expect(data.scorePercent).toBeGreaterThanOrEqual(0);
  expect(data.scorePercent).toBeLessThanOrEqual(100);
  expect(data.scorePercent % 20).toBe(0); // Should be multiple of 20 for 5 questions
});

test("POST /answers - handles perfect score", async () => {
  const { session, questions } = await createSessionWithQuestions();

  // Use correct answers for perfect score
  const correctAnswers = questions.questions.map((q: any) => q.correctIndex);

  const request = {
    sessionId: session.id,
    answers: correctAnswers,
  };

  const response = await fetch(`${BASE_URL}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data.scorePercent).toBe(100);
});

test("POST /answers - handles zero score", async () => {
  const { session, questions } = await createSessionWithQuestions();

  // Use incorrect answers for zero score
  const incorrectAnswers = questions.questions.map(
    (q: any) => (q.correctIndex + 1) % 4 // Always wrong answer
  );

  const request = {
    sessionId: session.id,
    answers: incorrectAnswers,
  };

  const response = await fetch(`${BASE_URL}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data.scorePercent).toBe(0);
});

test("POST /answers - validates answers array length", async () => {
  const { session } = await createSessionWithQuestions();

  const request = {
    sessionId: session.id,
    answers: [0, 1, 2], // Only 3 answers instead of 5
  };

  const response = await fetch(`${BASE_URL}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(400);
});

test("POST /answers - validates answer values range", async () => {
  const { session } = await createSessionWithQuestions();

  const request = {
    sessionId: session.id,
    answers: [0, 1, 2, 4, 0], // 4 is out of range (0-3)
  };

  const response = await fetch(`${BASE_URL}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(400);
});

test("POST /answers - validates session exists", async () => {
  const request = {
    sessionId: "non-existent-session",
    answers: [0, 1, 2, 3, 0],
  };

  const response = await fetch(`${BASE_URL}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(404);
});
