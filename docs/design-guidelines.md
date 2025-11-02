# Design Guidelines

**Last Updated**: 2025-11-02
**Version**: 1.0.0
**Applies To**: Speed Reader Application UI/UX

## Overview

This document defines the visual design system, UI patterns, and interaction guidelines for Speed Reader. All UI components and features must follow these guidelines to ensure consistency, accessibility, and quality user experience.

## Design Philosophy

### Core Principles

1. **Reading-First**: Design prioritizes readability and reduces eye strain
2. **Accessible by Default**: WCAG 2.1 AA compliance is mandatory, not optional
3. **Performance-Conscious**: Smooth 60fps animations, fast interactions
4. **Progressive Enhancement**: Works without JavaScript, enhanced with it
5. **Minimal Cognitive Load**: Clear hierarchy, predictable patterns

## Typography

### Font Family

**Primary Typeface**: Inter (Google Fonts)
- Variable font with weights 400, 500, 600, 700
- Optimized for screen reading with large x-height
- Clean, modern sans-serif with excellent legibility

```typescript
// Implementation in app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
```

### Type Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| h1 | 2.25rem (36px) | 700 | 1.2 | Page titles |
| h2 | 1.875rem (30px) | 700 | 1.3 | Section headings |
| h3 | 1.5rem (24px) | 600 | 1.4 | Subsection headings |
| h4 | 1.25rem (20px) | 600 | 1.5 | Card titles |
| h5 | 1.125rem (18px) | 500 | 1.5 | Small headings |
| h6 | 1rem (16px) | 500 | 1.5 | Labels |
| Body | 1rem (16px) | 400 | 1.6 | Primary content |
| Small | 0.875rem (14px) | 400 | 1.5 | Secondary text |
| Tiny | 0.75rem (12px) | 400 | 1.4 | Captions, hints |

### Reading Optimizations

```css
/* Implemented in globals.css */
p, li, blockquote {
  max-width: 70ch;      /* Optimal line length */
  line-height: 1.75;    /* Comfortable reading */
}

body {
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

## Color System

### Design Tokens

All colors defined as CSS custom properties in `src/app/globals.css`.

### Light Mode Palette

**Core Colors**:
| Token | Hex | Usage | Contrast |
|-------|-----|-------|----------|
| `--background` | #FAFAF9 | Page background | - |
| `--foreground` | #1A1A1A | Primary text | 16.5:1 ✓ |
| `--card` | #FFFFFF | Card backgrounds | - |
| `--primary` | #3B82F6 | Primary actions | 4.8:1 ✓ |
| `--muted-foreground` | #52525B | Secondary text | 5.2:1 ✓ |
| `--border` | #E7E5E4 | Dividers, borders | - |

**Semantic Colors**:
| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | #10B981 | Success states |
| `--warning` | #F59E0B | Warning states |
| `--error` | #EF4444 | Error states |
| `--info` | #3B82F6 | Info states |

**Chart Colors**:
| Token | Hex | Usage |
|-------|-----|-------|
| `--chart-1` | #3B82F6 | Blue - Primary metric |
| `--chart-2` | #10B981 | Green - Success metric |
| `--chart-3` | #F59E0B | Amber - Warning metric |
| `--chart-4` | #8B5CF6 | Purple - Secondary metric |
| `--chart-5` | #EC4899 | Pink - Tertiary metric |

### Dark Mode Palette

**Core Colors**:
| Token | Hex | Usage | Contrast |
|-------|-----|-------|----------|
| `--background` | #121212 | Page background (soft black) | - |
| `--foreground` | #E5E5E5 | Primary text | 14.8:1 ✓ |
| `--card` | #1A1A1A | Card backgrounds | - |
| `--primary` | #60A5FA | Primary actions | 5.1:1 ✓ |
| `--muted-foreground` | #A3A3A3 | Secondary text | 5.1:1 ✓ |
| `--border` | #262626 | Dividers, borders | - |

**Semantic Colors** (Brighter for dark mode):
| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | #34D399 | Success states |
| `--warning` | #FBBF24 | Warning states |
| `--error` | #F87171 | Error states |
| `--info` | #60A5FA | Info states |

### Color Usage Guidelines

**Contrast Requirements**:
- Normal text: Minimum 4.5:1 (WCAG AA)
- Large text (18pt+): Minimum 3:1 (WCAG AA)
- UI components: Minimum 3:1 (WCAG AA)

**Color Application**:
```typescript
// ✓ Good - Semantic color usage
<Button className="bg-primary text-primary-foreground">
  Primary Action
