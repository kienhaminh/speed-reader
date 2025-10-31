import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/services/authService";
import { logger, getRequestContext } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const context = getRequestContext(request);

  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "No active session" },
        { status: 400 }
      );
    }

    // Logout user
    await logout(sessionToken);

    logger.info("User logged out", context);

    // Clear session cookie
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return response;
  } catch (error) {
    logger.error(
      "Logout error",
      context,
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
