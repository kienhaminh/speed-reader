import { NextRequest, NextResponse } from "next/server";
import { completeSession } from "@/services/sessionService";
import { completeSessionSchema } from "@/models/readingSession";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = completeSessionSchema.parse(body);

    // Complete session using service
    const session = await completeSession(validatedData);

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("Session not found")) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      if (error.message.includes("already completed")) {
        return NextResponse.json(
          { error: "Session already completed" },
          { status: 409 }
        );
      }

      console.error("Session completion error:", error);
      return NextResponse.json(
        { error: "Failed to complete session" },
        { status: 500 }
      );
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
