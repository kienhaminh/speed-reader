import { NextRequest, NextResponse } from "next/server";
import { getAllChallenges, createChallenge } from "@/services/challengeService";
import { logger } from "@/lib/logger";
import { z } from "zod";

const createChallengeSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(1000),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  requiredLevel: z.number().int().min(1).max(100),
  xpReward: z.number().int().min(1).max(1000),
  content: z.string().min(100),
  wordCount: z.number().int().min(50),
  estimatedTimeMinutes: z.number().int().min(1).max(60),
});

// GET /api/challenges - Get all challenges
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || undefined;

    logger.apiRequest("GET", "/api/challenges", { userId });

    const challenges = await getAllChallenges(userId);

    return NextResponse.json({
      success: true,
      data: challenges,
    });
  } catch (error) {
    logger.apiError("GET", "/api/challenges", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

// POST /api/challenges - Create new challenge (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    logger.apiRequest("POST", "/api/challenges", { title: body.title });

    // Validate request body
    const validatedData = createChallengeSchema.parse(body);

    // TODO: Add admin authentication check

    const challenge = await createChallenge(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: challenge,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.apiError("POST", "/api/challenges", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create challenge" },
      { status: 500 }
    );
  }
}
