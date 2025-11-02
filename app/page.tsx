"use client";

import { useState, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppShell } from "@/components/AppShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ContentInput } from "@/components/ContentInput";
import { Reader } from "@/components/Reader";
import { LoadingState } from "@/components/LoadingState";
import { ReadingContent } from "@/models/readingContent";
import { ReadingSession } from "@/models/readingSession";
import { FileText, BookOpen, BarChart3 } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Lazy load Analytics component (includes heavy Recharts dependency)
const Analytics = lazy(() =>
  import("@/components/Analytics").then((mod) => ({ default: mod.Analytics }))
);

export default function HomePage() {
  const [activeContent, setActiveContent] = useState<ReadingContent | null>(
    null
  );
  const [activeSession, setActiveSession] = useState<ReadingSession | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("content");

  const handleContentCreated = (content: ReadingContent) => {
    setActiveContent(content);
    setActiveTab("reading");
  };

  const handleSessionStarted = (session: ReadingSession) => {
    setActiveSession(session);
  };

  const handleSessionCompleted = () => {
    setActiveSession(null);
    setActiveTab("analytics");
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    "1": () => setActiveTab("content"),
    "2": () => activeContent && setActiveTab("reading"),
    "3": () => setActiveTab("analytics"),
  });

  return (
    <ErrorBoundary>
      <AppShell>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 gap-1">
          <TabsTrigger
            value="content"
            data-testid="content-tab"
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger
            value="reading"
            data-testid="reading-tab"
            disabled={!activeContent}
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={activeContent ? "Reading tab" : "Reading tab (disabled until content is created)"}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Reading</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            data-testid="analytics-tab"
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="content" className="mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
            <ContentInput onContentCreated={handleContentCreated} />
          </TabsContent>

          <TabsContent value="reading" className="mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
            {activeContent && (
              <Reader
                content={activeContent}
                session={activeSession}
                onSessionStarted={handleSessionStarted}
                onSessionCompleted={handleSessionCompleted}
              />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
            <Suspense fallback={<LoadingState variant="card" />}>
              <Analytics />
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>
    </AppShell>
    </ErrorBoundary>
  );
}
