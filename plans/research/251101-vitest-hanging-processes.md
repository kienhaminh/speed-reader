# Research Report: Vitest Processes Not Exiting After Tests Complete

**Research Date:** 2025-11-01
**Sources Consulted:** 20+ official docs, GitHub issues, technical blogs
**Date Range:** 2024-2025
**Project Context:** Next.js 15, Vitest, PostgreSQL (Drizzle ORM), Redis

---

## Executive Summary

Vitest processes hanging after test completion is a common issue caused by: unclosed database connections, active timers/intervals, event listeners, mock fetch implementations, and Vite plugin conflicts. The speed-reader project uses PostgreSQL with postgres-js driver via Drizzle ORM but lacks explicit connection cleanup in tests.

**Critical Findings:**
- postgres-js connections remain open after tests, preventing process exit
- No teardown logic for database client in current test setup
- Mock server implementation doesn't clean up timers/event listeners
- Missing `teardownTimeout` configuration may cause premature force-exit
- Pool configuration defaults may not be optimal for isolation

**Immediate Action Required:**
1. Add explicit database connection cleanup in test teardown
2. Configure `teardownTimeout` to allow proper cleanup
3. Consider `pool: 'forks'` for better isolation with database connections
4. Implement proper Redis cleanup if used in tests

---

## Research Methodology

### Sources Consulted
- Vitest official documentation (config, API, reporters)
- GitHub discussions and issues (vitest-dev/vitest)
- Integration testing patterns with PostgreSQL
- Drizzle ORM connection management
- Next.js API testing patterns
- Real-world examples (ivandotv/vitest-database-containers, rphlmr/drizzle-vitest-pg)

### Key Search Terms
- vitest hanging process cleanup
- database connection teardown
- pool threads forks isolation
- teardownTimeout configuration
- Next.js API routes testing

---

## Key Findings

### 1. Common Causes of Hanging Vitest Processes

#### Database Connections (PRIMARY ISSUE FOR THIS PROJECT)
**postgres-js driver behavior:**
- Creates persistent connections that don't auto-close
- Connection pool remains active until explicitly ended
- Drizzle ORM wraps postgres-js but doesn't manage lifecycle

**Current project issue:**
```typescript
// src/lib/db.ts - singleton pattern without cleanup
let client: ReturnType<typeof postgres> | null = null;
// Client created once, never closed
```

**Tests use API routes that access db:**
```typescript
// No cleanup between tests
// Connection pool accumulates handles
// Process can't exit cleanly
```

#### Timers and Intervals
**Patterns that prevent exit:**
- `setInterval()` without `clearInterval()`
- `setTimeout()` chains in service code
- Fake timers not restored: `vi.useFakeTimers()` without `vi.useRealTimers()`

**MSW + Fake Timers Conflict:**
```typescript
// Causes hangs when microtask queue mocked
vi.useFakeTimers() // MSW promises never resolve

// Solution:
vi.useFakeTimers({
  toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval']
  // Excludes queueMicrotask
})
```

#### Event Listeners and Event Emitters
- Unremoved listeners on EventEmitter instances
- WebSocket connections not closed
- Server instances (HTTP/HTTPS) still listening

#### Mock Implementations
**Current project risk:**
```typescript
// tests/helpers/test-routes.ts
globalThis.fetch = vi.fn(async (...) => { ... })
// Mocked globally, restored in teardown
// If teardown fails, mock persists
```

#### Vite Plugin Conflicts
**Known problematic plugins:**
- `vite:css` - file watchers not cleaned up
- `@nabla/vite-plugin-eslint` - prevents exit
- ESLint/TypeScript plugins in test mode

**File watchers:**
- `addWatchFile()` called after server closes
- Watcher set but never cleared
- Node.js process held open

#### Circular Imports
- Source files with circular dependencies
- `vi.mock()` with `importOriginal` on circular imports
- Prevents proper module cleanup

### 2. Current Project Analysis

**Test Structure:**
```
tests/
├── setup.ts           # Global beforeAll/afterAll
├── helpers/
│   ├── test-routes.ts # Mock fetch for API routes
│   └── mock-server.ts # Alternative mock implementation
├── contract/          # API contract tests (7 files)
├── unit/              # Service unit tests (3 files)
└── integration/       # Excluded from vitest (5 files)
```

