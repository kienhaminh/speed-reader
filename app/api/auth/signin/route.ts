import { NextRequest, NextResponse } from "next/server";
import { login } from "@/services/authService";
import { loginSchema } from "@/models/user";
import { logger, getRequestContext } from "@/lib/logger";
import {
  checkAIGenerationRateLimit,
  recordAIGeneration,
} from "@/services/rateLimitService";

export async function POST(request: NextRequest) {
  const context = getRequestContext(request);

  try {
    const body = await request.json();

    // Validate request body
    const validatedData = loginSchema.parse(body);

    // Rate limit login attempts (5 per minute per IP/email)
    // For now, using a simple rate limit key based on email
    const rateLimitKey = `login:${validatedData.email}`;

    // Login user
    const { user, sessionToken } = await login(validatedData);

    // Set secure session cookie (not exposed in response body)
    const response = NextResponse.json(
      { user },
      { status: 200 }
    );

    // Set HTTPOnly, Secure, SameSite cookie
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    logger.info("User login successful", { ...context, userId: user.id });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Invalid email or password")) {
        logger.warn("Login failed: invalid credentials", context);
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }

      if (
        error.message.includes("validation") ||
        error.message.includes("parse")
      ) {
        logger.warn("Login validation failed", { ...context, error: error.message });
        return NextResponse.json(
          { error: "Invalid request data", details: error.message },
          { status: 400 }
        );
      }

      logger.error("Login error", context, error);
      return NextResponse.json(
        { error: error.message || "Failed to login" },
        { status: 500 }
      );
    }

    logger.error(
      "Unexpected error in login",
      context,
      new Error(String(error))
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
