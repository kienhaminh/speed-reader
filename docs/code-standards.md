# Code Standards & Codebase Structure

**Last Updated**: 2025-11-02
**Version**: 2.0.0
**Applies To**: All code within Speed Reader project

## Overview

This document defines coding standards, file organization patterns, naming conventions, and best practices for ClaudeKit Engineer. All code must adhere to these standards to ensure consistency, maintainability, and quality.

## Core Development Principles

### YANGI (You Aren't Gonna Need It)
- Avoid over-engineering and premature optimization
- Implement features only when needed
- Don't build infrastructure for hypothetical future requirements
- Start simple, refactor when necessary

### KISS (Keep It Simple, Stupid)
- Prefer simple, straightforward solutions
- Avoid unnecessary complexity
- Write code that's easy to understand and modify
- Choose clarity over cleverness

### DRY (Don't Repeat Yourself)
- Eliminate code duplication
- Extract common logic into reusable functions/modules
- Use composition and abstraction appropriately
- Maintain single source of truth

## File Organization Standards

### Directory Structure

```
project-root/
├── .claude/                    # Claude Code configuration
│   ├── agents/                # Agent definitions (*.md)
│   ├── commands/              # Slash commands (*.md)
│   │   ├── [category]/       # Nested command categories
│   │   └── [command].md      # Individual commands
│   ├── hooks/                # Git hooks and scripts
│   ├── skills/               # Reusable knowledge modules
│   │   └── [skill-name]/     # Individual skill directories
│   │       ├── SKILL.md      # Skill definition
│   │       └── references/   # Supporting materials
│   └── workflows/            # Workflow definitions
├── .opencode/                 # OpenCode configuration
│   ├── agent/                # OpenCode agent definitions
│   └── command/              # OpenCode commands
├── .github/                   # GitHub-specific files
│   └── workflows/            # CI/CD workflows
├── docs/                      # Project documentation
│   ├── research/             # Research reports
│   └── *.md                  # Core documentation files
├── guide/                     # User guides
├── plans/                     # Implementation plans
│   ├── reports/              # Agent communication reports
│   └── templates/            # Plan templates
├── src/                       # Source code (if applicable)
├── tests/                     # Test suites (if applicable)
├── .gitignore                # Git ignore patterns
├── CLAUDE.md                 # Claude-specific instructions
├── README.md                 # Project overview
├── package.json              # Node.js dependencies
└── LICENSE                   # License file
```

### File Naming Conventions

**Agent Definitions** (`.claude/agents/`, `.opencode/agent/`):
- Format: `[agent-name].md`
- Use kebab-case: `code-reviewer.md`, `docs-manager.md`
- Descriptive, role-based names
- Examples: `planner.md`, `tester.md`, `git-manager.md`

**Commands** (`.claude/commands/`, `.opencode/command/`):
- Format: `[command-name].md` or `[category]/[command-name].md`
- Use kebab-case for names
- Group related commands in subdirectories
- Examples:
  - `plan.md`
  - `fix/ci.md`
  - `design/screenshot.md`
  - `git/cm.md`

**Skills** (`.claude/skills/`):
- Format: `[skill-name]/SKILL.md`
- Use kebab-case for directory names
- Main file always named `SKILL.md`
- Supporting files in `references/` or `scripts/`
- Examples:
  - `better-auth/SKILL.md`
  - `cloudflare-workers/SKILL.md`
  - `mongodb/SKILL.md`

**Documentation** (`docs/`):
- Format: `[document-purpose].md`
- Use kebab-case with descriptive names
- Examples:
  - `project-overview-pdr.md`
  - `codebase-summary.md`
  - `code-standards.md`
  - `system-architecture.md`

**Reports** (`plans/reports/`):
- Format: `YYMMDD-from-[agent]-to-[agent]-[task]-report.md`
- Use date prefix for chronological sorting
- Clear source and destination agents
- Examples:
  - `251026-from-planner-to-main-auth-implementation-report.md`
  - `251026-from-tester-to-debugger-test-failures-report.md`

**Plans** (`plans/`):
- Format: `YYMMDD-[feature-name]-plan.md`
- Use date prefix for version tracking
- Descriptive feature names in kebab-case
- Examples:
  - `251026-user-authentication-plan.md`
  - `251026-database-migration-plan.md`

