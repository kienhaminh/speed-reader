# Fix Vitest Process Cleanup Issue - Implementation Plan

**Date**: 2025-11-01
**Version**: 1.0.0
**Status**: Ready for Implementation

## Overview

Vitest processes remain running after tests complete due to unclosed database connections. PostgreSQL client maintains active connection pool that prevents Node.js process from exiting. Need to implement proper cleanup in test lifecycle hooks.

## Root Cause Analysis

### Primary Issue: Database Connection Pool
- **Problem**: `postgres` client creates connection pool in `src/lib/db.ts` that never closes
- **Impact**: Each vitest worker process maintains open connections
- **Evidence**:
  - 7 vitest worker processes remain running after test completion
  - Database connection errors (ECONNREFUSED) visible in test output
  - No cleanup logic in test setup/teardown

### Secondary Issues Identified

1. **Lazy Initialization Pattern**
   - `db.ts` uses singleton pattern with Proxy for lazy init
   - No mechanism to access underlying client for cleanup
   - Client stored in closure, inaccessible from test code

2. **Test Setup Incomplete**
   - `tests/setup.ts` only handles mock server cleanup
   - No database connection cleanup
   - Missing `afterAll` hook for resource cleanup

3. **In-Memory Redis**
   - Uses in-memory Map, no cleanup needed
   - Not contributing to hang issue

4. **No Timers/Intervals in Test Code**
   - Component timers (WordViewer, ChunkViewer, ParagraphViewer) not used in vitest tests
   - Only used in Playwright e2e tests
   - Not contributing to hang issue

## Requirements

### Functional Requirements
1. All database connections must close after tests complete
2. Vitest processes must exit cleanly without hanging
3. Tests must continue to pass with same behavior
4. No impact on test isolation or reliability

### Non-Functional Requirements
1. Minimal code changes to core application code
2. Maintain existing lazy initialization pattern
3. Test execution time unchanged
4. Clear error messages if cleanup fails

## Architecture

### Current Architecture
```
Test Execution
    ↓
tests/setup.ts (beforeAll/afterAll)
    ↓
Contract Tests → Mock Server → API Routes → Services → db.ts (postgres client)
                                                            ↓
                                                     PostgreSQL Connection Pool
                                                     (NEVER CLOSES - ROOT CAUSE)
```

### Proposed Architecture
```
Test Execution
    ↓
tests/setup.ts (beforeAll/afterAll)
    ↓
    ├─ beforeAll: setupMockServer()
    └─ afterAll: teardownMockServer() + closeDatabase() ← NEW
                                            ↓
                                    db.ts: closeDbConnection() ← NEW
                                            ↓
                                    postgres client.end()
                                            ↓
                                    Connection Pool Closed
                                            ↓
                                    Process Exits Cleanly
```

## Implementation Steps

### Step 1: Add Database Cleanup Function to `src/lib/db.ts`

**File**: `/Users/kien.ha/Code/speed-reader/src/lib/db.ts`

**Changes**:
1. Export cleanup function to close postgres client
2. Handle null client case (not yet initialized)
3. Reset singleton instances after cleanup
4. Add error handling for cleanup failures

**Code Changes**:
```typescript
// Add after existing code:

/**
 * Close database connection and clean up resources
 * Used in test teardown to ensure clean process exit
 */
export async function closeDbConnection(): Promise<void> {
  if (client) {
    try {
      await client.end();
      client = null;
      dbInstance = null;
    } catch (error) {
      console.error('Failed to close database connection:', error);
      throw error;
    }
  }
}
```

**Why This Works**:
- Provides explicit cleanup mechanism
- Resets singleton state for next test run
- Throws error if cleanup fails (test will report it)
- Safe to call even if client not initialized

### Step 2: Update Test Setup with Database Cleanup

**File**: `/Users/kien.ha/Code/speed-reader/tests/setup.ts`

**Changes**:
1. Import `closeDbConnection` from db.ts
2. Add database cleanup to `afterAll` hook
3. Ensure cleanup happens after mock server teardown
4. Add error handling to prevent silent failures

