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
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    // Verify session and get user
    const user = await verifySession(sessionToken);

    if (!user) {
      // Session invalid or expired, clear cookie
      const response = NextResponse.json(
        { user: null },
        { status: 200 }
      );

      response.cookies.set("session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });

      return response;
    }

    logger.debug("Session verified", { ...context, userId: user.id });

    return NextResponse.json(
      { user: sanitizeUser(user) },
      { status: 200 }
    );
  } catch (error) {
    logger.error(
      "Session verification error",
      context,
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { user: null },
      { status: 200 }
    );
  }
}
