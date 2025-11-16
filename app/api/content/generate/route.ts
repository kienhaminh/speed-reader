import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { generateContent } from "@/services/aiContentService";
import { generateContentSchema } from "@/models/readingContent";
import { logger, getRequestContext } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const context = getRequestContext(request);

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
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {

      if (error.message.includes("limit") || error.message.includes("quota")) {
        return NextResponse.json({ error: error.message }, { status: 429 });
      }

      if (error.message.includes("AI service")) {
        return NextResponse.json({ error: error.message }, { status: 503 });
      }

      logger.error("Content generation error", context, error);
      return NextResponse.json(
        { error: "Failed to generate content" },
        { status: 500 }
      );
    }

    logger.error(
      "Unexpected error in content generation",
      context,
      new Error(String(error))
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
