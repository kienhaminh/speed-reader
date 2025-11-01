import { eq, and, isNotNull, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { readingSessions } from "@/models/schema";
import {
  type CreateSessionRequest,
  type CompleteSessionRequest,
  type ReadingSession,
  createSessionSchema,
  completeSessionSchema,
} from "@/models/readingSession";
import { getContentById } from "./contentService";

/**
 * Validates chunk size based on reading mode
 */
function validateChunkSize(mode: string, chunkSize?: number): void {
  if (mode === "chunk") {
    if (!chunkSize || chunkSize < 2 || chunkSize > 8) {
      throw new Error("Chunk size must be between 2 and 8 for chunk mode");
    }
  } else if (chunkSize !== undefined && chunkSize !== null) {
    throw new Error(`Chunk size should not be specified for ${mode} mode`);
  }
}

/**
 * Starts a new reading session
 */
export async function startSession(
  request: CreateSessionRequest
): Promise<ReadingSession> {
  // Validate input
  const validatedRequest = createSessionSchema.parse(request);

  // Validate chunk size for mode
  validateChunkSize(validatedRequest.mode, validatedRequest.chunkSize);

  // Verify content exists
  const content = await getContentById(validatedRequest.contentId);
  if (!content) {
    throw new Error("Content not found");
  }

  // Generate unique session ID
  const id = `session_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  // Create session record
  const newSession = {
    id,
    userId: validatedRequest.userId,
    contentId: validatedRequest.contentId,
    mode: validatedRequest.mode,
    paceWpm: validatedRequest.paceWpm,
    chunkSize: validatedRequest.chunkSize || null,
    startedAt: new Date(),
    endedAt: null,
    durationMs: 0,
    wordsRead: 0,
    computedWpm: 0,
  };

  // Insert into database
  const [insertedSession] = await db
    .insert(readingSessions)
    .values(newSession)
    .returning();

  if (!insertedSession) {
    throw new Error("Failed to create session");
  }

  return insertedSession;
}

/**
 * Computes WPM from words read and duration
 */
export function computeWpm(wordsRead: number, durationMs: number): number {
  if (durationMs <= 0) return 0;

  // WPM = (words read / duration in milliseconds) * 60000 (milliseconds per minute)
  const wpm = Math.round((wordsRead / durationMs) * 60000);

  // Ensure reasonable bounds
  return Math.max(0, Math.min(wpm, 3000)); // Cap at 3000 WPM (very fast readers)
}

/**
 * Completes a reading session and calculates metrics
 */
export async function completeSession(
  request: CompleteSessionRequest
): Promise<ReadingSession> {
  // Validate input
  const validatedRequest = completeSessionSchema.parse(request);

  // Get existing session
  const [existingSession] = await db
    .select()
    .from(readingSessions)
    .where(eq(readingSessions.id, validatedRequest.sessionId))
    .limit(1);

  if (!existingSession) {
    throw new Error("Session not found");
  }

  if (existingSession.endedAt) {
    throw new Error("Session already completed");
  }

  // Calculate computed WPM
  const computedWpm = computeWpm(
    validatedRequest.wordsRead,
    validatedRequest.durationMs
  );

  // Update session with completion data
  const [updatedSession] = await db
    .update(readingSessions)
    .set({
      endedAt: new Date(),
      durationMs: validatedRequest.durationMs,
      wordsRead: validatedRequest.wordsRead,
      computedWpm,
    })
    .where(eq(readingSessions.id, validatedRequest.sessionId))
    .returning();

  if (!updatedSession) {
    throw new Error("Failed to complete session");
  }

  return updatedSession;
}

/**
 * Gets session by ID
 */
export async function getSessionById(
  sessionId: string
): Promise<ReadingSession | null> {
  const [session] = await db
    .select()
    .from(readingSessions)
    .where(eq(readingSessions.id, sessionId))
    .limit(1);

  return session || null;
}

/**
 * Gets sessions for content
 */
export async function getSessionsByContent(
  contentId: string
): Promise<ReadingSession[]> {
  return await db
    .select()
    .from(readingSessions)
    .where(eq(readingSessions.contentId, contentId))
    .orderBy(readingSessions.startedAt);
}

/**
 * Gets recent sessions (optionally filtered by completion status)
 */
export async function getRecentSessions(
  limit: number = 10,
  completedOnly: boolean = false
): Promise<ReadingSession[]> {
  if (completedOnly) {
    return await db
      .select()
      .from(readingSessions)
      .where(isNotNull(readingSessions.endedAt))
      .orderBy(readingSessions.startedAt)
      .limit(limit);
  }

  return await db
    .select()
    .from(readingSessions)
    .orderBy(readingSessions.startedAt)
    .limit(limit);
}

/**
 * Validates reading session metrics
 */
export function validateSessionMetrics(
  wordsRead: number,
  durationMs: number,
  totalWords: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (wordsRead < 0) {
    errors.push("Words read cannot be negative");
  }

  if (durationMs <= 0) {
    errors.push("Duration must be positive");
  }

  if (wordsRead > totalWords) {
    errors.push(
      `Words read (${wordsRead}) cannot exceed total words (${totalWords})`
    );
  }

  const wpm = computeWpm(wordsRead, durationMs);
  if (wpm > 2000) {
    errors.push(`Computed WPM (${wpm}) seems unrealistically high`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Updates session pace during reading
 */
export async function updateSessionPace(
  sessionId: string,
  newPaceWpm: number
): Promise<ReadingSession> {
  if (newPaceWpm < 100 || newPaceWpm > 1200) {
    throw new Error("Pace must be between 100 and 1200 WPM");
  }

  const [updatedSession] = await db
    .update(readingSessions)
    .set({ paceWpm: newPaceWpm })
    .where(
      and(
        eq(readingSessions.id, sessionId),
        isNull(readingSessions.endedAt) // Only update active sessions
      )
    )
    .returning();

  if (!updatedSession) {
    throw new Error("Session not found or already completed");
  }

  return updatedSession;
}
