import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, RotateCcw, Sparkles, CheckCircle2, XCircle, Code2, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

type Phase = "intro" | "warmup" | "code" | "concept" | "reflection" | "complete";

const testCases = [
  { input: [1, 2, 3, 4], output: false },
  { input: [1, 2, 3, 1], output: true },
  { input: [5, 5, 5, 5], output: true },
  { input: [9, 8, 7, 6], output: false },
];

const ContainsDuplicateRunner = () => {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentTest, setCurrentTest] = useState(0);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (answer: boolean) => {
    setUserAnswer(answer);
    setShowFeedback(true);
    const correct = answer === testCases[currentTest].output;
    if (correct) {
      setScore(score + 10);
    }
  };

  const handleNext = () => {
    if (phase === "warmup" && currentTest < testCases.length - 1) {
      setCurrentTest(currentTest + 1);
      setUserAnswer(null);
      setShowFeedback(false);
    } else if (phase === "warmup" && currentTest === testCases.length - 1) {
      setPhase("code");
      setShowFeedback(false);
    } else {
      const phases: Phase[] = ["intro", "warmup", "code", "concept", "reflection", "complete"];
      const nextPhaseIndex = phases.indexOf(phase) + 1;
      if (nextPhaseIndex < phases.length) {
        setPhase(phases[nextPhaseIndex]);
      }
    }
  };

  const handleRestart = () => {
    setPhase("intro");
    setCurrentTest(0);
    setUserAnswer(null);
    setShowFeedback(false);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary p-4">
      <div className="container max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              Contains Duplicate
            </h1>
            <p className="text-muted-foreground mt-1">Arrays & Hashing</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Score: {score}
            </Badge>
            <Button onClick={handleRestart} variant="outline" size="icon">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{phase === "complete" ? "100%" : `${((["intro", "warmup", "code", "concept", "reflection", "complete"].indexOf(phase) + 1) / 6 * 100).toFixed(0)}%`}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-red-600"
              initial={{ width: "0%" }}
              animate={{ width: `${((["intro", "warmup", "code", "concept", "reflection", "complete"].indexOf(phase) + 1) / 6 * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-2 border-red-500/20">
                <div className="flex items-start gap-4 mb-6">
                  <Sparkles className="h-12 w-12 text-red-500 flex-shrink-0" />
                  <div>
                    <h2 className="text-3xl font-bold mb-4 text-card-foreground">
                      ✨ Let's test your hashing instincts!
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Given a list of numbers, tell me if any number shows up twice.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                      Try to imagine the hash set forming in real time — like a digital memory net catching duplicates midair 🕸️
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
                >
                  Start Warm-up
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Card>
            </motion.div>
          )}

          {phase === "warmup" && (
            <motion.div
              key="warmup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-2 border-red-500/20">
                <div className="mb-6">
                  <Badge variant="outline" className="mb-4">
                    Warm-up {currentTest + 1} of {testCases.length}
                  </Badge>
                  <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                    Predict the output
                  </h2>
                  <div className="bg-secondary/50 p-6 rounded-lg mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Input:</p>
                    <code className="text-2xl font-mono text-card-foreground">
                      {JSON.stringify(testCases[currentTest].input)}
                    </code>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <Button
                    onClick={() => handleAnswer(true)}
                    disabled={showFeedback}
                    size="lg"
                    className="flex-1 h-16 text-lg bg-red-500 hover:bg-red-600"
                  >
                    True
                  </Button>
                  <Button
                    onClick={() => handleAnswer(false)}
                    disabled={showFeedback}
                    size="lg"
                    variant="outline"
                    className="flex-1 h-16 text-lg border-2 border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    False
                  </Button>
                </div>

                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg mb-6 ${
                      userAnswer === testCases[currentTest].output
                        ? "bg-green-500/10 border border-green-500/50"
                        : "bg-red-500/10 border border-red-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {userAnswer === testCases[currentTest].output ? (
                        <>
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                          <div>
                            <p className="font-bold text-green-500">Correct! +10 points</p>
                            <p className="text-sm text-muted-foreground">
                              Output: {testCases[currentTest].output.toString()}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-6 w-6 text-red-500" />
                          <div>
                            <p className="font-bold text-red-500">Not quite</p>
                            <p className="text-sm text-muted-foreground">
                              Correct output: {testCases[currentTest].output.toString()}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {showFeedback && (
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="w-full h-14 text-lg bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
                  >
                    {currentTest < testCases.length - 1 ? "Next Test Case" : "Continue to Code"}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </Card>
            </motion.div>
          )}

          {phase === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-2 border-red-500/20">
                <div className="flex items-start gap-4 mb-6">
                  <Code2 className="h-10 w-10 text-red-500 flex-shrink-0" />
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                      Code Snippet Flash
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Here's the optimal solution. Study how the hash set catches duplicates:
                    </p>
                  </div>
                </div>
                
                <div className="bg-slate-900 p-6 rounded-lg mb-6 font-mono text-sm overflow-x-auto">
                  <pre className="text-slate-100">
{`def containsDuplicate(nums):
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False`}
                  </pre>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-card-foreground">Key insight:</strong> We use a set to track numbers we've seen. 
                    If we encounter a number already in the set, we've found a duplicate!
                  </p>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
                >
                  Continue to Concept
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Card>
            </motion.div>
          )}

          {phase === "concept" && (
            <motion.div
              key="concept"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-2 border-red-500/20">
                <div className="mb-6">
                  <Badge className="mb-4 bg-red-500">Pattern Recognition</Badge>
                  <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                    Concept Tags
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="font-bold text-card-foreground mb-2">Pattern</p>
                    <p className="text-muted-foreground">Arrays / Hashing</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="font-bold text-card-foreground mb-2">Technique</p>
                    <p className="text-muted-foreground">HashSet membership check (O(1) lookup)</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="font-bold text-card-foreground mb-2">Time Complexity</p>
                    <p className="text-muted-foreground">O(n) — single pass through the array</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="font-bold text-card-foreground mb-2">Space Complexity</p>
                    <p className="text-muted-foreground">O(n) — worst case, store all elements in set</p>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
                >
                  Continue to Reflection
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Card>
            </motion.div>
          )}

          {phase === "reflection" && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-2 border-red-500/20">
                <div className="flex items-start gap-4 mb-6">
                  <Lightbulb className="h-10 w-10 text-red-500 flex-shrink-0" />
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                      Mini Reflection
                    </h2>
                    <div className="bg-secondary/50 p-6 rounded-lg mb-6">
                      <p className="text-lg font-semibold text-card-foreground mb-3">
                        "Why does a set make this so clean?"
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Because membership lookup in a set is O(1), it's incredibly efficient for duplicate detection. 
                        Instead of comparing every element with every other element (which would be O(n²)), 
                        we can check if we've seen an element before in constant time.
                      </p>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        💡 <strong>Pro tip:</strong> Whenever you need to track "have I seen this before?", 
                        think hash set first. It's your fastest friend for membership checks!
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
                >
                  Complete Drill
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Card>
            </motion.div>
          )}

          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-2 border-red-500/20 text-center">
                <CheckCircle2 className="h-20 w-20 text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4 text-card-foreground">
                  Drill Complete! 🎉
                </h2>
                <p className="text-xl text-muted-foreground mb-6">
                  Final Score: {score} points
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleRestart}
                    size="lg"
                    variant="outline"
                    className="border-2 border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Try Again
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90"
                  >
                    <Link to="/">
                      Back to Home
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContainsDuplicateRunner;