**Research Reports** (`plans/research/`):
- Format: `YYMMDD-[research-topic].md`
- Date prefix for tracking
- Clear topic description
- Examples:
  - `251026-oauth2-implementation-strategies.md`
  - `251026-performance-optimization-techniques.md`

## File Size Management

### Hard Limits
- **Maximum file size**: 500 lines of code
- Files exceeding 500 lines MUST be refactored
- Exception: Auto-generated files (with clear marking)

### Refactoring Strategies

**When file exceeds 500 lines**:
1. **Extract Utility Functions**: Move to separate `utils/` directory
2. **Component Splitting**: Break into smaller, focused components
3. **Service Classes**: Extract business logic to dedicated services
4. **Module Organization**: Group related functionality into modules

**Example Refactoring**:
```
Before:
user-service.js (750 lines)

After:
services/
├── user-service.js (200 lines)      # Core service
├── user-validation.js (150 lines)   # Validation logic
└── user-repository.js (180 lines)   # Database operations
utils/
└── password-hasher.js (80 lines)    # Utility functions
```

## Naming Conventions

### Variables & Functions

**JavaScript/TypeScript**:
- **Variables**: camelCase
  ```javascript
  const userName = 'John Doe';
  const isAuthenticated = true;
  ```

- **Functions**: camelCase
  ```javascript
  function calculateTotal(items) { }
  const getUserById = (id) => { };
  ```

- **Classes**: PascalCase
  ```javascript
  class UserService { }
  class AuthenticationManager { }
  ```

- **Constants**: UPPER_SNAKE_CASE
  ```javascript
  const MAX_RETRY_COUNT = 3;
  const API_BASE_URL = 'https://api.example.com';
  ```

- **Private Members**: Prefix with underscore
  ```javascript
  class Database {
    _connectionPool = null;
    _connect() { }
  }
  ```

### Files & Directories

**Source Files**:
- **JavaScript/TypeScript**: kebab-case
  ```
  user-service.js
  authentication-manager.ts
  api-client.js
  ```

- **React Components**: PascalCase
  ```
  UserProfile.jsx
  AuthenticationForm.tsx
  NavigationBar.jsx
  ```

- **Test Files**: Match source file name + `.test` or `.spec`
  ```
  user-service.test.js
  authentication-manager.spec.ts
  ```

**Directories**: kebab-case
```
src/
├── components/
├── services/
├── utils/
├── api-clients/
└── test-helpers/
```

### API Design

**REST Endpoints**:
- Use kebab-case for URLs
- Plural nouns for collections
- Resource IDs in path parameters

```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/:userId/posts
```

**Request/Response Fields**:
- Use camelCase for JSON properties
```json
{
  "userId": 123,
  "userName": "john_doe",
  "emailAddress": "john@example.com",
  "isVerified": true,
  "createdAt": "2025-10-26T00:00:00Z"
}
```

## Code Style Guidelines

### General Formatting

**Indentation**:
- Use 2 spaces (not tabs)
- Consistent indentation throughout file
- No trailing whitespace

**Line Length**:
- Preferred: 80-100 characters
- Hard limit: 120 characters
- Break long lines logically

**Whitespace**:
- One blank line between functions/methods
- Two blank lines between classes
- Space after keywords: `if (`, `for (`, `while (`
- No space before function parentheses: `function name(`

### Comments & Documentation

**File Headers** (Optional but recommended):
```javascript
/**
 * User Service
 *
 * Handles user authentication, registration, and profile management.
 *
 * @module services/user-service
 * @author ClaudeKit
 * @version 1.0.0
 */
```

**Function Documentation**:
```javascript
/**
 * Authenticates a user with email and password
 *
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<User>} Authenticated user object
 * @throws {AuthenticationError} If credentials are invalid
 */
async function authenticateUser(email, password) {
  // Implementation
}
```

**Inline Comments**:
- Explain WHY, not WHAT
- Complex logic requires explanation
- TODO comments include assignee and date
```javascript
// TODO(john, 2025-10-26): Optimize this query for large datasets
const users = await db.query('SELECT * FROM users');

// Cache miss - fetch from database
const user = await fetchUserFromDB(userId);
```

