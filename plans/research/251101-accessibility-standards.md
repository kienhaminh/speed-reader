# Accessibility Standards Research (WCAG 2.1 AA)

**Date**: 2025-11-01
**Researcher**: Planner Agent
**Focus**: Accessibility compliance for reading apps

## Executive Summary

WCAG 2.1 AA compliance requires: 4.5:1 text contrast, full keyboard nav, screen reader support, focus indicators, reduced motion, 200% zoom support. Achievable with semantic HTML, ARIA labels, proper focus management.

## Key Findings

### 1. Keyboard Navigation

**Tab Order**:
- Logical flow: Top to bottom, left to right
- Skip to main content link
- Trap focus in modals
- Close dialogs with Escape

**Essential Shortcuts**:
```typescript
// Reading controls
Space: Play/Pause
Left/Right: Previous/Next word or chunk
Escape: Exit reading mode
Enter: Start session

// Navigation
Tab: Next focusable
Shift+Tab: Previous focusable
Home/End: First/Last item
```

**Implementation**:
```tsx
<button
  onClick={handlePlayPause}
  onKeyDown={(e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handlePlayPause()
    }
  }}
>
  Play/Pause
</button>
```

### 2. Screen Reader Compatibility

**Semantic HTML**:
```tsx
<main aria-label="Speed Reader Application">
  <header>
    <h1>Speed Reader</h1>
  </header>

  <nav aria-label="Main navigation">
    <TabsList role="tablist">
      <TabsTrigger role="tab" aria-selected={true}>
        Content
      </TabsTrigger>
    </TabsList>
  </nav>

  <article aria-label="Reading session">
    <section aria-live="polite" aria-atomic="true">
      {/* Current word display */}
    </section>
  </article>
</main>
```

**ARIA Labels**:
```tsx
// Buttons
<Button aria-label="Start reading session">
  <Play aria-hidden="true" />
  Play
</Button>

// Live regions
<div
  aria-live="polite"
  aria-atomic="true"
  role="status"
>
  {isReading ? 'Playing' : 'Paused'}
</div>

// Progress
<div
  role="progressbar"
  aria-valuenow={currentWord}
  aria-valuemin={0}
  aria-valuemax={totalWords}
  aria-label="Reading progress"
>
  {currentWord} of {totalWords} words
</div>
```

**Live Regions** (Reading Updates):
```tsx
// Announce word changes
<div
  aria-live="assertive"  // For reading mode
  aria-atomic="true"
  className="sr-only"
>
  {currentWord}
</div>

// Announce stats
<div aria-live="polite" className="sr-only">
  Speed: {wpm} words per minute
</div>
```

### 3. Color Contrast

**WCAG AA Requirements**:
- Normal text (< 18px): 4.5:1 minimum
- Large text (≥ 18px or 14px bold): 3:1 minimum
- UI components: 3:1 minimum

**Recommended Ratios**:
```css
/* Light mode */
--text-primary: #1A1A1A;      /* 15:1 on white */
--text-secondary: #666666;    /* 5.7:1 on white */
--border: #D1D5DB;            /* 3:1 on white */
--accent: #2563EB;            /* 4.5:1 on white */

/* Dark mode */
--text-primary: #E5E5E5;      /* 12:1 on #121212 */
--text-secondary: #A3A3A3;    /* 5.5:1 on #121212 */
--border: #404040;            /* 3:1 on #121212 */
--accent: #60A5FA;            /* 4.6:1 on #121212 */
```

**Testing**:
```bash
# Use axe DevTools, WAVE, or Lighthouse
# Check all interactive elements
# Test both light and dark modes
```

### 4. Focus Indicators

**Visible Focus States**:
```css
/* Default focus ring */
*:focus {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}

/* Custom focus with ring */
.button:focus-visible {
  outline: none;
  ring: 2px;
  ring-color: primary;
  ring-offset: 2px;
}

/* Don't remove focus for keyboard users */
.button:focus:not(:focus-visible) {
  outline: none;
}
```

**Focus Management**:
```typescript
// Focus trap in modal
import { FocusTrap } from '@headlessui/react'

<Dialog>
  <FocusTrap>
    <div className="modal-content">
      {/* Modal content */}
    </div>
  </FocusTrap>
</Dialog>

// Return focus after modal close
const previousFocus = useRef<HTMLElement>()

const openModal = () => {
  previousFocus.current = document.activeElement
  setIsOpen(true)
}

const closeModal = () => {
  setIsOpen(false)
  previousFocus.current?.focus()
}
```

