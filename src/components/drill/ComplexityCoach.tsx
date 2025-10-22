import { motion } from "framer-motion";
import { Zap, Clock } from "lucide-react";

interface ComplexityCoachProps {
  mode: "count" | "sort";
}

export function ComplexityCoach({ mode }: ComplexityCoachProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2 p-4 bg-card border border-border rounded-lg"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Zap className="h-4 w-4 text-primary" />
        Complexity Coach
      </div>
      
      {mode === "count" ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 text-green-500" />
            <span className="text-green-600 dark:text-green-400 font-medium">O(n) time</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">O(k) space</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Optimal approach! ⭐ Bonus XP
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400 font-medium">O(n log n) time</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">O(1) space (in-place)</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Valid but slower
          </p>
        </div>
      )}
    </motion.div>
  );
}