</Button>

<div className="text-muted-foreground">
  Secondary information
</div>

// ✗ Bad - Hardcoded colors
<Button className="bg-blue-500 text-white">
  Primary Action
</Button>
```

## Spacing System

### Base Unit: 4px

All spacing uses multiples of 4px for consistency.

| Token | Value | Rem | Usage |
|-------|-------|-----|-------|
| `spacing-1` | 4px | 0.25rem | Tight spacing |
| `spacing-2` | 8px | 0.5rem | Compact spacing |
| `spacing-3` | 12px | 0.75rem | Small gaps |
| `spacing-4` | 16px | 1rem | Default spacing |
| `spacing-6` | 24px | 1.5rem | Medium spacing |
| `spacing-8` | 32px | 2rem | Large spacing |
| `spacing-12` | 48px | 3rem | Section spacing |
| `spacing-16` | 64px | 4rem | Layout spacing |

### Component Spacing

**Cards**:
- Padding: 1.5rem (24px)
- Gap between cards: 1rem (16px)

**Buttons**:
- Padding horizontal: 1rem (16px)
- Padding vertical: 0.5rem (8px)
- Icon buttons: 0.75rem (12px) all sides

**Forms**:
- Label to input: 0.5rem (8px)
- Input vertical padding: 0.5rem (8px)
- Input horizontal padding: 0.75rem (12px)

## Border Radius

### Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small elements (badges, tags) |
| `--radius-md` | 8px | Inputs, small cards |
| `--radius-lg` | 10px | Buttons, large cards (default) |
| `--radius-xl` | 14px | Modals, dialogs |

```css
/* Base radius */
--radius: 0.625rem; /* 10px */

/* Derived values */
--radius-sm: calc(var(--radius) - 4px);  /* 6px */
--radius-md: calc(var(--radius) - 2px);  /* 8px */
--radius-lg: var(--radius);              /* 10px */
--radius-xl: calc(var(--radius) + 4px);  /* 14px */
```

## Animation & Motion

### Timing Standards

| Duration | Usage | Example |
|----------|-------|---------|
| 150ms | Micro-interactions | Button hover, scale |
| 200ms | Standard transitions | Theme toggle, tab switch |
| 300ms | Content transitions | Page navigation, modal open |
| 500ms | Long animations | Complex state changes |

### Easing Functions

```typescript
// Recommended easings
const easings = {
  // Standard Material Design
  standard: [0.4, 0.0, 0.2, 1],

  // Smooth exit
  easeOut: "easeOut",

  // Smooth entrance
  easeIn: "easeIn",

  // Balanced
  easeInOut: "easeInOut",
};
```

### GPU-Accelerated Properties

**Allowed** (GPU-accelerated):
- `transform` (translate, scale, rotate)
- `opacity`

**Avoid** (CPU-intensive):
- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`
- `background-color`

### Animation Examples

**Button Hover**:
```typescript
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.15 }}
>
  Click Me
</motion.button>
```

**Word Transition** (WordViewer):
```typescript
<motion.div
  key={word}
  initial={{ opacity: 0, scale: 0.8, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.8, y: -20 }}
  transition={{ duration: 0.15, ease: "easeOut" }}
>
  {word}
</motion.div>
```

**Progress Bar**:
```typescript
<motion.div
  className="bg-primary h-2"
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={{ duration: 0.3, ease: "easeOut" }}
/>
```

### Reduced Motion

Always respect `prefers-reduced-motion`:

