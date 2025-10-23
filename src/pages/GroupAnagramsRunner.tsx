import { useState, useEffect, useReducer, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw, Shuffle, Check, Eye, EyeOff, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnagramBinsBoard } from "@/components/drill/AnagramBinsBoard";
import { ProblemDescription } from "@/components/drill/ProblemDescription";
import { reducer, initGA, canAssign } from "@/core/engine/groupAnagrams";
import { generateAnagramSet } from "@/core/utils/anagramSeed";
import problemData from "@/data/group-anagrams.drills.json";

export default function GroupAnagramsRunner() {
  const navigate = useNavigate();

  // Seed words for the current run
  const [currentWords, setCurrentWords] = useState<string[]>([]);

  // ✅ Lazy init: guarantees a non-null initial state on first render
  const initArg = useMemo(() => ({ words: [] as string[], mode: "count" as const }), []);
  const [state, dispatch] = useReducer(reducer, initArg, (arg) => initGA(arg.words, arg.mode));

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ wordId: string; binId: string; ok: boolean } | null>(null);

  // time tracking
  const [startTime, setStartTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Initial load: generate words, hydrate reducer
  useEffect(() => {
    const words = generateAnagramSet(problemData as any);
    setCurrentWords(words);
  }, []);

  // Whenever currentWords changes, hydrate state with a new set
  useEffect(() => {
    if (currentWords.length > 0) {
      dispatch({ type: "NEW_SET", items: currentWords });
      setStartTime(Date.now()); // reset timer for the new set
      setElapsedTime(0);
    }
  }, [currentWords]);

  // Timer (stops when decided)
  useEffect(() => {
    if (state.decided) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.decided, startTime]);

  const handleAssign = useCallback(
    (wordId: string, binId: string) => {
      const wordObj = state.items.find((it) => it.id === wordId);
      if (!wordObj) return;

      const check = canAssign(state.bins, binId, wordObj.word, state.mode);

      // Show feedback
      setFeedback({ wordId, binId, ok: check.ok });
      const t = setTimeout(() => setFeedback(null), 1000);
      // optional cleanup pattern
      // return () => clearTimeout(t);

      if (check.ok) {
        dispatch({ type: "ASSIGN", wordId, binId });
        setSelectedWord(null);
      }
    },
    [state],
  );

  const handleRestart = () => {
    // Restart with the current words
    dispatch({ type: "RESTART", items: currentWords });
    setSelectedWord(null);
    setFeedback(null);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  const handleNewSet = () => {
    const words = generateAnagramSet(problemData as any);
    setCurrentWords(words);
    setSelectedWord(null);
    setFeedback(null);
  };

  const handleFinish = () => dispatch({ type: "FINISH" });
  const handleToggleMode = () => dispatch({ type: "TOGGLE_MODE" });
  const handleToggleKeys = () => dispatch({ type: "TOGGLE_KEYS" });
  const handleCreateBin = () => dispatch({ type: "CREATE_BIN" });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Group Anagrams
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatTime(elapsedTime)}
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4" />
                Score: {state.score}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRestart} variant="outline" size="sm" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
            <Button onClick={handleNewSet} variant="outline" size="sm" className="gap-2">
              <Shuffle className="h-4 w-4" />
              New Set
            </Button>
          </div>
        </motion.div>

        {/* Problem Description */}
        <ProblemDescription
          description={(problemData as any).problemDescription}
          storageKey="group-anagrams-desc-visible"
        />

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-3 items-center justify-between p-4 bg-card rounded-lg border border-border"
        >
          <div className="flex gap-2">
            <Button onClick={handleToggleMode} variant={state.mode === "count" ? "default" : "outline"} size="sm">
              {state.mode === "count" ? "Counting (O(n·k))" : "Sorting (O(n·k log k))"}
            </Button>
            <Button onClick={handleToggleKeys} variant="outline" size="sm" className="gap-2">
              {state.showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {state.showKeys ? "Hide" : "Show"} Signatures
            </Button>
          </div>

          <Button onClick={handleFinish} disabled={state.items.length > 0} className="gap-2" size="sm">
            <Check className="h-4 w-4" />
            Finish
          </Button>
        </motion.div>

        {/* Board */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AnagramBinsBoard
            state={state}
            selectedWord={selectedWord}
            onSelectWord={setSelectedWord}
            onAssign={handleAssign}
            onCreateBin={handleCreateBin}
            feedback={feedback}
          />
        </motion.div>

        {/* Summary Modal */}
        {state.decided && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => navigate("/")}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card p-8 rounded-xl shadow-2xl max-w-md w-full space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <Trophy className="h-16 w-16 mx-auto text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-2">Challenge Complete! 🎉</h2>
                <p className="text-muted-foreground">You've grouped all the anagrams</p>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Final Score</span>
                  <span className="font-semibold">{state.score} points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-semibold">{formatTime(elapsedTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Groups Created</span>
                  <span className="font-semibold">{state.bins.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-semibold capitalize">{state.mode}ing</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleRestart} className="flex-1 gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={handleNewSet} variant="outline" className="flex-1 gap-2">
                  <Shuffle className="h-4 w-4" />
                  New Set
                </Button>
              </div>

              <Button onClick={() => navigate("/")} variant="ghost" className="w-full">
                Back to Home
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
