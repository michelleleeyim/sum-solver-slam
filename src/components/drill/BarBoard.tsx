import { motion } from "framer-motion";
import { CWState } from "@/core/engine/container";
import { area } from "@/core/engine/container";

interface BarBoardProps {
  state: CWState;
}

export function BarBoard({ state }: BarBoardProps) {
  const { H, L, R } = state;
  const maxHeight = Math.max(...H);
  const currentArea = area(H, L, R);

  return (
    <div className="relative w-full">
      {/* Area display */}
      <motion.div
        key={`${L}-${R}`}
        className="text-center mb-4 px-4 py-2 rounded-full bg-primary/20 text-primary border-2 border-primary inline-block font-bold text-sm"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        Area = min({H[L]}, {H[R]}) × {R - L} = {currentArea}
      </motion.div>

      {/* Bar chart */}
      <div className="flex gap-1 items-end justify-center h-64 px-4">
        {H.map((height, idx) => {
          const isLeft = idx === L;
          const isRight = idx === R;
          const isActive = isLeft || isRight;
          const isBetween = idx > L && idx < R;
          const heightPercent = (height / maxHeight) * 100;

          return (
            <div key={idx} className="relative flex flex-col items-center flex-1 max-w-[60px]">
              {/* Pointer badges */}
              {isLeft && (
                <motion.div
                  layoutId="left-pointer"
                  className="absolute -top-8 px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-primary-foreground"
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
                  className="absolute -top-8 px-2 py-0.5 rounded-full text-xs font-bold bg-accent text-accent-foreground"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  R
                </motion.div>
              )}

              {/* Bar */}
              <motion.div
                className="relative w-full rounded-t-lg flex flex-col justify-end"
                style={{ height: "100%" }}
                animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Water fill area (only between L and R) */}
                {isBetween && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-primary/20"
                    style={{
                      height: `${(Math.min(H[L], H[R]) / maxHeight) * 100}%`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* The bar itself */}
                <motion.div
                  className={`
                    w-full rounded-t-lg flex items-end justify-center text-xs font-bold
                    transition-all duration-300
                    ${
                      isLeft
                        ? "bg-gradient-to-t from-primary to-primary-glow text-primary-foreground"
                        : isRight
                        ? "bg-gradient-to-t from-accent to-accent/80 text-accent-foreground"
                        : "bg-card text-card-foreground border border-border"
                    }
                  `}
                  style={{ height: `${heightPercent}%` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <span className="pb-1">{height}</span>
                </motion.div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Best area tracker */}
      <motion.div
        className="text-center mt-4 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Best Area: <span className="font-bold text-foreground">{state.bestArea}</span>
      </motion.div>
    </div>
  );
}
