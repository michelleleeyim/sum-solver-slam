import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

interface ResultChipProps {
  status: "unknown" | "valid" | "invalid";
}

export function ResultChip({ status }: ResultChipProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full
          text-sm font-medium shadow-md
          ${
            status === "valid"
              ? "bg-green-500/20 text-green-700 dark:text-green-400 border-2 border-green-500"
              : status === "invalid"
              ? "bg-destructive/20 text-destructive-foreground border-2 border-destructive"
              : "bg-muted text-muted-foreground border-2 border-border"
          }
        `}
      >
        {status === "valid" && <CheckCircle2 className="h-4 w-4" />}
        {status === "invalid" && <XCircle className="h-4 w-4" />}
        {status === "unknown" && <HelpCircle className="h-4 w-4" />}
        
        <span>
          Palindrome: {status === "valid" ? "✅" : status === "invalid" ? "❌" : "?"}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
