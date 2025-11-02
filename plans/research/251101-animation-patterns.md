# Animation & Transition Patterns Research

**Date**: 2025-11-01
**Researcher**: Planner Agent
**Focus**: Animation patterns for reading interfaces

## Executive Summary

Modern reading apps use subtle, purposeful animations (200-400ms) for feedback and transitions. 60fps performance critical. Framer Motion + CSS animations recommended. Reduced motion support mandatory.

## Key Findings

### 1. Micro-Interactions

**Button States**:
```css
/* Hover: Scale + shadow */
transition: transform 150ms, box-shadow 150ms;
hover: scale(1.02) shadow-lg

/* Active: Scale down */
active: scale(0.98)

/* Focus: Ring */
focus: ring-2 ring-offset-2
```

**Click Feedback**:
- Ripple effect (Material Design)
- Subtle bounce (scale 0.95 → 1.05 → 1)
- Color shift (150ms)

**Form Interactions**:
- Input focus: Border color transition (200ms)
- Validation: Shake animation for errors
- Success: Checkmark fade-in (300ms)

### 2. Page Transitions

**Navigation Patterns**:
- Fade: 300ms opacity transition (simplest)
- Slide: 400ms translate with ease-out
- Scale: Zoom in/out (modal dialogs)

**Reading Mode Transitions**:
```typescript
// Framer Motion variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
}
```

### 3. Loading States

**Skeleton Screens**:
- Pulse animation (1.5s loop)
- Gradient shimmer effect
- Preserve layout (no shift)

**Spinners**:
- Circular: 1s rotation
- Dots: Staggered bounce
- Progress bar: Smooth fill

**Pattern**:
```tsx
<div className="animate-pulse bg-gray-200 h-4 rounded" />
```

### 4. Progress Indicators

**Reading Progress**:
- Linear bar: Width transition (100ms, smooth)
- Circular: SVG stroke-dasharray animation
- Step indicator: Fade + slide

**Live Metrics**:
- Counter: Number increment animation
- WPM gauge: Smooth needle rotation
- Chart updates: Staggered entry (300ms delay)

### 5. Word/Chunk/Paragraph Highlighting

**60fps Animation Requirements**:
- Use CSS transforms (GPU-accelerated)
- Avoid layout changes
- RequestAnimationFrame for JS timing

**Word Viewer Animation**:
```tsx
// Entrance
initial: { scale: 0.8, opacity: 0 }
animate: { scale: 1, opacity: 1, transition: { duration: 0.15 } }

// Emphasis (optional)
whileInView: { scale: [1, 1.05, 1], transition: { duration: 0.2 } }
```

**Chunk Viewer Transition**:
```css
.chunk {
  transition: background-color 100ms, transform 100ms;
}
.chunk-current {
  background: highlight-color;
  transform: translateY(-2px);
}
```

**Paragraph Highlighting**:
- Fade in background (200ms)
- Smooth scroll to view (400ms)
- Border emphasis (pulse once)

### 6. Entrance/Exit Animations

**Modal/Dialog**:
```typescript
overlay: {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}
content: {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 }
}
```

**Cards**:
- Stagger children (50ms delay each)
- Slide up + fade in
- Hover: Lift (translateY(-4px) + shadow)

**Toast Notifications**:
```typescript
initial: { x: 300, opacity: 0 }
animate: { x: 0, opacity: 1 }
exit: { x: 300, opacity: 0, transition: { duration: 0.2 } }
```

### 7. Scroll-Based Effects

**Header Behavior**:
- Scroll down: Translate up (hide)
- Scroll up: Translate down (show)
- Throttle: 16ms (60fps)

**Parallax** (Use Sparingly):
- Background: 0.5x scroll speed
- Content: 1x scroll speed
- Decorative elements: 1.5x

**Note**: Avoid parallax for primary content (accessibility).

### 8. Performance-Optimized Libraries

**Framer Motion** (Recommended):
- Declarative React animations
- Layout animations built-in
- Gesture support
- Bundle: ~40KB gzipped

**React Spring**:
- Physics-based animations
- Better for complex sequences
- Bundle: ~25KB

**CSS Animations** (Preferred for Simple):
- No JS overhead
- GPU-accelerated
- Widely supported

**Recommendation**: CSS for micro-interactions, Framer Motion for complex transitions.

### 9. Reduced Motion Support

**Media Query**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Framer Motion**:
```typescript
import { useReducedMotion } from 'framer-motion'

const shouldReduce = useReducedMotion()
const transition = shouldReduce ? { duration: 0 } : { duration: 0.3 }
```

### 10. Examples from Leading Apps

**Duolingo**:
- Bounce animations for success
- Shake for errors
- Confetti celebration
- Smooth progress rings

**Khan Academy**:
- Gentle fade transitions
- Step-by-step reveal
- Mastery animations
- Video scrubbing timeline

**Notion**:
- Page slide transitions
- Block hover effects
- Drag & drop visual feedback
- Loading skeletons

## Recommendations for Speed Reader

1. **Use Framer Motion** for page/component transitions
2. **CSS animations** for micro-interactions (performance)
3. **200-300ms duration** for most transitions
4. **Skeleton screens** for loading states
5. **Smooth progress bars** with 100ms transitions
6. **GPU-accelerated** word viewer animations
7. **Stagger card animations** (50ms delay)
8. **Reduced motion support** via media query
9. **60fps requirement** for reading animations
10. **Auto-hide controls** with fade (300ms)

## Animation Timing Guidelines

- Micro: 100-150ms (button hover, focus)
- Small: 200-300ms (fade, color change)
- Medium: 300-400ms (slide, page transition)
- Large: 400-500ms (modal, major transition)
- Loading: 1-2s loop (pulse, spinner)

## Unresolved Questions

- Celebration animations for quiz completion?
- Sound effects for interactions?
- Haptic feedback for mobile?
