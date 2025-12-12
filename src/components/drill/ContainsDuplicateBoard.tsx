import { motion } from "framer-motion";
import type { CDState } from "@/core/engine/containsDuplicate";

interface ContainsDuplicateBoardProps {
  state: CDState;
}

export function ContainsDuplicateBoard({ state }: ContainsDuplicateBoardProps) {
  const { nums, idx, seen, foundDuplicate, duplicateValue, phase } = state;

  return (
    <div className="space-y-6">
      {/* Input Array */}
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-3">Input Array</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {nums.map((num, i) => {
            const isProcessed = i < idx;
            const isCurrent = i === idx && phase === "scan";
            const isDuplicate = foundDuplicate && num === duplicateValue;

            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`
                  w-12 h-12 flex items-center justify-center rounded-lg font-mono font-bold text-lg
                  border-2 transition-all duration-300
                  ${isCurrent ? "border-primary bg-primary/20 ring-2 ring-primary/50 scale-110" : ""}
                  ${isProcessed && !isDuplicate ? "border-muted bg-muted/50 text-muted-foreground" : ""}
                  ${isDuplicate ? "border-destructive bg-destructive/20 text-destructive ring-2 ring-destructive/50" : ""}
                  ${!isProcessed && !isCurrent ? "border-border bg-card" : ""}
                `}
              >
                {num}
              </motion.div>
            );
          })}
        </div>
        {phase === "scan" && idx < nums.length && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground mt-3"
          >
            Checking: <span className="font-mono font-bold text-foreground">{nums[idx]}</span>
          </motion.p>
        )}
      </div>

      {/* HashSet Visualization */}
      <div className="bg-card border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-3">
          HashSet (Seen Numbers)
        </p>
        <div className="flex flex-wrap gap-2 justify-center min-h-[48px]">
          {seen.size === 0 && phase === "scan" && idx === 0 ? (
            <span className="text-muted-foreground text-sm italic">Empty - start checking to fill</span>
          ) : (
            Array.from(seen).map((num, i) => (
              <motion.div
                key={num}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full font-mono font-bold
                  ${foundDuplicate && num === duplicateValue 
                    ? "bg-destructive text-destructive-foreground" 
                    : "bg-accent text-accent-foreground"
                  }
                `}
              >
                {num}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Result Display */}
      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            border rounded-lg p-6 text-center
            ${foundDuplicate 
              ? "bg-destructive/10 border-destructive/50" 
              : "bg-green-500/10 border-green-500/50"
            }
          `}
        >
          <p className="text-2xl font-bold mb-2">
            {foundDuplicate ? "Duplicate Found! 🔴" : "No Duplicates! ✅"}
          </p>
          <p className="text-muted-foreground">
            {foundDuplicate 
              ? `The number ${duplicateValue} appears more than once.`
              : "Every element in the array is distinct."
            }
          </p>
          <p className="text-lg font-mono mt-3">
            Result: <span className={foundDuplicate ? "text-destructive" : "text-green-500"}>
              {foundDuplicate ? "true" : "false"}
            </span>
          </p>
        </motion.div>
      )}

      {/* Algorithm Explanation */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">How it works:</span>{" "}
          For each number, check if it's already in the HashSet. If yes → duplicate found! 
          If no → add it to the set and continue. This gives us O(n) time complexity.
        </p>
      </div>
    </div>
  );
}
