import { motion } from "framer-motion";
import { Target, Trophy, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SessionHUDProps {
  progress: number;
  total: number;
  score: number;
  combo: number;
  target: number;
}

export function SessionHUD({ progress, total, score, combo, target }: SessionHUDProps) {
  const progressPercent = (progress / total) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Top row: Target and Stats */}
      <div className="flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-md"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Target className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg text-card-foreground">Target: {target}</span>
        </motion.div>

        <div className="flex gap-3">
          <motion.div
            className="flex items-center gap-1.5 bg-card px-3 py-2 rounded-full shadow-md"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Trophy className="h-4 w-4 text-primary" />
            <span className="font-bold text-card-foreground">{score}</span>
          </motion.div>

          {combo > 0 && (
            <motion.div
              className="flex items-center gap-1.5 bg-accent px-3 py-2 rounded-full shadow-md"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Zap className="h-4 w-4 text-accent-foreground" />
              <span className="font-bold text-accent-foreground">{combo}x</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>
            {progress} / {total}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>
    </div>
  );
}
