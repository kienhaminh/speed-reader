import { vi } from "vitest";

/**
 * Mock fetch for contract tests
 * This allows contract tests to make HTTP requests to localhost:3000/api
 * which are then routed to the actual Next.js route handlers
 */

// Store original fetch
const originalFetch = globalThis.fetch;

// Mock routes mapping
const routes: Record<string, (url: URL, request: Request) => Promise<Response>> = {};

export function registerRoute(path: string, handler: (url: URL, request: Request) => Promise<Response>) {
  routes[path] = handler;
}

// Mock fetch implementation
globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  // If not a mock request, use original fetch
  if (typeof input === "string" && !input.startsWith("http://localhost:3000")) {
    return originalFetch(input, init);
  }

  if (typeof input === "string") {
    const url = new URL(input);
    const path = url.pathname;

    // Check if we have a registered handler for this path
    const handler = routes[path];
    if (handler) {
      const request = new Request(input, init);
      return handler(url, request);
    }

    // If no handler, return a default 404
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return originalFetch(input, init);
});

// Helper to make requests in tests
export async function mockRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `http://localhost:3000${path}`;
  return fetch(url, options);
}

// Helper to clear all registered routes
export function clearRoutes() {
  Object.keys(routes).forEach(key => delete routes[key]);
}
