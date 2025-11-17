import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { users, sessions } from "@/models/schema";
import {
  type User,
  type SignupRequest,
  type LoginRequest,
  type UserProfile,
  sanitizeUser,
  signupSchema,
  loginSchema,
} from "@/models/user";
import { eq } from "drizzle-orm";
import crypto from "crypto";

/**
 * Hashes a password using bcrypt-like algorithm
 * In production, use bcrypt library
 */
function hashPassword(password: string): string {
  // Placeholder - in production use: import bcrypt; bcrypt.hashSync(password, 10)
  // For now, using Node's built-in crypto
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}$${hash}`;
}

/**
 * Verifies a password against a hash using constant-time comparison
 * to prevent timing attacks
 */
function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split("$");
  if (!salt || !storedHash) return false;

  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  // Use timingSafeEqual to prevent timing attack vulnerabilities
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(storedHash)
    );
  } catch {
    // timingSafeEqual throws if buffers are different lengths
    return false;
  }
}

/**
 * Generates a secure session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Creates a new user account
 */
export async function signup(request: SignupRequest): Promise<UserProfile> {
  // Validate input
  const validatedRequest = signupSchema.parse(request);

  // Normalize email (lowercase and trim)
  const normalizedEmail = validatedRequest.email.toLowerCase().trim();

  // Check if email already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser) {
    logger.warn("Signup attempt with existing email", {
      email: normalizedEmail,
    });
    throw new Error("Email already registered");
  }

  // Create new user
  const userId = `user_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  const passwordHash = hashPassword(validatedRequest.password);

  const [newUser] = await db
    .insert(users)
    .values({
      id: userId,
      email: normalizedEmail,
      passwordHash,
      name: validatedRequest.name,
      emailVerifiedAt: new Date(), // Auto-verify for demo
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (!newUser) {
    throw new Error("Failed to create user");
  }

  logger.info("User signed up", { userId, email: newUser.email });

  return sanitizeUser(newUser);
}

/**
 * Authenticates a user and creates a session
 */
export async function login(
  request: LoginRequest
): Promise<{ user: UserProfile; sessionToken: string }> {
  // Validate input
  const validatedRequest = loginSchema.parse(request);

  // Normalize email (lowercase and trim)
  const normalizedEmail = validatedRequest.email.toLowerCase().trim();

  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    logger.warn("Login attempt with non-existent email", {
      email: normalizedEmail,
    });
    throw new Error("Invalid email or password");
  }

  // Verify password
  const passwordValid = verifyPassword(
    validatedRequest.password,
    user.passwordHash
  );

  if (!passwordValid) {
    logger.warn("Login attempt with invalid password", {
      userId: user.id,
      email: user.email,
    });
    throw new Error("Invalid email or password");
  }

  // Create session
  const sessionId = `session_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    token,
    expiresAt,
    createdAt: new Date(),
  });

  logger.info("User logged in", { userId: user.id, email: user.email });

  return {
    user: sanitizeUser(user),
    sessionToken: token,
  };
}

/**
 * Verifies a session token and returns the user
 */
export async function verifySession(token: string): Promise<User | null> {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    logger.warn("Expired session accessed", { sessionId: session.id });
    // Delete expired session
    await db.delete(sessions).where(eq(sessions.id, session.id));
    return null;
  }

  // Get user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user || null;
}

/**
 * Logs out a user by deleting their session
 */
export async function logout(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
  logger.debug("User logged out");
}

/**
 * Gets a user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user || null;
}

/**
 * Updates user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<{ name: string; email: string }>
): Promise<UserProfile> {
  // Normalize email if being updated
  const normalizedUpdates = {
    ...updates,
    ...(updates.email && { email: updates.email.toLowerCase().trim() }),
  };

  // Check if email is being changed and if it's already taken
  if (normalizedUpdates.email) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedUpdates.email))
      .limit(1);

    if (existingUser && existingUser.id !== userId) {
      throw new Error("Email already in use");
    }
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      ...normalizedUpdates,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updatedUser) {
    throw new Error("User not found");
  }

  logger.info("User profile updated", { userId });

  return sanitizeUser(updatedUser);
}
