import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FoundTripletsPanelProps {
  triplets: number[][];
}

export function FoundTripletsPanel({ triplets }: FoundTripletsPanelProps) {
  if (triplets.length === 0) return null;

  return (
    <Card className="p-4 bg-accent/10 border-2 border-accent/30">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="h-5 w-5 text-accent" />
        <h3 className="font-bold text-card-foreground">Found Triplets</h3>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {triplets.map((triplet, idx) => (
            <motion.div
              key={`${triplet.join("-")}-${idx}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex items-center gap-2 px-3 py-2 bg-accent/20 rounded-lg"
            >
              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
              <span className="text-sm font-mono font-bold text-card-foreground">
                [{triplet.join(", ")}]
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
}
