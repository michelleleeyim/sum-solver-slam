import { useReducer, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { RotateCcw, Shuffle, ArrowRight, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProblemDescription } from "@/components/drill/ProblemDescription";
import { TwoSumBoard } from "@/components/drill/TwoSumBoard";
import drillData from "@/data/two-sum.drills.json";
import {
  TSState,
  TSAction,
  initTwoSum,
  reducer,
  isFinished,
  getTimeElapsed,
  calculateBonus,
} from "@/core/engine/twoSum";

function getRandomSeed() {
  const seeds = drillData.seeds;
  return seeds[Math.floor(Math.random() * seeds.length)];
}

export default function TwoSumRunner() {
  const [seed, setSeed] = useState(getRandomSeed);
  const [state, dispatch] = useReducer(reducer, seed, (s) =>
    initTwoSum(s.nums, s.target)
  );
  const [timer, setTimer] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    if (isFinished(state)) return;
    const interval = setInterval(() => {
      setTimer(getTimeElapsed(state));
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  // Show summary when done
  useEffect(() => {
    if (isFinished(state)) {
      const timeout = setTimeout(() => setShowSummary(true), 800);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  const handleCheckNext = () => {
    if (isFinished(state)) return;
    
    const current = state.nums[state.idx];
    const complement = state.target - current;
    
    if (state.seen.has(complement)) {
      setFeedback(`Found! ${complement} is in HashMap`);
    } else {
      setFeedback(`${complement} not found, adding ${current} to HashMap`);
    }
    
    dispatch({ type: "CHECK_NEXT" });
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleRestart = () => {
    dispatch({ type: "RESTART" });
    setShowSummary(false);
    setFeedback(null);
  };

  const handleNewSet = () => {
    const newSeed = getRandomSeed();
    setSeed(newSeed);
    dispatch({ type: "NEW_SET", nums: newSeed.nums, target: newSeed.target });
    setShowSummary(false);
    setFeedback(null);
  };

  const bonus = calculateBonus(state);
  const totalScore = state.score + bonus;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Two Sum</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Score</div>
              <div className="font-bold text-lg text-primary">{state.score}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="font-mono text-lg">{timer}s</div>
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <ProblemDescription
          description={drillData.problemDescription}
          storageKey="two-sum-desc"
        />

        {/* Board */}
        <div className="bg-card rounded-xl p-4 mb-4 border border-border">
          <TwoSumBoard state={state} />
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-4 p-3 rounded-lg text-center text-sm font-medium ${
                feedback.includes("Found")
                  ? "bg-green-500/20 text-green-500"
                  : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handleCheckNext}
            disabled={isFinished(state)}
            className="flex-1 h-12"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Check Next
          </Button>
          <Button onClick={handleRestart} variant="outline" size="icon" className="h-12 w-12">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button onClick={handleNewSet} variant="outline" size="icon" className="h-12 w-12">
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary Modal */}
        <AnimatePresence>
          {showSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowSummary(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-xl p-6 max-w-sm w-full border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-center mb-4">
                  {state.foundPair ? "🎉 Pair Found!" : "Drill Complete"}
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Array Length</span>
                    <span className="font-bold">{state.nums.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Score</span>
                    <span className="font-bold">{state.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bonus</span>
                    <span className="font-bold text-green-500">+{bonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-mono">{timer}s</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold">Total Score</span>
                    <span className="font-bold text-primary text-xl">{totalScore}</span>
                  </div>
                  {state.foundPair && (
                    <div className="bg-green-500/20 rounded-lg p-3 text-center">
                      <div className="text-sm text-muted-foreground">Result</div>
                      <div className="font-mono font-bold">[{state.foundPair[0]}, {state.foundPair[1]}]</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRestart} variant="outline" className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart
                  </Button>
                  <Button onClick={handleNewSet} className="flex-1">
                    <Shuffle className="w-4 h-4 mr-2" />
                    New Set
                  </Button>
                </div>
                <Link to="/" className="block mt-3">
                  <Button variant="ghost" className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
