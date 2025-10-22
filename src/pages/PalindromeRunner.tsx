import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StringBoard } from "@/components/drill/StringBoard";
import { PalindromeChoiceBar } from "@/components/drill/PalindromeChoiceBar";
import { FeedbackTray } from "@/components/drill/FeedbackTray";
import { SessionHUD } from "@/components/drill/SessionHUD";
import { ProblemDescription } from "@/components/drill/ProblemDescription";
import { ResultChip } from "@/components/drill/ResultChip";
import { saveSessionSummary } from "@/lib/storage";
import {
  PState,
  PAction,
  correctAction,
  nextState,
  isFinished,
  getHint,
  initializeState,
} from "@/core/engine/palindrome";
import drillsData from "@/data/palindrome.drills.json";

const PROBLEM_DESCRIPTION = "Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring case.";

const MICRO_DRILLS = 10;
const MINI_DRILLS = 5;

type FeedbackType = "correct" | "incorrect" | null;

export default function PalindromeRunner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") || "micro") as "micro" | "mini";

  const [drillIndex, setDrillIndex] = useState(0);
  const [state, setState] = useState<PState | null>(null);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [totalMoves, setTotalMoves] = useState(0);
  const [correctMoves, setCorrectMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastAction, setLastAction] = useState<PAction | undefined>();
  const [compareResult, setCompareResult] = useState<"match" | "mismatch" | null>(null);

  const totalDrills = mode === "micro" ? MICRO_DRILLS : MINI_DRILLS;

  const loadDrill = useCallback(() => {
    const drillSet = drillsData.sets.find((set) => set.mode === mode);
    if (!drillSet) return;

    const drill = drillSet.drills[drillIndex % drillSet.drills.length];
    setState(initializeState(drill.s, drill.L, drill.R));
    setLastAction(undefined);
    setCompareResult(null);
  }, [mode, drillIndex]);

  useEffect(() => {
    loadDrill();
  }, [loadDrill]);

  const handleAction = (action: PAction) => {
    if (!state || isFinished(state)) return;

    setTotalMoves((prev) => prev + 1);
    const expected = correctAction(state);
    const isCorrect = action === expected;

    if (isCorrect) {
      setCorrectMoves((prev) => prev + 1);
      setCombo((prev) => prev + 1);
      setScore((prev) => prev + 10 + combo * 2);
      setFeedback("correct");
      setFeedbackMessage(getHint(state));
    } else {
      setCombo(0);
      setFeedback("incorrect");
      setFeedbackMessage(`Expected: ${expected.replace("_", " ")}`);
    }

    const newState = nextState(state, action);
    setState(newState);
    setLastAction(action);

    if (action === "COMPARE") {
      const lChar = state.s[state.L].toLowerCase();
      const rChar = state.s[state.R].toLowerCase();
      const isAlnum = (ch: string) => /[0-9A-Za-z]/.test(ch);
      
      if (isAlnum(state.s[state.L]) && isAlnum(state.s[state.R])) {
        setCompareResult(lChar === rChar ? "match" : "mismatch");
      }
    } else {
      setCompareResult(null);
    }

    setTimeout(() => {
      setFeedback(null);
      setCompareResult(null);
    }, 1500);

    if (isFinished(newState)) {
      setTimeout(() => {
        if (drillIndex + 1 >= totalDrills) {
          const accuracy = totalMoves > 0 ? Math.round((correctMoves / totalMoves) * 100) : 0;
          saveSessionSummary({
            type: "palindrome",
            mode,
            score,
            accuracy,
            totalMoves,
            correctMoves,
            duration: 0,
            drillsCompleted: totalDrills,
            timestamp: Date.now(),
          });
          navigate(`/summary/palindrome?mode=${mode}&score=${score}&accuracy=${accuracy}`);
        } else {
          setDrillIndex((prev) => prev + 1);
        }
      }, 2000);
    }
  };

  const handleRestart = () => {
    setDrillIndex(0);
    setScore(0);
    setCombo(0);
    setTotalMoves(0);
    setCorrectMoves(0);
    setFeedback(null);
    setFeedbackMessage("");
    loadDrill();
  };

  if (!state) return null;

  const resultStatus = state.decided
    ? state.isPalindrome
      ? "valid"
      : "invalid"
    : "unknown";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold">Valid Palindrome</h1>
              <p className="text-sm text-muted-foreground capitalize">{mode} Mode</p>
            </motion.div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          </div>
        </div>
      </header>

      {/* HUD */}
      <div className="container mx-auto px-4 py-4">
        <SessionHUD
          progress={drillIndex + 1}
          total={totalDrills}
          score={score}
          combo={combo}
          target={totalDrills * 100}
        />
      </div>

      {/* Problem Description */}
      <ProblemDescription
        description={PROBLEM_DESCRIPTION}
        storageKey="hideDesc:/drill/palindrome"
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {/* String Board */}
          <StringBoard
            s={state.s}
            L={state.L}
            R={state.R}
            lastAction={lastAction}
            compareResult={compareResult}
          />

          {/* Hint */}
          <motion.div
            className="text-center px-4 py-2 rounded-lg bg-muted/50 max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm text-muted-foreground">{getHint(state)}</p>
          </motion.div>

          {/* Result Chip */}
          <ResultChip status={resultStatus} />

          {/* Controls */}
          <PalindromeChoiceBar
            onSkipLeft={() => handleAction("SKIP_LEFT")}
            onSkipRight={() => handleAction("SKIP_RIGHT")}
            onCompare={() => handleAction("COMPARE")}
            disabled={isFinished(state)}
          />
        </motion.div>
      </main>

      {/* Feedback */}
      <FeedbackTray type={feedback} message={feedbackMessage} />
    </div>
  );
}
