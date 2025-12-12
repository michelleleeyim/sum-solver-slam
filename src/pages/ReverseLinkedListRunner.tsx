import { useReducer, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Home, RotateCcw, Shuffle, Play, ArrowRight } from "lucide-react";
import {
  ReverseState,
  ReverseAction,
  initReverseLinkedList,
  reducer,
  isFinished,
  getTimeElapsed,
  calculateBonus,
} from "@/core/engine/reverseLinkedList";
import ReverseLinkedListBoard from "@/components/drill/ReverseLinkedListBoard";
import drillData from "@/data/reverse-linked-list.drills.json";

function getRandomSeed(): number[] {
  const seed = drillData.seeds[Math.floor(Math.random() * drillData.seeds.length)];
  return seed.nodes;
}

export default function ReverseLinkedListRunner() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, null, () => initReverseLinkedList(getRandomSeed()));
  const [showSummary, setShowSummary] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [descOpen, setDescOpen] = useState(() => {
    const saved = localStorage.getItem("desc-reverse-linked-list");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("desc-reverse-linked-list", String(descOpen));
  }, [descOpen]);

  useEffect(() => {
    if (state.phase === "done") return;
    const interval = setInterval(() => {
      setElapsed(getTimeElapsed(state));
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (isFinished(state)) {
      const timer = setTimeout(() => setShowSummary(true), 600);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleNewList = () => {
    dispatch({ type: "NEW_LIST" });
    setShowSummary(false);
  };

  const handleRestart = () => {
    dispatch({ type: "RESTART" });
    setShowSummary(false);
  };

  const bonus = calculateBonus(state);
  const finalScore = state.score + bonus;
  const time = getTimeElapsed(state);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <Home className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <div className="text-sm font-semibold">{drillData.title}</div>
          <div className="text-xs text-muted-foreground">Linked List</div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-mono">⏱️ {elapsed}s</span>
          <span className="font-mono">🏆 {state.score}</span>
        </div>
      </header>

      {/* Problem Description */}
      <div className="px-4 pt-4">
        <Collapsible open={descOpen} onOpenChange={setDescOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
              {descOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span className="italic">Problem Description</span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-2 bg-muted/30 border-border">
              <CardContent className="py-3 px-4">
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  {drillData.problemDescription}
                </p>
                <div className="mt-2 font-mono text-xs text-muted-foreground">
                  Example: 1 → 2 → 3 → 4 → 5 → null becomes 5 → 4 → 3 → 2 → 1 → null
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <ReverseLinkedListBoard state={state} />
          </CardContent>
        </Card>
      </main>

      {/* Controls */}
      <footer className="p-4 border-t border-border bg-card/50">
        <div className="flex gap-2">
          {state.phase === "ready" ? (
            <Button
              className="flex-1"
              onClick={() => dispatch({ type: "START" })}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Reversal
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={() => dispatch({ type: "NEXT_STEP" })}
              disabled={state.phase === "done"}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Next Step
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={handleRestart}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNewList}>
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>
      </footer>

      {/* Summary Modal */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🎉 Challenge Complete!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {finalScore}
              </div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-semibold">{state.score}</div>
                <div className="text-xs text-muted-foreground">Steps</div>
              </div>
              <div>
                <div className="text-xl font-semibold">+{bonus}</div>
                <div className="text-xs text-muted-foreground">Bonus</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{time}s</div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
            </div>

            {bonus >= 5 && (
              <div className="text-center py-2">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold">
                  ⭐ Perfect Run!
                </span>
              </div>
            )}

            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Reversed List</div>
              <div className="font-mono text-sm">
                {[...state.nodes].reverse().join(" → ")} → null
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleRestart}>
                Try Again
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleNewList}>
                New List
              </Button>
              <Button className="flex-1" onClick={() => navigate("/")}>
                Home
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
