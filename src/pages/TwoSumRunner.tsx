import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, RotateCcw, Sparkles, CheckCircle2, XCircle, Code2, Lightbulb, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

type Phase = "intro" | "warmup" | "code" | "concept" | "reflection" | "complete";

const testCases = [
  { nums: [2, 7, 11, 15], target: 9, output: [0, 1] },
  { nums: [3, 2, 4], target: 6, output: [1, 2] },
  { nums: [3, 3], target: 6, output: [0, 1] },
  { nums: [1, 2, 5, 10], target: 7, output: [1, 2] },
];

const TwoSumRunner = () => {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentTest, setCurrentTest] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = () => {
    setShowFeedback(true);
    try {
      const parsed = JSON.parse(userAnswer);
      const expected = testCases[currentTest].output;
      const correct = 
        Array.isArray(parsed) && 
        parsed.length === 2 &&
        ((parsed[0] === expected[0] && parsed[1] === expected[1]) ||
         (parsed[0] === expected[1] && parsed[1] === expected[0]));
      
      if (correct) {
        setScore(score + 15);
      }
    } catch {
      // Invalid format
    }
  };

  const handleNext = () => {
    if (phase === "warmup" && currentTest < testCases.length - 1) {
      setCurrentTest(currentTest + 1);
      setUserAnswer("");
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
    setUserAnswer("");
    setShowFeedback(false);
    setScore(0);
  };

  const isCorrect = () => {
    try {
      const parsed = JSON.parse(userAnswer);
      const expected = testCases[currentTest].output;
      return (
        Array.isArray(parsed) && 
        parsed.length === 2 &&
        ((parsed[0] === expected[0] && parsed[1] === expected[1]) ||
         (parsed[0] === expected[1] && parsed[1] === expected[0]))
      );
    } catch {
      return false;
    }
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Two Sum
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
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
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
              <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-2 border-orange-500/20">
                <div className="flex items-start gap-4 mb-6">
                  <Search className="h-12 w-12 text-orange-500 flex-shrink-0" />
                  <div>
                    <h2 className="text-3xl font-bold mb-4 text-card-foreground">
                      💫 Let's play detective
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      You have a list of numbers, and a secret target sum.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                      Two of these numbers hide the answer — can you catch them in a single pass before they slip by? 🕵️‍♀️
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                      Use your intuition about <strong className="text-card-foreground">complements</strong> — every number has a 'partner' waiting to make the sum complete.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90"
                >
                  Start Mental Simulation
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
              <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-2 border-orange-500/20">
                <div className="mb-6">
                  <Badge variant="outline" className="mb-4">
                    Test Case {currentTest + 1} of {testCases.length}
                  </Badge>
                  <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                    Predict Output (Mental Simulation)
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Visualize building the map in your head — scan left to right while whispering each complement to yourself.
                  </p>
                  <div className="bg-secondary/50 p-6 rounded-lg mb-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">nums:</p>
                        <code className="text-xl font-mono text-card-foreground">
                          {JSON.stringify(testCases[currentTest].nums)}
                        </code>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">target:</p>
                        <code className="text-xl font-mono text-card-foreground">
                          {testCases[currentTest].target}
                        </code>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-card-foreground mb-2 block">
                      Enter indices as array (e.g., [0, 1]):
                    </label>
                    <div className="flex gap-3">
                      <Input
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="[0, 1]"
                        className="text-lg font-mono"
                        disabled={showFeedback}
                      />
                      <Button
                        onClick={handleAnswer}
                        disabled={showFeedback || !userAnswer}
                        className="bg-orange-500 hover:bg-orange-600 px-8"
                      >
                        Check
                      </Button>
                    </div>
                  </div>
                </div>

                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg mb-6 ${
                      isCorrect()
                        ? "bg-green-500/10 border border-green-500/50"
                        : "bg-red-500/10 border border-red-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isCorrect() ? (
                        <>
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                          <div>
                            <p className="font-bold text-green-500">Correct! +15 points</p>
                            <p className="text-sm text-muted-foreground">
                              Expected: {JSON.stringify(testCases[currentTest].output)}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-6 w-6 text-red-500" />
                          <div>
                            <p className="font-bold text-red-500">Not quite</p>
                            <p className="text-sm text-muted-foreground">
                              Correct answer: {JSON.stringify(testCases[currentTest].output)}
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
                    className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90"
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
              <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-2 border-orange-500/20">
                <div className="flex items-start gap-4 mb-6">
                  <Code2 className="h-10 w-10 text-orange-500 flex-shrink-0" />
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                      Code Visualization
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Watch how the hash map builds as we scan through the array:
                    </p>
                  </div>
                </div>
                
                <div className="bg-slate-900 p-6 rounded-lg mb-6 font-mono text-sm overflow-x-auto">
                  <pre className="text-slate-100">
{`def twoSum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i`}
                  </pre>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-card-foreground mb-2">💭 As it runs, imagine:</p>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>• The <code className="text-orange-500">seen</code> dictionary growing with each iteration</li>
                      <li>• Each lookup checking "is your partner already in the map?" 💞</li>
                      <li>• The moment when complement matches — that's when we found our pair!</li>
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90"
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
              <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-2 border-orange-500/20">
                <div className="mb-6">
                  <Badge className="mb-4 bg-orange-500">Pattern: Hash Map Lookup</Badge>
                  <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                    Concept Reflection
                  </h2>
                  <div className="bg-secondary/50 p-6 rounded-lg mb-6">
                    <p className="text-lg font-semibold text-card-foreground mb-3">
                      "Why do we need a hash map here?"
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Because it gives us <strong className="text-orange-500">O(1) lookups</strong> — every number can instantly check if its missing piece has already appeared. 
                      Without it, we'd need nested loops checking every pair (O(n²)). The hash map is our "memory" that remembers what we've seen.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <h3 className="font-bold text-card-foreground">Then reflect:</h3>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="font-medium text-card-foreground mb-2">What would happen if we didn't use a hash map?</p>
                    <p className="text-sm text-muted-foreground">
                      We'd need two nested loops to compare every pair → O(n²) time complexity. Much slower for large arrays!
                    </p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="font-medium text-card-foreground mb-2">Could this pattern extend to 3Sum or 4Sum?</p>
                    <p className="text-sm text-muted-foreground">
                      Yes! 3Sum uses this Two Sum as a subroutine. Fix one element, then find Two Sum in the rest. Hash maps are the foundation.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90"
                >
                  Continue to Key Insights
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
              <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-2 border-orange-500/20">
                <div className="flex items-start gap-4 mb-6">
                  <Lightbulb className="h-10 w-10 text-orange-500 flex-shrink-0" />
                  <div className="w-full">
                    <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                      🪞 Key Insights Recap
                    </h2>
                    
                    <div className="bg-secondary/50 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-orange-500/20">
                          <tr>
                            <th className="text-left p-3 font-semibold text-card-foreground">Check</th>
                            <th className="text-left p-3 font-semibold text-card-foreground">Why it Matters</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="p-3 font-mono text-sm text-orange-500">complement = target - n</td>
                            <td className="p-3 text-sm text-muted-foreground">Finds the partner number dynamically</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-mono text-sm text-orange-500">if complement in seen:</td>
                            <td className="p-3 text-sm text-muted-foreground">Instant lookup (O(1))</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-mono text-sm text-orange-500">seen[n] = i</td>
                            <td className="p-3 text-sm text-muted-foreground">Records position for future matches</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-mono text-sm text-orange-500">return [seen[complement], i]</td>
                            <td className="p-3 text-sm text-muted-foreground">Returns indices in input order</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-mono text-sm text-orange-500">Time: O(n)</td>
                            <td className="p-3 text-sm text-muted-foreground">One pass through list</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-mono text-sm text-orange-500">Space: O(n)</td>
                            <td className="p-3 text-sm text-muted-foreground">Stores at most one entry per number</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mt-6">
                      <p className="text-sm text-muted-foreground">
                        ✨ <strong>Review tip:</strong> Each time you replay, shuffle inputs (some solvable, some not). 
                        When you get 3 correct in a row → mark this pattern as "Mastered (Tier 1)" 🌿
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90"
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
              <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-2 border-orange-500/20 text-center">
                <CheckCircle2 className="h-20 w-20 text-orange-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4 text-card-foreground">
                  Drill Complete! 🎉
                </h2>
                <p className="text-xl text-muted-foreground mb-2">
                  Final Score: {score} points
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  You've mastered the complement pattern! 🕵️‍♀️
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleRestart}
                    size="lg"
                    variant="outline"
                    className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500/10"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Try Again
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90"
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

export default TwoSumRunner;
