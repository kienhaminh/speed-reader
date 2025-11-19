# User Portal Implementation Plan

**Date**: 2025-11-18
**Version**: 1.0.0
**Status**: Ready for Implementation
**Estimated Effort**: 4-6 weeks (phased approach)

## Executive Summary

Comprehensive plan for implementing user portal with 4 core pages: Dashboard, Settings, Reader (relocated), and Story Challenges. Introduces XP/level gamification system, user-uploaded content comprehension questions, and progressive difficulty challenges.

**Key Features**:
- Dashboard with progress tracking, XP/level display, reading stats
- Settings page for profile, reading preferences, theme
- Reader page with AI question generation from uploaded content
- Story Challenges with 4 difficulty levels, XP rewards, unlock system

**Tech Stack Alignment**:
- Next.js 15 App Router with nested layouts
- Existing: PostgreSQL, Drizzle ORM, Google Gemini AI, shadcn/ui
- New: XP system, challenge content, user preferences storage

---

## 1. Research Findings

### 1.1 User Portal Architecture (Next.js 15)

**Key Findings**:
- App Router uses nested layouts for shared UI across portal pages
- Partial rendering preserves client state during navigation
- Server components by default, client components for interactivity
- File-based routing with folder nesting: `app/portal/[page]/page.tsx`

**Recommended Structure**:
```
app/
├── portal/
│   ├── layout.tsx          # Portal-wide layout (navigation, auth guard)
│   ├── dashboard/
│   │   └── page.tsx        # Dashboard page
│   ├── settings/
│   │   └── page.tsx        # Settings page
│   ├── reader/
│   │   └── page.tsx        # Reader page (moved from /reader)
│   └── challenges/
│       ├── page.tsx        # Challenges list
│       └── [id]/
│           └── page.tsx    # Individual challenge
```

**Benefits**:
- Shared navigation automatically available to all portal pages
- Auth guards enforced at layout level
- Preserves reading progress when switching between portal pages
- Clear separation from public marketing pages

### 1.2 XP and Gamification Systems

**Research Insights from 2025**:
- Simple schema: `user_id`, `total_xp`, `current_level`
- Event-driven: Award XP for activities (sessions, quiz scores, challenges)
- Level formula: Exponential curve prevents early saturation
- Balance autonomy (choice), value (meaning), competence (progress)

**Recommended XP Awards**:
| Activity | Base XP | Bonus Conditions |
|----------|---------|------------------|
| Complete reading session | 10 XP | +5 for >80% comprehension |
| Perfect quiz score (100%) | 25 XP | - |
| Complete story challenge | 50-200 XP | Scales with difficulty |
| Daily streak | 5 XP | Per consecutive day |
| Speed milestone | 15 XP | Per 50 WPM improvement |

**Level Progression Formula**:
```typescript
// Level N requires: 100 * N^1.5 total XP
// Level 1: 100 XP
// Level 2: 283 XP (cumulative)
// Level 5: 1,118 XP
// Level 10: 3,162 XP
const xpForLevel = (level: number) => Math.floor(100 * Math.pow(level, 1.5));
```

### 1.3 Question Generation Strategies

**Gemini 2.5 Pro Performance (2025 Research)**:
- 73.2% educator preference vs Claude, GPT-4o, o3
- Excels at educational pedagogy
- Can generate contextual questions from reading passages
- Requires prompt engineering for quality control

**Recommended Approach**:
```typescript
// Hybrid: AI generation + validation
1. User uploads content or pastes text
2. Gemini generates 5 comprehension questions
3. Validate: diversity check (factual, inferential, vocabulary)
4. Store questions with correct answers
5. Present to user after reading session
```

**Quality Metrics**:
- Question types: 40% factual recall, 40% inference, 20% vocabulary
- No duplicate answer patterns (e.g., all "C" answers)
- Clear, unambiguous correct answer
- Difficulty estimation via LLM (beginner/intermediate/advanced)

### 1.4 Level Progression & Unlock Systems

**Insights from Modern Games (2025)**:
- **Progressive unlocks**: Dead Cells "Boss Cell" system - unlock harder content after mastery
- **Adaptive difficulty**: Hades "God Mode" - assistance scales with attempts
- **Skill-based progression**: Unlock by demonstrating competence, not just grinding

**Recommended Challenge System**:
| Difficulty | Unlock Requirement | Story Count | WPM Target | XP Reward |
|------------|-------------------|-------------|------------|-----------|
| Beginner | Level 1 (default) | 5 stories | 150-250 WPM | 50 XP |
| Intermediate | Level 3 | 5 stories | 251-350 WPM | 100 XP |
| Advanced | Level 7 | 5 stories | 351-450 WPM | 150 XP |
| Expert | Level 12 | 5 stories | 451+ WPM | 200 XP |

**Unlock Logic**:
- User must reach minimum level to see difficulty tier
- Must complete 80% of previous tier to unlock next
- Leaderboard shows top 10 per difficulty (optional Phase 3)

### 1.5 User Profile & Settings Management

**Storage Strategy (Next.js Best Practices 2025)**:
- **Database**: Persistent user data (email, name, XP, level)
- **Cookies**: Secure session tokens (HttpOnly, Secure, SameSite)
- **Local Storage**: Non-sensitive preferences (default WPM, theme)

**Settings Categories**:
1. **Profile**: name, email, password change
2. **Reading Preferences**: default mode, speed, chunk size
3. **Theme**: light/dark/system (already implemented via ThemeToggle)
4. **Account**: email verification, delete account

**Database Pattern**:
```sql
-- Extend users table
ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';

-- Preferences schema (validated via Zod):
{
  defaultMode: "word" | "chunk" | "paragraph",
  defaultPaceWpm: number (150-600),
  defaultChunkSize: number (2-8),
  emailNotifications: boolean
}
```

---

## 2. Database Schema Changes

### 2.1 New Tables

#### `story_challenges`
```sql
CREATE TABLE story_challenges (
  id TEXT PRIMARY KEY,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  title VARCHAR(255) NOT NULL,
  story_text TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  target_wpm INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  unlock_level INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_challenges_difficulty ON story_challenges(difficulty);
CREATE INDEX idx_challenges_unlock_level ON story_challenges(unlock_level);
```