**Vitest Configuration:**
```typescript
// vitest.config.ts
{
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // No pool configuration (defaults to 'forks')
    // No teardownTimeout specified (defaults to 10s)
    // No explicit cleanup hooks
  }
}
```

**Database Usage in Tests:**
- API routes import `db` from `@/lib/db`
- Routes execute queries via Drizzle ORM
- postgres-js client created on first query
- **No cleanup mechanism exists**

**Critical Missing Cleanup:**
```typescript
// tests/setup.ts - MISSING
afterAll(async () => {
  teardownMockServer();
  // ❌ No database connection cleanup
  // ❌ No Redis cleanup
  // ❌ No timer cleanup
});
```

### 3. Configuration Options

#### teardownTimeout
```typescript
{
  test: {
    teardownTimeout: 10000, // Default 10s
  }
}
```
- Time before `process.exit()` forced
- May need increase for database cleanup
- Recommend 15000-30000ms for integration tests

#### Pool Options

**pool: 'threads' (default before v1)**
```typescript
{
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false, // Parallel execution
        maxThreads: 4,
        minThreads: 1,
      }
    }
  }
}
```
- Uses `node:worker_threads`
- Faster but compatibility issues
- **Cannot mock process.nextTick**
- Segfaults with native modules (Prisma, bcrypt)

**pool: 'forks' (default v1+, recommended)**
```typescript
{
  test: {
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false, // Parallel execution
        maxForks: 4,
        minForks: 1,
      }
    }
  }
}
```
- Uses `node:child_process`
- Better compatibility
- Better for database connections
- Slightly slower than threads

**pool: 'vmThreads'**
```typescript
{
  test: {
    pool: 'vmThreads',
    // Cannot disable isolation
    // Use threads instead if need isolate: false
  }
}
```

#### Isolation Settings
```typescript
{
  test: {
    isolate: true, // Default - each file in separate environment
    // Disable for speed (requires careful cleanup)
    // isolate: false, // Shared environment
  }
}
```

**Trade-offs:**
- `isolate: true`: Slower, safer, each file independent
- `isolate: false`: Faster, requires perfect cleanup, state leaks possible

#### File Parallelism
```typescript
{
  test: {
    fileParallelism: true, // Default
    // false: Sequential execution, easier debugging
  }
}
```

#### Cleanup Flags
```typescript
{
  test: {
    clearMocks: true,      // vi.clearAllMocks() before each
    mockReset: false,       // vi.resetAllMocks() before each
    restoreMocks: false,    // vi.restoreAllMocks() before each
    unstubEnvs: true,      // Restore process.env
    unstubGlobals: true,   // Restore globalThis
  }
}
```

### 4. Debugging Tools

#### Hanging Process Reporter
```bash
# Identify what's preventing exit
npx vitest --reporter=hanging-process
```

**Configuration:**
```typescript
{
  test: {
    reporters: ['default', 'hanging-process'],
  }
}
```

**Output Example:**
```
Tests completed but process won't exit.
Hanging processes:
- Timer [setTimeout] at db.ts:12
- Socket [postgres] at 127.0.0.1:5432
- Handle [FILEHANDLE] at /tmp/vitest-123
```

**Warning:** Resource-intensive, use only for debugging

#### Force Exit Flag
```bash
# Exit immediately after tests (skip cleanup)
npx vitest --run

# Not recommended for production CI
# Masks underlying issues
```

#### Single Thread Debugging
```bash
# Isolate which test file causes hang
npx vitest --pool=forks --poolOptions.forks.singleFork=true
```

---

## Best Practices for Cleanup

### 1. Database Connections

#### Pattern A: Cleanup in Global Setup
```typescript
// tests/setup.ts
import { beforeAll, afterAll } from 'vitest';

let dbClient: any;

beforeAll(async () => {
  // Tests will use existing db instance
  const { getClient } = await import('@/lib/db');
  dbClient = getClient();
});

afterAll(async () => {
  if (dbClient) {
    await dbClient.end({ timeout: 5 }); // 5s graceful shutdown
  }
});
```

#### Pattern B: Per-File Cleanup
```typescript
// tests/contract/content.post.test.ts
import { afterAll } from 'vitest';
import { db } from '@/lib/db';

afterAll(async () => {
  // Access underlying postgres-js client
  await db.$client?.end({ timeout: 5 });
});
```

