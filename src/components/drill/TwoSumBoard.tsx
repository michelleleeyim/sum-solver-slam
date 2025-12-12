import { motion } from "framer-motion";
import { TSState } from "@/core/engine/twoSum";

interface TwoSumBoardProps {
  state: TSState;
}

export function TwoSumBoard({ state }: TwoSumBoardProps) {
  const { nums, target, idx, seen, phase, foundPair } = state;

  return (
    <div className="space-y-6">
      {/* Target Display */}
      <div className="text-center">
        <span className="text-muted-foreground text-sm">Target Sum:</span>
        <div className="text-3xl font-bold text-primary">{target}</div>
      </div>

      {/* Input Array */}
      <div>
        <div className="text-sm text-muted-foreground mb-2 text-center">Input Array</div>
        <div className="flex justify-center gap-2 flex-wrap">
          {nums.map((num, i) => {
            const isCurrentIdx = i === idx && phase === "scan";
            const isInSeen = seen.has(num) && seen.get(num) === i;
            const isFoundPair = foundPair && (i === foundPair[0] || i === foundPair[1]);
            const isPastIdx = i < idx;

            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: isCurrentIdx ? 1.15 : 1, 
                  opacity: 1,
                }}
                className={`
                  w-14 h-14 rounded-lg flex flex-col items-center justify-center font-mono text-lg font-bold
                  transition-all duration-200
                  ${isFoundPair 
                    ? "bg-green-500 text-white ring-4 ring-green-300" 
                    : isCurrentIdx 
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/50" 
                      : isPastIdx
                        ? "bg-muted text-muted-foreground"
                        : "bg-secondary text-secondary-foreground"
                  }
                `}
              >
                <span>{num}</span>
                <span className="text-[10px] opacity-60">[{i}]</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Current Check Info */}
      {phase === "scan" && idx < nums.length && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/50 rounded-lg p-4 text-center"
        >
          <div className="text-sm text-muted-foreground mb-1">Current Check</div>
          <div className="font-mono text-lg">
            <span className="text-primary font-bold">{nums[idx]}</span>
            <span className="text-muted-foreground"> + </span>
            <span className="text-orange-500 font-bold">{target - nums[idx]}</span>
            <span className="text-muted-foreground"> = {target}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Looking for <span className="text-orange-500 font-bold">{target - nums[idx]}</span> in HashMap
          </div>
        </motion.div>
      )}

      {/* HashMap (Seen) */}
      <div>
        <div className="text-sm text-muted-foreground mb-2 text-center">
          HashMap (seen) — {seen.size} entries
        </div>
        <div className="flex justify-center gap-2 flex-wrap min-h-[56px]">
          {seen.size === 0 ? (
            <div className="text-muted-foreground text-sm italic">Empty</div>
          ) : (
            Array.from(seen.entries()).map(([value, index]) => (
              <motion.div
                key={`${value}-${index}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-orange-500/20 border border-orange-500/50 rounded-lg px-3 py-2 text-center"
              >
                <div className="font-mono font-bold text-orange-500">{value}</div>
                <div className="text-[10px] text-muted-foreground">idx: {index}</div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Found Pair Result */}
      {foundPair && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-500/20 border-2 border-green-500 rounded-xl p-4 text-center"
        >
          <div className="text-green-500 font-bold text-lg mb-1">✅ Pair Found!</div>
          <div className="font-mono">
            nums[{foundPair[0]}] + nums[{foundPair[1]}] = {nums[foundPair[0]]} + {nums[foundPair[1]]} = {target}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Return indices: [{foundPair[0]}, {foundPair[1]}]
          </div>
        </motion.div>
      )}

      {/* No Pair Found */}
      {phase === "done" && !foundPair && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 text-center"
        >
          <div className="text-red-500 font-bold text-lg">No pair found</div>
          <div className="text-sm text-muted-foreground">
            No two numbers add up to {target}
          </div>
        </motion.div>
      )}
    </div>
  );
}
