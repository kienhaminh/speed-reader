# Phase 1: Data Model

## Entities & Fields

### User

- id: string (device/user identifier)
- createdAt: datetime

Notes: Anonymous by default; may later link to auth account.

### ReadingContent

- id: string
- language: enum('en','vi')
- source: enum('paste','upload','ai')
- title: string | null
- text: string
- wordCount: integer
- createdByUserId: string | null
- createdAt: datetime

### ReadingSession

- id: string
- contentId: string (FK → ReadingContent)
- mode: enum('word','chunk','paragraph')
- paceWpm: integer
- chunkSize: integer | null
- startedAt: datetime
- endedAt: datetime | null
- durationMs: integer
- wordsRead: integer
- computedWpm: integer

### ComprehensionQuestion

- id: string
- sessionId: string (FK → ReadingSession)
- index: integer (1..5)
- prompt: string
- options: string[4]
- correctIndex: integer (0..3)

### ComprehensionResult

- id: string
- sessionId: string (FK → ReadingSession)
- answers: integer[5]
- scorePercent: integer (0..100)
- completedAt: datetime

### StudyLog (derived/aggregated)

- id: string
- userId: string
- totalTimeMs: integer
- averageWpmByMode: map<mode, integer>
- averageScorePercent: integer
- sessionsCount: integer
- updatedAt: datetime

## Relationships

- User 1..\* ReadingContent
- ReadingContent 1..\* ReadingSession
- ReadingSession 1..5 ComprehensionQuestion
- ReadingSession 1..1 ComprehensionResult
- User 1..1 StudyLog (aggregated)

## Validation Rules

- language ∈ {en, vi}
- paceWpm ∈ [100, 1200]
- chunkSize ∈ [2, 8] when mode='chunk'
- questions: exactly 5 per session; 4 options each
