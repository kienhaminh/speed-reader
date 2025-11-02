"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeHintProps {
  show: boolean;
}

export function SwipeHint({ show }: SwipeHintProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none md:hidden"
    >
      <motion.div
        animate={{
          x: [-10, 10, -10],
        }}
        transition={{
          duration: 2,
          repeat: 3,
          ease: "easeInOut",
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Swipe to navigate</span>
        <ChevronRight className="h-4 w-4" />
      </motion.div>
    </motion.div>
  );
}
