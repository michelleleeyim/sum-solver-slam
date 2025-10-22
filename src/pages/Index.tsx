import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Target, Hash, FolderOpen, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

const Index = () => {
  const [arraysOpen, setArraysOpen] = useState(false);
  const [pointersOpen, setPointersOpen] = useState(false);

  const arrayProblems = [
    { name: "Contains Duplicate", path: "/drill/contains-duplicate", color: "red" },
    { name: "Valid Anagram", path: "/drill/valid-anagram", color: "blue" },
    { name: "Two Sum", path: "/drill/two-sum", color: "orange" },
    { name: "Group Anagrams", path: "#", color: "purple", disabled: true },
    { name: "Top K Frequent Elements", path: "#", color: "pink", disabled: true },
    { name: "Encode & Decode Strings", path: "#", color: "cyan", disabled: true },
    { name: "Product of Array Except Self", path: "#", color: "indigo", disabled: true },
    { name: "Longest Consecutive Sequence", path: "#", color: "teal", disabled: true },
  ];

  const pointerProblems = [
    { name: "Valid Palindrome", path: "/drill/palindrome", color: "green" },
    { name: "Container With Most Water", path: "/drill/container", color: "yellow" },
    { name: "3Sum", path: "/drill/three-sum", color: "violet" },
    { name: "Trapping Rain Water", path: "#", color: "blue", disabled: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Algorithm Drills
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Train algorithm instincts visually. Master patterns through interactive micro-puzzles.
          </p>
        </motion.div>

        {/* Category Folders */}
        <div className="space-y-6 mb-12">
          {/* Arrays & Hashing Folder */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Collapsible open={arraysOpen} onOpenChange={setArraysOpen}>
              <Card className="p-6 shadow-xl bg-gradient-to-br from-card to-card/80 border-2 border-primary/20">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-primary/10">
                        <Hash className="h-8 w-8 text-primary" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                          Arrays & Hashing
                          {arraysOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {arrayProblems.length} problems · Hash sets, frequency maps, prefix sums
                        </p>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-6 grid gap-3">
                    {arrayProblems.map((problem, idx) => (
                      <motion.div
                        key={problem.name}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * idx }}
                      >
                        {problem.disabled ? (
                          <Card className="p-4 bg-secondary/30 border border-muted opacity-60">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-muted-foreground">{problem.name}</span>
                              <span className="text-xs text-muted-foreground">Coming Soon</span>
                            </div>
                          </Card>
                        ) : (
                          <Link to={problem.path}>
                            <Card className="p-4 bg-secondary/50 hover:bg-secondary/80 transition-all hover:scale-[1.02] border border-muted hover:border-primary/50">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-card-foreground">{problem.name}</span>
                                <ArrowRight className="h-4 w-4 text-primary" />
                              </div>
                            </Card>
                          </Link>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </motion.div>

          {/* Two Pointers Folder */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Collapsible open={pointersOpen} onOpenChange={setPointersOpen}>
              <Card className="p-6 shadow-xl bg-gradient-to-br from-card to-card/80 border-2 border-accent/20">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-accent/10">
                        <Target className="h-8 w-8 text-accent" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                          Two Pointers
                          {pointersOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {pointerProblems.length} problems · Opposite ends, sliding window, fast-slow
                        </p>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-6 grid gap-3">
                    {pointerProblems.map((problem, idx) => (
                      <motion.div
                        key={problem.name}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * idx }}
                      >
                        {problem.disabled ? (
                          <Card className="p-4 bg-secondary/30 border border-muted opacity-60">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-muted-foreground">{problem.name}</span>
                              <span className="text-xs text-muted-foreground">Coming Soon</span>
                            </div>
                          </Card>
                        ) : (
                          <Link to={problem.path}>
                            <Card className="p-4 bg-secondary/50 hover:bg-secondary/80 transition-all hover:scale-[1.02] border border-muted hover:border-accent/50">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-card-foreground">{problem.name}</span>
                                <ArrowRight className="h-4 w-4 text-accent" />
                              </div>
                            </Card>
                          </Link>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </motion.div>
        </div>

        {/* How It Works */}
        <motion.div
          className="mt-12"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="p-8 bg-card/50 backdrop-blur">
            <h3 className="text-2xl font-bold mb-6 text-card-foreground">How it works</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-card-foreground mb-1">Choose a category</h4>
                  <p className="text-muted-foreground text-sm">
                    Click on Arrays & Hashing or Two Pointers to see available problems.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-card-foreground mb-1">Pick a problem</h4>
                  <p className="text-muted-foreground text-sm">
                    Each problem has a unique drill that teaches you the optimal solution through interactive visualization.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-card-foreground mb-1">Master the pattern</h4>
                  <p className="text-muted-foreground text-sm">
                    Get instant feedback on your moves, build intuition, and level up your algorithm skills!
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