#### Pattern C: Singleton with Cleanup Export
```typescript
// src/lib/db.ts
export async function closeDatabase() {
  if (client) {
    await client.end({ timeout: 5 });
    client = null;
    dbInstance = null;
  }
}

// tests/setup.ts
import { closeDatabase } from '@/lib/db';

afterAll(async () => {
  await closeDatabase();
});
```

#### Drizzle + postgres-js Cleanup
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Get client from drizzle instance
const client = postgres(DATABASE_URL);
const db = drizzle(client);

// Cleanup
afterAll(async () => {
  await client.end({ timeout: 5 });
});
```

**postgres-js `.end()` options:**
```typescript
client.end({
  timeout: 5, // Seconds to wait for connections to close
});
```

### 2. Redis Connections

#### ioredis Cleanup
```typescript
import Redis from 'ioredis';

const redis = new Redis(REDIS_URL);

afterAll(async () => {
  await redis.quit(); // Graceful disconnect
  // or redis.disconnect() for immediate
});
```

#### redis (node-redis) Cleanup
```typescript
import { createClient } from 'redis';

const redis = await createClient({ url: REDIS_URL }).connect();

afterAll(async () => {
  await redis.quit();
});
```

### 3. Timers and Intervals

#### Fake Timers Cleanup
```typescript
import { beforeEach, afterEach, vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers(); // Clear pending timers
  vi.useRealTimers();  // Restore real timers
});
```

#### Manual Timer Tracking
```typescript
const timers: NodeJS.Timeout[] = [];

function safeSetTimeout(fn: () => void, ms: number) {
  const timer = setTimeout(fn, ms);
  timers.push(timer);
  return timer;
}

afterEach(() => {
  timers.forEach(clearTimeout);
  timers.length = 0;
});
```

### 4. Mock Cleanup

#### Global Mocks
```typescript
import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();  // Restore spies
  vi.clearAllMocks();    // Clear call history
  vi.unstubAllGlobals(); // Restore globalThis
  vi.unstubAllEnvs();    // Restore process.env
});
```

#### Module Mocks
```typescript
afterEach(() => {
  vi.resetModules(); // Clear module cache
});
```

### 5. Next.js API Routes

#### Pattern A: Direct Handler Invocation
```typescript
import { POST } from '@/app/api/content/route';

test('POST /content', async () => {
  const request = new Request('http://localhost:3000/api/content', {
    method: 'POST',
    body: JSON.stringify({ text: 'test' }),
  });

  const response = await POST(request);
  expect(response.status).toBe(201);
});

// No special cleanup needed if database cleaned up
```

#### Pattern B: Mock Fetch (Current Project)
```typescript
// tests/helpers/test-routes.ts
export function setupMockServer() {
  globalThis.fetch = vi.fn(async (input, init) => {
    // Route to handlers
  });
}

export function teardownMockServer() {
  globalThis.fetch = originalFetch; // Restore
}

// tests/setup.ts
beforeAll(() => setupMockServer());
afterAll(() => teardownMockServer());
```

**Current implementation is safe**, just needs database cleanup

### 6. Test Fixtures for Database

#### PGLite Pattern (In-Memory Postgres)
```typescript
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';

let client: PGlite;
let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  client = new PGlite();
  db = drizzle(client);
  await runMigrations(db);
});

afterAll(async () => {
  await client.close();
});

beforeEach(async () => {
  // Reset database between tests
  await db.delete(usersTable);
  await db.delete(sessionsTable);
});
```

**Advantages:**
- No Docker required
- Fast in-memory database
- Perfect isolation
- Auto-cleanup on close

#### Testcontainers Pattern
```typescript
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';

let container: PostgreSqlContainer;
let pool: Pool;

beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
  pool = new Pool({ connectionString: container.getConnectionUri() });
});

afterAll(async () => {
  await pool.end();
  await container.stop();
});
```

**Advantages:**
- Real PostgreSQL instance
- Tests exact production behavior
- Automatic container cleanup

**Disadvantages:**
- Requires Docker
- Slower startup (~2-5s per container)
- Resource-intensive

### 7. Hook Organization

#### File-Level Hooks
```typescript
// Runs once per test file
beforeAll(async () => {
  // Expensive setup: database, containers
});

