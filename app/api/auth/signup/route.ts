import { NextRequest, NextResponse } from "next/server";
import { signup } from "@/services/authService";
import { signupSchema } from "@/models/user";
import { logger, getRequestContext } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const context = getRequestContext(request);

  try {
    const body = await request.json();

    // Validate request body
    const validatedData = signupSchema.parse(body);

    // Sign up user
    const user = await signup(validatedData);

    logger.info("User signup successful", { ...context, userId: user.id });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Email already registered")) {
        logger.warn("Signup failed: email already registered", context);
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }

      if (
        error.message.includes("validation") ||
        error.message.includes("parse")
      ) {
        logger.warn("Signup validation failed", { ...context, error: error.message });
        return NextResponse.json(
          { error: "Invalid request data", details: error.message },
          { status: 400 }
        );
      }

      logger.error("Signup error", context, error);
      return NextResponse.json(
        { error: error.message || "Failed to sign up" },
        { status: 500 }
      );
    }

    logger.error(
      "Unexpected error in signup",
      context,
      new Error(String(error))
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
