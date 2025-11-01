# Speed Reader - Codebase Summary

**Last Updated**: 2025-10-31
**Version**: 0.2.0
**Project**: Speed Reader - Reading Speed & Comprehension Application

## Overview

Speed Reader is a modern web application built with Next.js 15 and React 19 for improving reading speed and comprehension through various reading techniques. The application uses PostgreSQL for data persistence, Google Gemini AI for content generation and quiz creation, and follows a clean architecture with clear separation between models, services, and API routes.

## Project Statistics

- **Total Files**: 106 files
- **Total Lines of Code**: ~88,739 tokens (355,600 characters)
- **TypeScript/JavaScript Files**: 79 files
- **Primary Language**: TypeScript
- **Framework**: Next.js 15 with App Router
- **Runtime**: React 19

## Directory Structure

```
speed-reader/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes (RESTful endpoints)
│   │   ├── analytics/
│   │   │   └── summary/route.ts
│   │   ├── answers/route.ts
│   │   ├── content/
│   │   │   ├── route.ts
│   │   │   └── generate/route.ts
│   │   ├── health/route.ts
│   │   ├── questions/route.ts
│   │   └── sessions/
│   │       ├── route.ts
│   │       └── complete/route.ts
│   └── page.tsx                 # Main application page
├── src/
│   ├── app/                     # App-level files (duplicate with root app/)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/              # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   ├── Analytics.tsx       # Analytics dashboard component
│   │   ├── ChunkViewer.tsx     # Chunk reading mode viewer
│   │   ├── ContentInput.tsx    # Content input/generation form
│   │   ├── ParagraphViewer.tsx # Paragraph reading mode viewer
│   │   ├── Quiz.tsx            # Comprehension quiz component
│   │   ├── Reader.tsx          # Main reader orchestrator
│   │   └── WordViewer.tsx      # Word-by-word reading mode viewer
│   ├── i18n/                   # Internationalization
│   │   ├── en.ts
│   │   ├── vi.ts
│   │   └── index.ts
│   ├── lib/                    # Utility libraries
│   │   ├── accessibility.ts    # Accessibility utilities
│   │   ├── db.ts              # Database connection (Drizzle)
│   │   ├── init-db.ts         # Database initialization
│   │   ├── logger.ts          # Logging utilities
│   │   └── utils.ts           # General utilities
│   ├── models/                 # Database models and Zod schemas
│   │   ├── comprehensionQuestion.ts
│   │   ├── comprehensionResult.ts
│   │   ├── readingContent.ts
│   │   ├── readingSession.ts
│   │   ├── schema.ts          # Drizzle schema definitions
│   │   ├── studyLog.ts
│   │   └── user.ts
│   ├── schemas/                # Centralized validation schemas
│   │   └── index.ts
│   └── services/               # Business logic layer
│       ├── aiContentService.ts # Gemini AI integration
│       ├── analyticsService.ts # Analytics calculations
│       ├── contentService.ts   # Content management
│       ├── quizService.ts     # Quiz generation
│       └── sessionService.ts  # Session management
├── tests/
│   ├── contract/               # API contract tests (7 files)
│   │   ├── analytics.summary.get.test.ts
│   │   ├── answers.post.test.ts
│   │   ├── content.generate.post.test.ts
│   │   ├── content.post.test.ts
│   │   ├── questions.post.test.ts
│   │   ├── sessions.complete.post.test.ts
│   │   └── sessions.post.test.ts
│   ├── integration/            # Integration tests (5 files)
│   │   ├── flow.ai.test.ts
│   │   ├── flow.analytics.test.ts
│   │   ├── flow.chunk.test.ts
│   │   ├── flow.paragraph.test.ts
│   │   └── flow.word.test.ts
│   ├── unit/                   # Unit tests (3 files)
│   │   ├── contentService.test.ts
│   │   ├── quizService.test.ts
│   │   └── sessionService.test.ts
│   └── setup.ts                # Test setup
├── drizzle/                    # Database migrations
│   ├── meta/
│   └── 0000_woozy_rhodey.sql
├── specs/                      # Feature specifications
│   └── 001-i-want-to/
│       ├── contracts/openapi.yaml
│       ├── data-model.md
│       ├── GEMINI.md
│       ├── plan.md
│       ├── quickstart.md
│       ├── research.md
│       ├── spec.md
│       └── tasks.md
└── Configuration files
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── drizzle.config.ts
    ├── vitest.config.ts
    ├── playwright.config.ts
    └── components.json
```

## Core Technologies

### Frontend Stack
- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Component library (Radix UI + Tailwind)
- **Lucide React** - Icon library

### Backend Stack
- **Next.js API Routes** - RESTful API endpoints
- **PostgreSQL** - Relational database
- **Drizzle ORM 0.44.5** - Type-safe ORM
- **Zod 4.1.8** - Schema validation

### AI Integration
- **Google Generative AI (Gemini 1.5 Flash)** - Content generation and quiz creation
- **Rate limiting** - In-memory rate limiting (5/session, 20/day)

