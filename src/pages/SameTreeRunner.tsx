import { useReducer, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Shuffle, Play, ArrowRight, TreeDeciduous, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProblemDescription } from "@/components/drill/ProblemDescription";
import { SameTreeBoard } from "@/components/drill/SameTreeBoard";
import {
  initSameTree,
  reducer,
  isFinished,
  getTimeElapsed,
  calculateBonus,
  generateTreePair,
} from "@/core/engine/sameTree";
import drillData from "@/data/same-tree.drills.json";

function getRandomPair(): { seedP: (number | null)[]; seedQ: (number | null)[] } {
  // 50% chance to use predefined pairs, 50% to generate random
  if (Math.random() > 0.5) {
    const pair = drillData.treePairs[Math.floor(Math.random() * drillData.treePairs.length)];
    return { seedP: pair.p, seedQ: pair.q };
  }
  const { seedP, seedQ } = generateTreePair();
  return { seedP, seedQ };
}

export default function SameTreeRunner() {
  const initialPair = getRandomPair();
  const [state, dispatch] = useReducer(
    reducer, 
    { seedP: initialPair.seedP, seedQ: initialPair.seedQ },
    ({ seedP, seedQ }) => initSameTree(seedP, seedQ)
  );
  const [showSummary, setShowSummary] = useState(false);
  const [time, setTime] = useState(0);

  // Timer
  useEffect(() => {
    if (state.phase !== 'traversing') return;
    
    const interval = setInterval(() => {
      setTime(getTimeElapsed(state));
    }, 100);
    
    return () => clearInterval(interval);
  }, [state.phase, state.startTime]);

  // Show summary when done
  useEffect(() => {
    if (isFinished(state)) {
      setTime(getTimeElapsed(state));
      setTimeout(() => setShowSummary(true), 600);
    }
  }, [state.phase]);

  const handleStart = () => {
    dispatch({ type: 'START' });
  };

  const handleCompareNext = () => {
    dispatch({ type: 'COMPARE_NEXT' });
  };

  const handleRestart = () => {
    dispatch({ type: 'RESTART' });
    setShowSummary(false);
    setTime(0);
  };

  const handleNewTrees = () => {
    const { seedP, seedQ } = getRandomPair();
    dispatch({ type: 'NEW_TREES', seedP, seedQ });
    setShowSummary(false);
    setTime(0);
  };

  const hasMoreNodes = state.currentIndex < state.traversalOrderP.length - 1 && !state.mismatch;
  const bonus = calculateBonus(state);
  const totalScore = state.score + bonus;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <TreeDeciduous className="h-5 w-5 text-green-500" />
              <h1 className="text-lg font-semibold">Same Tree</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Score:</span>
              <span className="font-mono font-bold text-primary">{state.score}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-mono font-bold">{time}s</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-screen-xl mx-auto px-4 py-6">
        <ProblemDescription
          description={drillData.problemDescription}
          storageKey="same-tree-desc"
        />

        {/* Traversal Mode Selection */}
        {state.phase === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Select Traversal Mode</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={state.traversalMode === 'dfs' ? 'default' : 'outline'}
                  onClick={() => dispatch({ type: 'SET_TRAVERSAL_MODE', mode: 'dfs' })}
                  className="min-w-[100px]"
                >
                  DFS
                </Button>
                <Button
                  variant={state.traversalMode === 'bfs' ? 'default' : 'outline'}
                  onClick={() => dispatch({ type: 'SET_TRAVERSAL_MODE', mode: 'bfs' })}
                  className="min-w-[100px]"
                >
                  BFS
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-md">
                {state.traversalMode === 'dfs' 
                  ? 'DFS: Compare nodes in preorder (root → left → right)'
                  : 'BFS: Compare nodes level by level'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Tree Board */}
        <div className="mb-8">
          <SameTreeBoard state={state} />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {state.phase === 'select' && (
            <Button onClick={handleStart} size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Start Comparison
            </Button>
          )}

          {state.phase === 'traversing' && !state.mismatch && (
            <Button 
              onClick={handleCompareNext} 
              disabled={!hasMoreNodes && state.currentIndex >= 0}
              size="lg"
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Compare Next
            </Button>
          )}

          <Button onClick={handleRestart} variant="outline" size="lg" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
          <Button onClick={handleNewTrees} variant="outline" size="lg" className="gap-2">
            <Shuffle className="h-4 w-4" />
            New Trees
          </Button>
        </div>

        {/* Instructions */}
        {state.phase === 'traversing' && !state.mismatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              {hasMoreNodes 
                ? '👆 Tap "Compare Next" to compare the next pair of nodes'
                : '✅ All nodes compared! Trees are identical.'}
            </p>
          </motion.div>
        )}
      </main>

      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {state.result === 'same' ? '🌲 Trees Match!' : '🌲 Trees Differ!'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Result */}
            <div className={`text-center rounded-xl p-6 border ${
              state.result === 'same' 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              {state.result === 'same' ? (
                <>
                  <Check className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p className="text-lg font-bold text-green-500">Identical Trees</p>
                  <p className="text-sm text-muted-foreground">Structure and values match perfectly</p>
                </>
              ) : (
                <>
                  <X className="h-12 w-12 mx-auto text-red-500 mb-2" />
                  <p className="text-lg font-bold text-red-500">Different Trees</p>
                  {state.mismatchReason && (
                    <p className="text-sm text-muted-foreground">{state.mismatchReason}</p>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-primary">{time}s</p>
                <p className="text-sm text-muted-foreground">Time</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{state.comparedNodes.size}</p>
                <p className="text-sm text-muted-foreground">Nodes Compared</p>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Traversal Mode: <span className="font-medium text-foreground">{state.traversalMode.toUpperCase()}</span></p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Base Score: {state.score}</p>
              {bonus > 0 && (
                <p className="text-sm text-green-500">+ {bonus} bonus</p>
              )}
              <p className="text-2xl font-bold text-primary">Total: {totalScore}</p>
            </div>

            {bonus >= 15 && (
              <div className="text-center">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full text-yellow-500 font-medium">
                  ⚡ Speed Bonus!
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={handleRestart} className="w-full">
                Try Again
              </Button>
              <Button onClick={handleNewTrees} variant="outline" className="w-full">
                New Trees
              </Button>
              <Link to="/" className="w-full">
                <Button variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
