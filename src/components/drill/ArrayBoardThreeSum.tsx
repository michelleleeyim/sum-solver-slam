import { motion } from "framer-motion";
import { ThreeSumState } from "@/core/engine/threeSum";

interface ArrayBoardThreeSumProps {
  state: ThreeSumState;
  currentSum: number;
}

export function ArrayBoardThreeSum({ state, currentSum }: ArrayBoardThreeSumProps) {
  const { nums, i, L, R, target } = state;

  return (
    <div className="relative w-full">
      {/* Array tiles */}
      <div className="flex gap-2 justify-center items-end mb-20">
        {nums.map((num, idx) => {
          const isI = idx === i;
          const isLeft = idx === L;
          const isRight = idx === R;
          const isActive = isI || isLeft || isRight;

          return (
            <div key={idx} className="relative flex flex-col items-center">
              {/* Pointer badges */}
              {isI && (
                <motion.div
                  layoutId="i-pointer"
                  className="absolute -top-10 px-3 py-1 rounded-full text-xs font-bold bg-purple-500 text-white"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  i (Fixed)
                </motion.div>
              )}
              {isLeft && (
                <motion.div
                  layoutId="left-pointer"
                  className="absolute -top-10 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  L
                </motion.div>
              )}
              {isRight && (
                <motion.div
                  layoutId="right-pointer"
                  className="absolute -top-10 px-3 py-1 rounded-full text-xs font-bold bg-accent text-accent-foreground"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  R
                </motion.div>
              )}

              {/* Number tile */}
              <motion.div
                className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold
                  shadow-md transition-all duration-300
                  ${
                    isI
                      ? "bg-purple-500 text-white scale-110 ring-4 ring-purple-300"
                      : isLeft
                      ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground scale-110"
                      : isRight
                      ? "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground scale-110"
                      : "bg-card text-card-foreground"
                  }
                `}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {num}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Sum bubble */}
      <motion.div
        key={`${i}-${L}-${R}`}
        className={`
          absolute left-1/2 -translate-x-1/2 -bottom-12
          px-4 py-2 rounded-full font-bold text-sm
          shadow-lg
          ${
            currentSum === target
              ? "bg-accent text-accent-foreground"
              : currentSum < target
              ? "bg-primary/20 text-primary border-2 border-primary"
              : "bg-destructive/20 text-destructive border-2 border-destructive"
          }
        `}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        ({nums[i]}) + {nums[L]} + {nums[R]} = {currentSum}
      </motion.div>
    </div>
  );
}
