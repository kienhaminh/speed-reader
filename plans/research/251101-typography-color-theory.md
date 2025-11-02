# Typography & Color Theory Research

**Date**: 2025-11-01
**Researcher**: Planner Agent
**Focus**: Optimal typography and color for reading experience

## Executive Summary

Inter font family recommended (open source, optimized for screens). 16px base, 1.6-1.8 line height. Warm backgrounds reduce eye strain. Dark mode: #121212 base. Blue/green accents for focus.

## Key Findings

### 1. Font Families for Screen Reading

**Top Recommendations**:

**Inter** (Primary Choice):
- Designed for UI, optimized for screens
- Excellent legibility at small sizes
- Open source, free
- Variable font support
- Used by: GitHub, Stripe, Figma

**System Fonts** (Fallback):
- Fast loading (no download)
- Native feel per platform
- SF Pro (macOS), Segoe UI (Windows)
- Stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`

**Merriweather/Georgia** (Serif Option):
- Elegant for long-form reading
- Alternative reading mode option
- Better for literary content

**Recommended Stack**:
```css
font-family:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  'Roboto',
  'Oxygen',
  'Ubuntu',
  'Cantarell',
  'Helvetica Neue',
  sans-serif;
```

### 2. Font Size Scales

**Modular Scale** (16px base, 1.25 ratio):
```css
:root {
  /* Base */
  --text-xs: 0.75rem;    /* 12px - Labels, captions */
  --text-sm: 0.875rem;   /* 14px - Secondary text */
  --text-base: 1rem;     /* 16px - Body text */
  --text-lg: 1.125rem;   /* 18px - Emphasized body */
  --text-xl: 1.25rem;    /* 20px - Small headings */
  --text-2xl: 1.5rem;    /* 24px - Section headings */
  --text-3xl: 1.875rem;  /* 30px - Page headings */
  --text-4xl: 2.25rem;   /* 36px - Hero text */
  --text-5xl: 3rem;      /* 48px - Word viewer (mobile) */
  --text-6xl: 3.75rem;   /* 60px - Word viewer (tablet) */
  --text-7xl: 4.5rem;    /* 72px - Word viewer (desktop) */
  --text-8xl: 6rem;      /* 96px - Word viewer (large) */
}
```

**Usage Guidelines**:
- Body text: 16-18px (--text-base to --text-lg)
- Secondary: 14px (--text-sm)
- Labels: 12px minimum (--text-xs)
- Headings: 20-30px (--text-xl to --text-3xl)
- Focus word: 48-96px responsive (--text-5xl to --text-8xl)

### 3. Line Height Ratios

**Optimal Ratios**:
```css
:root {
  --leading-none: 1;       /* Headings, display */
  --leading-tight: 1.25;   /* Large headings */
  --leading-snug: 1.375;   /* Small headings */
  --leading-normal: 1.5;   /* UI text */
  --leading-relaxed: 1.625; /* Body text (minimum) */
  --leading-loose: 1.75;   /* Long-form reading */
  --leading-extra: 2;      /* Maximum readability */
}
```

**Application**:
- Body paragraphs: 1.6-1.8 (optimal for comprehension)
- Headings: 1.2-1.4 (tighter, more impact)
- UI elements: 1.5 (standard)
- Word viewer: 1.1 (tight, single word)

**Research Backing**:
- Below 1.5: Difficult to read
- 1.5-1.8: Optimal range
- Above 2: Text feels disconnected

### 4. Letter & Word Spacing

**Letter Spacing** (tracking):
```css
:root {
  --tracking-tighter: -0.05em;  /* Large headings */
  --tracking-tight: -0.025em;   /* Headings */
  --tracking-normal: 0;         /* Body text */
  --tracking-wide: 0.025em;     /* Uppercase, labels */
  --tracking-wider: 0.05em;     /* All caps */
}
```

**Word Spacing**:
- Default (1em) sufficient for most cases
- Increase slightly (1.1em) for dyslexic users option

**Paragraph Width**:
- Optimal: 45-75 characters per line
- Max: 90 characters
- Implementation: `max-width: 70ch` (character-based)

```css
.reading-content {
  max-width: 70ch;    /* Optimal line length */
  margin: 0 auto;     /* Center content */
}
```

### 5. Color Psychology for Reading

**Calming Colors** (Reduce Eye Strain):
- **Blue**: Focus, trust, calm (#3B82F6, #2563EB)
- **Green**: Balance, growth (#10B981, #059669)
- **Purple**: Creativity, wisdom (#8B5CF6, #7C3AED)

**Avoid**:
- **Red**: Stress, alerts (use sparingly)
- **Yellow**: Hard to read, low contrast
- **Pure black on white**: High contrast fatigue

**Accent Color Selection**:
```css
/* Primary accent (blue - focus) */
--accent-primary: #3B82F6;
--accent-primary-hover: #2563EB;

/* Success (green) */
--accent-success: #10B981;

/* Warning (amber) */
--accent-warning: #F59E0B;