### Error Handling

**Always Use Try-Catch**:
```javascript
async function processPayment(orderId) {
  try {
    const order = await getOrder(orderId);
    const payment = await chargeCard(order.total);
    await updateOrderStatus(orderId, 'paid');
    return payment;
  } catch (error) {
    logger.error('Payment processing failed', { orderId, error });
    throw new PaymentError('Failed to process payment', { cause: error });
  }
}
```

**Error Types**:
- Create custom error classes for domain errors
- Include context and cause
- Provide actionable error messages

```javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}
```

**Structured Error Logging**:
- Use centralized logger, never console.log
- Log errors with context
- Use appropriate log levels
- Never expose sensitive data in logs

```typescript
// src/lib/logger.ts
import { logger } from '@/lib/logger';

// Good - Structured logging with context
logger.error('Database query failed', {
  query: sanitizeQuery(query),
  params: sanitizeParams(params),
  service: 'contentService',
  operation: 'fetchContent'
}, error);

// Good - API error logging
logger.apiError('POST', '/api/content', error, { userId, contentId });

// Bad - Using console
console.error('Query failed', error); // Never use console in production code
```

## Logging Standards

### Structured Logging

**Always Use Logger, Never console.log**:
```typescript
import { logger } from '@/lib/logger';

// ✓ Good - Structured logging
logger.info('User session started', { userId, sessionId, mode: 'word' });
logger.warn('Rate limit approaching', { userId, remaining: 2 });
logger.error('AI generation failed', { userId, contentId }, error);

// ✗ Bad - Console logging
console.log('User started session'); // Never use in production code
```

**Log Levels**:
- **DEBUG**: Development-only detailed information
- **INFO**: General informational messages (requests, operations)
- **WARN**: Warning conditions (approaching limits, fallback modes)
- **ERROR**: Error conditions requiring attention

**Request Logging**:
```typescript
import { logger, getRequestContext } from '@/lib/logger';

export async function POST(request: Request) {
  const context = getRequestContext(request);

  logger.apiRequest(request.method, '/api/content', context);

  try {
    // Handle request
    logger.info('Content created', { ...context, contentId });
    return NextResponse.json(result);
  } catch (error) {
    logger.apiError(request.method, '/api/content', error, context);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**Service Operation Logging**:
```typescript
logger.serviceOperation('contentService', 'createContent', { userId, language });

try {
  const content = await db.insert(readingContent).values(data);
  logger.info('Content persisted', { contentId: content.id });
} catch (error) {
  logger.serviceError('contentService', 'createContent', error, { userId });
  throw error;
}
```

**Context Best Practices**:
- Include operation identifiers (userId, sessionId, contentId)
- Add timing information (duration, timestamp)
- Never log sensitive data (passwords, API keys, tokens)
- Sanitize user input before logging
- Use structured context objects, not string concatenation

## Environment Variable Standards

### Validation Pattern

**Always Validate Environment Variables at Startup**:
```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Required variables
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .url('DATABASE_URL must be a valid URL'),

  GEMINI_API_KEY: z
    .string()
    .min(1, 'GEMINI_API_KEY is required'),

  // Optional variables with defaults
  REDIS_URL: z
    .string()
    .url('REDIS_URL must be a valid URL')
    .optional(),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

// Export typed environment variables
export type Env = z.infer<typeof envSchema>;
export const env = validateEnv(); // Validated once at startup
```

**Usage Pattern**:
```typescript
// ✓ Good - Use validated env
import { env } from '@/lib/env';

const apiKey = env.GEMINI_API_KEY; // Type-safe and validated
const isProduction = env.NODE_ENV === 'production';

// ✗ Bad - Direct process.env access
const apiKey = process.env.GEMINI_API_KEY; // Not validated, can be undefined
```

**Environment File Management**:
```bash
# Required files
.env.local          # Local development (gitignored)
.env.example        # Template with documentation (committed)

# .env.example format
# ============================================================================
# REQUIRED: Database Configuration
# ============================================================================
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# ============================================================================
# REQUIRED: AI/LLM Configuration
# ============================================================================
GEMINI_API_KEY="your_api_key_here"

