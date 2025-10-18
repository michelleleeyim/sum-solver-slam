import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, RotateCcw, Trophy, Target, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ContainerSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const stats = location.state || {
    drillType: "container",
    accuracy: 0,
    score: 0,
    totalDrills: 0,
    duration: 0,
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-accent" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Drill Complete! 🎉</h1>
            <p className="text-muted-foreground">Container With Most Water</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="p-6 text-center">
              <Target className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stats.accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </Card>

            <Card className="p-6 text-center">
              <TrendingUp className="h-6 w-6 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stats.score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </Card>

            <Card className="p-6 text-center">
              <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stats.totalDrills}</div>
              <div className="text-sm text-muted-foreground">Drills Completed</div>
            </Card>

            <Card className="p-6 text-center">
              <Clock className="h-6 w-6 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{formatTime(stats.duration)}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </Card>
          </div>

          {/* Insight */}
          <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
            <p className="text-sm text-muted-foreground text-center">
              💡 <span className="font-semibold">Key Insight:</span> Always move the pointer at the shorter line — 
              this maximizes the chance of finding a taller line that creates a larger area.
            </p>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/drill/container")}
              size="lg"
              className="w-full"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Practice Again
            </Button>

            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