**Code Changes**:
```typescript
// Replace entire file:
import { beforeAll, afterAll } from "vitest";
import { setupMockServer, teardownMockServer } from "./helpers/test-routes";
import { closeDbConnection } from "@/lib/db";
import { config } from "dotenv";

// Load test environment variables
config({ path: ".env.test" });

beforeAll(async () => {
  // Setup mock server for contract tests
  setupMockServer();
});

afterAll(async () => {
  // Cleanup resources in reverse order of initialization
  try {
    // First, teardown mock server
    teardownMockServer();

    // Then, close database connections
    await closeDbConnection();
  } catch (error) {
    console.error('Test cleanup failed:', error);
    throw error;
  }
});
```

**Why This Order**:
1. Teardown mock server first (no async operations)
2. Close database connections second (async, may have pending queries)
3. Throw errors to ensure failures are visible

### Step 3: Update Vitest Configuration for Better Process Management

**File**: `/Users/kien.ha/Code/speed-reader/vitest.config.ts`

**Changes**:
1. Add `pool` and `poolOptions` for better worker management
2. Configure `teardownTimeout` to allow cleanup time
3. Set `fileParallelism: false` during debugging (optional)

**Code Changes**:
```typescript
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],

    // Exclude Playwright integration tests
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["tests/integration/**"],

    // Pool configuration for better worker management
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },

    // Allow time for cleanup operations
    teardownTimeout: 10000, // 10 seconds for cleanup
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

**Configuration Rationale**:
- `pool: "forks"`: Explicit fork pool (default, but explicit is better)
- `teardownTimeout: 10000`: Give 10s for database connections to close gracefully
- Keeps existing behavior but adds safety margins

### Step 4: Add Test to Verify Cleanup Works

**File**: `/Users/kien.ha/Code/speed-reader/tests/unit/database-cleanup.test.ts` (NEW)

**Purpose**: Verify cleanup mechanism works correctly

**Code**:
```typescript
import { describe, it, expect, afterAll } from "vitest";
import { db, closeDbConnection } from "@/lib/db";