# ============================================================================
# OPTIONAL: Redis Configuration
# ============================================================================
# REDIS_URL="redis://localhost:6379"
```

### Configuration Principles

1. **Fail Fast**: Validate all configuration at application startup
2. **Type Safety**: Export typed configuration interfaces
3. **Documentation**: Document all variables in .env.example
4. **Defaults**: Provide sensible defaults for optional variables
5. **Validation**: Use Zod schemas for runtime validation
6. **No Secrets**: Never commit .env.local or .env files

## Rate Limiting Standards

### Implementation Pattern

**Redis-Based Rate Limiting with Fallback**:
```typescript
// src/services/rateLimitService.ts
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';

export async function checkAIGenerationRateLimit(
  userId: string
): Promise<RateLimitResult> {
  const result = await redis.get(`rate_limit:ai:${userId}`);

  if (exceedsLimit(result)) {
    logger.warn('Rate limit exceeded', { userId, type: 'ai_generation' });
    return { allowed: false, reason: 'Rate limit exceeded' };
  }

  return { allowed: true };
}

export async function recordAIGeneration(userId: string): Promise<void> {
  await redis.incr(`rate_limit:ai:${userId}`);
  await redis.expire(`rate_limit:ai:${userId}`, 3600);
  logger.debug('Rate limit recorded', { userId });
}
```

**Redis Client with In-Memory Fallback**:
```typescript
// src/lib/redis.ts
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, exSeconds?: number): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  del(key: string): Promise<void>;
}

class InMemoryRedis implements RedisClient {
  private store = new Map<string, { value: string; expireAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (item.expireAt && item.expireAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  // Additional methods...
}

// Automatically fallback to in-memory if Redis unavailable
function createRedisClient(): RedisClient {
  if (env.REDIS_URL) {
    try {
      return new ActualRedisClient(env.REDIS_URL);
    } catch (error) {
      logger.warn('Redis unavailable, using in-memory fallback', {}, error);
    }
  }

  return new InMemoryRedis();
}

export const redis = createRedisClient();
```

## Security Standards

### Input Validation

**Validate All Inputs**:
```javascript
function createUser(userData) {
  // Validate required fields
  if (!userData.email || !userData.password) {
    throw new ValidationError('Email and password required');
  }

  // Sanitize inputs
  const email = sanitizeEmail(userData.email);
  const password = userData.password; // Never log passwords

  // Validate formats
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format');
  }

  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }
}
```

### Sensitive Data Handling

**Never Commit Secrets**:
- Use environment variables for API keys, credentials
- Add `.env*` to `.gitignore`
- Use secret management systems in production

**Never Log Sensitive Data**:
```javascript
// BAD
logger.info('User login', { email, password }); // Never log passwords

// GOOD
logger.info('User login', { email }); // OK to log email
```

**Sanitize Database Queries**:
```javascript
// Use parameterized queries
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// Never concatenate user input
// BAD: const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

## Testing Standards

### Test File Organization

```
tests/
├── unit/              # Unit tests
│   ├── services/
│   └── utils/
├── integration/       # Integration tests
│   └── api/
├── e2e/              # End-to-end tests
└── fixtures/         # Test data
```

### Test Naming

```javascript
describe('UserService', () => {
  describe('authenticateUser', () => {
    it('should return user when credentials are valid', async () => {
      // Test implementation
    });

    it('should throw AuthenticationError when password is incorrect', async () => {
      // Test implementation
    });

    it('should throw ValidationError when email is missing', async () => {
      // Test implementation
    });
  });
});
```

### Test Coverage Requirements

- **Unit tests**: > 80% code coverage
- **Integration tests**: Critical user flows
- **E2E tests**: Happy paths and edge cases
- **Error scenarios**: All error paths tested

### Test Best Practices

- **Arrange-Act-Assert** pattern
- **Independent tests** (no test dependencies)
- **Descriptive test names** (behavior, not implementation)
- **Test one thing** per test
- **Use fixtures** for complex test data
- **Mock external dependencies**

## Git Standards

### Commit Messages

