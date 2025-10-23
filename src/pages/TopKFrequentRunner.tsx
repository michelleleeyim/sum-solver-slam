import { useReducer, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Shuffle, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProblemDescription } from "@/components/drill/ProblemDescription";
import { FeedbackTray } from "@/components/drill/FeedbackTray";
import { TopKBoard } from "@/components/drill/TopKBoard";
import { reducer, initTopK, isFinished, getComplexity, type Mode } from "@/core/engine/topK";
import drillData from "@/data/top-k-frequent.drills.json";

export default function TopKFrequentRunner() {
  const navigate = useNavigate();
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Pick a random seed
  const getRandomSeed = useCallback(() => {
    const seeds = drillData.seeds;
    return seeds[Math.floor(Math.random() * seeds.length)];
  }, []);

  const [currentSeed, setCurrentSeed] = useState(getRandomSeed);
  const [state, dispatch] = useReducer(
    reducer,
    initTopK(currentSeed.nums, currentSeed.k, "bucket")
  );

  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; message: string } | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Timer
  useEffect(() => {
    if (!state || isFinished(state)) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [state, startTime]);

  // Show summary when finished
  useEffect(() => {
    if (isFinished(state)) {
      setShowSummary(true);
    }
  }, [state]);

  const showFeedback = (type: "correct" | "incorrect", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleProcessNext = () => {
    const prevIdx = state.idx;
    dispatch({ type: "PROCESS_NEXT" });
    if (prevIdx < state.nums.length) {
      showFeedback("correct", `Counted ${state.nums[prevIdx]}`);
    }
  };

  const handleBuildStructure = () => {
    const prevPhase = state.phase;
    dispatch({ type: "BUILD_STRUCTURE" });
    if (prevPhase === "count" && state.idx === state.nums.length) {
      showFeedback("correct", state.mode === "bucket" ? "Buckets built!" : "Heap built!");
    } else {
      showFeedback("incorrect", "Finish counting first!");
    }
  };

  const handleTakeTopK = () => {
    const prevPhase = state.phase;
    dispatch({ type: "TAKE_TOP_K" });
    if (prevPhase === "extract") {
      showFeedback("correct", `Extracted top ${state.k} elements!`);
    } else {
      showFeedback("incorrect", "Build structure first!");
    }
  };

  const handleToggleMode = () => {
    dispatch({ type: "TOGGLE_MODE" });
    showFeedback("correct", `Switched to ${state.mode === "bucket" ? "Heap" : "Bucket"} mode`);
  };

  const handleRestart = () => {
    dispatch({ type: "RESTART", nums: currentSeed.nums, k: currentSeed.k });
    setShowSummary(false);
    showFeedback("correct", "Restarted with same data");
  };

  const handleNewSet = () => {
    const newSeed = getRandomSeed();
    setCurrentSeed(newSeed);
    dispatch({ type: "NEW_SET", nums: newSeed.nums, k: newSeed.k });
    setShowSummary(false);
    showFeedback("correct", "New set loaded");
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
              <h1 className="text-lg font-bold">Top K Frequent Elements</h1>
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
        storageKey="topk-description-visible"
      />

      {/* Mode & Complexity Chips */}
      <div className="container mx-auto px-4 mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="text-xs">
            Mode: {state.mode === "bucket" ? "Bucket Sort" : "Min-Heap"}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Complexity: {getComplexity(state.mode)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Phase: {state.phase}
          </Badge>
        </div>
      </div>

      {/* Main Board */}
      <div className="container mx-auto px-4">
        <TopKBoard state={state} />
      </div>

      {/* Controls */}
      <div className="container mx-auto px-4 mt-6">
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleProcessNext}
              disabled={state.phase !== "count" || state.idx >= state.nums.length}
              className="w-full"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Process Next
            </Button>
            <Button
              onClick={handleBuildStructure}
              disabled={state.phase !== "count" || state.idx < state.nums.length}
              variant="secondary"
              className="w-full"
            >
              {state.mode === "bucket" ? "Build Buckets" : "Build Heap"}
            </Button>
            <Button
              onClick={handleTakeTopK}
              disabled={state.phase !== "extract"}
              variant="default"
              className="w-full"
            >
              Take Top-{state.k}
            </Button>
            <Button onClick={handleToggleMode} variant="outline" className="w-full">
              Toggle: {state.mode === "bucket" ? "→ Heap" : "→ Bucket"}
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
              <h2 className="text-2xl font-bold mb-4 text-center">Complete! 🎉</h2>
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
                  <span className="text-muted-foreground">Mistakes:</span>
                  <span className="font-semibold">{state.mistakes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Mode:</span>
                  <Badge>{state.mode === "bucket" ? "Bucket (O(n))" : "Heap (O(n log k))"}</Badge>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-muted-foreground mb-2">Result:</p>
                  <div className="flex flex-wrap gap-2">
                    {state.result.map((v, i) => (
                      <span key={i} className="px-2 py-1 bg-accent text-accent-foreground rounded font-mono text-sm">
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
