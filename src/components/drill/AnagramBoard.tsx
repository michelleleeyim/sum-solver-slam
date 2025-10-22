import { motion } from "framer-motion";
import { VAState } from "@/core/engine/validAnagram";

interface AnagramBoardProps {
  state: VAState;
  lastAction?: string;
}

export function AnagramBoard({ state, lastAction }: AnagramBoardProps) {
  const { s, t, iS, iT, freq, mode, sortedS, sortedT } = state;

  const renderStringRow = (str: string, currentIndex: number, label: string, color: string) => (
    <div className="mb-6">
      <div className="text-sm font-medium text-muted-foreground mb-2">{label}</div>
      <div className="flex gap-1 flex-wrap">
        {str.split("").map((char, idx) => {
          const isActive = idx === currentIndex;
          const isProcessed = idx < currentIndex;
          
          return (
            <motion.div
              key={`${label}-${idx}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: isActive ? 1.05 : 1, 
                opacity: 1 
              }}
              className={`
                w-10 h-10 flex items-center justify-center
                rounded border-2 font-mono text-lg
                transition-all duration-200
                ${isActive ? `${color} border-current shadow-lg` : ""}
                ${isProcessed && !isActive ? "bg-muted/50 border-muted" : "border-border"}
                ${!isActive && !isProcessed ? "bg-background" : ""}
              `}
            >
              {char}
            </motion.div>
          );
        })}
      </div>
      {mode === "sort" && (label === "s:" ? sortedS : sortedT) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm font-mono text-muted-foreground"
        >
          Sorted: {label === "s:" ? sortedS : sortedT}
        </motion.div>
      )}
    </div>
  );

  const freqEntries = Object.entries(freq).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="flex gap-8 flex-col lg:flex-row">
      <div className="flex-1">
        {renderStringRow(s, iS, "s:", "text-primary bg-primary/10")}
        {renderStringRow(t, iT, "t:", "text-secondary bg-secondary/10")}
      </div>

      {mode === "count" && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 bg-card border border-border rounded-lg p-4"
        >
          <h3 className="text-sm font-semibold mb-3 text-foreground">Frequency Map</h3>
          {freqEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Empty</p>
          ) : (
            <div className="space-y-1">
              {freqEntries.map(([char, count]) => (
                <motion.div
                  key={char}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className={`
                    flex justify-between items-center p-2 rounded
                    ${count > 0 ? "bg-primary/10 text-primary" : ""}
                    ${count < 0 ? "bg-secondary/10 text-secondary" : ""}
                    ${count === 0 ? "bg-muted/50 text-muted-foreground" : ""}
                  `}
                >
                  <span className="font-mono font-medium">{char}</span>
                  <span className="font-mono text-sm">{count > 0 ? `+${count}` : count}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
