import { motion, AnimatePresence } from "framer-motion";
import { ReverseState } from "@/core/engine/reverseLinkedList";

interface Props {
  state: ReverseState;
}

export default function ReverseLinkedListBoard({ state }: Props) {
  const { nodes, prevIndex, currIndex, nextIndex, reversedUpTo, phase } = state;

  return (
    <div className="space-y-8">
      {/* Original list visualization */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Linked List
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {nodes.map((value, idx) => {
            const isReversed = idx < reversedUpTo;
            const isCurr = idx === currIndex;
            const isPrev = idx === prevIndex;
            const isNext = idx === nextIndex;

            return (
              <div key={idx} className="flex items-center">
                <motion.div
                  className={`
                    relative flex items-center justify-center
                    w-12 h-12 rounded-lg border-2 font-mono text-lg font-bold
                    transition-all duration-300
                    ${isReversed ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : ""}
                    ${isCurr ? "bg-blue-500/20 border-blue-500 text-blue-400 ring-2 ring-blue-500/50" : ""}
                    ${!isReversed && !isCurr ? "bg-muted/50 border-border text-foreground" : ""}
                  `}
                  animate={{
                    scale: isCurr ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {value}
                  
                  {/* Pointer labels */}
                  <AnimatePresence>
                    {isPrev && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-6 text-xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                      >
                        prev
                      </motion.span>
                    )}
                    {isCurr && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-6 text-xs font-semibold text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded"
                      >
                        curr
                      </motion.span>
                    )}
                    {isNext && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-6 text-xs font-semibold text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded"
                      >
                        next
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Arrow between nodes */}
                {idx < nodes.length - 1 && (
                  <motion.div
                    className={`
                      mx-1 flex items-center justify-center
                      ${idx < reversedUpTo ? "text-emerald-500" : "text-muted-foreground"}
                    `}
                    animate={{
                      rotateY: idx < reversedUpTo ? 180 : 0,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <svg
                      width="24"
                      height="12"
                      viewBox="0 0 24 12"
                      fill="none"
                      className="transform"
                    >
                      <path
                        d="M0 6H20M20 6L14 1M20 6L14 11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>
            );
          })}
          
          {/* Null terminator */}
          <div className="flex items-center">
            <div className="mx-1 text-muted-foreground">→</div>
            <div className="px-2 py-1 text-xs font-mono text-muted-foreground bg-muted/30 rounded">
              null
            </div>
          </div>
        </div>
      </div>

      {/* Pointer status panel */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <div className="text-xs text-muted-foreground mb-1">prev</div>
          <div className="font-mono font-bold text-lg">
            {prevIndex !== null ? nodes[prevIndex] : "null"}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="text-xs text-blue-400 mb-1">curr</div>
          <div className="font-mono font-bold text-lg text-blue-400">
            {currIndex !== null ? nodes[currIndex] : "null"}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <div className="text-xs text-cyan-400 mb-1">next</div>
          <div className="font-mono font-bold text-lg text-cyan-400">
            {nextIndex !== null ? nodes[nextIndex] : "null"}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Links reversed</span>
          <span>{reversedUpTo} / {nodes.length}</span>
        </div>
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${(reversedUpTo / nodes.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Phase indicator */}
      {phase === "ready" && (
        <div className="text-center py-4 text-muted-foreground">
          Tap <span className="font-semibold text-blue-400">Start Reversal</span> to begin
        </div>
      )}

      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-lg font-semibold text-emerald-400">Reversal Complete!</div>
          <div className="text-sm text-muted-foreground mt-1 font-mono">
            {[...nodes].reverse().join(" → ")} → null
          </div>
        </motion.div>
      )}
    </div>
  );
}