#### `challenge_attempts`
```sql
CREATE TABLE challenge_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES story_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP NOT NULL,
  duration_ms INTEGER NOT NULL,
  words_read INTEGER NOT NULL,
  computed_wpm INTEGER NOT NULL,
  comprehension_score INTEGER NOT NULL, -- 0-100
  xp_earned INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_attempts_user ON challenge_attempts(user_id);
CREATE INDEX idx_attempts_challenge ON challenge_attempts(challenge_id);
CREATE INDEX idx_attempts_completed ON challenge_attempts(completed_at);
```

#### `xp_transactions`
```sql
CREATE TABLE xp_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'session', 'quiz', 'challenge', 'streak', 'milestone'
  source_id TEXT, -- References session_id, challenge_id, etc.
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_xp_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_created ON xp_transactions(created_at);
```

### 2.2 Schema Modifications

#### Extend `users` table
```sql
ALTER TABLE users
  ADD COLUMN level INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN total_xp INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN preferences JSONB DEFAULT '{}' NOT NULL,
  ADD COLUMN last_active_at TIMESTAMP DEFAULT NOW() NOT NULL,
  ADD COLUMN streak_days INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN last_streak_date DATE;

-- Check constraints
ALTER TABLE users ADD CONSTRAINT check_level_positive CHECK (level > 0);
ALTER TABLE users ADD CONSTRAINT check_xp_non_negative CHECK (total_xp >= 0);
```

#### Extend `reading_content` table (for user-uploaded questions)
```sql
ALTER TABLE reading_content
  ADD COLUMN has_ai_questions BOOLEAN DEFAULT FALSE NOT NULL;
```

### 2.3 Drizzle Schema Updates

```typescript
// src/models/schema.ts additions

export const difficultyEnum = pgEnum("difficulty", [
  "beginner",
  "intermediate",
  "advanced",
  "expert"
]);

export const xpSourceEnum = pgEnum("xp_source", [
  "session",
  "quiz",
  "challenge",
  "streak",
  "milestone"
]);

export const storyChallenges = pgTable("story_challenges", {
  id: text("id").primaryKey(),
  difficulty: difficultyEnum("difficulty").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  storyText: text("story_text").notNull(),
  wordCount: integer("word_count").notNull(),
  targetWpm: integer("target_wpm").notNull(),
  xpReward: integer("xp_reward").notNull(),
  unlockLevel: integer("unlock_level").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challengeAttempts = pgTable("challenge_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: text("challenge_id").notNull(),
  completedAt: timestamp("completed_at").notNull(),
  durationMs: integer("duration_ms").notNull(),
  wordsRead: integer("words_read").notNull(),
  computedWpm: integer("computed_wpm").notNull(),
  comprehensionScore: integer("comprehension_score").notNull(),
  xpEarned: integer("xp_earned").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const xpTransactions = pgTable("xp_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  amount: integer("amount").notNull(),
  source: xpSourceEnum("source").notNull(),
  sourceId: text("source_id"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const storyChallengesRelations = relations(storyChallenges, ({ many }) => ({
  attempts: many(challengeAttempts),
}));

export const challengeAttemptsRelations = relations(challengeAttempts, ({ one }) => ({
  user: one(users, {
    fields: [challengeAttempts.userId],
    references: [users.id],
  }),
  challenge: one(storyChallenges, {
    fields: [challengeAttempts.challengeId],
    references: [storyChallenges.id],
  }),
}));

export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
  user: one(users, {
    fields: [xpTransactions.userId],
    references: [users.id],
  }),
}));
```

### 2.4 Migration Strategy

```bash
# Generate migration
pnpm drizzle-kit generate

# Migration file: drizzle/0002_add_gamification_system.sql
# Review generated SQL, then apply
pnpm drizzle-kit migrate
```

**Seed Data Required**:
- 20 story challenges (5 per difficulty level)
- Sample challenge content with varied topics
- Pre-generated comprehension questions for challenges

---

## 3. Component Architecture

### 3.1 New Components

#### Portal Layout
```typescript
// app/portal/layout.tsx
import { PortalNav } from "@/components/portal/PortalNav";
import { requireAuth } from "@/lib/auth"; // New auth utility

export default async function PortalLayout({ children }) {
  const user = await requireAuth(); // Redirects to /login if not authenticated

  return (
    <div className="min-h-screen bg-background">
      <PortalNav user={user} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
```

#### PortalNav Component
```typescript
// src/components/portal/PortalNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfile } from "@/models/user";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType;
}

const navItems: NavItem[] = [
  { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/reader", label: "Reader", icon: BookOpen },
  { href: "/portal/challenges", label: "Challenges", icon: Trophy },
  { href: "/portal/settings", label: "Settings", icon: Settings },
];

export function PortalNav({ user }: { user: UserProfile }) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/portal/dashboard" className="font-bold text-lg">
              Speed Reader
            </Link>
            <div className="hidden md:flex gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
              <span className="text-sm font-medium">Level {user.level}</span>
              <span className="text-xs text-muted-foreground">
                {user.totalXp} XP
              </span>
            </div>
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/auth/logout">Logout</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

#### Dashboard Page Components

**XP Progress Card**:
```typescript
// src/components/portal/XPProgressCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface XPProgressCardProps {
  currentLevel: number;
  totalXp: number;
  nextLevelXp: number;
}

export function XPProgressCard({ currentLevel, totalXp, nextLevelXp }: XPProgressCardProps) {
  const currentLevelXp = Math.floor(100 * Math.pow(currentLevel, 1.5));
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;
  const progress = (xpInCurrentLevel / xpNeededForNext) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Level Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-3xl font-bold">Level {currentLevel}</p>
            <p className="text-sm text-muted-foreground">{totalXp} total XP</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{xpInCurrentLevel} / {xpNeededForNext} XP</p>
            <p className="text-xs text-muted-foreground">to Level {currentLevel + 1}</p>
          </div>
        </div>
        <Progress value={progress} className="h-3" />
      </CardContent>
    </Card>
  );
}
```

**Recent Activity Card**:
```typescript
// src/components/portal/RecentActivityCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "session" | "challenge" | "milestone";
  description: string;
  xp: number;
  createdAt: Date;
}