afterAll(async () => {
  // Cleanup: close connections
});
```

#### Test-Level Hooks
```typescript
// Runs before/after each test
beforeEach(async () => {
  // Reset state, clear mocks
});

afterEach(async () => {
  // Cleanup mocks, restore globals
});
```

#### Suite-Level Hooks
```typescript
describe('User API', () => {
  let testDb: Database;

  beforeAll(async () => {
    testDb = await createTestDb();
  });

  afterAll(async () => {
    await testDb.close();
  });

  test('creates user', () => { /* ... */ });
});
```

#### Global Hooks (setup.ts)
```typescript
// Runs once before all test files
beforeAll(async () => {
  // Global setup: test server, global mocks
});

// Runs once after all test files
afterAll(async () => {
  // Global cleanup: close shared resources
});
```

**Execution order:**
```
Global beforeAll
  ↓
  File beforeAll
    ↓
    Suite beforeAll
      ↓
      Test beforeEach
        → Test
      Test afterEach
      ↓
    Suite afterAll
    ↓
  File afterAll
  ↓
Global afterAll
```

---

## Recommended Solutions for Speed-Reader Project

### Solution 1: Add Database Cleanup (CRITICAL)

**Modify `src/lib/db.ts`:**
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/models/schema";
import { env } from "@/lib/env";

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getClient() {
  if (!client) {
    client = postgres(env.DATABASE_URL, { prepare: false });
  }
  return client;
}

function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getClient(), { schema });
  }
  return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

// ADD THIS:
export async function closeDatabase() {
  if (client) {
    await client.end({ timeout: 5 });
    client = null;
    dbInstance = null;
  }
}

// ADD THIS (for tests):
export function getDbClient() {
  return client;
}
```

**Modify `tests/setup.ts`:**
```typescript
import { beforeAll, afterAll } from "vitest";
import { setupMockServer, teardownMockServer } from "./helpers/test-routes";
import { closeDatabase } from "@/lib/db";
import { config } from "dotenv";

config({ path: ".env.test" });

beforeAll(async () => {
  setupMockServer();
});

afterAll(async () => {
  teardownMockServer();

  // ADD THIS:
  await closeDatabase();
});
```

### Solution 2: Update Vitest Configuration

**Modify `vitest.config.ts`:**
```typescript
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["tests/integration/**"],

    // ADD THESE:
    pool: 'forks', // Better for database connections
    poolOptions: {
      forks: {
        singleFork: false, // Parallel execution
      }
    },
    teardownTimeout: 30000, // 30s for database cleanup

    // Automatic cleanup
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

### Solution 3: Add Redis Cleanup (If Used)

**If rate limiting uses Redis in tests:**
```typescript
// src/services/rateLimitService.ts
// Add cleanup export
export async function closeRateLimitService() {
  if (redisClient) {
    await redisClient.quit();
  }
}

// tests/setup.ts
import { closeRateLimitService } from "@/services/rateLimitService";

afterAll(async () => {
  teardownMockServer();
  await closeDatabase();
  await closeRateLimitService(); // ADD THIS
});
```

### Solution 4: Add Debugging Reporter (Temporary)

**For troubleshooting:**
```typescript
{
  test: {
    reporters: process.env.DEBUG_HANG
      ? ['default', 'hanging-process']
      : ['default'],
  }
}
```

```bash
# Run with hanging process reporter
DEBUG_HANG=1 pnpm test
```

### Solution 5: Per-Suite Cleanup Pattern

**For tests that need isolation:**
```typescript
// tests/contract/content.post.test.ts
import { test, expect, afterAll } from "vitest";
import { closeDatabase } from "@/lib/db";

const BASE_URL = "http://localhost:3000/api";

// Tests...

// Optional: cleanup after this specific suite
afterAll(async () => {
  // File-specific cleanup if needed
});
```

---

## Implementation Priority

### Phase 1: Critical (Do Immediately)
1. ✅ Add `closeDatabase()` export to `src/lib/db.ts`
2. ✅ Call `closeDatabase()` in `tests/setup.ts` afterAll
3. ✅ Add `teardownTimeout: 30000` to vitest.config.ts

**Expected result:** Tests should exit cleanly

### Phase 2: Recommended (Do Soon)
4. ✅ Set `pool: 'forks'` explicitly in config
5. ✅ Enable `clearMocks: true` and `restoreMocks: true`
6. ✅ Add Redis cleanup if used in tests

**Expected result:** More reliable test isolation

### Phase 3: Optional (Future Improvements)
7. Consider PGLite for faster test database
8. Add per-suite cleanup for complex tests
9. Implement test fixtures for common setup

---

## Verification Steps

### 1. Check Current Behavior
```bash
# Run tests and observe exit behavior
pnpm test

