# Phase 0 Research: Speed Reader Web Application

## Unknowns Resolved & Decisions

1. Text Input Formats

- Decision: Support paste and .txt file upload in MVP; no .docx/.pdf.
- Rationale: Simplifies parsing; avoids heavy dependencies.
- Alternatives: Accept .docx/.pdf (rejected for complexity and scope).

2. Maximum Content Size

- Decision: Limit to 2,000 words (~10,000 chars) per session.
- Rationale: Ensures performant rendering and AI cost control.
- Alternatives: No limit (rejected due to performance and safety).

3. Chunking Strategy ("chunk-of-meaning")

- Decision: Rule-based chunking by punctuation and word count; user-adjustable chunk size (2–8 words).
- Rationale: Deterministic, fast, offline; no ML dependency.
- Alternatives: Semantic chunking via AI (deferred; adds latency/cost).

4. Reading Pace (WPM)

- Decision: Default 300 WPM; min 100; max 1200.
- Rationale: Common speed-reading ranges; covers beginners to advanced.
- Alternatives: Adaptive auto-speed (deferred; needs telemetry/UX research).

5. Highlighting Mode (paragraph)

- Decision: Smooth progressive highlight of current word/chunk with keyboard controls.
- Rationale: Reduces eye saccades; accessible via keyboard.
- Alternatives: Full-screen RSVP only (rejected; lacks context for paragraph mode).

6. AI Content Generation (Gemini)

- Decision: Use Gemini AI API; prompt with topic, language (en/vi), approximate length (target words).
- Rationale: Aligns with stack; supports bilingual generation.
- Alternatives: Local LLM (rejected for quality/cost initially).

7. Quiz Generation

- Decision: 5 multiple-choice questions (4 options each) targeting main ideas and details.
- Rationale: Quick, objective scoring; low friction UX.
- Alternatives: Free-text grading (deferred; requires rubric and evaluation).

8. Rate Limits

- Decision: Max 5 AI generations per session; 50 per user per day.
- Rationale: Control cost/abuse; predictable UX.
- Alternatives: Unlimited (rejected for cost risk).

9. Data Retention & Identity

- Decision: Anonymous by default with device-scoped ID; retain logs 180 days; users may clear data.
- Rationale: Privacy-friendly MVP; sufficient for trends.
- Alternatives: Mandatory auth (deferred; adds friction).

10. Accessibility

- Decision: Keyboard operable controls; focus-visible; color contrast AA; scalable text.
- Rationale: Baseline accessibility without heavy lift.
- Alternatives: Full WCAG AA coverage (deferred; iterate post-MVP).

11. Error Handling

- Decision: Clear, actionable messages; retry for AI/network; local autosave of session progress.
- Rationale: Resilient UX.

12. Local-First Dev

- Decision: docker-compose with services: db (PostgreSQL), app (Next.js) with env injection.
- Rationale: Single-command spin-up; parity across machines.

## Best Practices Summary

- Next.js App Router, server actions for data ops.
- Drizzle ORM schema-first with migrations; strict typing.
- shadcn/ui with composition; minimal custom variants for performance.
- Zod for input validation at boundaries.
- Playwright for E2E of key flows (reading modes, quiz, analytics).

## Open Questions (Deferred)

- Sign-in options (email/OAuth) and data sync across devices.
- Advanced AI: semantic chunking, adaptive speed, free-text grading.
- Export/share of analytics and sessions.
