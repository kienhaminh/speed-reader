import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/services/xpService";
import { db } from "@/lib/db";
import { users } from "@/models/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

// GET /api/user/profile - Get user profile with XP stats
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from auth session
    // For now, using mock user ID from header
    const userId = request.headers.get("x-user-id") || "test-user-id";

    logger.apiRequest("GET", "/api/user/profile", { userId });

    const profile = await getUserProfile(userId);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    logger.apiError("GET", "/api/user/profile", error);

    if (error instanceof Error && error.message === "User not found") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile - Update user profile and preferences
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "test-user-id";
    const body = await request.json();

    logger.apiRequest("PATCH", "/api/user/profile", { userId });

    const updates: Partial<typeof users.$inferInsert> = {};

    // Update basic profile fields
    if (body.name !== undefined) {
      updates.name = body.name;
    }
    if (body.email !== undefined) {
      updates.email = body.email;
    }

    // Update preferences (stored as JSON)
    if (body.preferences !== undefined) {
      // Get existing preferences
      const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
      if (!existingUser) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      // Merge new preferences with existing ones
      updates.preferences = {
        ...(existingUser.preferences || {}),
        ...body.preferences,
      };
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No updates provided" },
        { status: 400 }
      );
    }

    updates.updatedAt = new Date();

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    logger.info("User profile updated", { userId, updatedFields: Object.keys(updates).join(", ") });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    logger.apiError("PATCH", "/api/user/profile", error);

    return NextResponse.json(
      { success: false, error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
