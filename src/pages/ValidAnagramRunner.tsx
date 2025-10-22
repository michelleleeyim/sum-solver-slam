import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, SkipForward, Repeat } from "lucide-react";
import { toast } from "sonner";
import { FeedbackTray } from "@/components/drill/FeedbackTray";
import { Trophy, Footprints } from "lucide-react";
import { ProblemDescription } from "@/components/drill/ProblemDescription";
import { AnagramBoard } from "@/components/drill/AnagramBoard";
import { ValidAnagramChoiceBar } from "@/components/drill/ValidAnagramChoiceBar";
import { ComplexityCoach } from "@/components/drill/ComplexityCoach";
import { VAState, VAAction, initVA, nextState, isFinished, correctAction } from "@/core/engine/validAnagram";
import { saveSessionSummary } from "@/lib/storage";
import drillsData from "@/data/valid-anagram.drills.json";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const PROBLEM_DESCRIPTION = drillsData.problemDescription;

export default function ValidAnagramRunner() {
  const navigate = useNavigate();
  const [seedIndex, setSeedIndex] = useState(0);
  const [state, setState] = useState<VAState>(() => {
    const seed = drillsData.seeds[0];
    return initVA(seed.s, seed.t);
  });
  
  const [score, setScore] = useState(0);
  const [steps, setSteps] = useState(0);
  const [correctMoves, setCorrectMoves] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect" | null;
    message: string;
  }>({ type: null, message: "" });
  const [startTime] = useState(Date.now());
  const [usedCountingMode, setUsedCountingMode] = useState(true);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isFinished(state)) return;
      
      if (e.key === "s" || e.key === "S") {
        handleAction("PROCESS_S");
      } else if (e.key === "t" || e.key === "T") {
        handleAction("PROCESS_T");
      } else if (e.key === "Enter") {
        handleAction("CHECK");
      } else if (e.key === "m" || e.key === "M") {
        handleAction("TOGGLE_MODE");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [state]);

  const handleAction = useCallback((action: VAAction) => {
    if (isFinished(state)) return;

    const correct = correctAction(state);
    const isCorrect = action === correct;
    
    const newState = nextState(state, action);
    setState(newState);
    setSteps(s => s + 1);

    if (action === "TOGGLE_MODE") {
      setUsedCountingMode(false);
      setFeedback({ type: null, message: "" });
      return;
    }

    if (isCorrect) {
      setCorrectMoves(c => c + 1);
      
      // Score based on mode
      if (state.mode === "count") {
        if (action === "CHECK") {
          setScore(s => s + 5);
        } else {
          setScore(s => s + 2);
        }
      } else {
        setScore(s => s + 1);
      }

      if (action === "PROCESS_S") {
        setFeedback({ type: "correct", message: `Added '${state.s[state.iS]}' to frequency map` });
      } else if (action === "PROCESS_T") {
        setFeedback({ type: "correct", message: `Decremented '${state.t[state.iT]}' in frequency map` });
      } else if (action === "CHECK") {
        const result = newState.isAnagram ? "Valid anagram! ✅" : "Not an anagram ❌";
        setFeedback({ type: "correct", message: result });
      } else {
        setFeedback({ type: "correct", message: "Correct step!" });
      }
    } else {
      setFeedback({ type: "incorrect", message: "Wrong action. Try again!" });
    }

    setTimeout(() => setFeedback({ type: null, message: "" }), 2000);

    // Check if finished
    if (isFinished(newState)) {
      const duration = Date.now() - startTime;
      const accuracy = steps > 0 ? Math.round((correctMoves / steps) * 100) : 100;
      
      // Bonus for staying in counting mode
      let finalScore = score;
      if (usedCountingMode) {
        finalScore += 5;
        toast.success("🎉 Bonus +5 XP for using optimal counting mode!");
      }

      saveSessionSummary({
        type: "valid-anagram",
        score: finalScore,
        accuracy,
        totalMoves: steps,
        correctMoves,
        duration,
        timestamp: Date.now(),
        isAnagram: newState.isAnagram,
        mode: state.mode,
      });

      setTimeout(() => {
        navigate("/summary/valid-anagram");
      }, 2000);
    }
  }, [state, score, steps, correctMoves, startTime, usedCountingMode, navigate]);

  const handleRestart = () => {
    const seed = drillsData.seeds[seedIndex];
    setState(initVA(seed.s, seed.t));
    setScore(0);
    setSteps(0);
    setCorrectMoves(0);
    setUsedCountingMode(true);
    setFeedback({ type: null, message: "" });
  };

  const handleNextSeed = () => {
    const nextIndex = (seedIndex + 1) % drillsData.seeds.length;
    setSeedIndex(nextIndex);
    const seed = drillsData.seeds[nextIndex];
    setState(initVA(seed.s, seed.t));
    setScore(0);
    setSteps(0);
    setCorrectMoves(0);
    setUsedCountingMode(true);
    setFeedback({ type: null, message: "" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Valid Anagram</h1>
          <div className="flex gap-2">
            <Button onClick={handleRestart} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart
            </Button>
            <Button onClick={handleNextSeed} variant="outline" size="sm">
              <SkipForward className="h-4 w-4 mr-2" />
              Next Seed
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2 bg-card px-5 py-3 rounded-full shadow-md border border-border">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg text-card-foreground">{score} XP</span>
          </div>
          <div className="flex items-center gap-2 bg-card px-5 py-3 rounded-full shadow-md border border-border">
            <Footprints className="h-5 w-5 text-secondary" />
            <span className="font-bold text-lg text-card-foreground">{steps} steps</span>
          </div>
        </div>

        <ProblemDescription
          description={PROBLEM_DESCRIPTION}
          storageKey="hideDesc:/drill/valid-anagram"
        />

        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <AnagramBoard state={state} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1">
            <ValidAnagramChoiceBar
              state={state}
              onAction={handleAction}
              disabled={isFinished(state)}
            />
          </div>
          <div className="lg:w-64 space-y-4">
            <ComplexityCoach mode={state.mode} />
            <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
              <Switch
                id="mode-toggle"
                checked={state.mode === "sort"}
                onCheckedChange={() => handleAction("TOGGLE_MODE")}
                disabled={isFinished(state)}
              />
              <Label htmlFor="mode-toggle" className="text-sm cursor-pointer">
                {state.mode === "count" ? "Counting Mode" : "Sorting Mode"}
              </Label>
            </div>
          </div>
        </div>

        {isFinished(state) && (
          <div className="text-center mb-6">
            <div className={`text-2xl font-bold ${state.isAnagram ? "text-green-500" : "text-destructive"}`}>
              {state.isAnagram ? "✅ Valid Anagram!" : "❌ Not an Anagram"}
            </div>
          </div>
        )}
      </div>

      <FeedbackTray type={feedback.type} message={feedback.message} />
    </div>
  );
}
