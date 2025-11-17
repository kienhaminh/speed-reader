"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  // Use lazy initialization to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch - mark as mounted after first render
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className="w-11 h-11"
      >
        <Moon className="h-5 w-5" />
      </Button>
    );
  }

  const toggleTheme = () => {
    // Simple toggle between light and dark only
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Current theme: ${resolvedTheme}. Click to toggle theme`}
      className="w-11 h-11 transition-transform hover:scale-110 duration-200"
      title={`Theme: ${resolvedTheme}`}
    >
      {resolvedTheme === "dark" ? (
        <Moon className="h-5 w-5 transition-transform duration-200" />
      ) : (
        <Sun className="h-5 w-5 transition-transform duration-200" />
      )}
      <span className="sr-only">Toggle theme (currently {resolvedTheme})</span>
    </Button>
  );
}
