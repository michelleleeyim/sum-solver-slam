import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PalindromeSummary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "micro";
  const score = parseInt(searchParams.get("score") || "0");
  const accuracy = parseInt(searchParams.get("accuracy") || "0");

  const [displayScore, setDisplayScore] = useState(0);
  const [displayAccuracy, setDisplayAccuracy] = useState(0);

  useEffect(() => {
    const scoreInterval = setInterval(() => {
      setDisplayScore((prev) => {
        const next = prev + Math.ceil(score / 20);
        return next >= score ? score : next;
      });
    }, 50);

    const accuracyInterval = setInterval(() => {
      setDisplayAccuracy((prev) => {
        const next = prev + Math.ceil(accuracy / 20);
        return next >= accuracy ? accuracy : next;
      });
    }, 50);

    return () => {
      clearInterval(scoreInterval);
      clearInterval(accuracyInterval);
    };
  }, [score, accuracy]);

  const getGrade = (acc: number) => {
    if (acc >= 95) return { grade: "S", color: "text-yellow-500", desc: "Perfect!" };
    if (acc >= 85) return { grade: "A", color: "text-green-500", desc: "Excellent" };
    if (acc >= 75) return { grade: "B", color: "text-blue-500", desc: "Great" };
    if (acc >= 65) return { grade: "C", color: "text-purple-500", desc: "Good" };
    return { grade: "D", color: "text-gray-500", desc: "Keep Practicing" };
  };

  const gradeInfo = getGrade(accuracy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 bg-card/80 backdrop-blur-sm border-2">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-4">
              <Trophy className="h-10 w-10 text-accent-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Drill Complete!</h1>
            <p className="text-muted-foreground capitalize">{mode} Mode - Valid Palindrome</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Score */}
            <motion.div
              className="text-center p-6 rounded-xl bg-primary/10 border-2 border-primary/20"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-4xl font-bold text-primary mb-1">{displayScore}</div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </motion.div>

            {/* Accuracy */}
            <motion.div
              className="text-center p-6 rounded-xl bg-accent/10 border-2 border-accent/20"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <TrendingUp className="h-8 w-8 text-accent-foreground mx-auto mb-2" />
              <div className="text-4xl font-bold text-accent-foreground mb-1">
                {displayAccuracy}%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </motion.div>
          </div>

          {/* Grade */}
          <motion.div
            className="text-center mb-8 p-6 rounded-xl bg-muted/50"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className={`text-6xl font-bold mb-2 ${gradeInfo.color}`}>
              {gradeInfo.grade}
            </div>
            <div className="text-lg text-muted-foreground">{gradeInfo.desc}</div>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={() => navigate(`/drill/palindrome?mode=${mode}`)}
              className="flex-1 h-12 gap-2"
              size="lg"
            >
              <RotateCcw className="h-5 w-5" />
              Try Again
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1 h-12 gap-2"
              size="lg"
            >
              <Home className="h-5 w-5" />
              Home
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
