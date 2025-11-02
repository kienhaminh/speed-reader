import { useEffect } from "react";

type ShortcutMap = Record<string, () => void>;

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

/**
 * Custom hook for managing keyboard shortcuts
 * @param shortcuts - Map of key combinations to handler functions
 * @param options - Configuration options
 *
 * @example
 * useKeyboardShortcuts({
 *   "1": () => setTab("content"),
 *   "Escape": () => closeModal(),
 *   "Control+s": () => save(),
 * });
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutMap,
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Build key combination string
      const parts: string[] = [];
      if (event.ctrlKey) parts.push("Control");
      if (event.altKey) parts.push("Alt");
      if (event.shiftKey) parts.push("Shift");
      if (event.metaKey) parts.push("Meta");

      // Add the actual key
      const key = event.key;
      if (!["Control", "Alt", "Shift", "Meta"].includes(key)) {
        parts.push(key);
      }

      const combination = parts.join("+");

      // Check if we have a handler for this combination
      const handler = shortcuts[combination] || shortcuts[key];

      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
}
