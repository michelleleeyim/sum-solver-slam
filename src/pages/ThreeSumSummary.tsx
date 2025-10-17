import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Target, Clock, CheckCircle2, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSessionSummaries } from "@/lib/storage";

const ThreeSumSummary = () => {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const summaries = getSessionSummaries();
    const latestThreeSumSummary = summaries
      .filter((s: any) => s.type === "three-sum")
      .sort((a: any, b: any) => b.timestamp - a.timestamp)[0];
    setSummary(latestThreeSumSummary);
  }, []);

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No session data found</p>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        {/* Celebration Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-6">
            <Trophy className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Drill Complete!
          </h1>
          <p className="text-xl text-muted-foreground">
            You've mastered the nested pointer technique
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 mb-8"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-card to-card/80">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-accent/20">
                <CheckCircle2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Triplets Found</p>
                <p className="text-3xl font-bold text-card-foreground">
                  {summary.triplets?.length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/80">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/20">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-3xl font-bold text-card-foreground">{summary.accuracy}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/80">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-purple-500/20">
                <Trophy className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-3xl font-bold text-card-foreground">{summary.score}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/80">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-accent/20">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-3xl font-bold text-card-foreground">{summary.duration}s</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Found Triplets */}
        {summary.triplets && summary.triplets.length > 0 && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-bold mb-4 text-card-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                Triplets You Found
              </h3>
              <div className="space-y-2">
                {summary.triplets.map((triplet: number[], idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-4 py-3 bg-accent/10 rounded-lg"
                  >
                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="text-sm font-mono font-bold text-card-foreground">
                      [{triplet.join(", ")}]
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Insight Box */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 mb-8 bg-gradient-to-br from-purple-500/10 to-primary/10 border-2 border-purple-500/20">
            <h3 className="text-lg font-bold mb-3 text-card-foreground">🎯 What You Learned</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Notice how you reused the <strong>Two Pointer logic</strong> inside a loop — this is
              the foundation of problems like <strong>4Sum</strong>,{" "}
              <strong>Closest 3Sum</strong>, and <strong>Container With Most Water</strong>. By
              fixing one pointer (<span className="text-purple-500 font-bold">i</span>) and
              applying the two-pointer pattern on the remaining subarray, you've mastered a
              powerful nested technique.
            </p>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button asChild size="lg" className="flex-1 h-14 text-lg font-bold">
            <Link to="/drill/three-sum">
              <RotateCcw className="mr-2 h-5 w-5" />
              Try Again
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="flex-1 h-14 text-lg font-bold">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ThreeSumSummary;
