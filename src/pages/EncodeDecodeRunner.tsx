import { useReducer, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Home, RotateCcw, Shuffle, Clock, Trophy } from "lucide-react";
import { EncodeDecodeBoard } from "@/components/drill/EncodeDecodeBoard";
import { ProblemDescription } from "@/components/drill/ProblemDescription";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  initEncodeDecode,
  reducer,
  isFinished,
  getTimeElapsed,
  calculateBonus,
  type EDState,
} from "@/core/engine/encodeDecode";
import drillData from "@/data/encode-decode.drills.json";

function generateWordSet(bank: string[], count: number = 4): string[] {
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, bank.length));
}

export default function EncodeDecodeRunner() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(
    reducer,
    generateWordSet(drillData.wordBank, 4),
    initEncodeDecode
  );
  const [timer, setTimer] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!state || isFinished(state)) return;
    const interval = setInterval(() => {
      setTimer(getTimeElapsed(state));
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    if (isFinished(state) && !showSummary) {
      setShowSummary(true);
    }
  }, [state, showSummary]);

  const handleEncodeNext = () => {
    dispatch({ type: "ENCODE_NEXT" });
  };

  const handleDecodeNext = () => {
    dispatch({ type: "DECODE_NEXT" });
  };

  const handleRestart = () => {
    dispatch({ type: "RESTART" });
    setShowSummary(false);
  };

  const handleNewSet = () => {
    const newWords = generateWordSet(drillData.wordBank, 4);
    dispatch({ type: "NEW_SET", words: newWords });
    setShowSummary(false);
  };

  const bonus = calculateBonus(state);
  const finalScore = state.score + bonus;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {drillData.title}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatTime(timer)}
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4" />
                Score: {state.score}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => navigate("/")} variant="outline" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </div>
        </motion.div>

        {/* Problem Description */}
        <ProblemDescription
          description={drillData.problemDescription}
          storageKey="encode-decode-desc-visible"
        />

        {/* Board */}
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <EncodeDecodeBoard state={state} />
        </motion.div>

        {/* Controls */}
        <motion.div
          className="flex flex-col gap-3 w-full max-w-md mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {state.phase === "encode" && (
            <Button
              onClick={handleEncodeNext}
              disabled={state.encodeIdx >= state.words.length}
              size="lg"
              className="h-16 text-lg font-bold"
            >
              Encode Next Word
              <span className="ml-auto text-xs opacity-70">
                ({state.encodeIdx + 1}/{state.words.length})
              </span>
            </Button>
          )}

          {state.phase === "decode" && (
            <Button
              onClick={handleDecodeNext}
              disabled={state.decoded.length >= state.words.length}
              size="lg"
              className="h-16 text-lg font-bold"
            >
              Decode Next Word
              <span className="ml-auto text-xs opacity-70">
                ({state.decoded.length + 1}/{state.words.length})
              </span>
            </Button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleRestart}
              variant="outline"
              size="lg"
              className="h-14"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Restart
            </Button>
            <Button
              onClick={handleNewSet}
              variant="outline"
              size="lg"
              className="h-14"
            >
              <Shuffle className="mr-2 h-5 w-5" />
              New Set
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Summary Modal */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Drill Complete! 🎉</DialogTitle>
            <DialogDescription>
              You've successfully encoded and decoded the strings!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">
                  {finalScore}
                </div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">{timer}s</div>
                <div className="text-sm text-muted-foreground">Time</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Words Encoded:</span>
                <span className="font-semibold">{state.words.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Words Decoded:</span>
                <span className="font-semibold">{state.decoded.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mistakes:</span>
                <span className="font-semibold">{state.mistakes}</span>
              </div>
              {bonus > 0 && (
                <div className="flex justify-between text-primary">
                  <span className="font-semibold">Perfect Bonus:</span>
                  <span className="font-bold">+{bonus}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleNewSet} className="flex-1">
                <Shuffle className="mr-2 h-4 w-4" />
                New Set
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
