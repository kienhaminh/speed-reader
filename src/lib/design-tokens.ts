/**
 * Design System Tokens
 * Central source of truth for typography, colors, spacing, and animations
 */

// Typography Scale (based on 16px base)
export const typography = {
  fontSize: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem",     // 48px
    "6xl": "3.75rem",  // 60px
    "7xl": "4.5rem",   // 72px
    "8xl": "6rem",     // 96px
  },
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "1.75",
    reading: "1.8",  // Optimal for body text
  },
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

// Color Palette (using OKLCH for better gradients)
export const colors = {
  light: {
    background: {
      primary: "#FAFAF9",    // Warm off-white
      secondary: "#F5F5F4",  // Stone 100
      tertiary: "#E7E5E4",   // Stone 200
    },
    text: {
      primary: "#1A1A1A",    // Near black
      secondary: "#52525B",  // Zinc 600
      tertiary: "#A1A1AA",   // Zinc 400
      disabled: "#D4D4D8",   // Zinc 300
    },
    border: {
      light: "#F5F5F4",
      default: "#E7E5E4",
      strong: "#D6D3D1",
    },
    focus: {
      ring: "#3B82F6",       // Blue 500
      ringOffset: "#FFFFFF",
    },
  },
  dark: {
    background: {
      primary: "#121212",    // Soft black (not pure black)
      secondary: "#1A1A1A",  // Slightly lighter
      tertiary: "#262626",   // Neutral 800
    },
    text: {
      primary: "#E5E5E5",    // Off-white
      secondary: "#A3A3A3",  // Neutral 400
      tertiary: "#737373",   // Neutral 500
      disabled: "#525252",   // Neutral 600
    },
    border: {
      light: "#1A1A1A",
      default: "#262626",
      strong: "#404040",
    },
    focus: {
      ring: "#60A5FA",       // Blue 400
      ringOffset: "#121212",
    },
  },
  semantic: {
    success: "#10B981",      // Green 500
    warning: "#F59E0B",      // Amber 500
    error: "#EF4444",        // Red 500
    info: "#3B82F6",         // Blue 500
  },
} as const;

// Spacing Scale (4px base unit)
export const spacing = {
  0: "0",
  px: "1px",
  0.5: "0.125rem",   // 2px
  1: "0.25rem",      // 4px
  1.5: "0.375rem",   // 6px
  2: "0.5rem",       // 8px
  2.5: "0.625rem",   // 10px
  3: "0.75rem",      // 12px
  3.5: "0.875rem",   // 14px
  4: "1rem",         // 16px
  5: "1.25rem",      // 20px
  6: "1.5rem",       // 24px
  7: "1.75rem",      // 28px
  8: "2rem",         // 32px
  9: "2.25rem",      // 36px
  10: "2.5rem",      // 40px
  11: "2.75rem",     // 44px (minimum touch target)
  12: "3rem",        // 48px
  14: "3.5rem",      // 56px
  16: "4rem",        // 64px
  20: "5rem",        // 80px
  24: "6rem",        // 96px
  32: "8rem",        // 128px
} as const;

// Animation Tokens
export const animations = {
  duration: {
    instant: "0ms",
    fast: "150ms",
    normal: "200ms",
    moderate: "300ms",
    slow: "400ms",
    slower: "600ms",
  },
  easing: {
    linear: "linear",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

// Breakpoints (mobile-first)
export const breakpoints = {
  sm: "640px",   // Small devices (phones)
  md: "768px",   // Medium devices (tablets)
  lg: "1024px",  // Large devices (desktops)
  xl: "1280px",  // Extra large devices
  "2xl": "1536px", // 2X Extra large devices
} as const;

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Border Radius
export const borderRadius = {
  none: "0",
  sm: "0.25rem",    // 4px
  DEFAULT: "0.5rem",   // 8px
  md: "0.625rem",   // 10px
  lg: "0.75rem",    // 12px
  xl: "1rem",       // 16px
  "2xl": "1.5rem",  // 24px
  full: "9999px",
} as const;

// Shadow Scale
export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  none: "none",
} as const;

// Accessibility - Touch Targets
export const touchTargets = {
  min: "44px",       // WCAG minimum
  comfortable: "48px", // Comfortable size
  large: "56px",     // Large size
} as const;

// Content Width (optimal reading width: 45-75 characters)
export const contentWidth = {
  narrow: "45ch",    // Minimum comfortable
  optimal: "65ch",   // Optimal reading
  wide: "75ch",      // Maximum comfortable
  full: "100%",
} as const;
