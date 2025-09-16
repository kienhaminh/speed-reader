import { test, expect } from "vitest";

const BASE_URL = "http://localhost:3000/api";

// Helper to create content first
async function createContent() {
  const response = await fetch(`${BASE_URL}/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: "en",
      source: "paste",
      text: "Sample text for session testing with enough words to read.",
    }),
  });
  const data = await response.json();
  return data.id;
}

test("POST /sessions - creates word mode session", async () => {
  const contentId = await createContent();

  const request = {
    contentId,
    mode: "word",
    paceWpm: 250,
  };

  const response = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(201);

  const data = await response.json();
  expect(data).toMatchObject({
    id: expect.any(String),
    contentId,
    mode: "word",
    paceWpm: 250,
    chunkSize: null,
    startedAt: expect.any(String),
    endedAt: null,
    durationMs: 0,
    wordsRead: 0,
    computedWpm: 0,
  });
});

test("POST /sessions - creates chunk mode session with chunk size", async () => {
  const contentId = await createContent();

  const request = {
    contentId,
    mode: "chunk",
    paceWpm: 300,
    chunkSize: 4,
  };

  const response = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(201);

  const data = await response.json();
  expect(data).toMatchObject({
    id: expect.any(String),
    contentId,
    mode: "chunk",
    paceWpm: 300,
    chunkSize: 4,
  });
});

test("POST /sessions - creates paragraph mode session", async () => {
  const contentId = await createContent();

  const request = {
    contentId,
    mode: "paragraph",
    paceWpm: 200,
  };

  const response = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(201);

  const data = await response.json();
  expect(data.mode).toBe("paragraph");
  expect(data.chunkSize).toBeNull();
});

test("POST /sessions - validates pace WPM range", async () => {
  const contentId = await createContent();

  const request = {
    contentId,
    mode: "word",
    paceWpm: 50, // Below minimum
  };

  const response = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(400);
});

test("POST /sessions - validates chunk size range for chunk mode", async () => {
  const contentId = await createContent();

  const request = {
    contentId,
    mode: "chunk",
    paceWpm: 250,
    chunkSize: 10, // Above maximum
  };

  const response = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(400);
});
