"use client";

import { motion } from "framer-motion";

interface LoadingStateProps {
  variant?: "card" | "text" | "chart" | "full";
  count?: number;
  className?: string;
}

export function LoadingState({
  variant = "card",
  count = 1,
  className = "",
}: LoadingStateProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <motion.div
                key={i}
                className="rounded-xl border border-border/50 bg-card p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <div className="space-y-3">
                  <div className="h-5 w-1/3 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        );

      case "text":
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        );

      case "chart":
        return (
          <motion.div
            className={`rounded-xl border border-border/50 bg-card p-6 shadow-sm ${className}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <div className="h-6 w-1/4 bg-muted rounded animate-pulse" />
              <div className="h-[200px] bg-muted rounded-lg animate-pulse" />
              <div className="flex gap-4">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </motion.div>
        );

      case "full":
        return (
          <motion.div
            className={`flex items-center justify-center min-h-[400px] ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center space-y-4">
              <motion.div
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return <div role="status" aria-label="Loading content">{renderSkeleton()}</div>;
}
