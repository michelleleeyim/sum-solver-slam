import { motion } from "framer-motion";
import { TKState } from "@/core/engine/topK";

interface TopKBoardProps {
  state: TKState;
}

export function TopKBoard({ state }: TopKBoardProps) {
  const { nums, idx, freq, mode, buckets, heap, result, k } = state;

  // Get unique values sorted
  const uniqueValues = Object.keys(freq)
    .map(Number)
    .sort((a, b) => a - b);

  // Max frequency for scaling bars
  const maxFreq = Math.max(1, ...Object.values(freq));

  // Get max frequency for bucket display
  const maxBucketFreq = buckets ? Math.max(0, ...Object.keys(buckets).map(Number)) : 0;

  return (
    <div className="space-y-6">
      {/* Counting Row - Incoming Numbers */}
      <div className="bg-card rounded-lg p-4 border">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Input Array</h3>
        <div className="flex flex-wrap gap-2">
          {nums.map((num, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`
                px-3 py-2 rounded-md font-mono text-sm
                ${
                  i < idx
                    ? "bg-primary/20 text-primary border border-primary/40"
                    : i === idx
                    ? "bg-accent text-accent-foreground border-2 border-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }
              `}
            >
              {num}
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Target: Top {k} most frequent
        </p>
      </div>

      {/* Frequency Board - Bars */}
      {uniqueValues.length > 0 && (
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Frequency Count</h3>
          <div className="flex items-end gap-3 justify-center min-h-[120px]">
            {uniqueValues.map((val) => {
              const count = freq[val] || 0;
              const heightPercent = (count / maxFreq) * 100;
              return (
                <div key={val} className="flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    className="bg-primary rounded-t-md w-12 min-h-[20px] relative"
                  >
                    <motion.span
                      key={count}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary"
                    >
                      {count}
                    </motion.span>
                  </motion.div>
                  <span className="text-xs font-mono font-semibold">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extraction Panel - Bucket or Heap View */}
      {(buckets || heap) && (
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
            {mode === "bucket" ? "Bucket Sort (O(n))" : "Min-Heap (O(n log k))"}
          </h3>

          {mode === "bucket" && buckets && (
            <div className="space-y-2">
              {Array.from({ length: maxBucketFreq + 1 })
                .map((_, i) => maxBucketFreq - i)
                .filter((f) => f > 0)
                .map((freqLevel) => {
                  const values = buckets[freqLevel] || [];
                  if (values.length === 0) return null;
                  return (
                    <motion.div
                      key={freqLevel}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 bg-muted/50 p-2 rounded"
                    >
                      <span className="text-xs font-mono w-16 text-muted-foreground">
                        freq={freqLevel}:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {values.map((v) => (
                          <span
                            key={v}
                            className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm font-mono"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}

          {mode === "heap" && heap && heap.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {heap.map(([count, val], i) => (
                <motion.div
                  key={`${val}-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center gap-1 p-2 bg-muted rounded"
                >
                  <span className="text-xs text-muted-foreground">count={count}</span>
                  <span className="px-2 py-1 bg-primary text-primary-foreground rounded font-mono text-sm">
                    {val}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Result Tray */}
      {result.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/20 border-2 border-accent rounded-lg p-4"
        >
          <h3 className="text-sm font-semibold mb-3 text-accent-foreground">
            Top {k} Most Frequent
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.map((val, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.1 }}
                className="px-3 py-2 bg-accent text-accent-foreground rounded-md font-mono font-semibold"
              >
                {val}
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 italic">
            Order can be any for same frequency
          </p>
        </motion.div>
      )}
    </div>
  );
}
