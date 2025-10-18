import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrayBoard } from "@/components/drill/ArrayBoard";
import { ChoiceBar } from "@/components/drill/ChoiceBar";
import { FeedbackTray } from "@/components/drill/FeedbackTray";
import { SessionHUD } from "@/components/drill/SessionHUD";
import { Button } from "@/components/ui/button";
import {
  nextState,
  correctAction,
  isTerminal,
  getCurrentSum,
  getHint,
  type TPState,
  type TPAction,
} from "@/core/engine/twoPointers";
import { saveSession } from "@/lib/storage";
import { generateTwoPointersDrill } from "@/lib/drillGenerator";
import { RotateCcw, ArrowRight } from "lucide-react";

interface DrillData {
  nums: number[];
  target: number;
  L: number;
  R: number;
}

const DrillRunner = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode") || "micro";

  const [drills, setDrills] = useState<DrillData[]>([]);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [state, setState] = useState<TPState | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [longestCombo, setLongestCombo] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect" | null;
    message: string;
  }>({ type: null, message: "" });

  // Generate random drills on mount
  useEffect(() => {
    const newDrills: DrillData[] = [];
    const count = mode === "micro" ? 10 : 5;
    for (let i = 0; i < count; i++) {
      newDrills.push(generateTwoPointersDrill("easy"));
    }
    setDrills(newDrills);
    initializeDrill(newDrills[0]);
  }, [mode]);

  const initializeDrill = (drill: DrillData) => {
    setState({
      nums: drill.nums,
      target: drill.target,
      L: drill.L,
      R: drill.R,
      status: "playing",
    });
    setAttempts(0);
  };

  const handleAction = (action: TPAction) => {
    if (!state || isTerminal(state)) return;

    const correct = correctAction(state);
    const isCorrect = action === correct;

    if (isCorrect) {
      // Apply the action
      const newState = nextState(state, action);
      setState(newState);

      // Update score
      const points = attempts === 0 ? 2 : attempts === 1 ? 1 : 0;
      setScore((s) => s + points);

      // Update combo
      if (attempts === 0) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > longestCombo) {
          setLongestCombo(newCombo);
        }
        if (newCombo % 3 === 0) {
          setScore((s) => s + 1); // Combo bonus
        }
      }

      // Track first-try correct
      if (attempts === 0) {
        setCorrectFirstTry((c) => c + 1);
      }

      // Show feedback
      setFeedback({
        type: "correct",
        message:
          attempts === 0
            ? "Perfect! +2 points"
            : attempts === 1
            ? "Correct! +1 point"
            : "Got it!",
      });

      // Auto-dismiss feedback
      setTimeout(() => setFeedback({ type: null, message: "" }), 1200);

      // Check if drill is complete
      if (isTerminal(newState) || mode === "micro") {
        // Move to next drill after a short delay
        setTimeout(() => {
          handleNextDrill();
        }, 1500);
      }
    } else {
      // Incorrect
      setAttempts((a) => a + 1);
      setCombo(0);

      const hint = getHint(state, action);
      setFeedback({
        type: "incorrect",
        message: hint,
      });

      setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
    }
  };

  const handleNextDrill = () => {
    const nextIndex = currentDrillIndex + 1;
    if (nextIndex < drills.length) {
      setCurrentDrillIndex(nextIndex);
      initializeDrill(drills[nextIndex]);
    } else {
      // Session complete - save and navigate to summary
      const accuracy = drills.length > 0 ? (correctFirstTry / drills.length) * 100 : 0;

      saveSession({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        setId: "random",
        mode: mode,
        difficulty: "easy",
        totalDrills: drills.length,
        correctFirstTry,
        totalScore: score,
        longestCombo,
        averageTime: 0,
        accuracy,
      });

      navigate("/summary");
    }
  };

  const handleReplay = () => {
    if (state) {
      setState({ ...drills[currentDrillIndex], status: "playing" });
      setAttempts(0);
    }
  };

  if (!state || drills.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading drills...</p>
      </div>
    );
  }

  const currentSum = getCurrentSum(state);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* HUD */}
        <SessionHUD
          progress={currentDrillIndex + 1}
          total={drills.length}
          score={score}
          combo={combo}
          target={state.target}
        />

        {/* Main Board */}
        <div className="my-12">
          <ArrayBoard state={state} currentSum={currentSum} />
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <ChoiceBar
            onMoveLeft={() => handleAction("MOVE_LEFT")}
            onMoveRight={() => handleAction("MOVE_RIGHT")}
            onFound={() => handleAction("FOUND")}
            disabled={isTerminal(state)}
          />

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={handleReplay}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Replay Step
            </Button>
            {isTerminal(state) && (
              <Button size="sm" onClick={handleNextDrill}>
                Next Drill
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Feedback */}
        <FeedbackTray type={feedback.type} message={feedback.message} />
      </div>
    </div>
  );
};

export default DrillRunner;
