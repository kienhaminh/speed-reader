import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/services/aiContentService";
import { generateContentSchema } from "@/models/readingContent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = generateContentSchema.parse(body);

    // Extract user ID from headers or session (simplified for now)
    const userId = request.headers.get("x-user-id") || "anonymous";

    // Generate content using AI service
    const content = await generateContent(validatedData, userId);

    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("validation") ||
        error.message.includes("parse")
      ) {
        return NextResponse.json(
          { error: "Invalid request data", details: error.message },
          { status: 400 }
        );
      }

      if (error.message.includes("limit") || error.message.includes("quota")) {
        return NextResponse.json({ error: error.message }, { status: 429 });
      }

      if (error.message.includes("AI service")) {
        return NextResponse.json({ error: error.message }, { status: 503 });
      }

      console.error("Content generation error:", error);
      return NextResponse.json(
        { error: "Failed to generate content" },
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
