import { useState, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProblemDescriptionProps {
  description: string;
  storageKey: string;
}

export function ProblemDescription({ description, storageKey }: ProblemDescriptionProps) {
  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved !== "hidden";
  });

  useEffect(() => {
    localStorage.setItem(storageKey, isVisible ? "visible" : "hidden");
  }, [isVisible, storageKey]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="mx-auto max-w-2xl px-3 mb-4">
      <div className="flex items-start gap-2 justify-center">
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
              role="note"
              aria-label="Problem description"
            >
              <p className="text-sm text-muted-foreground italic line-clamp-2 text-center">
                {description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={toggleVisibility}
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-accent/50 transition-colors"
          aria-label={isVisible ? "Hide problem description" : "Show problem description"}
        >
          {isVisible ? (
            <X className="h-4 w-4 text-muted-foreground" />
          ) : (
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}
