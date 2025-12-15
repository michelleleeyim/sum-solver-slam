import { useReducer, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Shuffle, Play, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DesignLLState,
  DesignLLAction,
  initDesignLinkedList,
  reducer,
  isFinished,
  getTimeElapsed,
  calculateBonus,
  getCurrentOperation,
} from "@/core/engine/designLinkedList";
import DesignLinkedListBoard from "@/components/drill/DesignLinkedListBoard";
import drillData from "@/data/design-linked-list.drills.json";

export default function DesignLinkedListRunner() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, null, initDesignLinkedList);
  const [time, setTime] = useState(0);
  const [showDescription, setShowDescription] = useState(() => {
    const saved = localStorage.getItem("showDescription-design-linked-list");
    return saved !== null ? saved === "true" : true;
  });
  const [showSummary, setShowSummary] = useState(false);

  // Timer
  useEffect(() => {
    if (state.phase === "operating") {
      const interval = setInterval(() => {
        setTime(getTimeElapsed(state));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.phase, state.startTime]);

  // Show summary when done
  useEffect(() => {
    if (isFinished(state)) {
      setShowSummary(true);
    }
  }, [state.phase]);

  // Save description preference
  useEffect(() => {
    localStorage.setItem("showDescription-design-linked-list", String(showDescription));
  }, [showDescription]);

  const currentOp = getCurrentOperation(state);

  const handleSelectIndex = (index: number) => {
    dispatch({ type: "SELECT_INDEX", index });

    if (currentOp?.type === "get") {
      dispatch({ type: "CONFIRM_GET", index });
    } else if (currentOp?.type === "deleteAtIndex") {
      dispatch({ type: "CONFIRM_DELETE", index });
    }
  };

  const handleSelectSlot = (index: number) => {
    dispatch({ type: "SELECT_INDEX", index });

    if (currentOp?.type === "addAtIndex") {
      dispatch({ type: "CONFIRM_ADD_AT_INDEX", index, val: currentOp.val });
    }
  };

  const handleConfirmOperation = () => {
    if (!currentOp) return;

    if (currentOp.type === "addAtHead") {
      dispatch({ type: "CONFIRM_ADD_HEAD", val: currentOp.val });
    } else if (currentOp.type === "addAtTail") {
      dispatch({ type: "CONFIRM_ADD_TAIL", val: currentOp.val });
    }
  };

  const handleNextOperation = () => {
    dispatch({ type: "NEXT_OP" });
  };

  const bonus = calculateBonus(state);
  const finalScore = state.score + bonus;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Score: </span>
              <span className="font-bold text-foreground">{state.score}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Time: </span>
              <span className="font-mono font-bold text-foreground">{time}s</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground">Design Linked List</h1>
          <p className="text-sm text-muted-foreground">Linked List • LeetCode #707</p>
        </div>

        {/* Problem Description */}
        <div className="mb-6">
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDescription ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>Problem Description</span>
          </button>
          <AnimatePresence>
            {showDescription && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm italic text-muted-foreground mt-2 p-3 bg-muted/30 rounded-lg">
                  {drillData.problemDescription}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Board */}
        <DesignLinkedListBoard
          state={state}
          onSelectIndex={handleSelectIndex}
          onSelectSlot={handleSelectSlot}
        />

        {/* Controls */}
        <div className="mt-8 space-y-3">
          {state.phase === "ready" && (
            <Button
              onClick={() => dispatch({ type: "START" })}
              className="w-full bg-violet-600 hover:bg-violet-700"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          )}

          {state.phase === "operating" && (
            <>
              {(currentOp?.type === "addAtHead" || currentOp?.type === "addAtTail") && !state.feedback && (
                <Button
                  onClick={handleConfirmOperation}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                >
                  Confirm {currentOp.type === "addAtHead" ? "Add at Head" : "Add at Tail"}
                </Button>
              )}

              {state.feedback && (
                <Button
                  onClick={handleNextOperation}
                  className="w-full"
                  size="lg"
                >
                  Next Operation
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: "RESTART" })}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
            <Button
              variant="outline"
              onClick={() => dispatch({ type: "NEW_SET" })}
              className="flex-1"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              New Set
            </Button>
          </div>
        </div>
      </main>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-2xl font-bold text-foreground">Challenge Complete!</h2>
                {state.mistakes === 0 && (
                  <div className="mt-2 inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
                    ⭐ Perfect Run!
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">Operations</span>
                  <span className="font-bold">{state.operations.length}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-mono font-bold">{getTimeElapsed(state)}s</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">Mistakes</span>
                  <span className="font-bold">{state.mistakes}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">Base Score</span>
                  <span className="font-bold">{state.score}</span>
                </div>
                {bonus > 0 && (
                  <div className="flex justify-between p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <span>Bonus</span>
                    <span className="font-bold">+{bonus}</span>
                  </div>
                )}
                <div className="flex justify-between p-3 bg-violet-500/20 rounded-lg border border-violet-500/30">
                  <span className="font-medium text-violet-300">Final Score</span>
                  <span className="font-bold text-xl text-violet-300">{finalScore}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setShowSummary(false);
                    dispatch({ type: "RESTART" });
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    setShowSummary(false);
                    dispatch({ type: "NEW_SET" });
                  }}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  New Set
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
