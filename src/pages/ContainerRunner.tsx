import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarBoard } from "@/components/drill/BarBoard";
import { ChoiceBar } from "@/components/drill/ChoiceBar";
import { FeedbackTray } from "@/components/drill/FeedbackTray";
import { SessionHUD } from "@/components/drill/SessionHUD";
import { ProblemDescription } from "@/components/drill/ProblemDescription";
import {
  CWState,
  CWAction,
  correctAction,
  nextState,
  isFinished,
  getHint,
  initializeState,
} from "@/core/engine/container";
import { saveSessionSummary } from "@/lib/storage";
import { generateContainerDrill } from "@/lib/drillGenerator";

const PROBLEM_DESCRIPTION = "Given n non-negative integers representing vertical line heights, find two lines that together with the x-axis form a container that holds the most water.";
const TOTAL_DRILLS = 10;

export default function ContainerRunner() {
  const navigate = useNavigate();
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [state, setState] = useState<CWState | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [correctMoves, setCorrectMoves] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect" | null; message: string }>({
    type: null,
    message: "",
  });
  const [startTime] = useState(Date.now());
  const [drillStats, setDrillStats] = useState<{ correct: boolean; attempts: number }[]>([]);

  useEffect(() => {
    loadDrill(0);
  }, []);

  const loadDrill = (index: number) => {
    if (index >= TOTAL_DRILLS) {
      finishSession();
      return;
    }

    const drill = generateContainerDrill("easy");
    setState(initializeState(drill.H));
    setAttempts(0);
    setFeedback({ type: null, message: "" });
  };

  const handleAction = (action: CWAction) => {
    if (!state || isFinished(state)) return;

    const correct = correctAction(state);
    const isCorrect = action === correct || correct === "EITHER";
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setTotalMoves(totalMoves + 1);

    if (isCorrect) {
      setCorrectMoves(correctMoves + 1);
      const points = newAttempts === 1 ? 2 : newAttempts === 2 ? 1 : 0;
      const newCombo = newAttempts === 1 ? combo + 1 : 0;
      const bonusPoints = newCombo > 0 && newCombo % 3 === 0 ? 1 : 0;

      setScore(score + points + bonusPoints);
      setCombo(newCombo);
      setFeedback({
        type: "correct",
        message: newAttempts === 1 ? "Perfect! ✨" : "Correct!",
      });

      const newState = nextState(state, action);
      setState(newState);

      setTimeout(() => setFeedback({ type: null, message: "" }), 1200);

      if (isFinished(newState)) {
        setDrillStats([...drillStats, { correct: true, attempts: newAttempts }]);
        setTimeout(() => {
          setCurrentDrillIndex(currentDrillIndex + 1);
          loadDrill(currentDrillIndex + 1);
        }, 1500);
      }
    } else {
      setCombo(0);
      const hint = getHint(state, action);
      setFeedback({
        type: "incorrect",
        message: hint || "Try again!",
      });
      setTimeout(() => setFeedback({ type: null, message: "" }), 2000);
    }
  };

  const finishSession = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = totalMoves > 0
      ? Math.round((correctMoves / totalMoves) * 100)
      : 0;

    saveSessionSummary({
      type: "container",
      accuracy,
      score,
      totalMoves,
      correctMoves,
      duration,
      timestamp: Date.now(),
    });

    navigate("/summary/container", {
      state: {
        drillType: "container",
        accuracy,
        score,
        totalDrills: drillStats.length,
        duration,
        drillStats,
      },
    });
  };

  const handleRestart = () => {
    setCurrentDrillIndex(0);
    setScore(0);
    setCombo(0);
    setTotalMoves(0);
    setCorrectMoves(0);
    setDrillStats([]);
    loadDrill(0);
  };

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading drill...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-foreground">Container With Most Water</h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestart}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SessionHUD
            progress={currentDrillIndex}
            total={TOTAL_DRILLS}
            score={score}
            combo={combo}
            target={state.bestArea}
          />
        </div>
      </header>

      {/* Problem Description */}
      <ProblemDescription
        description={PROBLEM_DESCRIPTION}
        storageKey="hideDesc:/drill/container"
      />

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDrillIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <BarBoard state={state} />

            <div className="flex justify-center">
              <ChoiceBar
                onMoveLeft={() => handleAction("MOVE_LEFT")}
                onMoveRight={() => handleAction("MOVE_RIGHT")}
                onFound={() => {}} // Not used in container
                disabled={isFinished(state)}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <FeedbackTray type={feedback.type} message={feedback.message} />
    </div>
  );
}
