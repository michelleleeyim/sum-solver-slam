import { useReducer, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Shuffle, Play, ArrowRight, RefreshCw, TreeDeciduous } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProblemDescription } from "@/components/drill/ProblemDescription";
import { InvertBinaryTreeBoard } from "@/components/drill/InvertBinaryTreeBoard";
import {
  initInvertBinaryTree,
  reducer,
  isFinished,
  getTimeElapsed,
  calculateBonus,
  getCurrentNodeId,
  InvertTreeState,
} from "@/core/engine/invertBinaryTree";
import drillData from "@/data/invert-binary-tree.drills.json";

function getRandomSeed(): number[] {
  return drillData.seeds[Math.floor(Math.random() * drillData.seeds.length)];
}

export default function InvertBinaryTreeRunner() {
  const [state, dispatch] = useReducer(reducer, getRandomSeed(), initInvertBinaryTree);
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
      setTimeout(() => setShowSummary(true), 500);
    }
  }, [state.phase]);

  const handleStart = () => {
    dispatch({ type: 'START' });
  };

  const handleSwap = () => {
    dispatch({ type: 'SWAP_CHILDREN' });
  };

  const handleNext = () => {
    dispatch({ type: 'NEXT_NODE' });
  };

  const handleRestart = () => {
    dispatch({ type: 'RESTART' });
    setShowSummary(false);
    setTime(0);
  };

  const handleNewTree = () => {
    dispatch({ type: 'NEW_TREE', seed: getRandomSeed() });
    setShowSummary(false);
    setTime(0);
  };

  const currentNodeId = getCurrentNodeId(state);
  const canSwap = currentNodeId && !state.swappedNodes.has(currentNodeId);
  const canNext = currentNodeId && state.swappedNodes.has(currentNodeId);
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
              <h1 className="text-lg font-semibold">Invert Binary Tree</h1>
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
          storageKey="invert-binary-tree-desc"
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
                  ? 'DFS: Recursive pre-order traversal (root → left → right)'
                  : 'BFS: Level-order traversal using a queue'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Tree Board */}
        <div className="mb-8">
          <InvertBinaryTreeBoard state={state} />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {state.phase === 'select' && (
            <Button onClick={handleStart} size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Start Inversion
            </Button>
          )}

          {state.phase === 'traversing' && (
            <>
              <Button 
                onClick={handleSwap} 
                disabled={!canSwap}
                size="lg"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Swap Children
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!canNext}
                variant="secondary"
                size="lg"
                className="gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Next Node
              </Button>
            </>
          )}

          <Button onClick={handleRestart} variant="outline" size="lg" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
          <Button onClick={handleNewTree} variant="outline" size="lg" className="gap-2">
            <Shuffle className="h-4 w-4" />
            New Tree
          </Button>
        </div>

        {/* Instructions */}
        {state.phase === 'traversing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              {canSwap 
                ? '👆 Tap "Swap Children" to swap left and right children of the current node'
                : canNext
                  ? '👆 Tap "Next Node" to move to the next node in the traversal'
                  : 'Processing...'}
            </p>
          </motion.div>
        )}
      </main>

      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🌳 Tree Inverted!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-primary">{time}s</p>
                <p className="text-sm text-muted-foreground">Time</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{state.swappedNodes.size}</p>
                <p className="text-sm text-muted-foreground">Nodes Swapped</p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Base Score: {state.score}</p>
              {bonus > 0 && (
                <p className="text-sm text-green-500">+ {bonus} bonus</p>
              )}
              <p className="text-2xl font-bold text-primary">Total: {totalScore}</p>
            </div>

            {bonus >= 30 && (
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
              <Button onClick={handleNewTree} variant="outline" className="w-full">
                New Tree
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