```css
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

## Component Patterns

### Buttons

**Variants**:
| Variant | Usage | Example |
|---------|-------|---------|
| `default` | Primary actions | Start Session, Submit |
| `secondary` | Secondary actions | Cancel, Skip |
| `outline` | Tertiary actions | More Options |
| `ghost` | Subtle actions | Icon buttons, theme toggle |
| `destructive` | Dangerous actions | Delete, Remove |
| `link` | Text-based links | Learn More, Details |

**Sizes**:
| Size | Height | Padding | Usage |
|------|--------|---------|-------|
| `sm` | 32px | 12px | Compact spaces |
| `default` | 36px | 16px | Standard usage |
| `lg` | 40px | 24px | Prominent actions |
| `icon` | 36px | - | Icon-only buttons |

**Interaction States**:
- Hover: `scale(1.02)` + shadow increase
- Active: `scale(0.98)`
- Focus: 2px ring with `--ring` color
- Disabled: 50% opacity, no pointer events

### Cards

**Structure**:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Title with Icon</CardTitle>
    <CardDescription>Supporting description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content area
  </CardContent>
</Card>
```

**Styling**:
- Background: `bg-card`
- Border: 1px solid `border`
- Radius: `rounded-lg` (10px)
- Shadow: `shadow-sm` on hover
- Padding: 1.5rem (24px)

### Tabs

**Icon-Based Navigation**:
```typescript
<Tabs defaultValue="input">
  <TabsList>
    <TabsTrigger value="input">
      <FileText className="h-4 w-4" />
      Input
    </TabsTrigger>
    <TabsTrigger value="read">
      <BookOpen className="h-4 w-4" />
      Read
    </TabsTrigger>
  </TabsList>
  <TabsContent value="input">...</TabsContent>
</Tabs>
```

**Interaction**:
- Active state: Primary background, primary foreground text
- Inactive state: Transparent, muted foreground text
- Hover: Accent background

### Theme Toggle

**Implementation**:
- Size: 44x44px (meets WCAG touch target)
- Icons: Sun (light), Moon (dark)
- States: light → dark → system → light
- Transition: 200ms scale on hover
- Label: Clear aria-label for screen readers

```typescript
<Button
  variant="ghost"
  size="icon"
  aria-label={`Current theme: ${theme}. Click to cycle themes`}
  className="w-11 h-11"
>
  {theme === "dark" ? <Moon /> : <Sun />}
</Button>
```

## Layout Patterns

### AppShell Structure

```typescript
<div className="min-h-screen bg-background">
  <SkipLink />

  <header className="sticky top-0 z-40 border-b backdrop-blur">
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      {/* Logo + Navigation */}
    </div>
  </header>

  <main id="main-content" className="container mx-auto px-4 py-8 max-w-7xl">
    {children}
  </main>

  <footer className="border-t mt-auto">
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Footer content */}
    </div>
  </footer>
</div>
```

### Container Widths

| Breakpoint | Max Width | Usage |
|------------|-----------|-------|
| Mobile | 100% | < 640px |
| Tablet | 768px | 640px - 1024px |
| Desktop | 1280px | > 1024px |
| Max | 1536px (7xl) | Maximum content width |

### Grid Layouts

**Analytics Dashboard**:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {metrics.map(metric => <MetricCard key={metric.id} {...metric} />)}
</div>
```

**Reading Stats**:
```typescript
<div className="grid grid-cols-3 gap-4">
  <StatCard label="WPM" value={wpm} />
  <StatCard label="Accuracy" value={accuracy} />
  <StatCard label="Progress" value={progress} />
</div>
```

## Accessibility Standards

### Focus Indicators

**Keyboard Navigation**:
- All interactive elements must have visible focus states
- Focus ring: 2px solid `--ring` color
- Offset: 2px from element
- Only visible for keyboard navigation (`:focus-visible`)

```css
*:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

### Skip Links

**Required on All Pages**:
```typescript
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
>
  Skip to main content
</a>
```

### ARIA Labels

**Icon-Only Buttons**:
```typescript
<Button
  variant="ghost"
  size="icon"
  aria-label="Toggle theme"
  title="Switch between light, dark, and system theme"
>
  <Sun className="h-5 w-5" />
  <span className="sr-only">Toggle theme (currently {theme})</span>
</Button>
```

**Progress Indicators**:
```typescript
<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Reading progress"
>
  <div style={{ width: `${progress}%` }} />
</div>
```

**Live Regions**:
```typescript
<p className="sr-only" aria-live="polite">
  Currently reading: {currentWord}
</p>
```

### Touch Targets

**Minimum Size**: 44x44px (WCAG 2.1 AA)

All clickable elements must meet this requirement:
- Buttons: 44px minimum height
- Icon buttons: 44x44px (11 × 11 in Tailwind)
- Links: Sufficient padding for 44px touch area
- Form controls: 44px minimum height