describe("Database cleanup", () => {
  it("should allow database operations", async () => {
    // This test verifies db can be used normally
    expect(db).toBeDefined();
  });

  // Local cleanup test
  afterAll(async () => {
    // Verify cleanup doesn't throw
    await expect(closeDbConnection()).resolves.toBeUndefined();
  });
});
```

**Why This Test**:
- Ensures `closeDbConnection()` is callable without errors
- Provides early warning if cleanup mechanism breaks
- Documents expected cleanup behavior

## Files to Modify/Create/Delete

### Files to Modify
1. **`/Users/kien.ha/Code/speed-reader/src/lib/db.ts`**
   - Add `closeDbConnection()` export function
   - ~10 lines added

2. **`/Users/kien.ha/Code/speed-reader/tests/setup.ts`**
   - Import and call `closeDbConnection()` in `afterAll`
   - ~5 lines added

3. **`/Users/kien.ha/Code/speed-reader/vitest.config.ts`**
   - Add pool configuration and teardown timeout
   - ~10 lines added

### Files to Create
1. **`/Users/kien.ha/Code/speed-reader/tests/unit/database-cleanup.test.ts`**
   - New test file to verify cleanup mechanism
   - ~15 lines

### Files to Delete
None

## Testing Strategy

### Verification Steps

1. **Run Tests and Verify No Hanging**
   ```bash
   pnpm test --run
   # Should complete and exit cleanly
   # No vitest processes should remain
   ```

2. **Check Process Cleanup**
   ```bash
   pnpm test --run && sleep 2 && ps aux | grep vitest
   # Should show NO vitest processes after 2 seconds
   ```

3. **Verify All Tests Still Pass**
   ```bash
   pnpm test --run
   # All existing tests should pass
   # No changes to test behavior
   ```

4. **Test Multiple Runs**
   ```bash
   pnpm test --run && pnpm test --run
   # Second run should work (no stale connections)
   ```

### Expected Behavior

**Before Fix**:
- `pnpm test --run` completes but hangs
- 7 vitest worker processes remain running
- Must Ctrl+C to exit
- `ps aux | grep vitest` shows multiple processes

**After Fix**:
- `pnpm test --run` completes and exits cleanly
- All vitest processes terminate automatically
- `ps aux | grep vitest` shows no processes
- Tests pass with same results

### Edge Cases to Test

1. **No Database Usage**: Test cleanup when db never initialized
2. **Multiple Test Files**: Ensure cleanup works across parallel test execution
3. **Test Failures**: Cleanup should run even if tests fail
4. **Interrupted Tests**: Ctrl+C should still trigger cleanup (best effort)

## Security Considerations

### Database Credentials
- No changes to credential handling
- `.env.test` already gitignored
- Cleanup doesn't log credentials

### Connection Pool Exhaustion
- Fix prevents connection pool exhaustion
- Each test run properly closes connections
- Database server no longer sees zombie connections

### Process Management
- Clean process exit improves CI/CD reliability
- No orphaned processes consuming resources
- Better signal handling (SIGTERM, SIGINT)

## Performance Considerations

### Test Execution Time
- **Impact**: Minimal (<100ms overhead)
- **Reason**: Cleanup happens once in `afterAll`, not per test
- Async cleanup won't slow down test execution

### Database Performance
- **Benefit**: Properly closed connections reduce DB load
- **Benefit**: Connection pool properly released
- No connection leaks over multiple test runs

### CI/CD Impact
- **Major Benefit**: Tests will exit cleanly in CI
- No timeout failures due to hanging processes
- Faster feedback loops

## Risks & Mitigations

### Risk 1: Cleanup Breaks Existing Tests
**Likelihood**: Low
**Impact**: High
**Mitigation**:
- Test changes incrementally
- Run full test suite before/after
- Cleanup only in `afterAll` (after all tests complete)

### Risk 2: Database Connection Already Closed
**Likelihood**: Low
**Impact**: Low
**Mitigation**:
- Check if client exists before calling `.end()`
- Catch and log errors without failing tests
- `closeDbConnection()` is idempotent

### Risk 3: Cleanup Takes Too Long
**Likelihood**: Low
**Impact**: Low
**Mitigation**:
- Set `teardownTimeout: 10000` (10 seconds)
- PostgreSQL `.end()` typically <1 second
- Log warning if cleanup exceeds expected time

### Risk 4: Race Conditions in Parallel Tests
**Likelihood**: Low
**Impact**: Medium
**Mitigation**:
- Vitest runs `afterAll` after all tests in suite complete
- Each worker has own process with own db connection
- No shared state between workers

## Rollback Plan

If issues arise after implementation:

1. **Immediate Rollback**:
   ```bash
   git revert <commit-hash>
   pnpm test --run
   ```

2. **Partial Rollback**: Remove just vitest.config.ts changes
   - Keep db.ts cleanup function (harmless if not called)
   - Remove setup.ts changes

3. **Temporary Workaround**: Force exit in package.json
   ```json
   "test": "vitest --run && pkill -f vitest"
   ```
   *(Not recommended, but works as emergency measure)*

## TODO Tasks

- [ ] Implement `closeDbConnection()` in `src/lib/db.ts`
- [ ] Update `tests/setup.ts` with cleanup logic
- [ ] Update `vitest.config.ts` with pool config and teardown timeout
- [ ] Create `tests/unit/database-cleanup.test.ts`
- [ ] Run `pnpm test --run` and verify clean exit
- [ ] Check no vitest processes remain after tests
- [ ] Run tests multiple times to verify no stale connections
- [ ] Document changes in commit message
- [ ] Update `docs/codebase-summary.md` if needed

## Success Criteria

✅ All vitest tests pass
✅ Tests complete and exit cleanly (no hanging)
✅ No vitest processes remain after test completion
✅ Tests can run multiple times consecutively
✅ Test execution time unchanged (<100ms overhead)
✅ CI/CD pipeline completes without timeouts
✅ No connection pool exhaustion warnings

## Unresolved Questions

None - all identified issues have clear solutions.

## References

### Internal Documentation
- [Codebase Summary](../docs/codebase-summary.md) - Database architecture
- [Code Standards](../docs/code-standards.md) - Testing standards

### External Resources
- [Vitest Configuration](https://vitest.dev/config/) - Pool and teardown options
- [postgres.js Documentation](https://github.com/porsager/postgres) - Connection management
- [Drizzle ORM](https://orm.drizzle.team/) - Database client lifecycle

---

**Implementation Time Estimate**: 30-45 minutes
**Testing Time Estimate**: 15-20 minutes
**Total Effort**: ~1 hour
