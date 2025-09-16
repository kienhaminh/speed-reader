import { test, expect } from "vitest";

const BASE_URL = "http://localhost:3000/api";

test("POST /content/generate - generates content via Gemini AI", async () => {
  const request = {
    language: "en",
    topic: "technology and innovation",
    targetWords: 300,
  };

  const response = await fetch(`${BASE_URL}/content/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data).toMatchObject({
    id: expect.any(String),
    language: "en",
    source: "ai",
    text: expect.any(String),
    wordCount: expect.any(Number),
    title: expect.any(String),
  });

  expect(data.text.length).toBeGreaterThan(100);
  expect(data.wordCount).toBeGreaterThan(200);
  expect(data.wordCount).toBeLessThan(400);
});

test("POST /content/generate - generates Vietnamese content", async () => {
  const request = {
    language: "vi",
    topic: "khoa học và công nghệ",
    targetWords: 200,
  };

  const response = await fetch(`${BASE_URL}/content/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(200);

  const data = await response.json();
  expect(data).toMatchObject({
    id: expect.any(String),
    language: "vi",
    source: "ai",
    text: expect.any(String),
    wordCount: expect.any(Number),
  });
});

test("POST /content/generate - validates target words range", async () => {
  const request = {
    language: "en",
    topic: "test topic",
    targetWords: 50, // Below minimum
  };

  const response = await fetch(`${BASE_URL}/content/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(400);
});

test("POST /content/generate - validates required fields", async () => {
  const response = await fetch(`${BASE_URL}/content/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  expect(response.status).toBe(400);
});
