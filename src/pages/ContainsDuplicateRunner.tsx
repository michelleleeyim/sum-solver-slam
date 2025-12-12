import { useReducer, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Shuffle, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProblemDescription } from "@/components/drill/ProblemDescription";
import { FeedbackTray } from "@/components/drill/FeedbackTray";
import { ContainsDuplicateBoard } from "@/components/drill/ContainsDuplicateBoard";
import { reducer, initContainsDuplicate, isFinished, getTimeElapsed, getResult } from "@/core/engine/containsDuplicate";
import drillData from "@/data/contains-duplicate.drills.json";

export default function ContainsDuplicateRunner() {
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Pick a random seed
  const getRandomSeed = useCallback(() => {
    const seeds = drillData.seeds;
    return seeds[Math.floor(Math.random() * seeds.length)];
  }, []);

  const [currentSeed, setCurrentSeed] = useState(getRandomSeed);
  const [state, dispatch] = useReducer(
    reducer,
    initContainsDuplicate(currentSeed.nums)
  );

  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; message: string } | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Timer
  useEffect(() => {
    if (isFinished(state)) return;
    const timer = setInterval(() => {
      setElapsedTime(getTimeElapsed(state));
    }, 1000);
    return () => clearInterval(timer);
  }, [state]);

  // Show summary when finished
  useEffect(() => {
    if (isFinished(state)) {
      setShowSummary(true);
    }
  }, [state]);

  const showFeedbackMessage = (type: "correct" | "incorrect", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleCheckNext = () => {
    if (state.phase !== "scan" || state.idx >= state.nums.length) return;
    
    const currentNum = state.nums[state.idx];
    const willFindDuplicate = state.seen.has(currentNum);
    
    dispatch({ type: "CHECK_NEXT" });
    
    if (willFindDuplicate) {
      showFeedbackMessage("correct", `Found duplicate: ${currentNum}!`);
    } else {
      showFeedbackMessage("correct", `Added ${currentNum} to HashSet`);
    }
  };

  const handleRestart = () => {
    dispatch({ type: "RESTART", nums: currentSeed.nums });
    setShowSummary(false);
    setElapsedTime(0);
    showFeedbackMessage("correct", "Restarted!");
  };

  const handleNewSet = () => {
    const newSeed = getRandomSeed();
    setCurrentSeed(newSeed);
    dispatch({ type: "NEW_SET", nums: newSeed.nums });
    setShowSummary(false);
    setElapsedTime(0);
    showFeedbackMessage("correct", "New set loaded!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Contains Duplicate</h1>
              <p className="text-xs text-muted-foreground">
                {formatTime(elapsedTime)} • Score: {state.score}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRestart}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNewSet}>
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Problem Description */}
      <ProblemDescription
        description={drillData.problemDescription}
        storageKey="contains-duplicate-description-visible"
      />

      {/* Status Badges */}
      <div className="container mx-auto px-4 mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="text-xs">
            Phase: {state.phase === "scan" ? "Scanning" : "Complete"}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Complexity: O(n)
          </Badge>
          <Badge variant="outline" className="text-xs">
            Progress: {state.idx}/{state.nums.length}
          </Badge>
        </div>
      </div>

      {/* Main Board */}
      <div className="container mx-auto px-4">
        <ContainsDuplicateBoard state={state} />
      </div>

      {/* Controls */}
      <div className="container mx-auto px-4 mt-6">
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCheckNext}
              disabled={state.phase !== "scan" || state.idx >= state.nums.length}
              className="w-full col-span-2"
              size="lg"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Check Next Number
            </Button>
            <Button variant="outline" onClick={handleRestart} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart
            </Button>
            <Button variant="outline" onClick={handleNewSet} className="w-full">
              <Shuffle className="h-4 w-4 mr-2" />
              New Set
            </Button>
          </div>
        </Card>
      </div>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border rounded-lg p-6 max-w-md w-full shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4 text-center">
                {getResult(state) ? "Duplicate Found! 🔴" : "All Unique! ✅"}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-semibold">{formatTime(elapsedTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="font-semibold">{state.score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Elements Checked:</span>
                  <span className="font-semibold">{state.idx}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Result:</span>
                  <Badge variant={getResult(state) ? "destructive" : "default"}>
                    {getResult(state) ? "true" : "false"}
                  </Badge>
                </div>
                {state.foundDuplicate && state.duplicateValue !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Duplicate Value:</span>
                    <span className="font-mono font-bold">{state.duplicateValue}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground mb-2">Input Array:</p>
                  <div className="flex flex-wrap gap-2">
                    {state.nums.map((v, i) => (
                      <span 
                        key={i} 
                        className={`px-2 py-1 rounded font-mono text-sm ${
                          v === state.duplicateValue 
                            ? "bg-destructive/20 text-destructive" 
                            : "bg-accent text-accent-foreground"
                        }`}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button variant="outline" onClick={handleRestart} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart
                </Button>
                <Button onClick={handleNewSet} className="w-full">
                  <Shuffle className="h-4 w-4 mr-2" />
                  New Set
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Tray */}
      <FeedbackTray type={feedback?.type || null} message={feedback?.message || ""} />
    </div>
  );
}
