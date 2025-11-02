"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface ChunkViewerProps {
  text: string;
  paceWpm: number;
  chunkSize: number;
  isPlaying: boolean;
  onWordsRead: (words: number) => void;
}

export function ChunkViewer({
  text,
  paceWpm,
  chunkSize: initialChunkSize,
  isPlaying,
  onWordsRead,
}: ChunkViewerProps) {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [chunkSize, setChunkSize] = useState(initialChunkSize);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Split text into words and then into chunks
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const chunks: string[][] = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }

  // Calculate interval between chunks (milliseconds)
  const intervalMs = (60 * 1000 * chunkSize) / paceWpm;

  useEffect(() => {
    if (isPlaying && currentChunkIndex < chunks.length) {
      intervalRef.current = setInterval(() => {
        setCurrentChunkIndex((prev) => {
          const next = prev + 1;
          const wordsReadSoFar = Math.min(next * chunkSize, words.length);
          onWordsRead(wordsReadSoFar);

          // Stop when we reach the end
          if (next >= chunks.length) {
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
  }, [
    isPlaying,
    currentChunkIndex,
    chunks.length,
    intervalMs,
    chunkSize,
    words.length,
    onWordsRead,
  ]);

  const currentChunk = chunks[currentChunkIndex] || [];
  const progress = (currentChunkIndex / chunks.length) * 100;
  const wordsRead = Math.min((currentChunkIndex + 1) * chunkSize, words.length);

  const handleChunkSizeChange = (newSize: number) => {
    if (newSize >= 2 && newSize <= 8) {
      setChunkSize(newSize);
      // Recalculate current position
      const currentWordPosition = currentChunkIndex * chunkSize;
      const newChunkIndex = Math.floor(currentWordPosition / newSize);
      setCurrentChunkIndex(newChunkIndex);
    }
  };

  return (
    <div className="space-y-6">
      {/* Chunk Size Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleChunkSizeChange(chunkSize - 1)}
          disabled={chunkSize <= 2}
          data-testid="chunk-size-decrease-btn"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium" data-testid="current-chunk-size">
          Chunk Size: {chunkSize}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleChunkSizeChange(chunkSize + 1)}
          disabled={chunkSize >= 8}
          data-testid="chunk-size-increase-btn"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Current Chunk Display */}
      <div className="min-h-[200px] md:min-h-[240px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChunkIndex}
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -15 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center px-8 py-6 bg-primary/5 dark:bg-primary/10 rounded-xl border-2 border-primary/20 shadow-lg max-w-4xl"
            data-testid="current-chunk"
          >
            {currentChunk.join(" ")}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Chunk {currentChunkIndex + 1} of {chunks.length}
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

      {/* Chunk Context */}
      <motion.div
        className="text-center text-sm text-muted-foreground max-w-4xl mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="sr-only" aria-live="polite">
          Currently reading chunk: {currentChunk.join(" ")}
        </p>
        <p aria-hidden="true">
          {chunks[currentChunkIndex - 1]?.join(" ") && (
            <span className="opacity-50">
              {chunks[currentChunkIndex - 1].join(" ")}
            </span>
          )}{" "}
          <span className="bg-primary/20 dark:bg-primary/30 px-2 py-1 rounded font-medium text-foreground">
            {currentChunk.join(" ")}
          </span>{" "}
          {chunks[currentChunkIndex + 1]?.join(" ") && (
            <span className="opacity-50">
              {chunks[currentChunkIndex + 1].join(" ")}
            </span>
          )}
        </p>
      </motion.div>

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
          <p className="text-2xl font-bold text-foreground">{chunkSize}</p>
          <p className="text-muted-foreground text-xs mt-1">Words/Chunk</p>
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
        <motion.div
          className="p-3 rounded-lg bg-card border"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-2xl font-bold text-foreground">{wordsRead}</p>
          <p className="text-muted-foreground text-xs mt-1">Words Read</p>
        </motion.div>
      </div>
    </div>
  );
}