# If hangs, use Ctrl+C and note time to exit
```

### 2. Enable Debug Reporter
```bash
# Identify hanging resources
pnpm vitest --reporter=hanging-process
```

**Look for:**
- `[postgres]` connections to 127.0.0.1:5432
- `[Timer]` from setTimeout/setInterval
- `[FILEHANDLE]` from file operations

### 3. Apply Phase 1 Fixes
```bash
# Test with fixes
pnpm test

# Should exit within 2-3 seconds of test completion
```

### 4. Verify Clean Exit
```bash
# Test multiple times
for i in {1..5}; do
  echo "Run $i"
  pnpm test
  echo "Exit code: $?"
done

# All should exit with code 0 quickly
```

### 5. Check CI/CD
```bash
# In CI environment
pnpm test --run

# Should exit reliably without --forceExit hacks
```

---

## Common Patterns and Anti-Patterns

### ✅ Good Patterns

#### Always Close Connections
```typescript
afterAll(async () => {
  await db.close();
  await redis.quit();
});
```

#### Explicit Timeout for Cleanup
```typescript
afterAll(async () => {
  await client.end({ timeout: 5 }); // Graceful shutdown
}, 10000); // 10s timeout for hook itself
```

#### Return Cleanup from Setup
```typescript
beforeAll(async () => {
  const resource = await setupResource();
  return async () => {
    await resource.cleanup();
  };
});
```

#### Track Resources
```typescript
const resources: Closeable[] = [];

afterAll(async () => {
  await Promise.all(resources.map(r => r.close()));
});
```

### ❌ Anti-Patterns

#### Assuming Auto-Cleanup
```typescript
// ❌ BAD: Connection never closed
const db = postgres(DATABASE_URL);
// Tests finish but connection remains
```

#### Ignoring Async Cleanup
```typescript
// ❌ BAD: Not awaiting
afterAll(() => {
  db.close(); // Returns promise, not awaited
});

// ✅ GOOD:
afterAll(async () => {
  await db.close();
});
```

#### Shared Mutable State
```typescript
// ❌ BAD: Shared between tests
let testUser = { id: 1, name: 'Test' };

test('modifies user', () => {
  testUser.name = 'Modified'; // Affects other tests
});

// ✅ GOOD:
beforeEach(() => {
  testUser = { id: 1, name: 'Test' }; // Fresh copy
});
```

#### Relying on Process Exit
```typescript
// ❌ BAD: Masks cleanup issues
test: {
  // Hack: forces exit without cleanup
  testTimeout: 5000,
  hookTimeout: 1000, // Too short
}

// ✅ GOOD: Proper cleanup with adequate time
test: {
  teardownTimeout: 30000, // Allows cleanup
  hookTimeout: 10000,
}
```

---

## Code Examples

### Example 1: Complete Test Setup with Database

```typescript
// tests/setup.ts
import { beforeAll, afterAll, afterEach, vi } from "vitest";
import { config } from "dotenv";
import { closeDatabase } from "@/lib/db";

// Load test environment
config({ path: ".env.test" });

// Global setup
beforeAll(async () => {
  console.log('🚀 Test suite starting');
});

// Global teardown
afterAll(async () => {
  console.log('🧹 Cleaning up...');

  // Close database connections
  await closeDatabase();

  // Close Redis if used
  // await closeRedis();

  console.log('✅ Cleanup complete');
});

// Per-test cleanup
afterEach(() => {
  // Restore all mocks
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
```

### Example 2: Database Module with Cleanup

```typescript
// src/lib/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/models/schema";
import { env } from "@/lib/env";

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;
let isShuttingDown = false;

function getClient() {
  if (isShuttingDown) {
    throw new Error('Database is shutting down');
  }

  if (!client) {
    client = postgres(env.DATABASE_URL, {
      prepare: false,
      max: 10, // Connection pool size
      idle_timeout: 20, // Close idle connections after 20s
      connect_timeout: 10, // Connection timeout 10s
    });
  }

  return client;
}

function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getClient(), { schema });
  }
  return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});

