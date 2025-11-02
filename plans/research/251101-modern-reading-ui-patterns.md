# Modern Reading UI/UX Patterns Research

**Date**: 2025-11-01
**Researcher**: Planner Agent
**Focus**: UI/UX best practices for reading/educational apps

## Executive Summary

Analysis of top reading apps (Pocket, Medium, Instapaper, Kindle, Blinkist, Readwise) reveals consistent patterns: content-first design, generous white space, reader-focused typography, progressive disclosure of features.

## Key Findings

### 1. Visual Hierarchy & Information Architecture

**Content-First Pattern**:
- Primary content occupies 60-70% screen space
- Controls/navigation minimal, context-aware
- Header collapses on scroll (sticky minimal controls)
- Settings/options behind single menu icon

**Card vs Full-Page**:
- Card-based: Best for content lists, dashboards, multi-item views
- Full-page: Optimal for active reading sessions
- Hybrid: Cards for setup, full-page for reading

**Recommendation**: Use cards for content input/configuration, full-page immersive mode for reading sessions.

### 2. Layout Patterns

**Three-Column Grid Pattern** (Desktop):
- Left: Minimal navigation/settings (collapsible)
- Center: Primary content (max 70ch width)
- Right: Context/stats (optional, collapsible)

**Mobile-First Stack**:
- Single column, full-width
- Bottom navigation/controls
- Swipe gestures for secondary actions

**Reading Session Layout**:
- Centered content (max 70ch for text, flexible for word display)
- Floating controls (play/pause, settings)
- Progress indicator (top or bottom)

### 3. Typography Systems

**Font Stack Priority**:
1. System fonts (SF Pro, Segoe UI) - fast, native feel
2. Inter - modern, optimized for screens
3. Georgia/Merriweather - serif option for long-form
4. Roboto/Open Sans - fallbacks

**Size Scale** (16px base):
- Body text: 16-18px
- Headings: 1.25x (20px), 1.5x (24px), 2x (32px)
- Small text: 14px (minimum for accessibility)
- Focus text (word viewer): 48-96px (responsive)

**Line Height**:
- Body: 1.6-1.8 (optimal readability)
- Headings: 1.2-1.4 (tighter)
- Focus display: 1.1-1.2

### 4. Color Palettes for Reading

**Light Mode Base**:
- Background: Warm white (#FAFAF9, not pure white)
- Text: Near-black (#1A1A1A, 90% contrast)
- Accent: Calming blues (#3B82F6), greens (#10B981)
- Cards: Subtle elevation (shadow, not borders)

**Dark Mode Base**:
- Background: Soft black (#121212, not #000)
- Text: Off-white (#E5E5E5)
- Accent: Lighter blues (#60A5FA), greens (#34D399)
- Reduced contrast ratios (prevents eye strain)

**Focus Indicators**:
- Primary action: High-contrast accent
- Current item: Highlighted background (subtle)
- Progress: Gradient or smooth fill

### 5. Spacing & White Space

**Spacing Scale** (4px base):
- xs: 4px - tight elements
- sm: 8px - related items
- md: 16px - component padding
- lg: 24px - section spacing
- xl: 48px - page sections

**Reading-Specific**:
- Paragraph spacing: 1.5em
- Section spacing: 2-3em
- Control spacing: 12-16px (touch-friendly)
- Card padding: 24-32px

### 6. Progressive Disclosure

**Essential vs Advanced**:
- Default view: Content + play/pause + speed
- Secondary: Mode selection, settings
- Tertiary: Analytics, export, advanced config

**Patterns**:
- Collapsible panels
- Modal dialogs for complex forms
- Tooltips for feature discovery
- Onboarding tours (dismissible)

### 7. Mobile-First Responsive

**Breakpoints**:
- Mobile: < 640px (single column)
- Tablet: 640-1024px (2-column optional)
- Desktop: > 1024px (3-column)

**Touch Optimization**:
- Min button size: 44x44px
- Spacing between tappable: 8px
- Swipe gestures for common actions
- Bottom sheet for mobile settings

### 8. Best Practices from Top Apps

**Pocket**:
- Clean card grid
- Excellent typography
- Smooth transitions
- Offline-first

**Medium**:
- Centered content (max 700px)
- Beautiful serif typography
- Progressive image loading
- Clap micro-interaction

**Kindle**:
- Customizable reading experience
- Page flip animations
- Reading position sync
- Eye-friendly themes

**Blinkist**:
- Timed reading mode
- Progress circles
- Bite-sized content cards
- Gamification elements

**Readwise**:
- Spaced repetition UI
- Highlight management
- Clean data visualization
- Email integration

## Recommendations for Speed Reader

1. **Adopt card-based layout** for content input/config, full-page for reading
2. **Implement floating controls** with auto-hide on inactivity
3. **Use Inter font family** with modular scale (16px base)
4. **Warm light mode** (#FAFAF9) and soft dark mode (#121212)
5. **Generous spacing** (24px section spacing, 16px component padding)
6. **Progressive disclosure** for advanced settings
7. **Mobile-first breakpoints** (640px, 1024px)
8. **Touch-optimized controls** (44px minimum)

## Unresolved Questions

- User preference for serif vs sans-serif?
- Custom theme builder needed?
- Offline mode priority?
