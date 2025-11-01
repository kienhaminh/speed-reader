# H4: User Authentication & Session Management - Implementation Plan

**Project**: Speed Reader
**Task**: H4 - User Authentication & Session Management
**Date**: 2025-10-31
**Priority**: HIGH
**Effort**: Complex (7-10 days)
**Status**: ⚠️ NEEDS CHANGES - See Code Review Report
**Dependencies**: H3 (Env Validation) ✅, H1 (Redis Foundation) ✅
**Review Date**: 2025-10-31
**Review Report**: `plans/reports/251031-from-code-reviewer-to-main-phase2-auth-review-report.md`

---

## 1. Technology Choice Analysis

### Why Better Auth (Recommended)

**Selected**: Better Auth v1.x

**Pros**:
- Full-featured auth framework designed for Next.js 15 + App Router
- Email/password + OAuth support (future-proof for social login)
- Built-in session management with multiple storage backends
- Type-safe API with TypeScript-first design
- Drizzle ORM native support (matches existing stack)
- No external dependencies for basic auth (self-hosted)
- Active development and good documentation
- Middleware support for Next.js
- Customizable auth flows

**Cons**:
- Newer than NextAuth (less battle-tested)
- Smaller community
- Need to manage auth infrastructure ourselves

**Comparison Matrix**:

| Feature | Better Auth | NextAuth.js | Clerk |
|---------|------------|-------------|-------|
| Next.js 15 Support | ✅ Native | ✅ Good | ✅ Good |
| Email/Password | ✅ Built-in | ⚠️ Custom adapter | ✅ Built-in |
| Drizzle ORM | ✅ Native | ⚠️ Custom adapter | ❌ N/A |
| OAuth | ✅ Built-in | ✅ Excellent | ✅ Excellent |
| Self-hosted | ✅ Free | ✅ Free | ❌ Managed only |
| Type Safety | ✅ Excellent | ⚠️ Good | ✅ Good |
| Session Management | ✅ Built-in | ✅ JWT/Database | ✅ Managed |
| Setup Complexity | 🟡 Medium | 🟡 Medium | 🟢 Low |
| Cost | 🟢 Free | 🟢 Free | 🔴 Paid ($25+/mo) |
| Control | 🟢 Full | 🟢 Full | 🔴 Limited |

**Decision Rationale**:
Better Auth provides best alignment with existing tech stack (Next.js 15, Drizzle, TypeScript), offers full control, and supports future OAuth needs without vendor lock-in.

**Integration Difficulty**: Medium
- Estimated setup: 2-3 days
- Requires database schema changes
- Needs middleware configuration
- Documentation is good but community smaller

---

## 2. Database Schema Changes

### 2.1 Enhanced User Table

**Current Schema** (`users` table):
```typescript
// Existing
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**New Schema**:
```typescript
export const users = pgTable("users", {
  // Existing fields
  id: text("id").primaryKey(), // Keep for backward compatibility
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // New auth fields
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  passwordHash: text("password_hash"), // null for OAuth-only users

  // Profile fields
  name: text("name"),
  avatar: text("avatar"),

  // Settings
  language: languageEnum("language").default("en").notNull(),
  preferredMode: modeEnum("preferred_mode").default("word"),

  // Metadata
  lastLoginAt: timestamp("last_login_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### 2.2 New Tables

**Sessions Table**:
```typescript
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // Session token
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Index for cleanup and queries
// CREATE INDEX idx_sessions_user_id ON sessions(user_id);
// CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

**Email Verification Table**:
```typescript
export const emailVerifications = pgTable("email_verifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Index for token lookup
// CREATE INDEX idx_email_verifications_token ON email_verifications(token);
```

**Password Reset Table**:
```typescript
export const passwordResets = pgTable("password_resets", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Index for token lookup
// CREATE INDEX idx_password_resets_token ON password_resets(token);
```

**OAuth Accounts Table** (for future OAuth support):
```typescript
export const oauthAccounts = pgTable("oauth_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // google, github, etc.
  providerAccountId: text("provider_account_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: one account per provider per user
  uniqueProviderAccount: unique("unique_provider_account")
    .on(table.userId, table.provider, table.providerAccountId),
}));
```

### 2.3 Relations Updates

```typescript
// Add to existing relations
export const usersRelations = relations(users, ({ many, one }) => ({
  // Existing
  readingContent: many(readingContent),
  studyLog: one(studyLogs, {
    fields: [users.id],
    references: [studyLogs.userId],
  }),

  // New auth relations
  sessions: many(sessions),
  oauthAccounts: many(oauthAccounts),
  emailVerifications: many(emailVerifications),
  passwordResets: many(passwordResets),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Similar for other new tables...
```

### 2.4 Backward Compatibility Strategy

**Issue**: Existing `users` table has minimal fields, `readingContent.createdByUserId` is nullable

**Solution**:
1. Add new fields to `users` with nullable/default values
2. Keep existing IDs valid
3. Migration path for anonymous users:
   - Anonymous users: `createdByUserId = null` stays null
   - Authenticated users: Link content to userId
4. No breaking changes to existing content

---

## 3. Better Auth Configuration

### 3.1 Installation Steps

```bash
# Install Better Auth
pnpm add better-auth

# Install password hashing library (Better Auth uses this)
pnpm add bcryptjs
pnpm add -D @types/bcryptjs

# Update environment variables
# (Already validated via H3)
```

### 3.2 Environment Variables Needed

**Update `src/lib/env.ts`**:
```typescript
const envSchema = z.object({
  // Existing
  DATABASE_URL: z.string().url(),
  GEMINI_API_KEY: z.string().min(1),
  REDIS_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default(3000).optional(),

  // New auth variables
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters'),

  AUTH_URL: z
    .string()
    .url('AUTH_URL must be a valid URL')
    .default('http://localhost:3000'),

  // Email configuration (optional for email verification)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
});
```

**Update `.env.example`**:
```bash
# ============================================================================
# REQUIRED: Authentication Configuration
# ============================================================================
# Generate a random secret: openssl rand -base64 32
AUTH_SECRET="your_32_character_secret_here"

# Authentication base URL (your app URL)
AUTH_URL="http://localhost:3000"

# ============================================================================
# OPTIONAL: Email Configuration (for verification emails)
# ============================================================================
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="your-email@gmail.com"
# SMTP_PASSWORD="your-app-password"
# SMTP_FROM="noreply@speedreader.com"
```

### 3.3 Better Auth Setup

**Create `src/lib/auth.ts`**:
```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { env } from "./env";
import * as schema from "@/models/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.oauthAccounts,
      verification: schema.emailVerifications,
    },
  }),

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // Email/Password configuration
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Start false, enable later
    minPasswordLength: 8,
    maxPasswordLength: 128,

    // Password strength requirements
    passwordStrength: {
      minLength: 8,
      requireNumbers: true,
      requireSpecialChars: false,
      requireUppercase: true,
      requireLowercase: true,
    },
  },

  // Account security
  account: {
    accountLinking: {
      enabled: true, // Allow linking OAuth to email accounts
      trustedProviders: ["google", "github"],
    },
  },

  // Rate limiting (integrate with existing rate limit service)
  rateLimit: {
    window: 60, // 1 minute
    max: 10, // 10 requests per minute per IP
  },

  // Advanced options
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    cookieSameSite: "lax",
    generateId: () => `usr_${crypto.randomUUID()}`, // Custom ID format
  },

  // Secret for JWT signing
  secret: env.AUTH_SECRET,
  baseURL: env.AUTH_URL,
});