export async function closeDatabase() {
  if (isShuttingDown || !client) {
    return; // Already closing or never opened
  }

  isShuttingDown = true;

  try {
    await client.end({
      timeout: 5, // 5 second graceful shutdown
    });
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('⚠️ Error closing database:', error);
  } finally {
    client = null;
    dbInstance = null;
    isShuttingDown = false;
  }
}

export function getDbClient() {
  return client;
}

// Graceful shutdown on process termination
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database...');
    await closeDatabase();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, closing database...');
    await closeDatabase();
    process.exit(0);
  });
}
```

### Example 3: Service with Connection Management

```typescript
// src/services/cacheService.ts
import Redis from 'ioredis';
import { env } from '@/lib/env';

let redis: Redis | null = null;

function getRedis() {
  if (!redis) {
    if (env.REDIS_URL) {
      redis = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: true, // Connect on first use
      });

      redis.on('error', (err) => {
        console.error('Redis error:', err);
      });
    }
  }
  return redis;
}

export async function cacheGet(key: string): Promise<string | null> {
  const client = getRedis();
  if (!client) return null;

  if (!client.status || client.status === 'end') {
    await client.connect();
  }

  return client.get(key);
}

export async function cacheSet(key: string, value: string, ttl: number): Promise<void> {
  const client = getRedis();
  if (!client) return;

  if (!client.status || client.status === 'end') {
    await client.connect();
  }

  await client.setex(key, ttl, value);
}

export async function closeCache() {
  if (redis) {
    try {
      await redis.quit(); // Graceful shutdown
    } catch (error) {
      console.error('Error closing Redis:', error);
      redis.disconnect(); // Force close
    } finally {
      redis = null;
    }
  }
}
```

### Example 4: Test with Per-Suite Database

```typescript
// tests/contract/sessions.test.ts
import { test, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { sessions, users } from "@/models/schema";

let testUserId: string;

beforeAll(async () => {
  // Create test user
  const [user] = await db.insert(users).values({
    email: 'test@example.com',
    name: 'Test User',
  }).returning();
  testUserId = user.id;
});

afterAll(async () => {
  // Cleanup test data
  await db.delete(sessions).where({ userId: testUserId });
  await db.delete(users).where({ id: testUserId });
});

test('creates session', async () => {
  const response = await fetch('http://localhost:3000/api/sessions', {
    method: 'POST',
    body: JSON.stringify({
      userId: testUserId,
      contentId: 'content-123',
    }),
  });

  expect(response.status).toBe(201);
});
```

### Example 5: PGLite Test Pattern

```typescript
// tests/integration/db-integration.test.ts
import { test, expect, beforeAll, afterAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "@/models/schema";

let client: PGlite;
let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  // In-memory Postgres
  client = new PGlite();
  db = drizzle(client, { schema });

  // Run migrations
  await migrate(db, { migrationsFolder: "./drizzle" });
});

afterAll(async () => {
  await client.close();
});

test('queries work', async () => {
  const [user] = await db.insert(schema.users).values({
    email: 'test@example.com',
  }).returning();

  expect(user.email).toBe('test@example.com');
});
```

---

## Configuration Reference

### Complete vitest.config.ts Template

```typescript
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    // Environment
    environment: "node",
    globals: true,

    // Files
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "node_modules",
      "dist",
      ".next",
      "tests/integration/**", // Playwright tests
    ],

    // Setup
    setupFiles: ["./tests/setup.ts"],
    globalSetup: ["./tests/global-setup.ts"], // Optional

    // Pool Configuration
    pool: "forks", // 'threads' | 'forks' | 'vmThreads'
    poolOptions: {
      forks: {
        singleFork: false, // Parallel execution
        maxForks: 4,       // Limit concurrent forks
        minForks: 1,
      },
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },

    // Isolation
    isolate: true, // Each file in separate environment
    fileParallelism: true, // Run files in parallel

    // Timeouts
    testTimeout: 10000,      // 10s per test
    hookTimeout: 10000,      // 10s per hook
    teardownTimeout: 30000,  // 30s for final cleanup

    // Cleanup
    clearMocks: true,      // vi.clearAllMocks() before each
    mockReset: false,       // vi.resetAllMocks() before each
    restoreMocks: true,    // vi.restoreAllMocks() before each
    unstubEnvs: true,      // Restore process.env before each
    unstubGlobals: true,   // Restore globalThis before each

    // Reporters
    reporters: process.env.CI
      ? ["default", "junit"]
      : ["default"],

    // Coverage (optional)
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "tests/**",
        "**/*.config.ts",
        "**/*.d.ts",
      ],
    },
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

