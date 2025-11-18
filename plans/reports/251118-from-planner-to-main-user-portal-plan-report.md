# Planning Report: User Portal Implementation

**From**: Planner Agent
**To**: Main Agent
**Date**: 2025-11-18
**Status**: Complete
**Plan Document**: `/home/user/speed-reader/plans/251118-user-portal-implementation-plan.md`

---

## Executive Summary

Comprehensive implementation plan created for user portal with 4 core pages (Dashboard, Settings, Reader, Story Challenges), XP/gamification system, AI question generation, and progressive difficulty challenges.

**Estimated Effort**: 4-6 weeks across 5 phases
**Complexity**: Medium-High (new database schema, gamification logic, AI integration)
**Risk Level**: Medium (balanced with mitigation strategies)

---

## Key Deliverables

### 1. Database Schema Design
- **3 new tables**: `story_challenges`, `challenge_attempts`, `xp_transactions`
- **Extended `users` table**: Added `level`, `total_xp`, `preferences`, `streak_days`
- **Migration strategy**: Drizzle migration with seed data for 20 story challenges
- **Indexes**: Optimized for common queries (user_id, created_at, difficulty)

### 2. Portal Architecture
- **Next.js 15 App Router**: Nested layout at `app/portal/layout.tsx`
- **4 pages**: dashboard, settings, reader, challenges (+ individual challenge detail)
- **Auth guards**: Server-side `requireAuth()` at layout level
- **Navigation**: `PortalNav` component with XP/level display

### 3. Component Design
- **8 new components**: PortalNav, XPProgressCard, RecentActivityCard, ProfileSettingsForm, ReadingPreferencesForm, ChallengeCard, QuestionGenerator
- **Reuse existing**: Analytics (dashboard), Reader (portal/reader), Quiz (challenges), ThemeToggle (nav)
- **Responsive**: Mobile-first, 44x44px touch targets, WCAG AA compliant

### 4. API Endpoints
- **12 new endpoints**: User profile, preferences, XP transactions, challenges, question generation, dashboard stats
- **RESTful design**: GET/PUT for resources, POST for actions
- **Auth**: All endpoints require valid session

### 5. Gamification System
- **XP sources**: Sessions (10-15 XP), quizzes (15-25 XP), challenges (50-200 XP), streaks (5 XP/day)
- **Level formula**: Exponential curve `100 * N^1.5` prevents early saturation
- **Unlocks**: Challenges locked by level requirement (Beginner: L1, Intermediate: L3, Advanced: L7, Expert: L12)

### 6. Testing Strategy
- **Unit tests**: XP service, challenge service (level calculations, unlock logic)
- **Integration tests**: XP award flow, challenge completion flow
- **E2E tests**: Dashboard, settings, challenges (Playwright)
- **Target coverage**: >80%

---

## Research Findings Summary

### 1. Next.js 15 App Router (2025 Best Practices)
- Nested layouts preserve state during navigation
- Partial rendering only updates page components, not layouts
- Server components by default for better performance
- File-based routing with folder nesting

### 2. Gamification Systems
- Simple schema: user_id + total_xp + level
- Event-driven XP awards tracked in transactions table
- Balance autonomy, value, competence for motivation
- Exponential level curve standard for learning apps

### 3. AI Question Generation
- Gemini 2.5 Pro: 73.2% educator preference (2025 research)
- Hybrid approach: AI generation + validation layer
- Quality metrics: 40% factual, 40% inference, 20% vocabulary
- Fallback to pre-generated questions if AI fails

### 4. Challenge Progression
- Progressive unlocks based on level (Dead Cells pattern)
- Difficulty tiers: Beginner (L1), Intermediate (L3), Advanced (L7), Expert (L12)
- Performance-based XP rewards (WPM + comprehension)
- Leaderboard optional (Phase 6)

