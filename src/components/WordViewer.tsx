"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  // Swipe gesture handlers for mobile navigation
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } }
  ) => {
    if (isPlaying) return; // Don't allow manual navigation while playing

    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold && currentWordIndex > 0) {
      // Swipe right = previous word
      const newIndex = currentWordIndex - 1;
      setCurrentWordIndex(newIndex);
      onWordsRead(newIndex + 1);
    } else if (info.offset.x < -swipeThreshold && currentWordIndex < words.length - 1) {
      // Swipe left = next word
      const newIndex = currentWordIndex + 1;
      setCurrentWordIndex(newIndex);
      onWordsRead(newIndex + 1);
    }
  };

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
      <div className="min-h-[240px] md:min-h-[300px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord + currentWordIndex}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="text-5xl sm:text-6xl md:text-8xl font-bold text-center px-8 py-6 bg-primary/5 dark:bg-primary/10 rounded-xl border-2 border-primary/20 shadow-lg cursor-grab active:cursor-grabbing touch-pan-x"
            data-testid="current-word"
          >
            {currentWord}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Word {currentWordIndex + 1} of {words.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
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

      {/* Word Context */}
      <motion.div
        className="text-center text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="sr-only" aria-live="polite">
          Currently reading: {currentWord}
        </p>
        <p aria-hidden="true">
          <span className="opacity-60">
            {words
              .slice(Math.max(0, currentWordIndex - 5), currentWordIndex)
              .join(" ")}
          </span>{" "}
          <span className="bg-primary/20 dark:bg-primary/30 px-2 py-1 rounded font-medium text-foreground">
            {currentWord}
          </span>{" "}
          <span className="opacity-60">
            {words.slice(currentWordIndex + 1, currentWordIndex + 6).join(" ")}
          </span>
        </p>
      </motion.div>

      {/* Reading Stats */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
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
            {Math.round(60000 / intervalMs)}
          </p>
          <p className="text-muted-foreground text-xs mt-1">Actual WPM</p>
        </motion.div>
        <motion.div
          className="p-3 rounded-lg bg-card border"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-2xl font-bold text-foreground">
            {Math.round(intervalMs)}
          </p>
          <p className="text-muted-foreground text-xs mt-1">Interval (ms)</p>
        </motion.div>
      </div>
    </div>
  );
}
