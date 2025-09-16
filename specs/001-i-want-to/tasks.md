# Tasks: Speed Reader Web Application

**Input**: Design documents from `/specs/001-i-want-to/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, UI, endpoints
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- Single project (Next.js): `app/`, `src/`, `tests/` at repo root

## Phase 3.1: Setup

- [ ] T001 Initialize Next.js (App Router) project with TypeScript per quickstart in `./` (scaffold, App Router, Tailwind)  
       Command: `pnpm create next-app speed-reader --ts --eslint --tailwind --src-dir --app --import-alias "@/*"`
- [ ] T002 Install dependencies in `./speed-reader` (Next.js app dir): `drizzle-orm pg dotenv zod`, dev: `drizzle-kit @playwright/test vitest`
- [ ] T003 Add shadcn/ui to project (init) in `./speed-reader`  
       Command: `pnpm dlx shadcn@latest init -d`
- [ ] T004 Create `docker-compose.yml` at repo root for services: `db` (PostgreSQL), `app` (Next.js)
- [ ] T005 Configure `.env.local` and `.env` with `DATABASE_URL`, `GEMINI_API_KEY` in `./speed-reader`
- [ ] T006 [P] Add base project scripts in `./speed-reader/package.json` (dev, build, test, drizzle:generate, drizzle:migrate)
- [ ] T007 Configure Drizzle (config file) and initial migration in `./speed-reader` per data model

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

Contract tests (one per endpoint) under `tests/contract/` using Playwright APIRequest or Vitest supertest-equivalent:

- [ ] T008 [P] Contract test POST /content → `tests/contract/content.post.test.ts`
- [ ] T009 [P] Contract test POST /content/generate → `tests/contract/content.generate.post.test.ts`
- [ ] T010 [P] Contract test POST /sessions → `tests/contract/sessions.post.test.ts`
- [ ] T011 [P] Contract test POST /sessions/complete → `tests/contract/sessions.complete.post.test.ts`
- [ ] T012 [P] Contract test POST /questions → `tests/contract/questions.post.test.ts`
- [ ] T013 [P] Contract test POST /answers → `tests/contract/answers.post.test.ts`
- [ ] T014 [P] Contract test GET /analytics/summary → `tests/contract/analytics.summary.get.test.ts`

Integration tests (user stories) under `tests/integration/` using Playwright:

- [ ] T015 [P] Integration: word-by-word mode flow (paste text, set WPM, read, metrics, quiz) → `tests/integration/flow.word.test.ts`
- [ ] T016 [P] Integration: chunk-of-meaning mode flow (chunk size control, metrics) → `tests/integration/flow.chunk.test.ts`
- [ ] T017 [P] Integration: paragraph highlight mode flow (progress highlight, metrics) → `tests/integration/flow.paragraph.test.ts`
- [ ] T018 [P] Integration: AI-generate content then read then quiz → `tests/integration/flow.ai.test.ts`
- [ ] T019 [P] Integration: analytics summary across sessions → `tests/integration/flow.analytics.test.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

Models (Drizzle) in `./speed-reader/src/models/`:

- [ ] T020 [P] Create `user.ts` model (id, createdAt)
- [ ] T021 [P] Create `readingContent.ts` model (id, language, source, title?, text, wordCount, createdByUserId?, createdAt)
- [ ] T022 [P] Create `readingSession.ts` model (id, contentId, mode, paceWpm, chunkSize?, timestamps, durationMs, wordsRead, computedWpm)
- [ ] T023 [P] Create `comprehensionQuestion.ts` model (id, sessionId, index, prompt, options[4], correctIndex)
- [ ] T024 [P] Create `comprehensionResult.ts` model (id, sessionId, answers[5], scorePercent, completedAt)
- [ ] T025 [P] Create `studyLog.ts` model (userId aggregates)

Services (pure functions) in `./speed-reader/src/services/`:

- [ ] T026 Implement `contentService.ts` (create from paste/upload; compute wordCount; persist)
- [ ] T027 Implement `aiContentService.ts` (Gemini content generation with limits from research)
- [ ] T028 Implement `sessionService.ts` (start session, complete session metrics calc)
- [ ] T029 Implement `quizService.ts` (generate 5 MCQs via Gemini; structure per schema)
- [ ] T030 Implement `analyticsService.ts` (aggregate logs into summary)

API routes in `./speed-reader/app/api/`:

- [ ] T031 Implement POST `/api/content` route using `contentService`
- [ ] T032 Implement POST `/api/content/generate` route using `aiContentService`
- [ ] T033 Implement POST `/api/sessions` route using `sessionService`
- [ ] T034 Implement POST `/api/sessions/complete` route using `sessionService`
- [ ] T035 Implement POST `/api/questions` route using `quizService`
- [ ] T036 Implement POST `/api/answers` route scoring and persisting result
- [ ] T037 Implement GET `/api/analytics/summary` route using `analyticsService`

UI (shadcn/ui) in `./speed-reader/app/` and `./speed-reader/src/components/`:

- [ ] T038 Build input/upload + AI generation screen with language switch
- [ ] T039 Build reader UI components: WordViewer, ChunkViewer, ParagraphHighlighter
- [ ] T040 Build playback controls (play/pause, speed, chunk size)
- [ ] T041 Build quiz UI (5 MCQs, scoring, feedback)
- [ ] T042 Build analytics dashboard (time, WPM by mode, score trends)

Validation & Internationalization:

- [ ] T043 [P] Define Zod schemas for all request payloads per OpenAPI in `./speed-reader/src/schemas/`
- [ ] T044 [P] Add i18n resources for en/vi UI strings in `./speed-reader/src/i18n/`

## Phase 3.4: Integration

- [ ] T045 Wire Drizzle to PostgreSQL via `DATABASE_URL`; run migrations; health check endpoint
- [ ] T046 Add structured logging (server routes/services) with error context
- [ ] T047 Add basic rate limiting for AI generation per research (per-session, per-day)
- [ ] T048 Add accessibility checks (keyboard operability, focus-visible, contrast)

## Phase 3.5: Polish

- [ ] T049 [P] Unit tests for services (content, session metrics, analytics) in `./speed-reader/tests/unit/`
- [ ] T050 Performance: ensure 60fps highlight and <50ms metric calc (profiling doc)
- [ ] T051 [P] Update docs: `quickstart.md` with docker-compose and env details
- [ ] T052 [P] Add README section linking to spec, plan, contracts
- [ ] T053 Cleanup duplication and enforce DRY across services and components

## Dependencies

- Setup (T001-T007) before Tests (T008-T019)
- Tests before Core (T020-T044)
- Models (T020-T025) block Services (T026-T030)
- Services block API routes (T031-T037)
- Core before Integration (T045-T048)
- Everything before Polish (T049-T053)

## Parallel Example

```
# Launch contract tests together after setup:
Task: "Contract test POST /content"
Task: "Contract test POST /content/generate"
Task: "Contract test POST /sessions"
Task: "Contract test POST /sessions/complete"
Task: "Contract test POST /questions"
Task: "Contract test POST /answers"
Task: "Contract test GET /analytics/summary"
```

## Validation Checklist

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
