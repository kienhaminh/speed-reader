"use client";

import { useState, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ContentInput } from "@/components/ContentInput";
import { Reader } from "@/components/Reader";
import { LoadingState } from "@/components/LoadingState";
import { ReadingContent } from "@/models/readingContent";
import { ReadingSession } from "@/models/readingSession";
import { FileText, BookOpen, Sparkles } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ReaderPage() {
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
    setActiveTab("content");
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    "1": () => setActiveTab("content"),
    "2": () => activeContent && setActiveTab("reading"),
  });

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reading Practice</h1>
          <p className="text-muted-foreground">
            Upload content, practice reading, and test your comprehension
          </p>
        </div>

        {/* New Feature Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 flex-shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">AI Question Generation</h3>
                <p className="text-sm text-muted-foreground">
                  After reading, we'll automatically generate comprehension questions to test your understanding.
                  Answer correctly to earn bonus XP!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1.5 gap-1.5 bg-muted/50 rounded-xl">
            <TabsTrigger
              value="content"
              data-testid="content-tab"
              className="flex items-center gap-2 px-4 py-3.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 hover:bg-muted/80"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span className="font-medium">Content</span>
            </TabsTrigger>
            <TabsTrigger
              value="reading"
              data-testid="reading-tab"
              disabled={!activeContent}
              className="flex items-center gap-2 px-4 py-3.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={activeContent ? "Reading tab" : "Reading tab (disabled until content is created)"}
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span className="font-medium">Reading</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="content" className="mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl animate-in fade-in-50 duration-300">
              <ContentInput onContentCreated={handleContentCreated} />
            </TabsContent>

            <TabsContent value="reading" className="mt-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl animate-in fade-in-50 duration-300">
              {activeContent && (
                <Reader
                  content={activeContent}
                  session={activeSession}
                  onSessionStarted={handleSessionStarted}
                  onSessionCompleted={handleSessionCompleted}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