### 5. Settings Management
- Database: Persistent user data (profile, XP, level)
- Cookies: Secure session tokens (HttpOnly, Secure, SameSite)
- Local Storage: Non-sensitive preferences (default WPM, theme)
- JSONB column for flexible preferences schema

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Focus**: Database schema, auth, portal structure

**Critical Tasks**:
1. Generate and apply database migration
2. Seed 20 story challenges (5 per difficulty)
3. Create `app/portal/layout.tsx` with `PortalNav`
4. Implement `requireAuth()` server utility
5. Add Drizzle schemas for new tables

**Deliverable**: Portal accessible with auth protection, navigation works

---

### Phase 2: Dashboard & Settings (Week 2-3)
**Focus**: XP display, settings management

**Critical Tasks**:
1. Build dashboard page with XP progress, recent activity, stats
2. Reuse Analytics component for reading stats
3. Build settings page with profile and preferences forms
4. Implement XP service (award, calculate level)
5. Create API endpoints: `/api/dashboard/stats`, `/api/user/*`, `/api/xp/*`

**Deliverable**: Dashboard shows XP/level, settings save/load preferences

---

### Phase 3: Reader Migration (Week 3-4)
**Focus**: Move reader to portal, AI question generation

**Critical Tasks**:
1. Move `/app/reader` to `/app/portal/reader`
2. Build `QuestionGenerator` component
3. Implement `/api/content/generate-questions` (Gemini integration)
4. Validate question quality (diversity, clarity)
5. Award XP for sessions (10-15 XP) and quizzes (15-25 XP)

**Deliverable**: Reader in portal, AI questions generated from uploads, XP awarded

---

### Phase 4: Story Challenges (Week 4-5)
**Focus**: Challenge system with unlock logic

**Critical Tasks**:
1. Build challenges list page (`/portal/challenges`)
2. Build individual challenge page (`/portal/challenges/[id]`)
3. Implement unlock logic based on user level
4. Create challenge completion endpoint
5. Award XP for challenges (50-200 XP by difficulty)

**Deliverable**: Challenges accessible, unlock system works, XP awarded

---

### Phase 5: Polish & Testing (Week 5-6)
**Focus**: Performance, accessibility, testing

**Critical Tasks**:
1. Optimize performance (lazy load Analytics, add indexes)
2. Accessibility audit (keyboard nav, ARIA, contrast)
3. Mobile responsive testing (375px, 414px)
4. Write unit, integration, E2E tests
5. Error handling and user feedback

**Deliverable**: Production-ready portal with >80% test coverage

---

## Critical Success Factors

### 1. XP Balance
- **Risk**: Users level too fast/slow, lose engagement
- **Mitigation**: Start conservative, monitor analytics, adjust in Phase 5
- **Key Metric**: Avg time to Level 5 = 2 weeks

### 2. Question Quality
- **Risk**: AI generates low-quality questions
- **Mitigation**: Prompt engineering, validation layer, user feedback
- **Key Metric**: Quiz completion rate = 85%+

### 3. Challenge Content
- **Risk**: Insufficient story variety
- **Solution**: Seed 20 diverse stories, plan content expansion (Iteration 4)
- **Key Metric**: Challenge completion rate = 60%+

### 4. Mobile UX
- **Risk**: Portal unusable on mobile
- **Mitigation**: Mobile-first design, test on real devices
- **Key Metric**: Mobile bounce rate <30%

---

## Recommended Next Steps

### Immediate Actions
1. **Review plan** with stakeholders/team
2. **Decide on challenge content sourcing**: Manual writing vs AI generation vs public domain
3. **Allocate time** for Phase 1 (2 weeks)
4. **Set up development environment** (branch: `feature/user-portal`)

### Before Starting Phase 1
1. **Confirm database migration strategy**: Review generated SQL before applying
2. **Prepare seed data**: Write/source 20 story texts (200-500 words each)
3. **Pre-generate challenge questions**: 5 questions per story (100 total)
4. **Design mockups** (optional): Visual designs for dashboard, challenges (or proceed with wireframes)

