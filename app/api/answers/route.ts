import { NextRequest, NextResponse } from "next/server";
import { submitAnswers } from "@/services/quizService";
import { submitAnswersSchema } from "@/models/comprehensionResult";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = submitAnswersSchema.parse(body);

    // Submit answers using service
    const result = await submitAnswers(validatedData);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("No questions found")) {
        return NextResponse.json(
          { error: "No questions found for session" },
          { status: 404 }
        );
      }

      if (
        error.message.includes("Expected") &&
        error.message.includes("answers")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      console.error("Answer submission error:", error);
      return NextResponse.json(
        { error: "Failed to submit answers" },
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
