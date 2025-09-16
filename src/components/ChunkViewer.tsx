"use client";

import { useState, useEffect, useRef } from "react";
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
      <div className="min-h-[200px] flex items-center justify-center">
        <div
          className="text-4xl md:text-5xl font-bold text-center px-8 py-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800 max-w-4xl"
          data-testid="current-chunk"
        >
          {currentChunk.join(" ")}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Chunk {currentChunkIndex + 1} of {chunks.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Chunk Context */}
      <div className="text-center text-sm text-gray-600 max-w-4xl mx-auto">
        <p>
          {chunks[currentChunkIndex - 1]?.join(" ") && (
            <span className="text-gray-400">
              {chunks[currentChunkIndex - 1].join(" ")}
            </span>
          )}{" "}
          <span className="bg-yellow-200 dark:bg-yellow-900/50 px-2 py-1 rounded">
            {currentChunk.join(" ")}
          </span>{" "}
          {chunks[currentChunkIndex + 1]?.join(" ") && (
            <span className="text-gray-400">
              {chunks[currentChunkIndex + 1].join(" ")}
            </span>
          )}
        </p>
      </div>

      {/* Reading Stats */}
      <div className="grid grid-cols-4 gap-4 text-center text-sm">
        <div>
          <p className="font-semibold">{paceWpm}</p>
          <p className="text-gray-600">Target WPM</p>
        </div>
        <div>
          <p className="font-semibold">{chunkSize}</p>
          <p className="text-gray-600">Words/Chunk</p>
        </div>
        <div>
          <p className="font-semibold">{Math.round(intervalMs)}</p>
          <p className="text-gray-600">Chunk Interval (ms)</p>
        </div>
        <div>
          <p className="font-semibold">{wordsRead}</p>
          <p className="text-gray-600">Words Read</p>
        </div>
      </div>
    </div>
  );
}
