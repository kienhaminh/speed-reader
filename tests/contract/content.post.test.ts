import { test, expect } from "vitest";

const BASE_URL = "http://localhost:3000/api";

test("POST /content - creates reading content from paste", async () => {
  const request = {
    language: "en",
    source: "paste",
    text: "This is a sample text for reading. It has multiple sentences to test word counting functionality.",
  };

  const response = await fetch(`${BASE_URL}/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(201);

  const data = await response.json();
  expect(data).toMatchObject({
    id: expect.any(String),
    language: "en",
    source: "paste",
    text: request.text,
    wordCount: expect.any(Number),
    title: null,
  });

  expect(data.wordCount).toBeGreaterThan(0);
});

test("POST /content - creates reading content from upload", async () => {
  const request = {
    language: "vi",
    source: "upload",
    text: "Đây là văn bản tiếng Việt để thử nghiệm. Nó có nhiều câu để kiểm tra chức năng đếm từ.",
    title: "Vietnamese Sample Text",
  };

  const response = await fetch(`${BASE_URL}/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(201);

  const data = await response.json();
  expect(data).toMatchObject({
    id: expect.any(String),
    language: "vi",
    source: "upload",
    text: request.text,
    title: "Vietnamese Sample Text",
    wordCount: expect.any(Number),
  });
});

test("POST /content - validates required fields", async () => {
  const response = await fetch(`${BASE_URL}/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  expect(response.status).toBe(400);
});

test("POST /content - validates language enum", async () => {
  const request = {
    language: "invalid",
    source: "paste",
    text: "Sample text",
  };

  const response = await fetch(`${BASE_URL}/content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  expect(response.status).toBe(400);
});
