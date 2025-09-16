"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Settings,
  BookOpen,
} from "lucide-react";
import { ReadingContent } from "@/models/readingContent";
import { ReadingSession, CreateSessionRequest } from "@/models/readingSession";
import { WordViewer } from "./WordViewer";
import { ChunkViewer } from "./ChunkViewer";
import { ParagraphViewer } from "./ParagraphViewer";
import { Quiz } from "./Quiz";

interface ReaderProps {
  content: ReadingContent;
  session: ReadingSession | null;
  onSessionStarted: (session: ReadingSession) => void;
  onSessionCompleted: () => void;
}

export function Reader({
  content,
  session,
  onSessionStarted,
  onSessionCompleted,
}: ReaderProps) {
  const [sessionConfig, setSessionConfig] = useState<CreateSessionRequest>({
    contentId: content.id,
    mode: "word",
    paceWpm: 250,
  });

  const [isReading, setIsReading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [readingMetrics, setReadingMetrics] = useState({
    wordsRead: 0,
    durationMs: 0,
  });

  const startTimeRef = useRef<number>(0);

  const handleStartSession = async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionConfig),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start session");
      }

      const newSession = await response.json();
      onSessionStarted(newSession);
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error("Failed to start session:", error);
      alert(error instanceof Error ? error.message : "Failed to start session");
    }
  };

  const handleCompleteSession = async () => {
    if (!session) return;

    try {
      const response = await fetch("/api/sessions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          wordsRead: readingMetrics.wordsRead,
          durationMs: readingMetrics.durationMs,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete session");
      }

      setIsReading(false);
      setShowQuiz(true);
    } catch (error) {
      console.error("Failed to complete session:", error);
      alert(
        error instanceof Error ? error.message : "Failed to complete session"
      );
    }
  };

  const handleQuizCompleted = () => {
    setShowQuiz(false);
    onSessionCompleted();
  };

  const handlePlayPause = () => {
    if (isReading) {
      // Pause
      const elapsed = Date.now() - startTimeRef.current;
      setReadingMetrics((prev) => ({
        ...prev,
        durationMs: prev.durationMs + elapsed,
      }));
      setIsReading(false);
    } else {
      // Play
      startTimeRef.current = Date.now();
      setIsReading(true);
    }
  };

  const handleWordsRead = (words: number) => {
    setReadingMetrics((prev) => ({ ...prev, wordsRead: words }));
  };

  const computedWpm =
    readingMetrics.durationMs > 0
      ? Math.round(
          (readingMetrics.wordsRead / readingMetrics.durationMs) * 60000
        )
      : 0;

  if (showQuiz && session) {
    return <Quiz session={session} onCompleted={handleQuizCompleted} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Content Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {content.title || "Reading Content"}
          </CardTitle>
          <CardDescription>
            {content.wordCount} words • {content.language.toUpperCase()} •{" "}
            {content.source}
            <span data-testid="word-count">{content.wordCount} words</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {!session ? (
        /* Session Configuration */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Reading Configuration
            </CardTitle>
            <CardDescription>
              Configure your reading session settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mode">Reading Mode</Label>
                <Select
                  value={sessionConfig.mode}
                  onValueChange={(value: "word" | "chunk" | "paragraph") =>
                    setSessionConfig((prev) => ({ ...prev, mode: value }))
                  }
                >
                  <SelectTrigger data-testid="mode-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="word">Word-by-Word</SelectItem>
                    <SelectItem value="chunk">Chunk of Meaning</SelectItem>
                    <SelectItem value="paragraph">
                      Paragraph Highlight
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pace">Pace (WPM)</Label>
                <Input
                  id="pace"
                  type="number"
                  min="100"
                  max="1200"
                  value={sessionConfig.paceWpm}
                  onChange={(e) =>
                    setSessionConfig((prev) => ({
                      ...prev,
                      paceWpm: parseInt(e.target.value) || 250,
                    }))
                  }
                  data-testid="pace-wpm-input"
                />
              </div>

              {sessionConfig.mode === "chunk" && (
                <div className="space-y-2">
                  <Label htmlFor="chunk-size">Chunk Size</Label>
                  <Input
                    id="chunk-size"
                    type="number"
                    min="2"
                    max="8"
                    value={sessionConfig.chunkSize || 3}
                    onChange={(e) =>
                      setSessionConfig((prev) => ({
                        ...prev,
                        chunkSize: parseInt(e.target.value) || 3,
                      }))
                    }
                    data-testid="chunk-size-input"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleStartSession}
              className="w-full"
              data-testid="start-session-btn"
            >
              Start Reading Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Reading Interface */
        <div className="space-y-4">
          {/* Reading Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant={isReading ? "secondary" : "default"}
                    size="lg"
                    onClick={handlePlayPause}
                    data-testid={isReading ? "pause-btn" : "play-btn"}
                  >
                    {isReading ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                    {isReading ? "Pause" : "Play"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleCompleteSession}
                    data-testid="finish-reading-btn"
                  >
                    Finish Reading
                  </Button>
                </div>

                <div className="text-sm text-gray-600 space-x-4">
                  <span data-testid="current-mode">Mode: {session.mode}</span>
                  <span data-testid="current-pace">
                    Pace: {session.paceWpm} WPM
                  </span>
                  <span data-testid="words-read">
                    Words: {readingMetrics.wordsRead}
                  </span>
                  <span data-testid="computed-wpm">
                    Current WPM: {computedWpm}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reading Viewer */}
          <Card data-testid="reader-container">
            <CardContent className="pt-6">
              <div className="text-center">
                <div
                  data-testid="reading-status"
                  className="mb-4 text-sm text-gray-600"
                >
                  {isReading ? "Playing" : "Paused"}
                </div>

                {session.mode === "word" && (
                  <WordViewer
                    text={content.text}
                    paceWpm={session.paceWpm}
                    isPlaying={isReading}
                    onWordsRead={handleWordsRead}
                  />
                )}

                {session.mode === "chunk" && (
                  <ChunkViewer
                    text={content.text}
                    paceWpm={session.paceWpm}
                    chunkSize={session.chunkSize || 3}
                    isPlaying={isReading}
                    onWordsRead={handleWordsRead}
                  />
                )}

                {session.mode === "paragraph" && (
                  <ParagraphViewer
                    text={content.text}
                    paceWpm={session.paceWpm}
                    isPlaying={isReading}
                    onWordsRead={handleWordsRead}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Session Metrics */}
          {readingMetrics.wordsRead > 0 && (
            <Card data-testid="session-complete">
              <CardHeader>
                <CardTitle>Session Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold" data-testid="words-read">
                      {readingMetrics.wordsRead}
                    </p>
                    <p className="text-sm text-gray-600">Words Read</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="duration-ms">
                      {readingMetrics.durationMs}
                    </p>
                    <p className="text-sm text-gray-600">Duration (ms)</p>
                  </div>
                  <div>
                    <p
                      className="text-2xl font-bold"
                      data-testid="computed-wpm"
                    >
                      {computedWpm}
                    </p>
                    <p className="text-sm text-gray-600">Computed WPM</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        (readingMetrics.wordsRead / content.wordCount) * 100
                      )}
                      %
                    </p>
                    <p className="text-sm text-gray-600">Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