### Testing Stack
- **Vitest 3.2.4** - Unit testing
- **Playwright 1.55.0** - E2E testing
- **Contract tests** - API contract validation
- **Integration tests** - Full user flow testing

## Module Organization

### Models Layer (`src/models/`)
Defines database schema and validation schemas using Drizzle ORM and Zod:

- **schema.ts** - Drizzle table definitions and relations
  - `users` - User accounts
  - `readingContent` - Reading material
  - `readingSessions` - Reading session records
  - `comprehensionQuestions` - Quiz questions
  - `comprehensionResults` - Quiz results
  - `studyLogs` - Analytics aggregates

- **Model Files** - Each entity has its own file with:
  - Zod validation schemas
  - TypeScript types
  - Request/response schemas

### Services Layer (`src/services/`)
Contains business logic separated from API routes:

- **contentService.ts** - Content CRUD operations, word counting, validation
- **aiContentService.ts** - Gemini AI integration, rate limiting, prompt engineering
- **sessionService.ts** - Session lifecycle, WPM calculations, metrics validation
- **quizService.ts** - Quiz generation using Gemini AI, answer scoring
- **analyticsService.ts** - Statistics aggregation, trend analysis
- **rateLimitService.ts** - Redis-based rate limiting with in-memory fallback

### API Layer (`app/api/`)
RESTful endpoints following Next.js App Router conventions:

- **POST /api/content** - Create reading content
- **POST /api/content/generate** - Generate AI content
- **POST /api/sessions** - Start reading session
- **POST /api/sessions/complete** - Complete session
- **POST /api/questions** - Generate quiz questions
- **POST /api/answers** - Submit quiz answers
- **GET /api/analytics/summary** - Get analytics data
- **GET /api/health** - Health check

### Components Layer (`src/components/`)
React components organized by feature:

**Reading Modes:**
- **WordViewer.tsx** (2,200 tokens) - Word-by-word display with 60fps animations
- **ChunkViewer.tsx** (1,500 tokens) - Chunk-of-meaning groups (2-8 words)
- **ParagraphViewer.tsx** (1,400 tokens) - Paragraph highlighting

**Core Features:**
- **Reader.tsx** (2,545 tokens) - Main orchestrator for reading sessions
- **ContentInput.tsx** (2,346 tokens) - Content input/AI generation form
- **Quiz.tsx** (2,667 tokens) - Comprehension testing interface
- **Analytics.tsx** (2,665 tokens) - Progress tracking dashboard

**UI Components:**
- shadcn/ui components in `components/ui/` (button, card, input, etc.)

### Internationalization (`src/i18n/`)
Multi-language support:
- **en.ts** - English translations
- **vi.ts** - Vietnamese translations
- **index.ts** - i18n utilities

### Library Layer (`src/lib/`)
Utility functions and configurations:
- **db.ts** - Database connection and Drizzle client
- **init-db.ts** - Database initialization
- **env.ts** - Environment variable validation with Zod
- **logger.ts** - Structured JSON logging with context
- **redis.ts** - Redis client with in-memory fallback
- **accessibility.ts** - WCAG compliance utilities
- **utils.ts** - General utilities (cn, etc.)

## Key Design Patterns

### 1. Service Layer Architecture
Business logic separated from API routes:
```
API Route → Service Function → Database/External API
```

### 2. Environment Variable Validation
All environment variables validated at startup with Zod:
```typescript
// src/lib/env.ts
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  GEMINI_API_KEY: z.string().min(1),
  REDIS_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});
export const env = validateEnv(); // Fails fast on startup
```

### 3. Structured Logging
Centralized JSON logging with context:
```typescript
// src/lib/logger.ts
logger.info('API request', { method, endpoint, userId, duration });
logger.error('Operation failed', { service, operation }, error);

// Request context helper
const context = getRequestContext(request);
logger.apiRequest(method, endpoint, context);
```

### 4. Rate Limiting Architecture
Redis-based distributed rate limiting with in-memory fallback:
```typescript
// src/services/rateLimitService.ts
const result = await checkAIGenerationRateLimit(userId);
if (!result.allowed) {
  return { error: result.reason, resetAt: result.resetAt };
}
await recordAIGeneration(userId);
```

### 5. Schema-First Development
All requests/responses validated with Zod schemas:
```typescript
const validatedData = schema.parse(input);
```

### 6. Type Safety
End-to-end type safety:
- Database: Drizzle ORM generates types from schema
- Validation: Zod infers TypeScript types
- Environment: Zod-validated env exports typed interface
- API: Typed request/response interfaces

### 7. Error Handling
Consistent error handling with structured logging:
```typescript
try {
  logger.apiRequest(method, endpoint, context);
  // Validate input
  // Execute business logic
  return NextResponse.json(result);
} catch (error) {
  logger.apiError(method, endpoint, error, context);
  // Categorize errors (validation, business logic, system)
  // Return appropriate HTTP status
}
```

### 8. Test-First Development
Tests written before implementation:
- Contract tests validate API contracts
- Unit tests cover service logic
- Integration tests verify user flows

## Entry Points

