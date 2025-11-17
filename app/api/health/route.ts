import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/models/schema";

export async function GET() {
  try {
    // Test database connection
    const startTime = Date.now();
    await db.select().from(users).limit(1);
    const dbResponseTime = Date.now() - startTime;

    // Check environment variables
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const hasDatabaseUrl = !!process.env.DATABASE_URL;

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: true,
        responseTime: `${dbResponseTime}ms`,
      },
      environment: {
        hasGeminiKey,
        hasDatabaseUrl,
        nodeEnv: process.env.NODE_ENV || "development",
      },
      version: "1.0.0",
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);

    const health = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: false,
        error:
          error instanceof Error ? error.message : "Unknown database error",
      },
      environment: {
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV || "development",
      },
      version: "1.0.0",
    };

    return NextResponse.json(health, { status: 503 });
  }
}