### Screen Reader Text

**Helper Class**:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  /* ... restore visibility */
}
```

## Responsive Design

### Breakpoints

| Name | Min Width | Usage |
|------|-----------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large displays |

### Mobile-First Approach

Always design for mobile first, enhance for larger screens:

```typescript
// ✓ Good - Mobile first
<div className="text-sm sm:text-base lg:text-lg">
  Responsive text
</div>

// ✗ Bad - Desktop first
<div className="lg:text-lg md:text-base text-sm">
  Wrong order
</div>
```

### Responsive Patterns

**Navigation**:
- Mobile: Hamburger menu
- Desktop: Horizontal navigation

**Cards**:
- Mobile: Single column
- Tablet: 2 columns
- Desktop: 3-4 columns

**Typography**:
- Mobile: Smaller scale
- Desktop: Larger scale

## Icon Usage

### Lucide React Icons

**Standard Sizes**:
| Size | Class | Pixels | Usage |
|------|-------|--------|-------|
| Small | `h-4 w-4` | 16px | Inline icons, tabs |
| Medium | `h-5 w-5` | 20px | Buttons, cards |
| Large | `h-6 w-6` | 24px | Headers, prominent actions |

**Accessibility**:
```typescript
// Decorative icons
<Icon className="h-5 w-5" aria-hidden="true" />

// Meaningful icons (with label)
<Button aria-label="Save changes">
  <Save className="h-5 w-5" />
</Button>
```

**Common Icons**:
- `BookOpen` - Reading, content
- `FileText` - Documents, input
- `BarChart3` - Analytics, stats
- `Sun` / `Moon` - Theme toggle
- `Play` / `Pause` - Media controls
- `Settings` - Configuration
- `Check` - Success, confirmation
- `X` - Close, dismiss

## Performance Guidelines

### Bundle Size Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Load JS | < 250 KB | 201 KB ✓ |
| Main Page | < 100 KB | 87.7 KB ✓ |
| Largest Component | < 50 KB | - |

### Optimization Strategies

1. **Code Splitting**: Use dynamic imports for heavy components
2. **Image Optimization**: Next.js Image component, WebP format
3. **Font Loading**: `display: swap` for web fonts
4. **CSS**: Tailwind JIT, tree-shaking unused styles
5. **Animation**: GPU-accelerated properties only

### Performance Metrics

- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.9s
- **Cumulative Layout Shift**: < 0.1
- **Animation Frame Rate**: 60fps

## Testing Guidelines

### Visual Testing

**Browser Compatibility**:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Viewport Testing**:
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

### Accessibility Testing

**Tools**:
- Lighthouse (Chrome DevTools)
- axe DevTools browser extension
- NVDA / JAWS screen readers
- Keyboard navigation testing

**Checklist**:
- ✅ All WCAG 2.1 AA criteria met
- ✅ Keyboard navigation functional
- ✅ Screen reader announcements correct
- ✅ Color contrast ratios pass
- ✅ Focus indicators visible
- ✅ Touch targets meet 44px minimum

## Design Token Reference

### Quick Reference Table

| Category | Light Mode | Dark Mode |
|----------|------------|-----------|
| **Background** | #FAFAF9 | #121212 |
| **Foreground** | #1A1A1A | #E5E5E5 |
| **Primary** | #3B82F6 | #60A5FA |
| **Border** | #E7E5E4 | #262626 |
| **Radius** | 10px | 10px |
| **Font** | Inter | Inter |
| **Base Spacing** | 4px | 4px |

### CSS Variable Usage

```typescript
// Access in Tailwind classes
<div className="bg-background text-foreground border-border rounded-lg">
  Content
</div>

// Access in CSS
.custom-element {
  background-color: var(--background);
  color: var(--foreground);
  border-radius: var(--radius);
}
```

## Resources

### Internal Documentation
- [Code Standards](./code-standards.md) - Code style and patterns
- [System Architecture](./system-architecture.md) - Technical architecture
- [Codebase Summary](./codebase-summary.md) - Project overview

### External References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Inter Font](https://rsms.me/inter/)

---

*Maintained by the Speed Reader design team. Last reviewed: 2025-11-02*
