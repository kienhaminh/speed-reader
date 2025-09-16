import { NextRequest, NextResponse } from "next/server";
import { createContent } from "@/services/contentService";
import { createReadingContentSchema } from "@/models/readingContent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createReadingContentSchema.parse(body);

    // Extract user ID from headers or session (simplified for now)
    const userId = request.headers.get("x-user-id") || undefined;

    // Create content using service
    const content = await createContent(validatedData, userId);

    return NextResponse.json(content, { status: 201 });
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

      if (error.message.includes("must contain at least one word")) {
        return NextResponse.json(
          { error: "Content must contain at least one word" },
          { status: 400 }
        );
      }

      console.error("Content creation error:", error);
      return NextResponse.json(
        { error: "Failed to create content" },
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