**Format**: Conventional Commits
```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature (minor version bump)
- `fix`: Bug fix (patch version bump)
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `style`: Code style changes

**Examples**:
```
feat(auth): add OAuth2 authentication support

Implements OAuth2 flow with Google and GitHub providers.
Includes token refresh and revocation.

Closes #123

---

fix(api): resolve timeout in database queries

Optimized slow queries and added connection pooling.

---

docs: update installation guide with Docker setup
```

**Rules**:
- Subject line: imperative mood, lowercase, no period
- Max 72 characters for subject
- Blank line between subject and body
- Body: explain WHY, not WHAT
- Footer: reference issues, breaking changes
- No AI attribution or signatures

### Branch Naming

**Format**: `type/description`

**Types**:
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test improvements

**Examples**:
```
feature/oauth-authentication
fix/database-connection-timeout
refactor/user-service-cleanup
docs/api-reference-update
test/integration-test-suite
```

### Pre-Commit Checklist

- ✅ No secrets or credentials
- ✅ No debug code or console.logs
- ✅ All tests pass locally
- ✅ Code follows style guidelines
- ✅ No linting errors
- ✅ Files under 500 lines
- ✅ Conventional commit message

## Documentation Standards

### Code Documentation

**Self-Documenting Code**:
- Clear variable and function names
- Logical code organization
- Minimal comments needed

**When to Comment**:
- Complex algorithms or business logic
- Non-obvious optimizations
- Workarounds for bugs/limitations
- Public API functions
- Configuration options

### Markdown Documentation

**Structure**:
```markdown
# Document Title

Brief overview paragraph

## Section 1

Content with examples

## Section 2

More content

## See Also

- [Related Doc](./related.md)
```

**Formatting**:
- Use ATX-style headers (`#`, `##`, `###`)
- Code blocks with language specification
- Tables for structured data
- Lists for sequential items
- Links for cross-references

**Code Blocks**:
````markdown
```javascript
function example() {
  return 'example';
}
```
````

## Agent-Specific Standards

### Agent Definition Files

**Frontmatter**:
```yaml
---
name: agent-name
description: Brief description of agent purpose and when to use it
mode: subagent | all
model: anthropic/claude-sonnet-4-20250514
temperature: 0.1
---
```

**Required Sections**:
1. Agent role and responsibilities
2. Core capabilities
3. Workflow process
4. Output requirements
5. Quality standards
6. Communication protocols

### Command Definition Files

**Frontmatter**:
```yaml
---
name: command-name
description: What this command does
---
```

**Argument Handling**:
- `$ARGUMENTS` - All arguments as single string
- `$1`, `$2`, `$3` - Individual positional arguments

**Example**:
```markdown
---
name: plan
description: Create implementation plan for given task
---

Planning task: $ARGUMENTS

Using planner agent to research and create comprehensive plan for: $1
```

### Skill Definition Files

**Structure**:
```markdown
# Skill Name

Guide for using [Technology] - brief description

## When to Use

- List of use cases
- Scenarios where skill applies

## Core Concepts

Key concepts and terminology

## Implementation Guide

Step-by-step instructions

## Examples

Practical examples

## Best Practices

Recommendations and tips

## Common Pitfalls

Mistakes to avoid

## Resources

- Official docs
- Tutorials
- References
```

## Configuration File Standards

### package.json

**Required Fields**:
- name, version, description
- repository (with URL)
- author, license
- engines (Node version)
- scripts (test, lint, etc.)

**Best Practices**:
- Use semantic versioning
- Specify exact dependency versions for stability
- Include keywords for discoverability
- Use `files` field to control published content

### .gitignore

**Standard Exclusions**:
```
# Dependencies
node_modules/
package-lock.json (for libraries)

# Environment
.env
.env.*
!.env.example

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
*.test.js.snap

# Temporary
tmp/
temp/
*.tmp
```

## Performance Standards

### Code Performance

**Optimization Priorities**:
1. Correctness first
2. Readability second
3. Performance third (when needed)

**Common Optimizations**:
- Use appropriate data structures
- Avoid unnecessary loops
- Cache expensive computations
- Lazy load when possible
- Debounce/throttle frequent operations

