import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, RotateCcw, ArrowRight } from "lucide-react";
import { getSessionSummaries } from "@/lib/storage";
import { useEffect, useState } from "react";

export default function ValidAnagramSummary() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const sessions = getSessionSummaries();
    const latest = sessions.find(s => s.type === "valid-anagram");
    setSummary(latest);
  }, []);

  if (!summary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Session Found</CardTitle>
            <CardDescription>Start a drill to see your results</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { score, accuracy, totalMoves, correctMoves, duration, isAnagram, mode } = summary;
  const durationSec = Math.round(duration / 1000);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">Valid Anagram Complete! 🎉</CardTitle>
          <CardDescription>
            Result: {isAnagram ? "Valid Anagram ✅" : "Not an Anagram ❌"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-3xl font-bold text-primary">{score}</div>
              <div className="text-sm text-muted-foreground">XP Earned</div>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-3xl font-bold text-secondary">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-3xl font-bold text-accent-foreground">{totalMoves}</div>
              <div className="text-sm text-muted-foreground">Total Moves</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">{durationSec}s</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Mode Used</span>
              <span className="font-medium">
                {mode === "count" ? "Counting (Optimal)" : "Sorting"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Correct Moves</span>
              <span className="font-medium">{correctMoves} / {totalMoves}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button onClick={() => navigate("/drill/valid-anagram")} className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
