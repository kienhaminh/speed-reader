import { vi } from "vitest";

// Import route handlers using relative paths
import * as sessionsRoute from "../../app/api/sessions/route";
import * as sessionsCompleteRoute from "../../app/api/sessions/complete/route";
import * as contentRoute from "../../app/api/content/route";
import * as contentGenerateRoute from "../../app/api/content/generate/route";
import * as answersRoute from "../../app/api/answers/route";
import * as questionsRoute from "../../app/api/questions/route";
import * as analyticsSummaryRoute from "../../app/api/analytics/summary/route";

// Store original fetch
const originalFetch = globalThis.fetch;

export function setupMockServer() {
  // Mock fetch globally
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? new URL(input) : new URL(input.toString());
    const method = (init?.method || "GET").toUpperCase();

    try {
      // Route handlers
      if (url.pathname === "/api/sessions" && method === "POST") {
        const request = new Request(input, init);
        // @ts-expect-error - Next.js types
        return sessionsRoute.POST(request);
      }

      if (url.pathname === "/api/sessions/complete" && method === "POST") {
        const request = new Request(input, init);
        // @ts-expect-error - Next.js types
        return sessionsCompleteRoute.POST(request);
      }

      if (url.pathname === "/api/content" && method === "POST") {
        const request = new Request(input, init);
        // @ts-expect-error - Next.js types
        return contentRoute.POST(request);
      }

      if (url.pathname === "/api/content/generate" && method === "POST") {
        const request = new Request(input, init);
        // @ts-expect-error - Next.js types
        return contentGenerateRoute.POST(request);
      }

      if (url.pathname === "/api/answers" && method === "POST") {
        const request = new Request(input, init);
        // @ts-expect-error - Next.js types
        return answersRoute.POST(request);
      }

      if (url.pathname === "/api/questions" && method === "POST") {
        const request = new Request(input, init);
        // @ts-expect-error - Next.js types
        return questionsRoute.POST(request);
      }

      if (url.pathname === "/api/analytics/summary" && method === "GET") {
        const request = new Request(input, init);
        // @ts-expect-error - Next.js types
        return analyticsSummaryRoute.GET(request);
      }

      // Return 404 for unmatched routes
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Mock server error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  });
}

export function teardownMockServer() {
  // Restore original fetch
  globalThis.fetch = originalFetch;
}
