import { motion } from "framer-motion";
import { ProductState } from "@/core/engine/productArray";

interface ProductArrayBoardProps {
  state: ProductState;
}

export function ProductArrayBoard({ state }: ProductArrayBoardProps) {
  const { nums, prefix, suffix, result, i, stage } = state;

  const getStageBadgeColor = (s: string) => {
    if (s === stage) return "bg-primary text-primary-foreground";
    if (
      (s === "prefix" && (stage === "suffix" || stage === "combine" || stage === "done")) ||
      (s === "suffix" && (stage === "combine" || stage === "done"))
    ) {
      return "bg-green-500/20 text-green-500";
    }
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      {/* Stage Progress */}
      <div className="flex justify-center gap-2 flex-wrap">
        <div className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${getStageBadgeColor("prefix")}`}>
          1. Prefix Pass
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${getStageBadgeColor("suffix")}`}>
          2. Suffix Pass
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${getStageBadgeColor("combine")}`}>
          3. Combine
        </div>
      </div>

      {/* Input Array */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground text-center">Input Array</h3>
        <div className="flex justify-center gap-2 flex-wrap">
          {nums.map((num, idx) => (
            <motion.div
              key={idx}
              className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 font-bold text-lg transition-all ${
                (stage === "prefix" && idx === i) || (stage === "suffix" && idx === i)
                  ? "border-primary bg-primary/10 scale-110"
                  : "border-border bg-card"
              }`}
              animate={{
                scale: (stage === "prefix" && idx === i) || (stage === "suffix" && idx === i) ? 1.1 : 1,
              }}
            >
              {num}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Prefix Array */}
      {(stage === "prefix" || stage === "suffix" || stage === "combine" || stage === "done") && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground text-center">Prefix Products (Left → Right)</h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {prefix.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 font-bold text-lg ${
                  val === 0
                    ? "border-dashed border-muted-foreground/30 text-muted-foreground/30"
                    : "border-green-500 bg-green-500/10 text-green-600"
                }`}
              >
                {val === 0 ? "?" : val}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Suffix Array */}
      {(stage === "suffix" || stage === "combine" || stage === "done") && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground text-center">Suffix Products (Right → Left)</h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {suffix.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 font-bold text-lg ${
                  val === 0
                    ? "border-dashed border-muted-foreground/30 text-muted-foreground/30"
                    : "border-blue-500 bg-blue-500/10 text-blue-600"
                }`}
              >
                {val === 0 ? "?" : val}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Result Array */}
      {(stage === "combine" || stage === "done") && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground text-center">Result (Prefix × Suffix)</h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {result.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 font-bold text-lg ${
                  val === 0
                    ? "border-dashed border-muted-foreground/30 text-muted-foreground/30"
                    : stage === "done"
                    ? "border-primary bg-primary/20 text-primary"
                    : idx < i
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-dashed border-muted-foreground/30 text-muted-foreground/30"
                }`}
              >
                {val === 0 ? "?" : val}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Explanation */}
      <div className="text-center text-sm text-muted-foreground italic">
        {stage === "prefix" && "Building prefix products: each cell = product of all elements to the left"}
        {stage === "suffix" && "Building suffix products: each cell = product of all elements to the right"}
        {stage === "combine" && "Combining: result[i] = prefix[i] × suffix[i]"}
        {stage === "done" && "✅ Complete! Each result is the product of all elements except itself."}
      </div>
    </div>
  );
}
