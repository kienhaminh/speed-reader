"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentInput } from "@/components/ContentInput";
import { Reader } from "@/components/Reader";
import { Analytics } from "@/components/Analytics";
import { ReadingContent } from "@/models/readingContent";
import { ReadingSession } from "@/models/readingSession";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Speed Reader
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Enhance your reading speed and comprehension
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content" data-testid="content-tab">
              Content
            </TabsTrigger>
            <TabsTrigger
              value="reading"
              data-testid="reading-tab"
              disabled={!activeContent}
            >
              Reading
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="analytics-tab">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <ContentInput onContentCreated={handleContentCreated} />
          </TabsContent>

          <TabsContent value="reading" className="mt-6">
            {activeContent && (
              <Reader
                content={activeContent}
                session={activeSession}
                onSessionStarted={handleSessionStarted}
                onSessionCompleted={handleSessionCompleted}
              />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Analytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