export function RecentActivityCard({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex justify-between items-start py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <span className="text-xs font-semibold text-primary">+{activity.xp} XP</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
```

#### Settings Page Components

**ProfileSettingsForm**:
```typescript
// src/components/portal/ProfileSettingsForm.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/models/user";

export function ProfileSettingsForm({ user }: { user: UserProfile }) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      // Success feedback
      alert("Profile updated successfully");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
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
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

**ReadingPreferencesForm**:
```typescript
// src/components/portal/ReadingPreferencesForm.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Preferences {
  defaultMode: "word" | "chunk" | "paragraph";
  defaultPaceWpm: number;
  defaultChunkSize: number;
}

export function ReadingPreferencesForm({ preferences }: { preferences: Preferences }) {
  const [mode, setMode] = useState(preferences.defaultMode);
  const [wpm, setWpm] = useState(preferences.defaultPaceWpm);
  const [chunkSize, setChunkSize] = useState(preferences.defaultChunkSize);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultMode: mode,
          defaultPaceWpm: wpm,
          defaultChunkSize: chunkSize,
        }),
      });

      if (!response.ok) throw new Error("Failed to update preferences");
      alert("Preferences saved");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="mode">Default Reading Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as any)}>
              <SelectTrigger id="mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="word">Word-by-word</SelectItem>
                <SelectItem value="chunk">Chunks</SelectItem>
                <SelectItem value="paragraph">Paragraph</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="wpm">Default Speed (WPM)</Label>
            <Input
              id="wpm"
              type="number"
              min={150}
              max={600}
              step={10}
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
            />
          </div>

          {mode === "chunk" && (
            <div>
              <Label htmlFor="chunkSize">Default Chunk Size (words)</Label>
              <Input
                id="chunkSize"
                type="number"
                min={2}
                max={8}
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
              />
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### Story Challenges Components

**ChallengeCard**:
```typescript
// src/components/portal/ChallengeCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Trophy, Clock } from "lucide-react";
import Link from "next/link";

interface Challenge {
  id: string;
  title: string;
  difficulty: string;
  wordCount: number;
  targetWpm: number;
  xpReward: number;
  unlockLevel: number;
  completed: boolean;
  locked: boolean;
}

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const difficultyColors = {
    beginner: "bg-green-500/10 text-green-500",
    intermediate: "bg-blue-500/10 text-blue-500",
    advanced: "bg-orange-500/10 text-orange-500",
    expert: "bg-red-500/10 text-red-500",
  };

  return (
    <Card className={challenge.locked ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {challenge.locked && <Lock className="h-4 w-4" />}
              {challenge.title}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className={difficultyColors[challenge.difficulty]}>
                {challenge.difficulty}
              </Badge>
              {challenge.completed && (
                <Badge variant="outline" className="gap-1">
                  <Trophy className="h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{challenge.wordCount} words</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span>{challenge.xpReward} XP</span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Target: {challenge.targetWpm}+ WPM with 80%+ comprehension
        </div>

        {challenge.locked ? (
          <Button disabled className="w-full">
            Unlock at Level {challenge.unlockLevel}
          </Button>
        ) : (
          <Button className="w-full" asChild>
            <Link href={`/portal/challenges/${challenge.id}`}>
              {challenge.completed ? "Retry Challenge" : "Start Challenge"}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Reader Page with Question Generation

**QuestionGenerator Component**:
```typescript
// src/components/portal/QuestionGenerator.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function QuestionGenerator({ contentId }: { contentId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/content/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
      });

      if (!response.ok) throw new Error("Failed to generate questions");

      setGenerated(true);
      alert("Questions generated! Complete your reading to test yourself.");
    } catch (error) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Comprehension Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Generate comprehension questions from your uploaded content using AI.
          Answer them after reading to test understanding.
        </p>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || generated}
          className="w-full"
        >
          {isGenerating
            ? "Generating Questions..."
            : generated
            ? "Questions Generated ✓"
            : "Generate Questions"}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 3.2 Component Reuse Strategy

**Existing Components to Reuse**:
- `Analytics.tsx` → Use in Dashboard (as-is or with minor tweaks)
- `Reader.tsx` → Move to `/portal/reader` (minimal changes)
- `Quiz.tsx` → Reuse for challenges and user-generated questions
- `ContentInput.tsx` → Reuse in Reader page
- `AppShell.tsx` → NOT used in portal (portal has own layout)
- `ThemeToggle.tsx` → Reuse in PortalNav

**New Components Needed**:
- PortalNav (navigation bar)
- XPProgressCard (XP/level display)
- RecentActivityCard (activity feed)
- ProfileSettingsForm (profile editing)
- ReadingPreferencesForm (preferences)
- ChallengeCard (challenge display)
- QuestionGenerator (AI question gen)

---

## 4. API Endpoints Design

### 4.1 User Profile & Preferences

#### GET `/api/user/profile`
**Purpose**: Fetch current user profile
**Auth**: Required (session cookie)
**Response**:
```typescript
{
  id: string;
  email: string;
  name: string;
  level: number;
  totalXp: number;
  streakDays: number;
  createdAt: string;
}
```

#### PUT `/api/user/profile`
**Purpose**: Update user profile (name, email)
**Request**:
```typescript
{
  name?: string;
  email?: string;
}
```
**Response**: Updated user profile

#### GET `/api/user/preferences`
**Purpose**: Fetch user preferences
**Response**:
```typescript
{
  defaultMode: "word" | "chunk" | "paragraph";
  defaultPaceWpm: number;
  defaultChunkSize: number;
  emailNotifications: boolean;
}
```

#### PUT `/api/user/preferences`
**Purpose**: Update preferences
**Request**: Same as response above

### 4.2 XP & Leveling System

#### POST `/api/xp/award`
**Purpose**: Award XP for activity (internal use by other endpoints)
**Request**:
```typescript
{
  userId: string;
  amount: number;
  source: "session" | "quiz" | "challenge" | "streak" | "milestone";
  sourceId?: string;
  description: string;
}
```
**Response**:
```typescript
{
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
}
```

#### GET `/api/xp/transactions`
**Purpose**: Fetch recent XP transactions
**Query Params**: `limit=20`, `offset=0`
**Response**:
```typescript
{
  transactions: Array<{
    id: string;
    amount: number;
    source: string;
    description: string;
    createdAt: string;
  }>;
  total: number;
}
```

### 4.3 Story Challenges

#### GET `/api/challenges`
**Purpose**: List all challenges (filtered by user level)
**Query Params**: `difficulty?=beginner`
**Response**:
```typescript
{
  challenges: Array<{
    id: string;
    difficulty: string;
    title: string;
    wordCount: number;
    targetWpm: number;
    xpReward: number;
    unlockLevel: number;
    completed: boolean; // Has user completed it?
    locked: boolean; // Is it locked for user?
    bestAttempt?: {
      wpm: number;
      score: number;
    };
  }>;
}
```

#### GET `/api/challenges/[id]`
**Purpose**: Get challenge details
**Response**:
```typescript
{
  id: string;
  title: string;
  difficulty: string;
  storyText: string;
  wordCount: number;
  targetWpm: number;
  xpReward: number;
  unlockLevel: number;
  attempts: number; // User's attempt count
}
```

#### POST `/api/challenges/[id]/complete`
**Purpose**: Submit challenge completion
**Request**:
```typescript
{
  durationMs: number;
  wordsRead: number;
  comprehensionScore: number; // 0-100
}
```
**Response**:
```typescript
{
  success: boolean;
  attempt: {
    id: string;
    computedWpm: number;
    xpEarned: number;
  };
  levelUp?: {
    newLevel: number;
    newTotalXp: number;
  };
}
```

### 4.4 Question Generation

#### POST `/api/content/generate-questions`
**Purpose**: Generate comprehension questions for user-uploaded content
**Request**:
```typescript
{
  contentId: string;
}
```
**Process**:
1. Fetch content text from database
2. Call Gemini AI with prompt:
```
Generate 5 multiple-choice comprehension questions for the following text.
Include 2 factual recall, 2 inferential, and 1 vocabulary question.
Format as JSON array with: question, options (4 choices), correctIndex.

Text:
{content.text}
```
3. Validate response (diversity, quality)
4. Store questions in `comprehension_questions` table
5. Mark content as `has_ai_questions = true`

**Response**:
```typescript
{
  success: boolean;
  questionsGenerated: number;
}
```

#### GET `/api/content/[id]/questions`
**Purpose**: Fetch questions for content
**Response**:
```typescript
{
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    // correctIndex NOT included (revealed after submission)
  }>;
}
```

### 4.5 Dashboard Analytics

#### GET `/api/dashboard/stats`
**Purpose**: Fetch dashboard overview stats
**Response**:
```typescript
{
  user: {
    level: number;
    totalXp: number;
    xpForNextLevel: number;
    streakDays: number;
  };
  readingStats: {
    totalSessions: number;
    totalTimeMs: number;
    averageWpm: number;
    averageComprehension: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    xp: number;
    createdAt: string;
  }>;
  challengesCompleted: number;
  challengesAvailable: number;
}
```

---

## 5. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal**: Database schema, auth guards, basic portal structure

**Tasks**:
1. Database Migration
   - Create migration file for new tables
   - Extend `users` table with XP/level columns
   - Seed 20 story challenges (5 per difficulty)
   - Apply migration to dev database

2. Auth Utilities
   - Create `requireAuth()` helper for server components
   - Implement session validation middleware
   - Add logout endpoint

3. Portal Layout
   - Create `/app/portal/layout.tsx`
   - Build `PortalNav` component with navigation
   - Add auth guard to portal layout
   - Test navigation between placeholder pages

4. Drizzle Models
   - Add new table schemas to `src/models/schema.ts`
   - Generate Zod validation schemas
   - Export TypeScript types

**Deliverables**:
- Database with gamification schema
- Portal layout with auth protection
- Navigation between placeholder pages

**Testing**:
- Verify auth redirect when not logged in
- Verify navigation preserves state
- Database queries for new tables work

---

### Phase 2: Dashboard & Settings (Week 2-3)

**Goal**: Functional dashboard with XP display, settings management

**Tasks**:
1. Dashboard Page
   - Create `/app/portal/dashboard/page.tsx`
   - Build `XPProgressCard` component
   - Build `RecentActivityCard` component
   - Reuse `Analytics` component for reading stats
   - Implement GET `/api/dashboard/stats` endpoint

2. Settings Page
   - Create `/app/portal/settings/page.tsx`
   - Build `ProfileSettingsForm` component
   - Build `ReadingPreferencesForm` component
   - Implement PUT `/api/user/profile` endpoint
   - Implement GET/PUT `/api/user/preferences` endpoints

3. XP Service
   - Create `src/services/xpService.ts`
   - Implement `awardXP()` function
   - Implement level calculation logic
   - Implement POST `/api/xp/award` endpoint

4. User Preferences
   - Add preferences validation schema (Zod)
   - Store preferences in `users.preferences` JSONB
   - Load preferences on Reader page initialization

**Deliverables**:
- Dashboard showing XP, level, recent activity, stats
- Settings page for profile and preferences
- Working XP award system

**Testing**:
- Manual XP award correctly updates level
- Level progression formula matches expected values
- Preferences save and load correctly
- Dashboard displays accurate real-time stats

---

### Phase 3: Reader Page Migration (Week 3-4)

**Goal**: Move reader to portal, add question generation

**Tasks**:
1. Reader Page Migration
   - Move `/app/reader/page.tsx` to `/app/portal/reader/page.tsx`
   - Update imports and routes
   - Ensure existing functionality works (word/chunk/paragraph modes)
   - Add "Back to Dashboard" link

2. Question Generation
   - Build `QuestionGenerator` component
   - Implement POST `/api/content/generate-questions` endpoint
   - Create Gemini AI prompt for question generation
   - Validate question quality (diversity, clarity)
   - Store questions in `comprehension_questions` table

3. Quiz Integration
   - Fetch AI-generated questions after reading session
   - Reuse existing `Quiz` component
   - Award XP based on quiz score (25 XP for 100%)
   - Display XP earned after quiz completion

4. XP Awards for Sessions
   - Modify POST `/api/sessions/complete` to award XP
   - Base XP: 10 per session
   - Bonus: +5 if comprehension >80%
   - Track in `xp_transactions` table

**Deliverables**:
- Reader page in portal with question generation
- AI-generated questions displayed after reading
- XP awards for reading sessions and quiz performance

**Testing**:
- Question generation produces diverse, high-quality questions
- Quiz correctly validates answers
- XP awarded accurately based on performance
- Level up triggers when XP threshold crossed

---

### Phase 4: Story Challenges (Week 4-5)

**Goal**: Story challenges with difficulty tiers, unlock system

**Tasks**:
1. Challenges Service
   - Create `src/services/challengeService.ts`
   - Implement unlock logic based on user level
   - Implement completion detection
   - Calculate XP rewards

2. Challenges List Page
   - Create `/app/portal/challenges/page.tsx`
   - Build `ChallengeCard` component
   - Implement GET `/api/challenges` endpoint
   - Filter by difficulty, show locked/unlocked status

3. Individual Challenge Page
   - Create `/app/portal/challenges/[id]/page.tsx`
   - Reuse `Reader` component for challenge text
   - Generate comprehension questions for challenge
   - Track reading metrics (WPM, time)

4. Challenge Completion
   - Implement POST `/api/challenges/[id]/complete` endpoint
   - Validate performance (WPM, comprehension)
   - Award XP (50-200 based on difficulty)
   - Store attempt in `challenge_attempts` table
   - Check for level up

5. Challenge Content Seeding
   - Write or source 20 story texts (5 per difficulty)
   - Varied topics: fiction, history, science, tech
   - Pre-generate questions for each story
   - Seed into database

**Deliverables**:
- Challenges page listing all challenges
- Individual challenge pages with reading experience
- Unlock system based on level
- XP rewards for challenge completion

**Testing**:
- Locked challenges don't allow access
- Unlock requirements display correctly
- Completion awards correct XP amount
- WPM and comprehension calculated accurately
- Leaderboard data structure ready (even if UI not built)

---

### Phase 5: Polish & Testing (Week 5-6)

**Goal**: Bug fixes, performance optimization, comprehensive testing

**Tasks**:
1. Performance Optimization
   - Lazy load Analytics component
   - Optimize database queries (add indexes)
   - Cache user preferences in memory/localStorage
   - Reduce API calls with SWR or React Query

2. Error Handling
   - Add error boundaries to portal pages
   - User-friendly error messages
   - Graceful degradation if Gemini API fails
   - Retry logic for transient failures

3. Accessibility Audit
   - Keyboard navigation for all portal pages
   - ARIA labels for interactive elements
   - Screen reader testing (NVDA/VoiceOver)
   - Color contrast validation (WCAG AA)

4. Mobile Responsive
   - Test all pages on mobile (375px, 414px)
   - Adjust navigation for small screens (hamburger menu)
   - Touch targets meet 44x44px requirement
   - Horizontal scroll prevented

5. Testing Suite
   - Unit tests for XP service, challenge service
   - Integration tests for XP award flow
   - E2E tests for dashboard, settings, challenges
   - API contract tests for new endpoints

6. Documentation
   - Update README with portal features
   - Document XP system and level formula
   - API documentation for new endpoints
   - User guide for challenges and question generation

**Deliverables**:
- Optimized performance (< 250KB bundle)
- Comprehensive error handling
- WCAG AA compliant
- Mobile-responsive design
- Test coverage >80%

**Testing**:
- Run full test suite (unit, integration, E2E)
- Manual testing on multiple devices
- Accessibility audit with Lighthouse
- Performance audit (Core Web Vitals)

---

### Optional Phase 6: Leaderboard (Week 6+)

**Goal**: Social features - leaderboard, achievements (if time allows)

**Tasks**:
1. Leaderboard
   - Create `leaderboards` table (per difficulty)
   - Implement GET `/api/leaderboard` endpoint
   - Build `Leaderboard` component
   - Display top 10 users per difficulty
   - Update leaderboard on challenge completion

2. Achievements System
   - Create `achievements` table
   - Define achievement criteria (e.g., "Read 100 sessions")
   - Implement achievement check logic
   - Display earned achievements on dashboard
   - Award bonus XP for achievements

**Deliverables**:
- Leaderboard page showing top performers
- Achievements display on dashboard

---

## 6. Testing Strategy

### 6.1 Unit Tests

**XP Service** (`src/services/xpService.test.ts`):
```typescript
describe("XP Service", () => {
  test("calculates correct XP for level", () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(5)).toBe(1118);
    expect(xpForLevel(10)).toBe(3162);
  });

  test("awards XP and updates level", async () => {
    const result = await awardXP({
      userId: "user1",
      amount: 150,
      source: "session",
      description: "Completed session",
    });

    expect(result.newTotalXp).toBe(150);
    expect(result.newLevel).toBe(2);
    expect(result.leveledUp).toBe(true);
  });
});
```

**Challenge Service** (`src/services/challengeService.test.ts`):
```typescript
describe("Challenge Service", () => {
  test("locks challenges above user level", () => {
    const challenges = getChallengesForUser(userLevel3);

    const beginner = challenges.filter(c => c.difficulty === "beginner");
    const intermediate = challenges.filter(c => c.difficulty === "intermediate");
    const advanced = challenges.filter(c => c.difficulty === "advanced");

    expect(beginner.every(c => !c.locked)).toBe(true);
    expect(intermediate.every(c => !c.locked)).toBe(true);
    expect(advanced.every(c => c.locked)).toBe(true);
  });

  test("awards correct XP for difficulty", () => {
    expect(calculateChallengeXP("beginner")).toBe(50);
    expect(calculateChallengeXP("expert")).toBe(200);
  });
});
```

### 6.2 Integration Tests

**XP Award Flow** (`tests/integration/xp-award-flow.test.ts`):
```typescript
test("completing session awards XP and levels up user", async () => {
  // 1. Create user (level 1, 0 XP)
  const user = await createTestUser();

  // 2. Complete reading session (awards 10 XP)
  await completeSession(user.id);

  // 3. Complete quiz with 100% (awards 25 XP)
  await submitQuiz(user.id, { score: 100 });

  // 4. Check user XP and level
  const updatedUser = await getUser(user.id);
  expect(updatedUser.totalXp).toBe(35);
  expect(updatedUser.level).toBe(1); // Still level 1 (needs 100 XP)

  // 5. Complete challenge (awards 50 XP)
  await completeChallenge(user.id, "beginner-1");

  // 6. Check level up
  const finalUser = await getUser(user.id);
  expect(finalUser.totalXp).toBe(85);
  expect(finalUser.level).toBe(1);

  // 7. Award 15 more XP to trigger level up
  await awardXP(user.id, 15, "milestone");

  const leveledUpUser = await getUser(user.id);
  expect(leveledUpUser.totalXp).toBe(100);
  expect(leveledUpUser.level).toBe(2);
});
```

**Challenge Completion Flow** (`tests/integration/challenge-completion.test.ts`):
```typescript
test("user completes beginner challenge and earns XP", async () => {
  const user = await createTestUser({ level: 1 });
  const challenge = await getChallenge("beginner-1");

  // Start challenge reading session
  const session = await startChallengeSession(user.id, challenge.id);

  // Simulate reading (250 WPM, 200 words = 48 seconds)
  await wait(48000);

  // Complete with high comprehension
  const result = await completeChallenge(user.id, challenge.id, {
    durationMs: 48000,
    wordsRead: 200,
    comprehensionScore: 90,
  });

  expect(result.success).toBe(true);
  expect(result.xpEarned).toBe(50);
  expect(result.computedWpm).toBeGreaterThanOrEqual(250);
});
```

### 6.3 E2E Tests

**Dashboard Page** (`tests/e2e/dashboard.spec.ts`):
```typescript
test("dashboard displays user XP, level, and recent activity", async ({ page }) => {
  await page.goto("/portal/dashboard");

  // Check XP progress card
  await expect(page.locator('text="Level 3"')).toBeVisible();
  await expect(page.locator('text="450 total XP"')).toBeVisible();

  // Check recent activity
  await expect(page.locator('text="Completed Word Reading Session"')).toBeVisible();
  await expect(page.locator('text="+10 XP"')).toBeVisible();
});
```

**Settings Page** (`tests/e2e/settings.spec.ts`):
```typescript
test("user updates reading preferences", async ({ page }) => {
  await page.goto("/portal/settings");

  // Change default mode
  await page.selectOption('select#mode', 'chunk');

  // Change default WPM
  await page.fill('input#wpm', '300');

  // Save
  await page.click('button:has-text("Save Preferences")');

  // Verify success
  await expect(page.locator('text="Preferences saved"')).toBeVisible();

  // Reload and verify persistence
  await page.reload();
  await expect(page.locator('select#mode')).toHaveValue('chunk');
  await expect(page.locator('input#wpm')).toHaveValue('300');
});
```

**Story Challenges** (`tests/e2e/challenges.spec.ts`):
```typescript
test("user views and completes unlocked challenge", async ({ page }) => {
  await page.goto("/portal/challenges");

  // Check beginner challenges are unlocked
  const beginnerCard = page.locator('[data-difficulty="beginner"]').first();
  await expect(beginnerCard.locator('text="Locked"')).not.toBeVisible();

  // Start challenge
  await beginnerCard.locator('button:has-text("Start Challenge")').click();

  // Read story
  await expect(page.locator('text="Once upon a time"')).toBeVisible();
  await page.click('button:has-text("Start Reading")');

  // Wait for reading to complete
  await page.waitForSelector('text="Reading Complete"', { timeout: 60000 });

  // Answer quiz questions
  await page.click('[data-question="0"] [data-option="0"]');
  await page.click('[data-question="1"] [data-option="2"]');
  // ... answer remaining questions

  // Submit
  await page.click('button:has-text("Submit Answers")');

  // Verify XP award
  await expect(page.locator('text="+50 XP"')).toBeVisible();
});
```

### 6.4 API Contract Tests

**Challenges API** (`tests/contract/challenges.test.ts`):
```typescript
test("GET /api/challenges returns valid schema", async () => {
  const response = await fetch("/api/challenges");
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data).toMatchSchema({
    challenges: arrayOf({
      id: "string",
      difficulty: oneOf(["beginner", "intermediate", "advanced", "expert"]),
      title: "string",
      wordCount: "number",
      targetWpm: "number",
      xpReward: "number",
      unlockLevel: "number",
      completed: "boolean",
      locked: "boolean",
    }),
  });
});
```

---

## 7. UI/UX Wireframes (Text Descriptions)

### 7.1 Dashboard Page

**Layout**:
```
+----------------------------------------------------------+
| [Logo] Dashboard | Reader | Challenges | Settings      |
|                                    [Level 3] [450 XP] [🌙]|
+----------------------------------------------------------+

+------------------------+  +--------------------------------+
| XP Progress Card       |  | Reading Stats Card             |
| [Trophy Icon]          |  | [Chart Icon]                   |
| Level 3                |  | Total Sessions: 24             |
| 450 / 1,118 XP         |  | Avg WPM: 320                   |
| [===========>    ] 40% |  | Avg Comprehension: 85%         |
| to Level 4             |  | Total Time: 4h 32m             |
+------------------------+  +--------------------------------+

+----------------------------------------------------------+
| Recent Activity                                          |
| [Scroll Area - 300px]                                    |
| • Completed Beginner Challenge "The Lost Key"  +50 XP   |
|   2 hours ago                                            |
| • Aced comprehension quiz (100%)               +25 XP   |
|   1 day ago                                              |
| • Completed Word Reading Session               +10 XP   |
|   2 days ago                                             |
+----------------------------------------------------------+

+----------------------------------------------------------+
| Quick Actions                                            |
| [Start Reading] [View Challenges] [Change Settings]     |
+----------------------------------------------------------+
```

**Interactions**:
- XP progress bar animates on mount (150ms)
- Recent activity scrollable, shows last 10 items
- Quick action buttons navigate to respective pages

### 7.2 Settings Page

**Layout**:
```
+----------------------------------------------------------+
| [Logo] Dashboard | Reader | Challenges | Settings      |
+----------------------------------------------------------+

+----------------------------------------------------------+
| Profile Information                                      |
| Name:     [John Doe________________]                    |
| Email:    [john@example.com_______]                     |
| [Save Changes]                                           |
+----------------------------------------------------------+

+----------------------------------------------------------+
| Reading Preferences                                      |
| Default Mode:      [Dropdown: Word-by-word ▼]           |
| Default Speed:     [300] WPM (150-600)                  |
| Default Chunk Size: [4] words (2-8)                     |
| [Save Preferences]                                       |
+----------------------------------------------------------+

+----------------------------------------------------------+
| Theme Preferences                                        |
| Theme: [Light] [Dark] [System]  (Active: Dark)          |
+----------------------------------------------------------+

+----------------------------------------------------------+
| Account Actions                                          |
| [Change Password] [Verify Email] [Delete Account]       |
+----------------------------------------------------------+
```

**Interactions**:
- Form fields validate on blur
- Save buttons show loading state
- Success messages appear briefly (3s fade-out)

### 7.3 Story Challenges Page

**Layout**:
```
+----------------------------------------------------------+
| [Logo] Dashboard | Reader | Challenges | Settings      |
+----------------------------------------------------------+

+----------------------------------------------------------+
| Story Challenges                                         |
| Filter: [All Difficulties ▼]  Sort: [XP Reward ▼]      |
+----------------------------------------------------------+

Beginner Challenges (5/5 Completed)
+------------------------+  +------------------------+
| [Trophy✓] The Lost Key|  | [Trophy✓] Morning Walk|
| [Green Badge] Beginner |  | [Green Badge] Beginner |
| 200 words | 50 XP      |  | 180 words | 50 XP      |
| Target: 150+ WPM       |  | Target: 150+ WPM       |
| [Retry Challenge]      |  | [Retry Challenge]      |
+------------------------+  +------------------------+

Intermediate Challenges (2/5 Completed)
+------------------------+  +------------------------+
| Space Exploration      |  | [Trophy✓] Ocean Deep  |
| [Blue Badge] Intermed. |  | [Blue Badge] Intermed. |
| 350 words | 100 XP     |  | 320 words | 100 XP     |
| Target: 251+ WPM       |  | Target: 251+ WPM       |
| [Start Challenge]      |  | [Retry Challenge]      |
+------------------------+  +------------------------+

Advanced Challenges (0/5 Completed)
+------------------------+  +------------------------+
| [Lock🔒] Quantum Phys. |  | [Lock🔒] Ancient Rome |
| [Orange] Advanced      |  | [Orange] Advanced      |
| 500 words | 150 XP     |  | 480 words | 150 XP     |
| Unlock at Level 7      |  | Unlock at Level 7      |
| [Locked]               |  | [Locked]               |
+------------------------+  +------------------------+
```

**Interactions**:
- Cards have hover effect (scale 1.02, shadow)
- Locked cards have reduced opacity, non-clickable
- Completed cards show trophy badge
- Filter/sort update grid immediately

### 7.4 Individual Challenge Page

**Layout**:
```
+----------------------------------------------------------+
| [← Back to Challenges]                                   |
+----------------------------------------------------------+

+----------------------------------------------------------+
| The Lost Key                                             |
| [Green Badge] Beginner | 200 words | Target: 150+ WPM    |
| Reward: 50 XP with 80%+ comprehension                   |
+----------------------------------------------------------+

+----------------------------------------------------------+
| Reading Mode: [Word-by-word ▼]  Speed: [250] WPM       |
| [Start Reading]                                          |
+----------------------------------------------------------+

[Story text appears here after starting]
Once upon a time, in a small village nestled between
rolling hills, there lived a young girl named Emma...

+----------------------------------------------------------+
| Progress: [===========>           ] 60% (120/200 words) |
| Time: 28s | WPM: 257                                     |
+----------------------------------------------------------+

[After completion, Quiz appears]
+----------------------------------------------------------+
| Comprehension Quiz                                       |
| Question 1/5: What was Emma searching for?              |
| ○ A treasure chest                                       |
| ● A lost key                                            |
| ○ Her pet dog                                           |
| ○ A magic wand                                          |
|                                              [Next →]    |
+----------------------------------------------------------+
```

**Interactions**:
- Reading mode selector pre-populated with user preference
- Progress bar updates in real-time
- Quiz navigation prevents skipping questions
- Result screen shows XP earned, WPM, comprehension score

---

## 8. Risks and Mitigation

### 8.1 Technical Risks

**Risk 1: Gemini AI Question Generation Quality**
- **Impact**: Low-quality questions frustrate users
- **Likelihood**: Medium
- **Mitigation**:
  - Prompt engineering with examples
  - Validation layer (check diversity, clarity)
  - Fallback to manual questions if AI fails
  - User feedback mechanism to flag bad questions

**Risk 2: XP System Imbalance**
- **Impact**: Users level too fast/slow, lose engagement
- **Likelihood**: Medium
- **Mitigation**:
  - Start with conservative XP awards
  - Monitor analytics (avg time to level up)
  - Adjust XP values in Phase 5 based on data
  - Exponential level formula prevents early saturation

**Risk 3: Database Performance with Large User Base**
- **Impact**: Slow queries degrade UX
- **Likelihood**: Low (small initial user base)
- **Mitigation**:
  - Indexes on frequently queried columns (user_id, created_at)
  - Pagination for activity feeds, leaderboards
  - Caching for dashboard stats (Redis or in-memory)
  - Database query optimization in Phase 5

**Risk 4: Auth Session Management Complexity**
- **Impact**: Security vulnerabilities, session bugs
- **Likelihood**: Low
- **Mitigation**:
  - Use established auth library (Better Auth or NextAuth)
  - Follow security best practices (HttpOnly cookies, CSRF protection)
  - Session expiry and refresh token flow
  - Thorough testing of auth flows

### 8.2 Product Risks

**Risk 5: Feature Scope Creep**
- **Impact**: Delays launch, incomplete features
- **Likelihood**: High
- **Mitigation**:
  - Strict phase boundaries
  - MVP-first approach (leaderboard is optional Phase 6)
  - Regular scope review meetings
  - Document feature requests for post-launch

**Risk 6: User Engagement Lower Than Expected**
- **Impact**: Gamification doesn't increase retention
- **Likelihood**: Medium
- **Mitigation**:
  - A/B test XP values and level progression
  - User interviews to understand motivation
  - Add social features (leaderboard, achievements)
  - Iterate based on analytics (daily active users, session length)

### 8.3 Design Risks

**Risk 7: Portal Navigation Confusion**
- **Impact**: Users can't find features, poor UX
- **Likelihood**: Low
- **Mitigation**:
  - Clear, consistent navigation in PortalNav
  - Breadcrumbs for nested pages (challenge detail)
  - User testing with 5-10 beta users
  - Analytics tracking for page flow, drop-off points

**Risk 8: Mobile Responsiveness Issues**
- **Impact**: Poor mobile experience
- **Likelihood**: Medium
- **Mitigation**:
  - Mobile-first design approach
  - Test on real devices (iPhone, Android)
  - Responsive breakpoints at 640px, 768px, 1024px
  - Touch target size validation (44x44px minimum)

---

## 9. Success Metrics

### 9.1 User Engagement Metrics

| Metric | Baseline (Current) | Target (Post-Launch) | Measurement |
|--------|-------------------|---------------------|-------------|
| Daily Active Users | N/A | 100+ | Analytics |
| Avg Session Length | 5 min | 8 min | Session tracking |
| Sessions per User/Week | 2 | 4 | Database query |
| Challenge Completion Rate | N/A | 60% | Attempts / Starts |
| Quiz Completion Rate | 70% | 85% | Completions / Sessions |

### 9.2 Gamification Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Avg Time to Level 2 | 3-5 sessions | XP transactions |
| Avg Time to Level 5 | 2 weeks | XP transactions |
| % Users Above Level 3 | 40% | User table query |
| XP Transactions per User/Week | 5+ | Transactions count |
| Challenge Retry Rate | 20% | Duplicate attempts |

### 9.3 Feature Adoption Metrics

| Feature | Adoption Target | Measurement |
|---------|----------------|-------------|
| AI Question Generation | 40% of uploaded content | Content table flag |
| Settings Customization | 60% of users | Preferences != default |
| Story Challenges Started | 70% of users | Attempt count |
| Dashboard Daily Visits | 50% of active users | Page views |

### 9.4 Performance Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Dashboard Load Time (P50) | < 1.2s | Lighthouse |
| Challenge Page Load (P50) | < 1.5s | Lighthouse |
| API Response Time (P95) | < 300ms | Server logs |
| Bundle Size (First Load JS) | < 250 KB | Next.js build |
| Lighthouse Score | 90+ | Lighthouse CI |

### 9.5 Quality Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Test Coverage | > 80% | Vitest coverage |
| E2E Test Pass Rate | 100% | Playwright |
| Accessibility Score | 95+ | axe DevTools |
| Error Rate | < 0.5% | Sentry/logs |
| User-Reported Bugs | < 5/week | Issue tracker |

---

## 10. Post-Launch Iterations

### Iteration 1: Analytics & Insights (Month 2)
- Add detailed reading analytics (WPM over time, mode comparison)
- Export data feature (CSV download)
- Weekly email summary of progress
- Personalized recommendations ("Try Advanced challenges!")

### Iteration 2: Social Features (Month 3)
- Leaderboard (global, friends, difficulty-specific)
- Achievement badges (50 sessions, 1000 WPM, etc.)
- Social sharing (post progress to Twitter, LinkedIn)
- Challenge creation by users (UGC)

### Iteration 3: Mobile App (Month 4+)
- React Native app for iOS/Android
- Offline reading mode
- Push notifications for streaks, challenges
- Sync with web progress

### Iteration 4: Content Expansion (Ongoing)
- 100+ story challenges (20 per difficulty)
- Themed challenge packs (sci-fi, history, tech)
- Partnerships with content creators
- Daily challenge rotation

---

## Appendix A: Database Schema ERD (Text Format)

```
users
├── id (PK)
├── email (UNIQUE)
├── passwordHash
├── name
├── level ← NEW
├── totalXp ← NEW
├── preferences (JSONB) ← NEW
├── streakDays ← NEW
├── lastStreakDate ← NEW
└── createdAt

reading_content
├── id (PK)
├── text
├── wordCount
├── hasAiQuestions ← NEW
└── createdByUserId (FK → users.id)

reading_sessions
├── id (PK)
├── userId (FK → users.id)
├── contentId (FK → reading_content.id)
├── mode
├── paceWpm
├── computedWpm
└── durationMs

comprehension_questions
├── id (PK)
├── sessionId (FK → reading_sessions.id)
├── prompt
├── options (JSON)
└── correctIndex

story_challenges ← NEW
├── id (PK)
├── difficulty (ENUM)
├── title
├── storyText
├── wordCount
├── targetWpm
├── xpReward
└── unlockLevel

challenge_attempts ← NEW
├── id (PK)
├── userId (FK → users.id)
├── challengeId (FK → story_challenges.id)
├── completedAt
├── computedWpm
├── comprehensionScore
└── xpEarned

xp_transactions ← NEW
├── id (PK)
├── userId (FK → users.id)
├── amount
├── source (ENUM)
├── sourceId
└── createdAt
```

---

## Appendix B: API Endpoint Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/user/profile` | Fetch user profile | ✓ |
| PUT | `/api/user/profile` | Update profile | ✓ |
| GET | `/api/user/preferences` | Fetch preferences | ✓ |
| PUT | `/api/user/preferences` | Update preferences | ✓ |
| POST | `/api/xp/award` | Award XP (internal) | ✓ |
| GET | `/api/xp/transactions` | Fetch XP history | ✓ |
| GET | `/api/challenges` | List challenges | ✓ |
| GET | `/api/challenges/[id]` | Get challenge detail | ✓ |
| POST | `/api/challenges/[id]/complete` | Submit completion | ✓ |
| POST | `/api/content/generate-questions` | Generate AI questions | ✓ |
| GET | `/api/content/[id]/questions` | Fetch questions | ✓ |
| GET | `/api/dashboard/stats` | Dashboard overview | ✓ |

---

## Appendix C: XP Award Reference

| Activity | Base XP | Bonus Conditions | Total Range |
|----------|---------|------------------|-------------|
| Reading session | 10 | +5 for >80% comprehension | 10-15 |
| Perfect quiz (100%) | 25 | - | 25 |
| Good quiz (80-99%) | 15 | - | 15 |
| Beginner challenge | 50 | - | 50 |
| Intermediate challenge | 100 | - | 100 |
| Advanced challenge | 150 | - | 150 |
| Expert challenge | 200 | - | 200 |
| Daily streak (each day) | 5 | - | 5 |
| Speed milestone | 15 | Per 50 WPM increase | 15 |

---

## Appendix D: Level Progression Table

| Level | Cumulative XP Required | XP from Previous Level |
|-------|------------------------|------------------------|
| 1 | 0 | - |
| 2 | 100 | 100 |
| 3 | 283 | 183 |
| 4 | 520 | 237 |
| 5 | 1,118 | 598 |
| 7 | 1,838 | 720 |
| 10 | 3,162 | 1,324 |
| 12 | 4,157 | 995 |
| 15 | 5,809 | 1,652 |
| 20 | 8,944 | 3,135 |

---

## Unresolved Questions

1. **Challenge Content Sourcing**: Where to source/generate 20 high-quality story texts? Options: Write manually, use public domain texts, generate with AI, hire writers.

2. **Leaderboard Privacy**: Should leaderboards show real names or usernames? Privacy concerns vs social engagement.

3. **XP Award Balance**: Are XP values properly balanced for engagement? Requires analytics after launch to fine-tune.

4. **Question Generation Fallback**: If Gemini API fails, should we show pre-generated questions, skip quiz, or retry?

5. **Mobile Navigation**: Hamburger menu or bottom tab bar for mobile portal navigation?

6. **Streak Reset Logic**: Should missed days reset streak to 0 or allow 1-day grace period?

7. **Challenge Unlocking**: Allow users to "skip" locked challenges with XP cost, or strictly enforce level requirements?

---

**Plan Status**: ✅ Ready for Implementation
**Next Steps**: Review with main agent, proceed to Phase 1 implementation
**Document Version**: 1.0.0
**Last Updated**: 2025-11-18
