import { useReducer, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Shuffle, Play, ArrowRight, TreeDeciduous, Check, X, Search, GitCompare, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProblemDescription } from "@/components/drill/ProblemDescription";
import { SubtreeOfAnotherTreeBoard } from "@/components/drill/SubtreeOfAnotherTreeBoard";
import {
  initSubtree,
  reducer,
  isFinished,
  getTimeElapsed,
  calculateBonus,
  generateTreePair,
  getCurrentSearchNode,
} from "@/core/engine/subtreeOfAnotherTree";
import drillData from "@/data/subtree-of-another-tree.drills.json";

function getRandomPair(): { seedRoot: (number | null)[]; seedSubRoot: (number | null)[] } {
  // 50% chance to use predefined pairs, 50% to generate random
  if (Math.random() > 0.5) {
    const pair = drillData.treePairs[Math.floor(Math.random() * drillData.treePairs.length)];
    return { seedRoot: pair.root, seedSubRoot: pair.subRoot };
  }
  const { seedRoot, seedSubRoot } = generateTreePair();
  return { seedRoot, seedSubRoot };
}

export default function SubtreeOfAnotherTreeRunner() {
  const initialPair = getRandomPair();
  const [state, dispatch] = useReducer(
    reducer, 
    { seedRoot: initialPair.seedRoot, seedSubRoot: initialPair.seedSubRoot },
    ({ seedRoot, seedSubRoot }) => initSubtree(seedRoot, seedSubRoot)
  );
  const [showSummary, setShowSummary] = useState(false);
  const [time, setTime] = useState(0);

  // Timer
  useEffect(() => {
    if (state.phase === 'select' || state.phase === 'done') return;
    
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

  const handleVisitNext = () => {
    dispatch({ type: 'VISIT_NEXT_NODE' });
  };

  const handleStartComparison = () => {
    dispatch({ type: 'START_COMPARISON' });
  };

  const handleCompareNext = () => {
    dispatch({ type: 'COMPARE_NEXT' });
  };

  const handleSkipComparison = () => {
    dispatch({ type: 'SKIP_COMPARISON' });
  };

  const handleReturnToSearch = () => {
    dispatch({ type: 'RETURN_TO_SEARCH' });
  };

  const handleRestart = () => {
    dispatch({ type: 'RESTART' });
    setShowSummary(false);
    setTime(0);
  };

  const handleNewTrees = () => {
    const { seedRoot, seedSubRoot } = getRandomPair();
    dispatch({ type: 'NEW_TREES', seedRoot, seedSubRoot });
    setShowSummary(false);
    setTime(0);
  };

  const currentSearchNode = getCurrentSearchNode(state);
  const isCandidate = currentSearchNode && state.candidateNodes.includes(currentSearchNode);
  const hasMoreNodes = state.searchIndex < state.searchOrder.length - 1;
  const hasMoreCompare = state.compareIndex < state.compareOrderRoot.length - 1 && !state.mismatch;
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
              <h1 className="text-lg font-semibold">Subtree of Another Tree</h1>
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
          storageKey="subtree-of-another-tree-desc"
        />

        {/* Tree Board */}
        <div className="mb-8">
          <SubtreeOfAnotherTreeBoard state={state} />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {state.phase === 'select' && (
            <Button onClick={handleStart} size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Start Search
            </Button>
          )}

          {state.phase === 'search' && (
            <>
              {isCandidate && (
                <Button 
                  onClick={handleStartComparison} 
                  size="lg"
                  className="gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare Subtree
                </Button>
              )}
              
              {hasMoreNodes && (
                <Button 
                  onClick={isCandidate ? handleSkipComparison : handleVisitNext} 
                  variant={isCandidate ? "outline" : "default"}
                  size="lg"
                  className="gap-2"
                >
                  {isCandidate ? (
                    <>
                      <SkipForward className="h-4 w-4" />
                      Skip
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Visit Next
                    </>
                  )}
                </Button>
              )}
            </>
          )}

          {state.phase === 'compare' && !state.mismatch && (
            <Button 
              onClick={handleCompareNext} 
              disabled={!hasMoreCompare && state.compareIndex >= 0}
              size="lg"
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <ArrowRight className="h-4 w-4" />
              Compare Next
            </Button>
          )}

          {state.phase === 'compare' && state.mismatch && (
            <Button 
              onClick={handleReturnToSearch} 
              size="lg"
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Continue Search
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
        {state.phase === 'search' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              {isCandidate 
                ? '🎯 Candidate found! Value matches subRoot root. Tap "Compare Subtree" or "Skip" to continue.'
                : hasMoreNodes 
                  ? '🔍 Searching for nodes with value matching subRoot root...'
                  : '❌ Search exhausted. No matching subtree found.'}
            </p>
          </motion.div>
        )}

        {state.phase === 'compare' && !state.mismatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              🔄 Comparing subtree structure and values...
            </p>
          </motion.div>
        )}
      </main>

      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {state.found ? '🌲 Subtree Found!' : '🌲 No Subtree Match'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Result */}
            <div className={`text-center rounded-xl p-6 border ${
              state.found 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              {state.found ? (
                <>
                  <Check className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p className="text-lg font-bold text-green-500">subRoot is a subtree of root</p>
                  <p className="text-sm text-muted-foreground">Structure and values match perfectly</p>
                </>
              ) : (
                <>
                  <X className="h-12 w-12 mx-auto text-red-500 mb-2" />
                  <p className="text-lg font-bold text-red-500">subRoot is NOT a subtree of root</p>
                  <p className="text-sm text-muted-foreground">No matching subtree found</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-primary">{time}s</p>
                <p className="text-sm text-muted-foreground">Time</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{state.visitedNodes.size}</p>
                <p className="text-sm text-muted-foreground">Nodes Visited</p>
              </div>
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
