"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SkipLink } from "@/components/SkipLink";
import { HelpModal } from "@/components/HelpModal";
import { Button } from "@/components/ui/button";
import { Book, HelpCircle } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Help modal keyboard shortcut
  useKeyboardShortcuts({
    "?": () => setHelpOpen(true),
    "Escape": () => setHelpOpen(false),
  });

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />

      {/* Header */}
      <header
        className={`sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
          isScrolled ? "shadow-md border-border/50" : "border-border/20"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 transition-all duration-200 group-hover:bg-primary/20 group-hover:scale-105">
              <Book className="h-6 w-6 text-primary transition-transform duration-200 group-hover:rotate-[-5deg]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Speed Reader
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Enhance your reading skills
              </p>
            </div>
          </div>

          <nav aria-label="Main navigation" className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHelpOpen(true)}
              aria-label="Open help"
              className="w-11 h-11 transition-all duration-200 hover:bg-primary/10 hover:scale-105"
              title="Help (Press ?)"
            >
              <HelpCircle className="h-5 w-5 transition-transform duration-200 hover:rotate-12" />
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl min-h-[calc(100vh-theme(spacing.32))]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          <p className="text-sm text-muted-foreground text-center">
            Built with{" "}
            <span className="text-primary inline-block animate-pulse">❤️</span>{" "}
            for better reading experiences
          </p>
        </div>
      </footer>

      {/* Help Modal */}
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}