**Example**:
```javascript
// Cache expensive operations
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const expensiveCalculation = memoize((n) => {
  // Complex calculation
  return result;
});
```

### File I/O

- Use async operations
- Stream large files
- Batch writes when possible
- Clean up file handles

## Quality Assurance

### Code Review Checklist

**Functionality**:
- ✅ Implements required features
- ✅ Handles edge cases
- ✅ Error handling complete
- ✅ Input validation present

**Code Quality**:
- ✅ Follows naming conventions
- ✅ Adheres to file size limits
- ✅ DRY principle applied
- ✅ KISS principle followed
- ✅ Well-structured and organized

**Security**:
- ✅ No hardcoded secrets
- ✅ Input sanitization
- ✅ Proper authentication/authorization
- ✅ Secure dependencies

**Testing**:
- ✅ Unit tests included
- ✅ Integration tests for flows
- ✅ Edge cases tested
- ✅ Error paths covered

**Documentation**:
- ✅ Code comments where needed
- ✅ API documentation updated
- ✅ README updated if needed
- ✅ Changelog entry added

## Animation Standards

### Performance Guidelines

**GPU-Accelerated Properties Only**:
```typescript
// ✓ Good - GPU-accelerated properties
<motion.div
  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
  transition={{ duration: 0.2 }}
/>

// ✗ Bad - CPU-intensive properties
<motion.div
  animate={{ width: "100%", height: "200px", backgroundColor: "#fff" }}
/>
```

**Timing Standards**:
- **Micro-interactions**: 150-200ms (button hover, scale effects)
- **Content transitions**: 200-300ms (page transitions, modal open/close)
- **Long animations**: 300-500ms (complex state changes)
- **Maximum duration**: 500ms (avoid longer animations for responsiveness)

**Easing Functions**:
```typescript
// Standard easings
transition={{ ease: "easeOut" }}      // Default for exits
transition={{ ease: "easeIn" }}       // Entrances
transition={{ ease: "easeInOut" }}    // Smooth both ways

// Performance-optimized cubic-bezier
transition={{ ease: [0.4, 0.0, 0.2, 1] }}  // Material Design standard
```

### Framer Motion Best Practices

**AnimatePresence for Mount/Unmount**:
```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={currentItem}
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.8, y: -20 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
  >
    {content}
  </motion.div>
</AnimatePresence>
```

**Optimized Animation Properties**:
- `transform` properties: `x`, `y`, `scale`, `rotate`
- `opacity`
- Avoid: `width`, `height`, `top`, `left`, `margin`, `padding`

**Performance Monitoring**:
- Target 60fps (16.67ms per frame)
- Use Chrome DevTools Performance tab to verify
- GPU usage should remain stable during animations

### Reduced Motion Support

**Always Respect User Preferences**:
```css
/* In globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Framer Motion with Reduced Motion**:
```typescript
import { useReducedMotion } from 'framer-motion';

function Component() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0.01 : 0.3,
      }}
    />
  );
}
```

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

**Focus Management**:
```css
/* Focus visible only for keyboard navigation */
*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

**Skip Links**:
```typescript
// Required on all pages
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
>
  Skip to main content
</a>

// Main content must have id="main-content"
<main id="main-content">...</main>
```

### Touch Target Requirements

**Minimum Size**: 44x44px (WCAG 2.1 AA)
```typescript
// ✓ Good - Meets touch target size
<Button size="icon" className="w-11 h-11">
  <Icon className="h-5 w-5" />
</Button>

// ✗ Bad - Too small
<button className="w-6 h-6">
  <Icon />
</button>
```

### ARIA Labels and Roles

**Interactive Elements**:
```typescript
// Buttons with icon-only content
<Button
  variant="ghost"
  size="icon"
  aria-label="Toggle theme"
  title="Toggle between light, dark, and system theme"
>
  <Sun className="h-5 w-5" />
  <span className="sr-only">Toggle theme</span>
</Button>

// Progress indicators
<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
>
  <div style={{ width: `${progress}%` }} />
</div>

// Live regions for dynamic content
<p className="sr-only" aria-live="polite">
  Currently reading: {currentWord}
</p>
```

### Semantic HTML

