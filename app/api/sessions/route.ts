import { NextRequest, NextResponse } from "next/server";
import { startSession } from "@/services/sessionService";
import { createSessionSchema } from "@/models/readingSession";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createSessionSchema.parse(body);

    // Create session using service
    const session = await startSession(validatedData);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("Content not found")) {
        return NextResponse.json(
          { error: "Content not found" },
          { status: 404 }
        );
      }

      if (error.message.includes("Chunk size")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      console.error("Session creation error:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
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
