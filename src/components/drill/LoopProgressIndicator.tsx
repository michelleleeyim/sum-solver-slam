import { motion } from "framer-motion";

interface LoopProgressIndicatorProps {
  currentIndex: number;
  total: number;
}

export function LoopProgressIndicator({ currentIndex, total }: LoopProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <span className="text-xs text-muted-foreground font-medium">Outer Loop Progress:</span>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, idx) => (
          <motion.div
            key={idx}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              idx < currentIndex
                ? "bg-accent"
                : idx === currentIndex
                ? "bg-purple-500 ring-2 ring-purple-300"
                : "bg-muted"
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          />
        ))}
      </div>
    </div>
  );
}
