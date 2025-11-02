"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";

interface ParagraphViewerProps {
  text: string;
  paceWpm: number;
  isPlaying: boolean;
  onWordsRead: (words: number) => void;
}

export function ParagraphViewer({
  text,
  paceWpm,
  isPlaying,
  onWordsRead,
}: ParagraphViewerProps) {
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Split text into paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  // Calculate words per paragraph and total words read
  const paragraphWordCounts = paragraphs.map(
    (p) => p.split(/\s+/).filter((w) => w.length > 0).length
  );
  const totalWordsInCurrentParagraphs = paragraphWordCounts
    .slice(0, currentParagraphIndex + 1)
    .reduce((sum, count) => sum + count, 0);

  // Calculate time to read current paragraph
  const currentParagraphWords = paragraphWordCounts[currentParagraphIndex] || 0;
  const timePerParagraphMs = (currentParagraphWords / paceWpm) * 60 * 1000;

  useEffect(() => {
    if (isPlaying && currentParagraphIndex < paragraphs.length) {
      intervalRef.current = setTimeout(() => {
        setCurrentParagraphIndex((prev) => {
          const next = prev + 1;
          onWordsRead(totalWordsInCurrentParagraphs);

          // Stop when we reach the end
          if (next >= paragraphs.length) {
            return prev;
          }

          return next;
        });
      }, timePerParagraphMs);
    } else {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [
    isPlaying,
    currentParagraphIndex,
    paragraphs.length,
    timePerParagraphMs,
    totalWordsInCurrentParagraphs,
    onWordsRead,
  ]);

  const progress = ((currentParagraphIndex + 1) / paragraphs.length) * 100;

  const handlePreviousParagraph = () => {
    if (currentParagraphIndex > 0) {
      setCurrentParagraphIndex(currentParagraphIndex - 1);
      const wordsRead = paragraphWordCounts
        .slice(0, currentParagraphIndex)
        .reduce((sum, count) => sum + count, 0);
      onWordsRead(wordsRead);
    }
  };

  const handleNextParagraph = () => {
    if (currentParagraphIndex < paragraphs.length - 1) {
      setCurrentParagraphIndex(currentParagraphIndex + 1);
      const wordsRead = paragraphWordCounts
        .slice(0, currentParagraphIndex + 2)
        .reduce((sum, count) => sum + count, 0);
      onWordsRead(wordsRead);
    }
  };

  const handleSkipToEnd = () => {
    setCurrentParagraphIndex(paragraphs.length - 1);
    const totalWords = paragraphWordCounts.reduce(
      (sum, count) => sum + count,
      0
    );
    onWordsRead(totalWords);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousParagraph}
          disabled={currentParagraphIndex === 0}
          data-testid="prev-paragraph-btn"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <span className="text-sm font-medium" data-testid="paragraph-progress">
          {currentParagraphIndex + 1} of {paragraphs.length}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextParagraph}
          disabled={currentParagraphIndex === paragraphs.length - 1}
          data-testid="next-paragraph-btn"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSkipToEnd}
          data-testid="skip-to-end-btn"
        >
          <SkipForward className="h-4 w-4" />
          Skip to End
        </Button>
      </div>

      {/* Paragraph Count Display */}
      <div
        className="text-center text-sm text-gray-600"
        data-testid="paragraph-count"
      >
        {paragraphs.length} paragraphs
      </div>

      {/* Paragraphs Display */}
      <div className="space-y-4" data-testid="paragraph-container">
        {paragraphs.map((paragraph, index) => {
          const isActive = index === currentParagraphIndex;
          const isCompleted = index < currentParagraphIndex;
          const isPending = index > currentParagraphIndex;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isPending ? 0.6 : 1,
                y: 0,
                scale: isActive ? 1 : 0.98,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                isActive
                  ? "bg-primary/5 dark:bg-primary/10 border-primary/30 shadow-lg highlighted"
                  : isCompleted
                  ? "bg-muted/50 border-muted opacity-60 completed"
                  : "bg-card border-border"
              }`}
              data-testid={`paragraph-${index}`}
            >
              <p className="text-lg leading-loose max-w-[70ch]">{paragraph}</p>
              <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                <span>Paragraph {index + 1}</span>
                <span>•</span>
                <span>{paragraphWordCounts[index]} words</span>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-2 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-medium"
                  >
                    Reading now
                  </motion.span>
                )}
                {isCompleted && (
                  <span className="ml-2 text-xs">✓ Completed</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span data-testid="reading-progress">
            {Math.round(progress)}% complete
          </span>
          <span data-testid="paragraphs-read">
            {currentParagraphIndex + 1} paragraphs read
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Reading Stats */}
      <div className="grid grid-cols-4 gap-4 text-center text-sm">
        <motion.div
          className="p-3 rounded-lg bg-card border"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-2xl font-bold text-foreground">{paceWpm}</p>
          <p className="text-muted-foreground text-xs mt-1">Target WPM</p>
        </motion.div>
        <motion.div
          className="p-3 rounded-lg bg-card border"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-2xl font-bold text-foreground">
            {currentParagraphWords}
          </p>
          <p className="text-muted-foreground text-xs mt-1">Current Words</p>
        </motion.div>
        <motion.div
          className="p-3 rounded-lg bg-card border"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-2xl font-bold text-foreground">
            {Math.round(timePerParagraphMs / 1000)}
          </p>
          <p className="text-muted-foreground text-xs mt-1">Seconds/Para</p>
        </motion.div>
        <motion.div
          className="p-3 rounded-lg bg-card border"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-2xl font-bold text-foreground">
            {totalWordsInCurrentParagraphs}
          </p>
          <p className="text-muted-foreground text-xs mt-1">Total Words</p>
        </motion.div>
      </div>
    </div>
  );
}
