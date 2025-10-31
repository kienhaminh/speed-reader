import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/services/authService";
import { logger, getRequestContext } from "@/lib/logger";
import { sanitizeUser } from "@/models/user";

export async function GET(request: NextRequest) {
  const context = getRequestContext(request);

  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get("session")?.value;

    if (!sessionToken) {
      logger.warn("Unauthorized /me request: no session", context);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify session and get user
    const user = await verifySession(sessionToken);

    if (!user) {
      logger.warn("Unauthorized /me request: invalid session", context);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    logger.debug("User profile retrieved", { ...context, userId: user.id });

    return NextResponse.json(
      { user: sanitizeUser(user) },
      { status: 200 }
    );
  } catch (error) {
    logger.error(
      "Profile retrieval error",
      context,
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
