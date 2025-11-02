"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  description,
}: BottomSheetProps) {
  // Prevent body scroll when bottom sheet is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { y: number } }
  ) => {
    if (info.offset.y > 100) {
      onOpenChange(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "max-h-[85vh] rounded-t-3xl",
              "bg-background border-t border-border",
              "shadow-2xl overflow-hidden"
            )}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="px-6 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {title && (
                    <h2 className="text-lg font-semibold text-foreground">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-11 h-11 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
