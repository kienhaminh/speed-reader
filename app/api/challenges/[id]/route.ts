import { NextRequest, NextResponse } from "next/server";
import { getChallengeById, recordChallengeAttempt } from "@/services/challengeService";
import { logger } from "@/lib/logger";
import { z } from "zod";

const attemptSchema = z.object({
  sessionId: z.string().nullable().optional(),
  scorePercent: z.number().int().min(0).max(100),
  wpm: z.number().int().min(1),
});

// GET /api/challenges/[id] - Get challenge by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params;
    const userId = request.headers.get("x-user-id") || undefined;

    logger.apiRequest("GET", `/api/challenges/${challengeId}`, { userId });

    const challenge = await getChallengeById(challengeId, userId);

    if (!challenge) {
      return NextResponse.json(
        { success: false, error: "Challenge not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    logger.apiError("GET", "/api/challenges/[id]", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}

// POST /api/challenges/[id]/attempt - Record challenge attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params;
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    logger.apiRequest("POST", `/api/challenges/${challengeId}/attempt`, {
      userId,
      scorePercent: body.scorePercent,
    });

    // Validate request body
    const validatedData = attemptSchema.parse(body);

    const result = await recordChallengeAttempt(
      userId,
      challengeId,
      validatedData.sessionId || null,
      validatedData.scorePercent,
      validatedData.wpm
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.apiError("POST", "/api/challenges/[id]/attempt", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === "Challenge not found") {
        return NextResponse.json(
          { success: false, error: "Challenge not found" },
          { status: 404 }
        );
      }
      if (error.message === "Challenge is locked") {
        return NextResponse.json(
          { success: false, error: "Challenge is locked" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to record challenge attempt" },
      { status: 500 }
    );
  }
}