### 5. Skip Links & Landmarks

**Skip to Content**:
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Content */}
</main>
```

**Landmark Regions**:
```tsx
<header role="banner">
  <nav aria-label="Main" role="navigation">
  </nav>
</header>

<main role="main">
  <section aria-labelledby="reading-heading">
    <h2 id="reading-heading">Reading Session</h2>
  </section>
</main>

<footer role="contentinfo">
</footer>
```

### 6. Alternative Text

**Images**:
```tsx
// Decorative (empty alt)
<img src="decoration.svg" alt="" role="presentation" />

// Functional (descriptive)
<img src="play.svg" alt="Play reading session" />

// Complex (longer description)
<img
  src="chart.png"
  alt="Reading progress chart showing 250 WPM average"
  aria-describedby="chart-description"
/>
<div id="chart-description" className="sr-only">
  Detailed chart description...
</div>
```

**Icons**:
```tsx
// With text label (hide icon from screen reader)
<Button>
  <Play aria-hidden="true" />
  Play
</Button>

// Icon only (provide label)
<Button aria-label="Play reading session">
  <Play />
</Button>
```

### 7. Reduced Motion

**Implementation**:
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

```typescript
// React hook
function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mediaQuery.matches)

    const handler = (e) => setPrefersReduced(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}
```

### 8. Font Scaling & Zoom

**Support 200% Zoom**:
- Use relative units (rem, em, %)
- Avoid fixed widths
- Test at 200% browser zoom
- No horizontal scrolling

```css
/* Good */
font-size: 1rem;  /* Scales with user settings */
padding: 1.5em;   /* Relative to font size */
max-width: 70ch;  /* Character-based width */

/* Bad */
font-size: 16px;  /* Fixed */
padding: 24px;    /* Fixed */
width: 800px;     /* Fixed */
```

**Responsive Typography**:
```css
:root {
  /* Fluid typography */
  font-size: clamp(14px, 1vw + 0.5rem, 18px);
}
```

### 9. Touch Target Sizes

**Minimum Sizes**:
- Buttons: 44x44px minimum
- Links: 44x44px tap area
- Form inputs: 44px height

```css
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

/* Increase tap area without visual change */
.link {
  position: relative;
}
.link::after {
  content: '';
  position: absolute;
  top: -12px;
  right: -12px;
  bottom: -12px;
  left: -12px;
}
```

### 10. Testing Tools

**Automated**:
```bash
# Lighthouse (built into Chrome DevTools)
npm run build
lighthouse http://localhost:3000 --view

# axe DevTools (Chrome extension)
# Install: chrome.google.com/webstore (search "axe DevTools")

# WAVE (Web extension)
# Install: wave.webaim.org/extension

# Jest + jest-axe
npm install --save-dev jest-axe
```

**Manual**:
- Tab through entire app
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Test at 200% zoom
- Test with reduced motion
- Test keyboard-only navigation

**Code Example**:
```typescript
// jest-axe test
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('should have no accessibility violations', async () => {
  const { container } = render(<Reader {...props} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Recommendations for Speed Reader

1. **Add skip to content** link
2. **Semantic HTML** with proper landmarks
3. **ARIA labels** for all interactive elements
4. **Live regions** for reading mode updates
5. **Keyboard shortcuts** (Space, Left/Right, Escape)
6. **Focus management** in modals
7. **4.5:1 contrast** for all text
8. **Reduced motion** support
9. **200% zoom** support (use rem units)
10. **44px touch targets** for mobile
11. **Automated testing** with jest-axe

## Implementation Checklist

- [ ] Add skip link
- [ ] Semantic HTML (header, main, nav, section)
- [ ] ARIA labels on all buttons/inputs
- [ ] Live region for current word
- [ ] Keyboard navigation (Tab, Space, Arrow keys)
- [ ] Focus trap in modals
- [ ] Color contrast check (all elements)
- [ ] Focus indicators (visible, 2px)
- [ ] Reduced motion CSS
- [ ] Use rem/em units
- [ ] 44px touch targets
- [ ] Screen reader testing
- [ ] Lighthouse audit (score > 90)

## Unresolved Questions

- Voice control support needed?
- High contrast mode theme?
- Custom keyboard shortcuts configurable?
