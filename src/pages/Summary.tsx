import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSessions, type SessionSummary } from "@/lib/storage";
import { Trophy, Target, Zap, ArrowRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const Summary = () => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const latestSession = sessions[0];

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  if (!latestSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary">
        <Card className="p-8 max-w-md text-center">
          <p className="text-muted-foreground mb-4">No session data found</p>
          <Button asChild>
            <Link to="/">Start a Drill</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-4">
            <Trophy className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">Session Complete!</h1>
          <p className="text-muted-foreground">Here's how you did</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-8"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 text-center bg-gradient-to-br from-card to-card/80">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-card-foreground mb-1">
              {latestSession.totalScore}
            </p>
            <p className="text-sm text-muted-foreground">Total Score</p>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-card to-card/80">
            <Target className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="text-3xl font-bold text-card-foreground mb-1">
              {latestSession.accuracy.toFixed(0)}%
            </p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-card to-card/80">
            <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-card-foreground mb-1">
              {latestSession.longestCombo}x
            </p>
            <p className="text-sm text-muted-foreground">Longest Combo</p>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-card to-card/80">
            <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="text-3xl font-bold text-card-foreground mb-1">
              {latestSession.correctFirstTry}/{latestSession.totalDrills}
            </p>
            <p className="text-sm text-muted-foreground">First Try</p>
          </Card>
        </motion.div>

        {/* Performance Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-primary-glow/10 border-2 border-primary/30">
            <div className="text-center">
              <p className="text-lg font-bold text-card-foreground mb-2">
                {latestSession.accuracy >= 80
                  ? "🌟 Excellent Work!"
                  : latestSession.accuracy >= 60
                  ? "👍 Good Job!"
                  : "💪 Keep Practicing!"}
              </p>
              <p className="text-sm text-muted-foreground">
                {latestSession.accuracy >= 80
                  ? "You've mastered this pattern. Try a harder set!"
                  : latestSession.accuracy >= 60
                  ? "You're getting the hang of it. One more round?"
                  : "Practice makes perfect. Try again to improve!"}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            asChild
            size="lg"
            className="h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-primary-foreground"
          >
            <Link to={`/drill/two-pointers?mode=${latestSession.mode}`}>
              Run Another Set
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 text-lg">
            <Link to="/">Back to Home</Link>
          </Button>
        </motion.div>

        {/* Session History */}
        {sessions.length > 1 && (
          <motion.div
            className="mt-12"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-bold mb-4 text-foreground">Recent Sessions</h2>
            <div className="space-y-2">
              {sessions.slice(1, 4).map((session) => (
                <Card key={session.id} className="p-4 bg-card/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-card-foreground">
                        {session.mode.toUpperCase()} • {session.difficulty}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-card-foreground">{session.totalScore} pts</p>
                      <p className="text-sm text-muted-foreground">
                        {session.accuracy.toFixed(0)}% accuracy
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Summary;