### During Implementation
1. **Phase boundaries**: Complete each phase before starting next
2. **Testing discipline**: Write tests alongside implementation
3. **Code reviews**: Review all portal code for security, performance
4. **Analytics setup**: Track user engagement metrics from Day 1

---

## Key Decisions Required

### 1. Challenge Content Sourcing (Phase 1)
**Options**:
- A) Write manually (high quality, time-consuming)
- B) Use public domain texts (free, may lack variety)
- C) Generate with AI (fast, requires editing)
- D) Hire writers ($$, professional quality)

**Recommendation**: Hybrid B+C - public domain + AI generation, then manual editing

### 2. Leaderboard Privacy (Phase 6)
**Options**:
- A) Real names (social pressure, privacy concerns)
- B) Usernames (pseudonymous, less personal)
- C) Opt-in (user choice, complex)

**Recommendation**: B (usernames) - balance engagement and privacy

### 3. XP Award Values (Phase 2)
**Current Plan**:
- Session: 10-15 XP
- Quiz: 15-25 XP
- Challenge: 50-200 XP

**Action**: Start with these, monitor analytics, adjust in Phase 5 if needed

### 4. Question Generation Fallback (Phase 3)
**Options**:
- A) Skip quiz if AI fails
- B) Show pre-generated questions
- C) Retry API call

**Recommendation**: B (pre-generated fallback) - better UX than skipping

---

## Unresolved Questions

1. **Challenge content sourcing**: Final decision on sourcing method
2. **Leaderboard privacy**: Display names vs usernames
3. **XP balance**: Requires post-launch analytics to validate
4. **Mobile navigation**: Hamburger menu vs bottom tab bar (test during Phase 5)
5. **Streak reset**: 0-day grace period or strict daily requirement
6. **Challenge skip**: Allow XP-based unlock bypass or enforce level requirement
7. **Achievement system**: Define criteria for optional Phase 6 achievements

---

## Risk Assessment

| Risk | Likelihood | Impact | Priority | Mitigation |
|------|-----------|--------|----------|------------|
| XP imbalance | Medium | High | P1 | Conservative start, analytics, adjustments |
| AI question quality | Medium | Medium | P1 | Prompt engineering, validation, fallback |
| Scope creep | High | High | P0 | Strict phases, MVP-first, defer leaderboard |
| Database performance | Low | Medium | P2 | Indexes, pagination, caching |
| Mobile UX issues | Medium | High | P1 | Mobile-first, real device testing |
| Auth vulnerabilities | Low | High | P0 | Use established library, security best practices |

---

## Success Metrics (Post-Launch Targets)

### Engagement
- Daily Active Users: 100+
- Avg Session Length: 8 min (up from 5 min)
- Sessions per User/Week: 4 (up from 2)
- Challenge Completion Rate: 60%

### Gamification
- Avg Time to Level 2: 3-5 sessions
- Avg Time to Level 5: 2 weeks
- % Users Above Level 3: 40%

### Performance
- Dashboard Load Time (P50): <1.2s
- Bundle Size: <250 KB
- Lighthouse Score: 90+
- Test Coverage: >80%

---

## Conclusion

Comprehensive plan ready for implementation. Phased approach reduces risk, enables iterative refinement. Focus on MVP (Phases 1-5), defer optional features (Phase 6 leaderboard). Monitor analytics post-launch, adjust XP values and content based on user behavior.

**Recommendation**: Proceed to Phase 1 implementation after:
1. Reviewing plan with team
2. Sourcing/generating challenge content
3. Setting up feature branch

**Estimated Timeline**: 4-6 weeks to production-ready portal

---

**Plan Document**: `/home/user/speed-reader/plans/251118-user-portal-implementation-plan.md` (detailed 900+ line specification)

**Status**: ✅ Planning Complete - Ready for Implementation
