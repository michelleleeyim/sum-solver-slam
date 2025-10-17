import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface FeedbackTrayProps {
  type: "correct" | "incorrect" | null;
  message: string;
}

export function FeedbackTray({ type, message }: FeedbackTrayProps) {
  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`
            fixed bottom-6 left-1/2 -translate-x-1/2 z-50
            px-6 py-4 rounded-2xl shadow-2xl
            flex items-center gap-3 max-w-md w-full mx-4
            ${
              type === "correct"
                ? "bg-accent text-accent-foreground"
                : "bg-destructive text-destructive-foreground"
            }
          `}
        >
          {type === "correct" ? (
            <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
          ) : (
            <XCircle className="h-6 w-6 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