/* Error (red - limited use) */
--accent-error: #EF4444;
```

### 6. Light Mode Color Scheme

**Warm Background** (Reduces Eye Strain):
```css
:root {
  /* Backgrounds */
  --bg-primary: #FAFAF9;      /* Warm white (not pure) */
  --bg-secondary: #F5F5F4;    /* Subtle contrast */
  --bg-card: #FFFFFF;         /* Card background */

  /* Text */
  --text-primary: #1A1A1A;    /* Near black (15:1) */
  --text-secondary: #666666;  /* Gray (5.7:1) */
  --text-tertiary: #999999;   /* Light gray (3.2:1) */

  /* Borders */
  --border-primary: #E5E5E5;
  --border-secondary: #D1D5DB;

  /* Accents */
  --accent: #3B82F6;
  --accent-bg: #EFF6FF;       /* Light blue background */
}
```

**Why Warm White?**:
- Pure white (#FFF) causes eye strain
- Slight warmth (#FAFAF9, #F9FAFB) more comfortable
- Industry standard (Medium, Notion, Linear)

### 7. Dark Mode Color Scheme

**Soft Black Base** (Not Pure Black):
```css
.dark {
  /* Backgrounds */
  --bg-primary: #121212;      /* Soft black (Material Design) */
  --bg-secondary: #1E1E1E;    /* Elevated surface */
  --bg-card: #252525;         /* Card background */

  /* Text */
  --text-primary: #E5E5E5;    /* Off-white (12:1) */
  --text-secondary: #A3A3A3;  /* Gray (5.5:1) */
  --text-tertiary: #737373;   /* Dim gray (3.1:1) */

  /* Borders */
  --border-primary: #404040;
  --border-secondary: #333333;

  /* Accents */
  --accent: #60A5FA;          /* Lighter blue */
  --accent-bg: #1E3A5F;       /* Dark blue background */
}
```

**Why Not Pure Black?**:
- Pure black (#000) causes halation (glow around text)
- #121212 recommended by Material Design
- Reduces eye strain in dark environments
- Better contrast ratios for colored elements

### 8. Reading-Specific Optimizations

**Focus Mode Palette**:
```css
.reading-mode {
  /* Minimal distraction */
  --bg: #FEFEFE;
  --text: #1A1A1A;
  --highlight: #FEF3C7;       /* Gentle yellow */
  --current-word: #DBEAFE;    /* Light blue */
}

.dark .reading-mode {
  --bg: #0A0A0A;
  --text: #E5E5E5;
  --highlight: #422006;       /* Dark amber */
  --current-word: #1E3A8A;    /* Dark blue */
}
```

**Progress Indicators**:
```css
:root {
  /* Gradient for progress */
  --progress-gradient: linear-gradient(
    90deg,
    #3B82F6 0%,
    #8B5CF6 100%
  );

  /* Success gradient */
  --success-gradient: linear-gradient(
    90deg,
    #10B981 0%,
    #059669 100%
  );
}
```

### 9. Contrast Ratios Cheatsheet

**WCAG AA Requirements**:
| Text Size | Weight | Minimum Contrast |
|-----------|--------|------------------|
| < 18px    | Normal | 4.5:1           |
| < 18px    | Bold   | 3:1             |
| ≥ 18px    | Normal | 3:1             |
| ≥ 18px    | Bold   | 3:1             |
| UI Elements | -    | 3:1             |

**Testing Tools**:
- WebAIM Contrast Checker: webaim.org/resources/contrastchecker
- Chrome DevTools: Inspect > Accessibility
- Figma: Built-in contrast checker

### 10. Eye Strain Reduction Techniques

**Color Temperature**:
- Cooler (blues): Alertness, focus
- Warmer (yellows): Comfort, long reading

**Night Reading Mode**:
- Sepia tone option (#F4ECD8 background)
- Reduced blue light
- Lower brightness colors

**Anti-Fatigue Strategies**:
1. Use warm backgrounds (#FAFAF9, not #FFF)
2. Reduce contrast slightly in dark mode
3. Avoid pure black/white combinations
4. Generous line spacing (1.6-1.8)
5. Optimal paragraph width (70ch)
6. Blue light filter option

**Implementation**:
```css
.sepia-mode {
  --bg: #F4ECD8;
  --text: #5C4A42;
}
```

## Recommendations for Speed Reader

1. **Use Inter font** family (load via Google Fonts or self-host)
2. **16px base** with modular scale
3. **1.6-1.8 line height** for body text
4. **70ch max width** for paragraphs
5. **Warm light mode** (#FAFAF9 background)
6. **Soft dark mode** (#121212 background)
7. **Blue accent** (#3B82F6) for primary actions
8. **48-96px responsive** word viewer sizing
9. **4.5:1 contrast minimum** for all text
10. **Sepia mode option** for night reading

## Font Loading Strategy

```typescript
// next.config.ts
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',  // Avoid FOUT
})

export default function RootLayout({ children }) {
  return (
    <html className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

## Unresolved Questions

- Serif font option needed?
- User-configurable font size?
- Custom color themes?
- Blue light filter intensity?
