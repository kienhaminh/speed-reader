"use client";

import { useState, useEffect, useRef } from "react";

interface WordViewerProps {
  text: string;
  paceWpm: number;
  isPlaying: boolean;
  onWordsRead: (words: number) => void;
}

export function WordViewer({
  text,
  paceWpm,
  isPlaying,
  onWordsRead,
}: WordViewerProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Split text into words
  const words = text.split(/\s+/).filter((word) => word.length > 0);

  // Calculate interval between words (milliseconds)
  const wordsPerMinute = paceWpm;
  const intervalMs = (60 * 1000) / wordsPerMinute;

  useEffect(() => {
    if (isPlaying && currentWordIndex < words.length) {
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex((prev) => {
          const next = prev + 1;
          onWordsRead(next);

          // Stop when we reach the end
          if (next >= words.length) {
            return prev;
          }

          return next;
        });
      }, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentWordIndex, words.length, intervalMs, onWordsRead]);

  const currentWord = words[currentWordIndex] || "";
  const progress = (currentWordIndex / words.length) * 100;

  return (
    <div className="space-y-6">
      {/* Current Word Display */}
      <div className="min-h-[200px] flex items-center justify-center">
        <div
          className="text-6xl md:text-8xl font-bold text-center px-8 py-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800"
          data-testid="current-word"
        >
          {currentWord}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Word {currentWordIndex + 1} of {words.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Word Context */}
      <div className="text-center text-sm text-gray-600 max-w-2xl mx-auto">
        <p>
          {words
            .slice(Math.max(0, currentWordIndex - 5), currentWordIndex)
            .join(" ")}{" "}
          <span className="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">
            {currentWord}
          </span>{" "}
          {words.slice(currentWordIndex + 1, currentWordIndex + 6).join(" ")}
        </p>
      </div>

      {/* Reading Stats */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="font-semibold">{paceWpm}</p>
          <p className="text-gray-600">Target WPM</p>
        </div>
        <div>
          <p className="font-semibold">{Math.round(60000 / intervalMs)}</p>
          <p className="text-gray-600">Actual WPM</p>
        </div>
        <div>
          <p className="font-semibold">{Math.round(intervalMs)}</p>
          <p className="text-gray-600">Word Interval (ms)</p>
        </div>
      </div>
    </div>
  );
}