1. **Development Server**: `npm run dev` → `app/page.tsx`
2. **API Endpoints**: `app/api/*/route.ts`
3. **Database Migrations**: `drizzle/migrations`
4. **Tests**: `tests/**/*.test.ts`

## Development Principles

1. **Separation of Concerns**: Clear boundaries between models, services, and API routes
2. **Type Safety**: TypeScript everywhere with strict mode, validated environment variables
3. **Validation**: All inputs and configuration validated with Zod schemas at runtime
4. **Structured Logging**: JSON logging with context, no console.log in production code
5. **Configuration Management**: Environment variables validated at startup, fail-fast pattern
6. **Rate Limiting**: Distributed rate limiting with Redis, graceful degradation to in-memory
7. **Testing**: Comprehensive test coverage (contract, unit, integration, e2e)
8. **Accessibility**: WCAG compliance, keyboard navigation, screen reader support
9. **Performance**: 60fps animations, <50ms calculations, optimized queries
10. **Error Handling**: Graceful degradation, structured error logging, user-friendly messages
11. **Code Quality**: ESLint, TypeScript strict mode, consistent formatting
12. **Security**: No secrets in logs, sanitized error messages, validated inputs

## File Statistics by Type

- **Components**: 15 files (7 UI components, 8 feature components)
- **API Routes**: 8 endpoints
- **Services**: 5 service modules
- **Models**: 7 model definitions
- **Tests**: 15 test files (7 contract, 5 integration, 3 unit)
- **Configuration**: 10 config files
- **Migrations**: 1 migration

## Top 5 Files by Complexity

1. **tests/integration/flow.analytics.test.ts** (2,803 tokens) - Comprehensive analytics flow testing
2. **src/components/Quiz.tsx** (2,667 tokens) - Quiz interface with state management
3. **src/components/Analytics.tsx** (2,665 tokens) - Analytics dashboard with charts
4. **src/components/Reader.tsx** (2,545 tokens) - Main reading session orchestrator
5. **src/components/ContentInput.tsx** (2,346 tokens) - Content input/generation form

## Dependencies Summary

### Production Dependencies (11)
- @google/generative-ai - AI content generation
- @radix-ui/* - Accessible UI primitives
- next, react, react-dom - Core framework
- drizzle-zod - Schema validation integration
- postgres - PostgreSQL driver
- tailwind-merge, clsx, class-variance-authority - Styling utilities
- lucide-react - Icons

### Development Dependencies (16)
- Testing: vitest, @playwright/test
- Database: drizzle-kit, drizzle-orm, pg, @types/pg
- Build: TypeScript, ESLint, Tailwind CSS
- Types: @types/node, @types/react, @types/react-dom
- Validation: zod

## Configuration Files

- **package.json** - Dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **next.config.ts** - Next.js configuration
- **drizzle.config.ts** - Database ORM configuration
- **vitest.config.ts** - Unit test configuration
- **playwright.config.ts** - E2E test configuration
- **components.json** - shadcn/ui configuration
- **eslint.config.mjs** - Linting rules
- **postcss.config.mjs** - PostCSS configuration
- **docker-compose.yml** - Docker services (PostgreSQL)

## Notable Patterns

1. **Centralized Schemas**: All validation schemas re-exported from `src/schemas/index.ts`
2. **Environment Validation**: Zod-based validation at startup with typed exports
3. **Structured Logging**: Consistent JSON logging with request context throughout codebase
4. **Rate Limiting**: Redis-backed with automatic in-memory fallback for resilience
5. **Service Functions**: Pure functions that can be tested independently
6. **API Route Simplicity**: API routes are thin wrappers around service functions
7. **Type Inference**: Extensive use of Zod's type inference for DRY types
8. **Component Composition**: React components follow single responsibility principle
9. **Test Organization**: Tests organized by type (contract, integration, unit)
10. **Fail-Fast Configuration**: Invalid config detected at startup, not at runtime

## Database Schema

### Tables
- **users** - User accounts with session tracking
- **reading_content** - Reading material (paste, upload, AI-generated)
- **reading_sessions** - Session records with metrics (WPM, duration)
- **comprehension_questions** - Quiz questions for sessions
- **comprehension_results** - Quiz results and scores
- **study_logs** - Aggregated analytics per user

### Enums
- **language**: en, vi
- **source**: paste, upload, ai
- **mode**: word, chunk, paragraph

### Relations
- users → reading_content (one-to-many)
- users → study_logs (one-to-one)
- reading_content → reading_sessions (one-to-many)
- reading_sessions → comprehension_questions (one-to-many)
- reading_sessions → comprehension_results (one-to-one)

## Next Steps for Exploration

1. Review `specs/001-i-want-to/` for feature specifications and design decisions
2. Check `tests/integration/` for user flow examples
3. Examine `src/services/` for core business logic
4. Study `src/models/schema.ts` for database structure
5. Review `app/api/` for API endpoint implementations

## Unresolved Questions

None identified. All core components are well-documented and functional.

---

*Generated from repomix-output.xml on 2025-10-30*