// Export types for use in app
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
```

### 3.4 Auth Client Setup

**Create `src/lib/auth-client.ts`**:
```typescript
import { createAuthClient } from "better-auth/client";
import { env } from "./env";

export const authClient = createAuthClient({
  baseURL: env.AUTH_URL,
});

// Export hooks for React components
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
```

### 3.5 Drizzle Integration

Better Auth uses Drizzle adapter natively. Ensure schema tables match Better Auth expectations:

**Verification**:
```typescript
// Better Auth expects these column names
// users: id, email, emailVerified, name, createdAt, updatedAt
// sessions: id, userId, expiresAt, createdAt
// accounts: id, userId, provider, providerAccountId, ...
```

Our schema matches these requirements ✅

---

## 4. API Routes Planning

### 4.1 Auth API Routes

Better Auth provides built-in API routes via `/api/auth/*`. Configure in Next.js:

**Create `app/api/auth/[...all]/route.ts`**:
```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

This creates all necessary routes:
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login with email/password
- `POST /api/auth/signout` - Logout and clear session
- `GET /api/auth/session` - Get current session
- `POST /api/auth/verify-email` - Verify email token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- (Future) `GET /api/auth/callback/{provider}` - OAuth callbacks

### 4.2 Custom API Routes

**Create `app/api/auth/me/route.ts`**:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    logger.info("User profile fetched", { userId: session.user.id });

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
        avatar: session.user.avatar,
        createdAt: session.user.createdAt,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch user profile", {}, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate update payload
    const updateSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      language: z.enum(["en", "vi"]).optional(),
      preferredMode: z.enum(["word", "chunk", "paragraph"]).optional(),
    });

    const validated = updateSchema.parse(body);

    // Update user in database
    const updatedUser = await db
      .update(users)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning();

    logger.info("User profile updated", {
      userId: session.user.id,
      fields: Object.keys(validated),
    });

    return NextResponse.json({ user: updatedUser[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    logger.error("Failed to update user profile", {}, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Create `app/api/auth/rate-limit-status/route.ts`**:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRateLimitStatus } from "@/services/rateLimitService";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const status = await getRateLimitStatus(session.user.id);

    return NextResponse.json(status);
  } catch (error) {
    logger.error("Failed to fetch rate limit status", {}, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 4.3 Error Handling & Rate Limiting

**Standardized Error Responses**:
```typescript
// src/utils/api-errors.ts
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: new AuthError(
    "Invalid email or password",
    "INVALID_CREDENTIALS",
    401
  ),
  EMAIL_ALREADY_EXISTS: new AuthError(
    "Email already registered",
    "EMAIL_EXISTS",
    409
  ),
  WEAK_PASSWORD: new AuthError(
    "Password does not meet requirements",
    "WEAK_PASSWORD",
    400
  ),
  SESSION_EXPIRED: new AuthError(
    "Session expired, please login again",
    "SESSION_EXPIRED",
    401
  ),
  RATE_LIMIT_EXCEEDED: new AuthError(
    "Too many requests, please try again later",
    "RATE_LIMIT",
    429
  ),
};
```

**Rate Limiting on Auth Endpoints**:

Better Auth has built-in rate limiting, but integrate with existing rate limit service:

```typescript
// In auth.ts configuration
rateLimit: {
  window: 60, // 1 minute
  max: 10, // 10 auth requests per minute per IP

  // Custom limits per endpoint
  customLimits: {
    "/api/auth/signup": { window: 3600, max: 3 }, // 3 signups per hour
    "/api/auth/signin": { window: 60, max: 5 }, // 5 login attempts per minute
    "/api/auth/forgot-password": { window: 3600, max: 3 }, // 3 per hour
  },
},
```

---

## 5. Middleware & Protected Routes

### 5.1 Auth Middleware

**Create `src/middleware/auth.ts`**:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function authMiddleware(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Allow public routes
    const publicRoutes = [
      "/api/auth/",
      "/api/health",
    ];

    const isPublicRoute = publicRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Require authentication for protected routes
    if (!session?.user) {
      logger.warn("Unauthorized access attempt", {
        path: request.nextUrl.pathname,
        method: request.method,
      });

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Add user info to headers for downstream handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.user.id);
    requestHeaders.set("x-user-email", session.user.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    logger.error("Auth middleware error", {}, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 5.2 Middleware Configuration

**Create/Update `middleware.ts` at project root**:
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "@/middleware/auth";

export async function middleware(request: NextRequest) {
  // Apply auth middleware to API routes (except public ones)
  if (request.nextUrl.pathname.startsWith("/api")) {
    return authMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all API routes
    "/api/:path*",

    // Exclude public routes
    "!(api/auth/*)",
    "!(api/health)",

    // Apply to protected pages (future)
    // "/(dashboard|settings)/:path*",
  ],
};
```

### 5.3 User Context Injection

**Create `src/utils/get-user.ts`**:
```typescript
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    emailVerified: session.user.emailVerified,
  };
}

export async function requireUser(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
```

### 5.4 Session Validation

Sessions are validated automatically by Better Auth. Expired sessions return null.

**Session Lifecycle**:
1. User logs in → Session created (7-day expiry)
2. Each request → Session validated via cookie
3. Session updates every 24 hours (extends expiry)
4. After 7 days inactive → Session expires, re-login required
5. Logout → Session deleted immediately

---

## 6. Integration Points

### 6.1 Update Existing Rate Limiting

**Update `src/services/rateLimitService.ts`**:

Currently uses header `x-user-id`, update to use authenticated user:

```typescript
// Add new function for authenticated rate limiting
export async function checkAuthenticatedUserRateLimit(
  userId: string,
  operation: "ai_generation" | "api_general"
): Promise<RateLimitResult> {
  if (operation === "ai_generation") {
    return checkAIGenerationRateLimit(userId);
  }

  // For general API rate limiting
  const now = Date.now();
  const minuteKey = `rate_limit:api:minute:${userId}`;
  const hourKey = `rate_limit:api:hour:${userId}`;

  // Check minute limit
  const minuteCount = await redis.get(minuteKey);
  if (minuteCount && parseInt(minuteCount) >= RATE_LIMITS.API_GENERAL.PER_MINUTE) {
    return {
      allowed: false,
      reason: "API rate limit exceeded (per minute)",
      remaining: 0,
      resetAt: new Date(now + 60000),
    };
  }

  // Check hour limit
  const hourCount = await redis.get(hourKey);
  if (hourCount && parseInt(hourCount) >= RATE_LIMITS.API_GENERAL.PER_HOUR) {
    return {
      allowed: false,
      reason: "API rate limit exceeded (per hour)",
      remaining: 0,
      resetAt: new Date(now + 3600000),
    };
  }

  return { allowed: true };
}

export async function recordAPIRequest(userId: string): Promise<void> {
  const minuteKey = `rate_limit:api:minute:${userId}`;
  const hourKey = `rate_limit:api:hour:${userId}`;

  await redis.incr(minuteKey);
  await redis.expire(minuteKey, 60);

  await redis.incr(hourKey);
  await redis.expire(hourKey, 3600);

  logger.debug("API request recorded", { userId });
}
```

### 6.2 Update Analytics Service

**Update `src/services/analyticsService.ts`**:

Add userId parameter to all analytics functions:

```typescript
export async function getAnalyticsSummary(
  userId: string, // Now required, not optional
  startDate?: Date,
  endDate?: Date
): Promise<AnalyticsSummary> {
  logger.serviceOperation("analyticsService", "getAnalyticsSummary", {
    userId,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
  });

  // Filter queries by userId
  const sessions = await db.query.readingSessions.findMany({
    where: and(
      eq(readingSessions.userId, userId), // Add userId filter
      isNotNull(readingSessions.endedAt),
      startDate ? gte(readingSessions.endedAt, startDate) : undefined,
      endDate ? lte(readingSessions.endedAt, endDate) : undefined
    ),
    // ... rest of query
  });

  // ... rest of function
}
```

**Add userId to sessions table**:

Update schema:
```typescript
export const readingSessions = pgTable("reading_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id), // Add userId
  contentId: text("content_id").notNull(),
  mode: modeEnum("mode").notNull(),
  paceWpm: integer("pace_wpm").notNull(),
  chunkSize: integer("chunk_size"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  durationMs: integer("duration_ms").notNull(),
  wordsRead: integer("words_read").notNull(),
  computedWpm: integer("computed_wpm").notNull(),
});
```

### 6.3 Update Session Service

**Update `src/services/sessionService.ts`**:

```typescript
export async function startSession(
  userId: string, // Add userId parameter
  data: CreateReadingSessionInput
): Promise<ReadingSession> {
  logger.serviceOperation("sessionService", "startSession", {
    userId,
    contentId: data.contentId,
    mode: data.mode,
  });

  // Create session with userId
  const session = await db.insert(readingSessions).values({
    id: generateId("ses"),
    userId, // Link to user
    contentId: data.contentId,
    mode: data.mode,
    paceWpm: data.paceWpm,
    chunkSize: data.chunkSize,
    startedAt: new Date(),
    durationMs: 0,
    wordsRead: 0,
    computedWpm: 0,
  }).returning();

  return session[0];
}

export async function getUserActiveSessions(
  userId: string
): Promise<ReadingSession[]> {
  return db.query.readingSessions.findMany({
    where: and(
      eq(readingSessions.userId, userId),
      isNull(readingSessions.endedAt)
    ),
    orderBy: [desc(readingSessions.startedAt)],
  });
}
```

### 6.4 Update Content Service

**Update `src/services/contentService.ts`**:

```typescript
export async function createContent(
  userId: string, // Make required
  data: CreateReadingContentInput
): Promise<ReadingContent> {
  logger.serviceOperation("contentService", "createContent", {
    userId,
    language: data.language,
    source: data.source,
  });

  // Validate user owns content creation
  const content = await db.insert(readingContent).values({
    id: generateId("cnt"),
    createdByUserId: userId, // Link to authenticated user
    language: data.language,
    source: data.source,
    title: data.title,
    text: data.text,
    wordCount: countWords(data.text),
    createdAt: new Date(),
  }).returning();

  return content[0];
}

export async function getUserContent(
  userId: string,
  limit: number = 20
): Promise<ReadingContent[]> {
  return db.query.readingContent.findMany({
    where: eq(readingContent.createdByUserId, userId),
    orderBy: [desc(readingContent.createdAt)],
    limit,
  });
}
```

### 6.5 Update API Routes

**Pattern for all protected API routes**:

```typescript
// app/api/content/route.ts
import { getCurrentUser, requireUser } from "@/utils/get-user";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user (throws if not authenticated)
    const user = await requireUser(request);

    const body = await request.json();
    const validated = createReadingContentSchema.parse(body);

    // Pass userId to service
    const content = await createContent(user.id, validated);

    logger.apiRequest("POST", "/api/content", {
      userId: user.id,
      contentId: content.id,
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    logger.apiError("POST", "/api/content", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

Apply to all API routes:
- ✅ `app/api/content/route.ts`
- ✅ `app/api/content/generate/route.ts`
- ✅ `app/api/sessions/route.ts`
- ✅ `app/api/sessions/complete/route.ts`
- ✅ `app/api/questions/route.ts`
- ✅ `app/api/answers/route.ts`
- ✅ `app/api/analytics/summary/route.ts`

### 6.6 Update Request Context

**Update `src/lib/logger.ts`**:

```typescript
export function getRequestContext(request: Request): Record<string, any> {
  return {
    method: request.method,
    url: request.url,
    userId: request.headers.get("x-user-id") || undefined, // Set by auth middleware
    userEmail: request.headers.get("x-user-email") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
    timestamp: new Date().toISOString(),
  };
}
```

---

## 7. Database Migrations

### 7.1 Migration Plan

**Phase 1: Add new tables** (Non-breaking)
```sql
-- Migration: 001_add_auth_tables.sql

-- Add sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Add email verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_email_verifications_token ON email_verifications(token);

-- Add password resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_password_resets_token ON password_resets(token);

-- Add OAuth accounts table
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT unique_provider_account UNIQUE (user_id, provider, provider_account_id)
);

CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
```

**Phase 2: Enhance users table** (Non-breaking - all nullable)
```sql
-- Migration: 002_enhance_users_table.sql

-- Add auth fields (all nullable for backward compatibility)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Add settings
ALTER TABLE users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_mode TEXT DEFAULT 'word';

-- Add metadata
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add unique constraint on email (only for non-null values)
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
```

**Phase 3: Add userId to reading_sessions** (Breaking - requires data migration)
```sql
-- Migration: 003_add_user_to_sessions.sql

-- Add userId column (nullable initially)
ALTER TABLE reading_sessions ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id);

-- Create index
CREATE INDEX idx_reading_sessions_user_id ON reading_sessions(user_id);

-- IMPORTANT: In production, populate user_id from content.createdByUserId
-- UPDATE reading_sessions rs
-- SET user_id = (
--   SELECT rc.created_by_user_id
--   FROM reading_content rc
--   WHERE rc.id = rs.content_id
-- );

-- After data migration, make non-null (future migration)
-- ALTER TABLE reading_sessions ALTER COLUMN user_id SET NOT NULL;
```

### 7.2 Drizzle Migration Generation

```bash
# Generate migration from schema changes
pnpm drizzle:generate

# Review generated migration
cat drizzle/[timestamp]_auth_tables.sql

# Apply migration
pnpm drizzle:migrate
```

### 7.3 Data Integrity Checks

**Before Migration**:
```sql
-- Check existing users
SELECT COUNT(*) FROM users;

-- Check users without email
SELECT COUNT(*) FROM users WHERE id NOT LIKE 'usr_%';

-- Check orphaned sessions
SELECT COUNT(*) FROM reading_sessions rs
WHERE NOT EXISTS (
  SELECT 1 FROM reading_content rc
  WHERE rc.id = rs.content_id
);
```

**After Migration**:
```sql
-- Verify new tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('sessions', 'email_verifications', 'password_resets', 'oauth_accounts');

-- Verify indexes created
SELECT indexname FROM pg_indexes
WHERE tablename IN ('sessions', 'email_verifications', 'password_resets', 'oauth_accounts');

-- Check users table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';
```

### 7.4 Rollback Strategy

**Rollback Script** (if needed):
```sql
-- Rollback 003_add_user_to_sessions
DROP INDEX IF EXISTS idx_reading_sessions_user_id;
ALTER TABLE reading_sessions DROP COLUMN IF EXISTS user_id;

-- Rollback 002_enhance_users_table
DROP INDEX IF EXISTS idx_users_email;
ALTER TABLE users DROP COLUMN IF EXISTS last_login_at;
ALTER TABLE users DROP COLUMN IF EXISTS updated_at;
ALTER TABLE users DROP COLUMN IF EXISTS preferred_mode;
ALTER TABLE users DROP COLUMN IF EXISTS language;
ALTER TABLE users DROP COLUMN IF EXISTS avatar;
ALTER TABLE users DROP COLUMN IF EXISTS name;
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE users DROP COLUMN IF EXISTS email_verified;
ALTER TABLE users DROP COLUMN IF EXISTS email;

-- Rollback 001_add_auth_tables
DROP TABLE IF EXISTS oauth_accounts;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS email_verifications;
DROP TABLE IF EXISTS sessions;
```

---

## 8. Testing Strategy

### 8.1 Unit Tests for Auth Service

**Create `tests/unit/auth.test.ts`**:
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/models/schema";

describe("Auth Service", () => {
  describe("Sign Up", () => {
    it("should create user with valid email and password", async () => {
      const result = await auth.api.signUp({
        email: "test@example.com",
        password: "SecurePass123",
        name: "Test User",
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe("test@example.com");
      expect(result.session).toBeDefined();
    });

    it("should reject weak password", async () => {
      await expect(
        auth.api.signUp({
          email: "test@example.com",
          password: "weak",
        })
      ).rejects.toThrow("Password does not meet requirements");
    });

    it("should reject duplicate email", async () => {
      await auth.api.signUp({
        email: "duplicate@example.com",
        password: "SecurePass123",
      });

      await expect(
        auth.api.signUp({
          email: "duplicate@example.com",
          password: "AnotherPass123",
        })
      ).rejects.toThrow("Email already registered");
    });

    it("should reject invalid email format", async () => {
      await expect(
        auth.api.signUp({
          email: "invalid-email",
          password: "SecurePass123",
        })
      ).rejects.toThrow("Invalid email");
    });
  });

  describe("Sign In", () => {
    beforeEach(async () => {
      await auth.api.signUp({
        email: "signin@example.com",
        password: "SecurePass123",
      });
    });

    it("should sign in with correct credentials", async () => {
      const result = await auth.api.signIn({
        email: "signin@example.com",
        password: "SecurePass123",
      });

      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
    });

    it("should reject incorrect password", async () => {
      await expect(
        auth.api.signIn({
          email: "signin@example.com",
          password: "WrongPassword",
        })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should reject non-existent email", async () => {
      await expect(
        auth.api.signIn({
          email: "notfound@example.com",
          password: "SecurePass123",
        })
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("Session Management", () => {
    it("should create session on sign in", async () => {
      const result = await auth.api.signUp({
        email: "session@example.com",
        password: "SecurePass123",
      });

      const session = await auth.api.getSession({
        headers: new Headers({
          cookie: `session=${result.session.token}`,
        }),
      });

      expect(session).toBeDefined();
      expect(session.user.email).toBe("session@example.com");
    });

    it("should delete session on sign out", async () => {
      const signIn = await auth.api.signUp({
        email: "signout@example.com",
        password: "SecurePass123",
      });

      await auth.api.signOut({
        headers: new Headers({
          cookie: `session=${signIn.session.token}`,
        }),
      });

      const session = await auth.api.getSession({
        headers: new Headers({
          cookie: `session=${signIn.session.token}`,
        }),
      });

      expect(session).toBeNull();
    });

    it("should extend session on activity", async () => {
      const signIn = await auth.api.signUp({
        email: "extend@example.com",
        password: "SecurePass123",
      });

      const initialSession = await auth.api.getSession({
        headers: new Headers({
          cookie: `session=${signIn.session.token}`,
        }),
      });

      // Wait 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const extendedSession = await auth.api.getSession({
        headers: new Headers({
          cookie: `session=${signIn.session.token}`,
        }),
      });

      expect(extendedSession.expiresAt.getTime()).toBeGreaterThan(
        initialSession.expiresAt.getTime()
      );
    });
  });
});
```

### 8.2 Integration Tests for Auth Flows

**Create `tests/integration/auth-flows.test.ts`**:
```typescript
import { describe, it, expect } from "vitest";
import { testClient } from "./test-utils";

describe("Authentication Flows", () => {
  describe("Registration → Login → Access Protected Resource", () => {
    it("should complete full auth flow", async () => {
      // 1. Register
      const registerRes = await testClient.post("/api/auth/signup", {
        email: "flow@example.com",
        password: "SecurePass123",
        name: "Flow Test",
      });

      expect(registerRes.status).toBe(201);
      const { session } = await registerRes.json();
      expect(session).toBeDefined();

      // 2. Access protected resource
      const contentRes = await testClient.post("/api/content", {
        headers: {
          Cookie: `session=${session.token}`,
        },
        body: {
          language: "en",
          source: "paste",
          text: "Test content",
        },
      });

      expect(contentRes.status).toBe(201);

      // 3. Get user profile
      const profileRes = await testClient.get("/api/auth/me", {
        headers: {
          Cookie: `session=${session.token}`,
        },
      });

      expect(profileRes.status).toBe(200);
      const profile = await profileRes.json();
      expect(profile.user.email).toBe("flow@example.com");

      // 4. Logout
      const logoutRes = await testClient.post("/api/auth/signout", {
        headers: {
          Cookie: `session=${session.token}`,
        },
      });

      expect(logoutRes.status).toBe(200);

      // 5. Verify session invalidated
      const retryRes = await testClient.get("/api/auth/me", {
        headers: {
          Cookie: `session=${session.token}`,
        },
      });

      expect(retryRes.status).toBe(401);
    });
  });

  describe("Password Reset Flow", () => {
    it("should reset password successfully", async () => {
      // 1. Create account
      await testClient.post("/api/auth/signup", {
        email: "reset@example.com",
        password: "OldPass123",
      });

      // 2. Request password reset
      const resetReq = await testClient.post("/api/auth/forgot-password", {
        email: "reset@example.com",
      });

      expect(resetReq.status).toBe(200);

      // 3. Get reset token from database (in real test, from email)
      const token = await db.query.passwordResets.findFirst({
        where: eq(passwordResets.userId, user.id),
        orderBy: desc(passwordResets.createdAt),
      });

      // 4. Reset password
      const resetRes = await testClient.post("/api/auth/reset-password", {
        token: token.token,
        password: "NewPass123",
      });

      expect(resetRes.status).toBe(200);

      // 5. Login with new password
      const loginRes = await testClient.post("/api/auth/signin", {
        email: "reset@example.com",
        password: "NewPass123",
      });

      expect(loginRes.status).toBe(200);
    });
  });

  describe("Rate Limiting", () => {
    it("should enforce login rate limit", async () => {
      // Attempt 6 logins in quick succession
      const promises = Array.from({ length: 6 }, (_, i) =>
        testClient.post("/api/auth/signin", {
          email: "rate@example.com",
          password: "wrong",
        })
      );

      const results = await Promise.all(promises);
      const rateLimited = results.filter((r) => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});
```

### 8.3 E2E Tests for Auth Pages

**Create `tests/e2e/auth.spec.ts`**:
```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication Pages", () => {
  test("should register new user", async ({ page }) => {
    await page.goto("/signup");

    await page.fill('input[name="email"]', "e2e@example.com");
    await page.fill('input[name="password"]', "SecurePass123");
    await page.fill('input[name="name"]', "E2E Test User");
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");

    // Should show user name
    await expect(page.locator("text=E2E Test User")).toBeVisible();
  });

  test("should login existing user", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "existing@example.com");
    await page.fill('input[name="password"]', "SecurePass123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "WrongPass");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=Invalid email or password")
    ).toBeVisible();
  });

  test("should logout user", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', "logout@example.com");
    await page.fill('input[name="password"]', "SecurePass123");
    await page.click('button[type="submit"]');

    // Logout
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Logout');

    // Should redirect to login
    await expect(page).toHaveURL("/login");
  });

  test("should protect authenticated routes", async ({ page }) => {
    // Try to access protected route without auth
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL("/login");
  });
});
```

### 8.4 Protected Route Tests

**Create `tests/integration/protected-routes.test.ts`**:
```typescript
import { describe, it, expect } from "vitest";
import { testClient } from "./test-utils";

describe("Protected API Routes", () => {
  describe("Without Authentication", () => {
    it("should reject unauthenticated requests to /api/content", async () => {
      const res = await testClient.post("/api/content", {
        body: { language: "en", source: "paste", text: "Test" },
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe("Unauthorized");
    });

    it("should reject unauthenticated requests to /api/sessions", async () => {
      const res = await testClient.post("/api/sessions", {
        body: { contentId: "cnt_123", mode: "word", paceWpm: 300 },
      });

      expect(res.status).toBe(401);
    });

    it("should reject unauthenticated requests to /api/analytics/summary", async () => {
      const res = await testClient.get("/api/analytics/summary");

      expect(res.status).toBe(401);
    });
  });

  describe("With Authentication", () => {
    it("should allow authenticated requests", async () => {
      const { session } = await testClient.createAuthenticatedUser();

      const res = await testClient.post("/api/content", {
        headers: { Cookie: `session=${session.token}` },
        body: { language: "en", source: "paste", text: "Auth test" },
      });

      expect(res.status).toBe(201);
    });
  });

  describe("Public Routes", () => {
    it("should allow access to /api/health without auth", async () => {
      const res = await testClient.get("/api/health");
      expect(res.status).toBe(200);
    });

    it("should allow access to /api/auth/* without auth", async () => {
      const res = await testClient.post("/api/auth/signup", {
        email: "public@example.com",
        password: "SecurePass123",
      });

      expect(res.status).toBe(201);
    });
  });
});
```

---

## 9. Security Considerations

### 9.1 Password Hashing

Better Auth uses bcrypt by default with 10 rounds.

**Configuration**:
```typescript
// In auth.ts
emailAndPassword: {
  // Better Auth handles hashing internally
  // Uses bcrypt with salt rounds = 10
  // No manual password hashing needed
}
```

**Best Practices**:
- Never log passwords (already enforced by logger)
- Never return password hashes in API responses
- Use HTTPS in production (enforced by useSecureCookies)
- Enforce minimum password length (8 chars)
- Require password strength (uppercase, lowercase, numbers)

### 9.2 Session Security

**Cookie Configuration**:
```typescript
advanced: {
  useSecureCookies: env.NODE_ENV === "production", // HTTPS only in prod
  cookieSameSite: "lax", // CSRF protection
  cookieName: "session", // Custom session cookie name
  sessionExpiryCheck: true, // Validate expiry on each request
}
```

**Session Token Security**:
- Cryptographically secure random tokens
- HTTPOnly cookies (prevents XSS access)
- Secure flag in production (HTTPS only)
- SameSite=Lax (CSRF protection)
- 7-day expiry with automatic renewal

**Session Cleanup**:

Create cleanup cron job:
```typescript
// src/jobs/cleanup-sessions.ts
import { db } from "@/lib/db";
import { sessions } from "@/models/schema";
import { lt } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function cleanupExpiredSessions() {
  const result = await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, new Date()))
    .returning({ id: sessions.id });

  logger.info("Expired sessions cleaned", { count: result.length });
}

// Run daily via cron or scheduled job
```

### 9.3 CSRF Protection

Better Auth provides CSRF protection via:
- SameSite cookies (blocks cross-origin requests)
- Double-submit cookie pattern
- State parameter validation

**Additional Protection**:
```typescript
// Add CSRF token to forms (handled by Better Auth)
// Token automatically validated on POST requests
```

### 9.4 Rate Limiting on Auth Endpoints

**Implemented via Better Auth config**:
```typescript
rateLimit: {
  window: 60, // 1 minute
  max: 10, // 10 requests per minute per IP

  customLimits: {
    "/api/auth/signup": { window: 3600, max: 3 },
    "/api/auth/signin": { window: 60, max: 5 },
    "/api/auth/forgot-password": { window: 3600, max: 3 },
  },
}
```

**Additional IP-based rate limiting**:

Integrate with existing rate limit service:
```typescript
// In auth middleware
import { checkIPRateLimit } from "@/services/rateLimitService";

const ipAddress = request.headers.get("x-forwarded-for") ||
                  request.headers.get("x-real-ip") ||
                  "unknown";

const rateLimitResult = await checkIPRateLimit(ipAddress, "auth");

if (!rateLimitResult.allowed) {
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429 }
  );
}
```

### 9.5 Input Validation

**All inputs validated via Zod**:

```typescript
// Example signup validation
const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number"),
  name: z.string().min(1).max(100).optional(),
});
```

**Sanitization**:
- Email: Lowercase and trim
- Name: Trim whitespace
- All user input escaped before database insertion (Drizzle handles this)

### 9.6 Brute Force Protection

**Login Attempt Tracking**:

```typescript
// Track failed login attempts per email
async function checkLoginAttempts(email: string): Promise<boolean> {
  const key = `login_attempts:${email}`;
  const attempts = await redis.get(key);

  if (attempts && parseInt(attempts) >= 5) {
    logger.warn("Login attempts exceeded", { email });
    return false; // Block login
  }

  return true;
}

async function recordFailedLogin(email: string): Promise<void> {
  const key = `login_attempts:${email}`;
  await redis.incr(key);
  await redis.expire(key, 3600); // Reset after 1 hour
}

async function resetLoginAttempts(email: string): Promise<void> {
  const key = `login_attempts:${email}`;
  await redis.del(key);
}
```

Integrate into sign-in handler:
```typescript
// In auth.ts or custom handler
const allowed = await checkLoginAttempts(email);
if (!allowed) {
  throw new Error("Too many failed login attempts");
}

// After failed login
await recordFailedLogin(email);

// After successful login
await resetLoginAttempts(email);
```

---

## 10. Frontend Integration

### 10.1 Auth Context Provider

**Create `src/contexts/AuthContext.tsx`**:
```typescript
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authClient, User } from "@/lib/auth-client";
import { logger } from "@/lib/logger";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const session = await authClient.getSession();
        setUser(session?.user || null);
      } catch (error) {
        logger.error("Failed to load user session", {}, error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authClient.signIn({ email, password });
    setUser(result.user);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const result = await authClient.signUp({ email, password, name });
    setUser(result.user);
  };

  const signOut = async () => {
    await authClient.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    const session = await authClient.getSession();
    setUser(session?.user || null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

### 10.2 Login Page Layout

**Create `app/(auth)/login/page.tsx`**:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>

        <div className="mt-2 text-center text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </div>
      </Card>
    </div>
  );
}
```

### 10.3 Signup Page Layout

**Create `app/(auth)/signup/page.tsx`**:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signUp(email, password, name);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create account");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-600 mt-1">
              At least 8 characters, with uppercase, lowercase, and number
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </div>
      </Card>
    </div>
  );
}
```

### 10.4 Protected Routes

**Create `src/components/ProtectedRoute.tsx`**:
```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

**Wrap protected pages**:
```typescript
// app/dashboard/page.tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Dashboard content...</div>
    </ProtectedRoute>
  );
}
```

### 10.5 Session Persistence

Session automatically persists via HTTPOnly cookies. No client-side storage needed.

**Session Refresh**:
```typescript
// Automatically handled by Better Auth
// Session extends on activity (every 24 hours)
```

**Check session in components**:
```typescript
import { useAuth } from "@/contexts/AuthContext";

export function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div>
      <span>{user.name || user.email}</span>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

---

## 11. Implementation Phases

### Phase 1: Database Schema + Migrations (Days 1-2)

**Tasks**:
- ✅ Update `src/models/schema.ts` with auth tables
- ✅ Generate Drizzle migration
- ✅ Test migration on local database
- ✅ Verify backward compatibility
- ✅ Create rollback script

**Deliverables**:
- Updated schema file
- Migration SQL files
- Rollback scripts
- Migration verification tests

**Validation**:
```bash
pnpm drizzle:generate
pnpm drizzle:migrate
# Verify tables created
psql $DATABASE_URL -c "\dt"
```

### Phase 2: Better Auth Setup + Basic Endpoints (Days 3-4)

**Tasks**:
- ✅ Install Better Auth + dependencies
- ✅ Configure `src/lib/auth.ts`
- ✅ Create auth client `src/lib/auth-client.ts`
- ✅ Set up API routes `app/api/auth/[...all]/route.ts`
- ✅ Update environment variables
- ✅ Test signup/signin/signout flows

**Deliverables**:
- Auth configuration
- API route handlers
- Updated .env.example
- Basic auth flow tests

**Validation**:
```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Test signin
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'
```

### Phase 3: Middleware + Protected Routes (Days 5-6)

**Tasks**:
- ✅ Create auth middleware
- ✅ Configure middleware.ts
- ✅ Create user helper utilities
- ✅ Update all API routes to require auth
- ✅ Add user context to request headers
- ✅ Test protected route access

**Deliverables**:
- Auth middleware
- Protected route config
- User helper utilities
- Protected route tests

**Validation**:
- Unauthenticated requests return 401
- Authenticated requests succeed
- User context available in routes

### Phase 4: Integration with Existing Services (Days 7-8)

**Tasks**:
- ✅ Update rate limiting service
- ✅ Update analytics service with userId
- ✅ Update session service with userId
- ✅ Update content service with userId
- ✅ Add userId to reading_sessions table
- ✅ Migrate existing data (if needed)

**Deliverables**:
- Updated service functions
- Data migration scripts
- Integration tests
- Service validation

**Validation**:
- All services use authenticated userId
- Existing functionality still works
- Data integrity maintained

### Phase 5: Testing + Documentation (Days 9-10)

**Tasks**:
- ✅ Write unit tests for auth service
- ✅ Write integration tests for auth flows
- ✅ Write E2E tests for login/signup
- ✅ Test protected routes
- ✅ Test rate limiting
- ✅ Update README with auth setup
- ✅ Document API changes
- ✅ Create migration guide

**Deliverables**:
- Comprehensive test suite (80%+ coverage)
- Updated documentation
- Migration guide
- Deployment checklist

**Validation**:
```bash
pnpm test # All tests pass
pnpm test:e2e # E2E tests pass
pnpm build # Build succeeds
```

---

## 12. Rollback Strategy

### How to Revert if Needed

**Scenario 1: Issues During Development**

Simply revert git commits:
```bash
git revert <commit-hash>
git push
```

**Scenario 2: Issues in Production**

1. **Database Rollback**:
```bash
# Run rollback SQL script
psql $DATABASE_URL -f rollback-auth-migration.sql
```

2. **Code Rollback**:
```bash
# Deploy previous version
git checkout <previous-tag>
pnpm build
# Deploy
```

3. **Environment Cleanup**:
```bash
# Remove auth env vars if needed
unset AUTH_SECRET
unset AUTH_URL
```

### Data Migration Reversibility

**Risk**: Adding userId to reading_sessions

**Mitigation**:
- Keep userId nullable initially
- Populate gradually
- Only make required after validation

**Rollback**:
```sql
-- Remove userId from reading_sessions
ALTER TABLE reading_sessions DROP COLUMN user_id;
```

### Breaking Changes

**Potential Breaking Changes**:
1. API routes now require authentication
2. Reading sessions require userId
3. Analytics filtered by userId

**Mitigation**:
- Feature flag for auth requirement
- Backward compatibility mode
- Gradual migration period

**Compatibility Mode** (optional):
```typescript
// Allow both authenticated and anonymous users
const userId = await getCurrentUser(request) ||
               request.headers.get("x-user-id") ||
               "anonymous";
```

### Backward Compatibility

**Support for Existing Anonymous Users**:

```typescript
// In services, handle both cases
export async function createContent(
  userIdOrNull: string | null,
  data: CreateReadingContentInput
) {
  // Works with both authenticated and anonymous
  const content = await db.insert(readingContent).values({
    createdByUserId: userIdOrNull, // Can be null
    // ... rest of fields
  });

  return content;
}
```

**Migration Path**:
1. Phase 1: Support both authenticated + anonymous (1-2 weeks)
2. Phase 2: Encourage registration via UI prompts
3. Phase 3: Migrate anonymous content to registered users
4. Phase 4: Require authentication (optional)

---

## Summary

### Key Deliverables

✅ Better Auth integration with Next.js 15 + Drizzle
✅ Email/password authentication
✅ Secure session management (7-day sessions)
✅ Protected API routes with middleware
✅ User profile management
✅ Rate limiting per authenticated user
✅ Integration with existing services (analytics, sessions, content)
✅ Comprehensive testing (unit, integration, E2E)
✅ Database migrations with rollback
✅ Frontend auth pages (login, signup)
✅ Security best practices (CSRF, rate limiting, password hashing)

### Estimated Timeline

- **Phase 1**: Database Schema (2 days)
- **Phase 2**: Better Auth Setup (2 days)
- **Phase 3**: Middleware + Routes (2 days)
- **Phase 4**: Service Integration (2 days)
- **Phase 5**: Testing + Docs (2 days)

**Total**: 10 days

### Success Criteria

✅ Users can register with email/password
✅ Users can login and maintain sessions across devices
✅ All API routes require authentication
✅ Rate limiting works per authenticated user
✅ Existing functionality preserved
✅ 80%+ test coverage
✅ Zero security vulnerabilities
✅ Production-ready deployment

### Unresolved Questions

1. **Email Verification**: Should we require email verification before allowing login? (Recommend: No initially, add later)

2. **OAuth Providers**: Which OAuth providers to support first? (Recommend: Google + GitHub)

3. **Session Duration**: Is 7 days appropriate or should it be longer/shorter? (Current: 7 days seems reasonable)

4. **Anonymous Content Migration**: How to handle existing anonymous content? (Recommend: Keep as-is, allow linking later)

5. **Multi-device Sessions**: Should we allow multiple active sessions per user? (Recommend: Yes, track in sessions table)

6. **Password Reset Email**: Do we have SMTP configured for password reset emails? (Check: Needs SMTP setup or use transactional email service)

7. **Rate Limit Tiers**: Should premium users have higher rate limits? (Future consideration)

---

**End of Implementation Plan**

*Ready for implementation. All dependencies met (H3 ✅, H1 ✅). Estimated completion: 10 days.*

---

## CODE REVIEW FINDINGS (2025-10-31)

### Implementation Status: ⚠️ NEEDS CHANGES

**Reviewed By**: code-reviewer agent
**Review Date**: 2025-10-31
**Review Report**: `plans/reports/251031-from-code-reviewer-to-main-phase2-auth-review-report.md`

### Implementation Approach
✅ **Custom Authentication** - Opted for custom implementation instead of Better Auth
- Simpler dependencies
- Full control over auth flow
- Achieves same security goals
- Uses PBKDF2 for password hashing (needs upgrade to bcrypt)

### Critical Issues to Fix Before Commit

1. **Missing Foreign Key Constraints** - HIGH PRIORITY
   - Sessions, email_verifications, password_resets tables lack FK constraints
   - Risk: Data integrity issues, orphaned records
   - Fix: Generate new migration with FK constraints
   - Effort: 30 mins

2. **Password Verification Timing Attack** - SECURITY
   - Current implementation doesn't use constant-time comparison
   - Risk: Timing attacks possible
   - Fix: Use bcrypt or crypto.timingSafeEqual
   - Effort: 1-2 hours

3. **Session Token Exposure** - SECURITY
   - Token returned in response body AND cookie
   - Risk: Minor security concern
   - Fix: Remove from response body
   - Effort: 2 mins

4. **Missing Email Normalization** - DATA INTEGRITY
   - Emails not normalized before storage
   - Risk: Duplicate accounts (Test@example.com vs test@example.com)
   - Fix: Add toLowerCase().trim()
   - Effort: 30 mins

### Additional Improvements Needed

5. **Missing Database Indexes** - PERFORMANCE
   - Sessions, email verifications, password resets need indexes
   - Effort: 1 hour

6. **No Login Rate Limiting** - SECURITY
   - Code imported but not implemented
   - Effort: 2 hours

7. **No Tests** - QUALITY
   - Unit, integration, security tests missing
   - Effort: 1-2 days

### Positive Findings ✅

- Excellent type safety with TypeScript + Zod
- Structured logging throughout
- HTTPOnly, Secure, SameSite cookies properly configured
- Generic error messages (no user enumeration)
- Follows all codebase patterns
- Clean code organization
- Build passing with no errors

### Implementation Progress

**Phase 1 (Database Schema)**: 90% ✅
- [x] Schema changes
- [x] Migration generated
- [x] userId added to readingSessions
- [ ] ⚠️ Foreign key constraints missing
- [ ] ⚠️ Database indexes missing

**Phase 2 (Auth Service)**: 100% ✅
- [x] Password hashing (needs upgrade)
- [x] Signup, login, logout functions
- [x] Session verification
- [x] User profile management

**Phase 3 (API Routes)**: 95% ✅
- [x] All 5 auth endpoints implemented
- [ ] ⚠️ Rate limiting not activated

**Phase 4 (Integration)**: 80% ✅
- [x] ReadingSession userId
- [x] Reader component updated
- [ ] ⏭️ Other services (deferred to future)

**Phase 5 (Testing)**: 10% ❌
- [ ] Unit tests
- [ ] Integration tests
- [ ] Security tests
- [x] Build verification

**Overall Progress**: 85% complete for Phase 2 MVP

### Next Steps

**Before Commit** (4-6 hours):
1. Add foreign key constraints
2. Fix password verification (bcrypt or constant-time)
3. Remove session token from response body
4. Add email normalization

**Before Production** (1-2 days):
1. Add database indexes
2. Implement login rate limiting
3. Write comprehensive test suite
4. Add email verification flag

### Verdict

**Status**: ⚠️ NEEDS CHANGES
**Security Score**: 8/10 (Good with minor fixes)
**Code Quality**: 7.5/10 (Good)
**Recommendation**: Fix 4 critical issues, then merge

**Timeline**: 4-6 hours to fix critical issues + 1-2 days for full test coverage

---

*Plan updated with code review findings on 2025-10-31*
