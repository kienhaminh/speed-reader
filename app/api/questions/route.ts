import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/services/quizService";
import { generateQuestionsSchema } from "@/models/comprehensionQuestion";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = generateQuestionsSchema.parse(body);

    // Generate questions using service
    const questions = await generateQuestions(validatedData);

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
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

      if (error.message.includes("Content not found")) {
        return NextResponse.json(
          { error: "Content not found for session" },
          { status: 404 }
        );
      }

      if (error.message.includes("AI service")) {
        return NextResponse.json({ error: error.message }, { status: 503 });
      }

      console.error("Question generation error:", error);
      return NextResponse.json(
        { error: "Failed to generate questions" },
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
