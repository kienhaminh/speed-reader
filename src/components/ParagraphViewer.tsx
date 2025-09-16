"use client";

import { useState, useEffect, useRef } from "react";
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
          let className =
            "p-6 rounded-lg border-2 transition-all duration-300 ";

          if (index === currentParagraphIndex) {
            className +=
              "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 highlighted";
          } else if (index < currentParagraphIndex) {
            className +=
              "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 completed";
          } else {
            className +=
              "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700";
          }

          return (
            <div
              key={index}
              className={className}
              data-testid={`paragraph-${index}`}
            >
              <p className="text-lg leading-relaxed">{paragraph}</p>
              <div className="mt-2 text-xs text-gray-500">
                Paragraph {index + 1} • {paragraphWordCounts[index]} words
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span data-testid="reading-progress">
            {Math.round(progress)}% complete
          </span>
          <span data-testid="paragraphs-read">
            {currentParagraphIndex + 1} paragraphs read
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Reading Stats */}
      <div className="grid grid-cols-4 gap-4 text-center text-sm">
        <div>
          <p className="font-semibold">{paceWpm}</p>
          <p className="text-gray-600">Target WPM</p>
        </div>
        <div>
          <p className="font-semibold">{currentParagraphWords}</p>
          <p className="text-gray-600">Words in Current</p>
        </div>
        <div>
          <p className="font-semibold">
            {Math.round(timePerParagraphMs / 1000)}
          </p>
          <p className="text-gray-600">Seconds/Paragraph</p>
        </div>
        <div>
          <p className="font-semibold">{totalWordsInCurrentParagraphs}</p>
          <p className="text-gray-600">Total Words Read</p>
        </div>
      </div>
    </div>
  );
}