**Use Semantic Elements**:
```typescript
// ✓ Good - Semantic HTML
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

<main id="main-content">
  <article>
    <h1>Title</h1>
    <section>Content</section>
  </article>
</main>

<footer>
  <p>Copyright info</p>
</footer>

// ✗ Bad - Non-semantic divs
<div className="header">
  <div className="nav">...</div>
</div>
<div className="content">...</div>
```

### Keyboard Navigation

**Requirements**:
- All interactive elements must be keyboard accessible
- Tab order must be logical
- Focus indicators must be visible
- Escape key should close modals/dropdowns
- Enter/Space should activate buttons

**Testing Checklist**:
- ✅ Can navigate entire interface with Tab/Shift+Tab
- ✅ Can activate all buttons with Enter/Space
- ✅ Can close modals with Escape
- ✅ Focus indicators are clearly visible
- ✅ Tab order follows visual layout

### Color Contrast

**WCAG AA Requirements**:
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Design Token Compliance**:
```css
/* Light mode - AA compliant */
--foreground: #1A1A1A;        /* 16.5:1 on #FAFAF9 background */
--muted-foreground: #52525B;  /* 5.2:1 on #FAFAF9 background */

/* Dark mode - AA compliant */
--foreground: #E5E5E5;        /* 14.8:1 on #121212 background */
--muted-foreground: #A3A3A3;  /* 5.1:1 on #121212 background */
```

**Testing Tools**:
- Chrome DevTools Lighthouse
- axe DevTools browser extension
- WebAIM Contrast Checker

### Screen Reader Support

**Best Practices**:
```typescript
// Hide decorative elements
<div aria-hidden="true">
  <DecorativeIcon />
</div>

// Provide alternative text
<img src="chart.png" alt="Bar chart showing reading speed improvements over 6 months" />

// Complex interactions
<button
  onClick={toggleTheme}
  aria-label={`Current theme: ${theme}. Click to cycle themes`}
>
  <ThemeIcon />
</button>
```

## Theme Implementation Standards

### Custom Theme Provider Pattern

**Use Custom Context over next-themes**:
```typescript
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

// Implementation with localStorage persistence
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme | null;
      return stored || "system";
    }
    return "system";
  });

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    localStorage.setItem("theme", theme);
  }, [theme, resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Design Token Management

**CSS Custom Properties in globals.css**:
```css
:root {
  /* Light mode tokens */
  --background: #FAFAF9;
  --foreground: #1A1A1A;
  --primary: #3B82F6;
  --radius: 0.625rem;
}

.dark {
  /* Dark mode tokens */
  --background: #121212;
  --foreground: #E5E5E5;
  --primary: #60A5FA;
}
```

**Usage in Components**:
```typescript
// Use Tailwind classes that reference CSS variables
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">
    Click me
  </Button>
</div>
```

## Enforcement

### Automated Checks

**Pre-Commit**:
- Commitlint (conventional commits)
- Secret scanning
- File size validation

**Pre-Push**:
- Linting (ESLint, Prettier)
- Unit tests
- Type checking

**CI/CD**:
- All tests
- Build verification
- Coverage reports
- Security scans

### Manual Review

**Code Review Focus**:
- Architecture and design decisions
- Complex logic correctness
- Security implications
- Performance considerations
- Maintainability and readability

## Exceptions

**When to Deviate**:
- Performance-critical code (document reasons)
- External library constraints
- Generated code (mark clearly)
- Legacy code (plan refactoring)

**Documentation Required**:
```javascript
/**
 * EXCEPTION: File exceeds 500 lines
 * REASON: Critical performance optimization requires monolithic structure
 * TODO: Refactor when performance is no longer critical
 * DATE: 2025-10-26
 */
```

## References

### Internal Documentation
- [Project Overview PDR](./project-overview-pdr.md)
- [Codebase Summary](./codebase-summary.md)
- [System Architecture](./system-architecture.md)

### External Standards
- [Conventional Commits](https://conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Related Projects
- [Claude Code Documentation](https://docs.claude.com/)
- [Open Code Documentation](https://opencode.ai/docs)

## Unresolved Questions

None. All code standards are well-defined and documented.