### Environment Variables for Testing

```bash
# .env.test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/speedreader_test"
REDIS_URL="redis://localhost:6379/1" # Different DB than dev
GEMINI_API_KEY="test_key_or_mock"
NODE_ENV="test"

# Vitest specific
VITEST_POOL_SIZE=4
VITEST_MAX_FORKS=4
```

---

## Resources & References

### Official Documentation
- [Vitest Configuration](https://vitest.dev/config/) - Complete config reference
- [Vitest API Reference](https://vitest.dev/api/) - Test APIs and hooks
- [Vitest Reporters](https://vitest.dev/guide/reporters) - hanging-process reporter
- [Improving Performance](https://vitest.dev/guide/improving-performance) - Pool options and isolation
- [Drizzle ORM - PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql) - Connection management
- [postgres-js](https://github.com/porsager/postgres) - Client API and cleanup

### GitHub Issues & Discussions
- [vitest#4797](https://github.com/vitest-dev/vitest/discussions/4797) - Vitest 1.0 hanging after tests
- [vitest#2888](https://github.com/vitest-dev/vitest/discussions/2888) - Database connections in global setup
- [vitest#1659](https://github.com/vitest-dev/vitest/issues/1659) - Configurable teardownTimeout
- [vitest#4914](https://github.com/vitest-dev/vitest/discussions/4914) - Why is pool: 'forks' not default
- [drizzle-orm#228](https://github.com/drizzle-team/drizzle-orm/discussions/228) - Close or destroy connection

### Tutorials & Examples
- [Testing Node.js + Postgres with Vitest & Testcontainers](https://nikolamilovic.com/posts/integration-testing-node-postgres-vitest-testcontainers/)
- [ivandotv/vitest-database-containers](https://github.com/ivandotv/vitest-database-containers) - Example repository
- [rphlmr/drizzle-vitest-pg](https://github.com/rphlmr/drizzle-vitest-pg) - Drizzle + PGLite pattern
- [Testing Next.js with Vitest](https://nextjs.org/docs/app/guides/testing/vitest) - Official Next.js guide
- [Clean Room Tests with `using` Keyword](https://blog.disintegrator.dev/posts/clean-room-testing-using/) - Modern cleanup pattern

### Related Tools
- [PGLite](https://github.com/electric-sql/pglite) - In-memory Postgres for testing
- [Testcontainers](https://node.testcontainers.org/) - Docker containers for testing
- [node-mocks-http](https://www.npmjs.com/package/node-mocks-http) - Mock HTTP for Next.js routes

---

## Glossary

**Pool** - Worker management strategy (threads, forks, vmThreads)

**Isolation** - Running each test file in separate environment to prevent state sharing

**Teardown** - Cleanup phase after tests complete (opposite of setup)

**hanging-process reporter** - Vitest reporter that identifies resources preventing exit

**postgres-js** - PostgreSQL client library used by Drizzle ORM

**Connection pool** - Set of reusable database connections maintained by client

**Graceful shutdown** - Closing connections after in-flight queries complete (vs. force close)

**File parallelism** - Running multiple test files concurrently

**Test isolation** - Ensuring tests don't affect each other (fresh state per test)

**Mock** - Fake implementation of function/module for testing

**Spy** - Wrapper that tracks calls to real implementation

**Stub** - Replacement implementation with predefined behavior

**Hook** - Lifecycle function (beforeAll, afterAll, beforeEach, afterEach)

**Setup file** - File run before tests start (setupFiles config)

**Global setup** - One-time setup before all test files (globalSetup config)

**Fake timers** - Mocked setTimeout/setInterval for deterministic tests

**Handle** - Node.js resource that keeps process alive (connection, timer, listener)

---

## Unresolved Questions

### 1. Rate Limiting Service Implementation
**Question:** Does the rate limiting service use Redis in test environment?

**Context:** Project has `rateLimitService.ts` but unclear if Redis is used in tests

**Impact:** If Redis used in tests, cleanup required in teardown

**Next steps:**
- Check if `REDIS_URL` set in `.env.test`
- Verify rate limit service initialization in tests
- Add cleanup if needed

### 2. Timer Usage in Services
**Question:** Do services use `setInterval` or long-running timers?

**Context:** Searched for timers but need deeper audit

**Impact:** Unclosed timers prevent process exit

**Next steps:**
- Audit all services for setTimeout/setInterval
- Check if any timers created during test execution
- Add cleanup if found

### 3. Integration Test Strategy
**Question:** Why are integration tests excluded from vitest?

**Context:** `tests/integration/**` excluded in config, should be Playwright but contains `.test.ts` files

**Impact:** May indicate incomplete migration or confusion about test types

**Next steps:**
- Clarify integration vs e2e test strategy
- Determine if integration tests should use vitest with real DB
- Consider separate vitest config for integration tests

### 4. File Watchers
**Question:** Are there any Vite plugins that might set file watchers?

**Context:** No custom plugins in vitest.config.ts currently

**Impact:** Generally not an issue for this project

**Next steps:** Monitor for issues if plugins added later

### 5. Optimal teardownTimeout Value
**Question:** Is 30s appropriate or overkill for this project?

**Context:** Recommended 30s for safety, but may be longer than needed

**Impact:** Tests wait up to 30s before force exit if cleanup hangs

**Next steps:**
- Start with 30s for safety
- Monitor actual cleanup time with logging
- Reduce if cleanup consistently fast (<5s)

### 6. Test Data Cleanup Strategy
**Question:** Should tests clean up database records or use transactions?

**Context:** Tests create records but no explicit cleanup in individual tests

**Impact:** Database accumulates test data over time

**Alternatives:**
1. **Current**: Create records, never clean up (relies on DB reset between runs)
2. **Cleanup in afterAll**: Delete test records after suite
3. **Transactions**: Wrap each test in transaction, rollback
4. **Fresh DB**: PGLite or Testcontainers per suite

**Next steps:**
- Evaluate test data accumulation impact
- Consider PGLite for speed and isolation
- Implement cleanup if DB becomes polluted

---

## Appendix A: Debugging Commands

```bash
# Identify hanging processes
npx vitest --reporter=hanging-process

# Run in single fork (easier debugging)
npx vitest --pool=forks --poolOptions.forks.singleFork=true

# Disable file parallelism
npx vitest --fileParallelism=false

# Run specific test file
npx vitest tests/contract/content.post.test.ts

# Force exit (not recommended, masks issues)
npx vitest --run

# Verbose output
npx vitest --reporter=verbose

# Node.js debugging (detect open handles)
node --trace-warnings $(which vitest)

# With inspector
node --inspect-brk $(which vitest)

# Environment variable debugging
DEBUG=* npx vitest

# Vitest debug mode
DEBUG=vitest:* npx vitest
```

---

## Appendix B: Migration Checklist

For upgrading existing projects to proper cleanup:

- [ ] Identify all connection types (DB, Redis, HTTP clients)
- [ ] Add cleanup exports to connection modules
- [ ] Import cleanup functions in test setup
- [ ] Call cleanup in global `afterAll` hook
- [ ] Configure `teardownTimeout` appropriately
- [ ] Set `pool: 'forks'` for compatibility
- [ ] Enable automatic mock cleanup flags
- [ ] Run tests and verify clean exit
- [ ] Test with hanging-process reporter
- [ ] Add logging to confirm cleanup execution
- [ ] Document cleanup pattern for team
- [ ] Add pre-commit hook to prevent regressions

---

## Summary

**Root cause for speed-reader project:** postgres-js connection pool not closed after tests

**Solution:** Add `closeDatabase()` export and call in `afterAll` hook

**Configuration:** Set `teardownTimeout: 30000` and `pool: 'forks'`

**Verification:** Tests should exit within 2-3 seconds, no forced exit needed

**General principle:** Every resource opened in tests must be explicitly closed

**Best practice:** Use global `afterAll` for shared resources, per-suite for isolated resources

---

**Report generated:** 2025-11-01
**Research time:** ~2 hours
**Sources:** 20+ authoritative sources
**Confidence:** High for identified issues and solutions
**Applicability:** Specific to speed-reader project context with Next.js 15, Vitest, PostgreSQL (postgres-js + Drizzle)
