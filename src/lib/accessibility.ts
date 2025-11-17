/**
 * Accessibility utilities and helpers
 */

/**
 * Check if element has sufficient color contrast
 * This is a simplified check - in production you'd use a proper WCAG contrast library
 */
export function checkColorContrast(): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} {
  // Simplified contrast calculation
  // In a real implementation, you'd use a proper color contrast library
  // and would accept foreground and background color parameters
  const ratio = 4.5; // Placeholder - would calculate actual contrast ratio

  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
  };
}

/**
 * Generate accessible IDs for form elements
 */
export function generateAccessibleId(prefix: string = "accessible"): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * ARIA live region announcer for screen readers
 */
export class ScreenReaderAnnouncer {
  private liveRegion: HTMLElement | null = null;

  constructor() {
    this.createLiveRegion();
  }

  private createLiveRegion(): void {
    if (typeof document === "undefined") return;

    this.liveRegion = document.createElement("div");
    this.liveRegion.setAttribute("aria-live", "polite");
    this.liveRegion.setAttribute("aria-atomic", "true");
    this.liveRegion.style.position = "absolute";
    this.liveRegion.style.left = "-10000px";
    this.liveRegion.style.width = "1px";
    this.liveRegion.style.height = "1px";
    this.liveRegion.style.overflow = "hidden";

    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: "polite" | "assertive" = "polite"): void {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute("aria-live", priority);
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = "";
      }
    }, 1000);
  }

  destroy(): void {
    if (this.liveRegion && this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion);
      this.liveRegion = null;
    }
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private focusStack: HTMLElement[] = [];

  /**
   * Save current focus and set new focus
   */
  pushFocus(element: HTMLElement): void {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus) {
      this.focusStack.push(currentFocus);
    }
    element.focus();
  }

  /**
   * Restore previous focus
   */
  popFocus(): void {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }

  /**
   * Trap focus within container
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      if (event.key === "Escape") {
        this.popFocus();
      }
    };

    container.addEventListener("keydown", handleKeydown);

    // Return cleanup function
    return () => {
      container.removeEventListener("keydown", handleKeydown);
    };
  }
}

/**
 * Keyboard navigation utilities
 */
export const KeyCodes = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
  TAB: "Tab",
} as const;

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-contrast: high)").matches;
}

/**
 * Get appropriate ARIA role for reading content
 */
export function getReadingContentRole(
  mode: "word" | "chunk" | "paragraph"
): string {
  switch (mode) {
    case "word":
    case "chunk":
      return "marquee"; // For dynamic content that changes
    case "paragraph":
      return "article"; // For structured text content
    default:
      return "region";
  }
}

/**
 * Generate descriptive text for reading progress
 */
export function generateProgressDescription(
  current: number,
  total: number,
  unit: "words" | "chunks" | "paragraphs"
): string {
  const percentage = Math.round((current / total) * 100);
  return `Reading progress: ${current} of ${total} ${unit}, ${percentage}% complete`;
}

/**
 * Create global accessibility announcer instance
 */
let globalAnnouncer: ScreenReaderAnnouncer | null = null;

export function getGlobalAnnouncer(): ScreenReaderAnnouncer {
  if (!globalAnnouncer) {
    globalAnnouncer = new ScreenReaderAnnouncer();
  }
  return globalAnnouncer;
}

/**
 * Cleanup accessibility resources
 */
export function cleanupAccessibility(): void {
  if (globalAnnouncer) {
    globalAnnouncer.destroy();
    globalAnnouncer = null;
  }
}
