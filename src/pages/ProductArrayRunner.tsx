import { useReducer, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ProductArrayBoard } from "@/components/drill/ProductArrayBoard";
import { ProblemDescription } from "@/components/drill/ProblemDescription";
import { reducer, initProductArray, isFinished, getTimeElapsed, calculateBonus } from "@/core/engine/productArray";
import drillData from "@/data/product-array.drills.json";

export default function ProductArrayRunner() {
  const navigate = useNavigate();
  const getRandomSeed = () => drillData.seeds[Math.floor(Math.random() * drillData.seeds.length)];
  
  const [state, dispatch] = useReducer(reducer, getRandomSeed().nums, initProductArray);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (isFinished(state)) {
      setShowSummary(true);
      return;
    }

    const timer = setInterval(() => {
      setElapsedTime(getTimeElapsed(state));
    }, 1000);

    return () => clearInterval(timer);
  }, [state]);

  const handleNextStep = () => {
    dispatch("NEXT_STEP");
  };

  const handleRestart = () => {
    setShowSummary(false);
    setElapsedTime(0);
    dispatch("RESTART");
  };

  const handleNewSet = () => {
    setShowSummary(false);
    setElapsedTime(0);
    dispatch("NEW_SET");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const bonus = calculateBonus(state, elapsedTime);
  const finalScore = state.score + bonus;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-4 text-sm">
            <div className="font-mono font-semibold">⏱️ {formatTime(elapsedTime)}</div>
            <div className="font-mono font-semibold">⭐ {state.score}</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">{drillData.title}</h1>
        
        <ProblemDescription
          description={drillData.problemDescription}
          storageKey="product-array-description-visible"
        />

        <div className="flex justify-center gap-2 mt-4">
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            Time: O(n)
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            Space: O(1) excluding output
          </div>
        </div>
      </div>

      {/* Board */}
      <ProductArrayBoard state={state} />

      {/* Controls */}
      <div className="max-w-4xl mx-auto mt-8 flex justify-center gap-3 flex-wrap">
        <Button
          onClick={handleNextStep}
          disabled={isFinished(state)}
          size="lg"
          className="gap-2"
        >
          <Play className="h-5 w-5" />
          Next Step
        </Button>
        <Button
          onClick={handleRestart}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <RotateCcw className="h-5 w-5" />
          Restart
        </Button>
        <Button
          onClick={handleNewSet}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <Sparkles className="h-5 w-5" />
          New Set
        </Button>
      </div>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border rounded-lg shadow-lg p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-center mb-6">🎉 Complete!</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-mono font-bold">{formatTime(elapsedTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="font-mono font-bold">{state.score}</span>
                </div>
                {bonus > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Bonus:</span>
                    <span className="font-mono font-bold">+{bonus}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg pt-2 border-t">
                  <span className="font-semibold">Final Score:</span>
                  <span className="font-mono font-bold text-primary">{finalScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Result:</span>
                  <span className="font-mono text-sm">[{state.result.join(", ")}]</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleNewSet} className="flex-1 gap-2">
                  <Sparkles className="h-4 w-4" />
                  New Set
                </Button>
                <Button onClick={handleRestart} variant="outline" className="flex-1 gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
