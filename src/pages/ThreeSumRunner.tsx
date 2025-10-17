import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrayBoardThreeSum } from "@/components/drill/ArrayBoardThreeSum";
import { ThreeSumChoiceBar } from "@/components/drill/ThreeSumChoiceBar";
import { FeedbackTray } from "@/components/drill/FeedbackTray";
import { FoundTripletsPanel } from "@/components/drill/FoundTripletsPanel";
import { LoopProgressIndicator } from "@/components/drill/LoopProgressIndicator";
import {
  ThreeSumState,
  ThreeSumAction,
  initializeState,
  nextState,
  correctAction,
  getCurrentSum,
  getHint,
  isFinished,
} from "@/core/engine/threeSum";
import drillsData from "@/data/threeSum.drills.json";
import { saveSessionSummary } from "@/lib/storage";

const ThreeSumRunner = () => {
  const navigate = useNavigate();
  const [drillIndex, setDrillIndex] = useState(0);
  const [state, setState] = useState<ThreeSumState | null>(null);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect" | null; message: string }>({
    type: null,
    message: "",
  });
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalMoves, setTotalMoves] = useState(0);
  const [correctMoves, setCorrectMoves] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadDrill(0);
  }, []);

  const loadDrill = (index: number) => {
    const drill = drillsData.sets[index];
    if (drill) {
      setState(initializeState(drill.nums, drill.target));
    }
  };

  const handleAction = (action: ThreeSumAction) => {
    if (!state || isFinished(state)) return;

    const correct = correctAction(state);
    const isCorrect = action === correct;

    setTotalMoves((prev) => prev + 1);

    if (isCorrect) {
      setCorrectMoves((prev) => prev + 1);
      setScore((prev) => prev + 2);
      setFeedback({ type: "correct", message: getSuccessMessage(action) });

      const newState = nextState(state, action);
      setState(newState);

      // Check if drill is finished
      if (isFinished(newState)) {
        setTimeout(() => {
          handleDrillComplete();
        }, 1500);
      }
    } else {
      setFeedback({
        type: "incorrect",
        message: getHint(state, action),
      });
    }

    // Update accuracy
    setTimeout(() => {
      setAccuracy(Math.round((correctMoves / totalMoves) * 100) || 100);
    }, 100);

    // Clear feedback after delay
    setTimeout(() => {
      setFeedback({ type: null, message: "" });
    }, 2000);
  };

  const getSuccessMessage = (action: ThreeSumAction): string => {
    if (action === "FOUND_TRIPLET") {
      return "Perfect! Triplet recorded. Continue searching...";
    } else if (action === "NEXT_I") {
      return "Inner loop complete! Moving to next base element.";
    } else {
      return "Correct move!";
    }
  };

  const handleDrillComplete = () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    saveSessionSummary({
      type: "three-sum",
      score,
      accuracy,
      totalMoves,
      correctMoves,
      duration,
      timestamp: Date.now(),
      triplets: state?.found || [],
    });

    navigate("/summary/three-sum");
  };

  const handleRestart = () => {
    setScore(0);
    setAccuracy(100);
    setTotalMoves(0);
    setCorrectMoves(0);
    loadDrill(drillIndex);
    setFeedback({ type: null, message: "" });
  };

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading drill...</p>
      </div>
    );
  }

  const currentSum = getCurrentSum(state);
  const shouldShowNextI = state.L >= state.R;
  const totalIterations = state.nums.length - 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className="text-lg font-bold text-card-foreground">{accuracy}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="text-lg font-bold text-primary">{score}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            3Sum Drill – Find Triplets
          </h1>
          <p className="text-muted-foreground">
            Fix pointer <span className="text-purple-500 font-bold">i</span>, then use{" "}
            <span className="text-primary font-bold">L</span> and{" "}
            <span className="text-accent font-bold">R</span> to find triplets
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Array Board */}
          <div className="lg:col-span-2">
            <Card className="p-8 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Target: <span className="text-2xl font-bold text-primary">{state.target}</span>
                </span>
              </div>

              <ArrayBoardThreeSum state={state} currentSum={currentSum} />

              <LoopProgressIndicator currentIndex={state.i} total={totalIterations} />
            </Card>

            {/* Choice Buttons */}
            <div className="mt-6 flex justify-center">
              <ThreeSumChoiceBar
                onMoveLeft={() => handleAction("MOVE_LEFT")}
                onMoveRight={() => handleAction("MOVE_RIGHT")}
                onFound={() => handleAction("FOUND_TRIPLET")}
                onNextI={() => handleAction("NEXT_I")}
                disabled={feedback.type !== null}
                showNextI={shouldShowNextI}
              />
            </div>
          </div>

          {/* Right Column - Found Triplets */}
          <div className="lg:col-span-1">
            <FoundTripletsPanel triplets={state.found} />
          </div>
        </div>

        {/* Feedback Tray */}
        <FeedbackTray type={feedback.type} message={feedback.message} />
      </div>
    </div>
  );
};

export default ThreeSumRunner;
