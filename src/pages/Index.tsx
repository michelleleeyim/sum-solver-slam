import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Target, Zap, Trophy, Layers, Container } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
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

        {/* Category Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Two Pointers Card */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="p-8 shadow-xl bg-gradient-to-br from-card to-card/80 border-2 border-primary/20 h-full">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-card-foreground">
                    Two Pointers – Pair Sum
                  </h2>
                  <p className="text-muted-foreground">
                    Learn the classic two-pointer technique for finding pairs in sorted arrays. Make
                    split-second decisions: move left, move right, or claim victory.
                  </p>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-secondary/50 rounded-xl">
                <div className="text-center">
                  <Zap className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Quick Drills</p>
                  <p className="text-lg font-bold text-card-foreground">10 min</p>
                </div>
                <div className="text-center">
                  <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Skill Level</p>
                  <p className="text-lg font-bold text-card-foreground">Beginner</p>
                </div>
                <div className="text-center">
                  <Target className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Drills</p>
                  <p className="text-lg font-bold text-card-foreground">20+</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-primary-foreground shadow-lg"
                >
                  <Link to="/drill/two-pointers?mode=micro">
                    Quick Drill (Micro)
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 text-lg font-bold border-2 border-primary text-primary hover:bg-primary/10"
                >
                  <Link to="/drill/two-pointers?mode=mini">Multi-Step (Mini)</Link>
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* 3Sum Card */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="p-8 shadow-xl bg-gradient-to-br from-card to-card/80 border-2 border-purple-500/20 h-full">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-purple-500/10">
                  <Layers className="h-8 w-8 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-card-foreground">
                    3Sum Pattern – Nested Two Pointers
                  </h2>
                  <p className="text-muted-foreground">
                    Master the nested pointer technique by fixing one element and applying two-pointer
                    logic to find triplets. Level up your algorithm skills!
                  </p>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-secondary/50 rounded-xl">
                <div className="text-center">
                  <Zap className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-bold text-card-foreground">15 min</p>
                </div>
                <div className="text-center">
                  <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Skill Level</p>
                  <p className="text-lg font-bold text-card-foreground">Intermediate</p>
                </div>
                <div className="text-center">
                  <Layers className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Drills</p>
                  <p className="text-lg font-bold text-card-foreground">5+</p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                asChild
                size="lg"
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 text-white shadow-lg"
              >
                <Link to="/drill/three-sum">
                  Start 3Sum Drill
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </Card>
          </motion.div>

          {/* Container Card */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="p-8 shadow-xl bg-gradient-to-br from-card to-card/80 border-2 border-accent/20 h-full">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-accent/10">
                  <Container className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-card-foreground">
                    Container With Most Water
                  </h2>
                  <p className="text-muted-foreground">
                    Master the greedy two-pointer approach by always moving the shorter line. 
                    Visualize how to maximize area between vertical lines.
                  </p>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-secondary/50 rounded-xl">
                <div className="text-center">
                  <Zap className="h-5 w-5 text-accent mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-bold text-card-foreground">10 min</p>
                </div>
                <div className="text-center">
                  <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Skill Level</p>
                  <p className="text-lg font-bold text-card-foreground">Intermediate</p>
                </div>
                <div className="text-center">
                  <Container className="h-5 w-5 text-accent mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Drills</p>
                  <p className="text-lg font-bold text-card-foreground">15+</p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                asChild
                size="lg"
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-accent to-accent/80 hover:opacity-90 text-accent-foreground shadow-lg"
              >
                <Link to="/drill/container">
                  Start Container Drill
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </Card>
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
                  <h4 className="font-bold text-card-foreground mb-1">See the array & target</h4>
                  <p className="text-muted-foreground text-sm">
                    You'll see a sorted array with two pointers (L and R) and a target sum to find.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-card-foreground mb-1">Choose your move</h4>
                  <p className="text-muted-foreground text-sm">
                    If the sum is too small, move left pointer right (L++). If too large, move
                    right pointer left (R--). If equal, claim "Found Pair!"
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-card-foreground mb-1">Get instant feedback</h4>
                  <p className="text-muted-foreground text-sm">
                    Correct moves earn points and build your combo. Mistakes show helpful hints. No
                    dead ends—you can always retry.
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
