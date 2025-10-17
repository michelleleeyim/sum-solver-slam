import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Check, SkipForward } from "lucide-react";
import { motion } from "framer-motion";

interface ThreeSumChoiceBarProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onFound: () => void;
  onNextI: () => void;
  disabled?: boolean;
  showNextI?: boolean;
}

export function ThreeSumChoiceBar({
  onMoveLeft,
  onMoveRight,
  onFound,
  onNextI,
  disabled = false,
  showNextI = false,
}: ThreeSumChoiceBarProps) {
  return (
    <motion.div
      className="flex flex-col gap-3 w-full max-w-md"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onMoveLeft}
          disabled={disabled}
          size="lg"
          className="h-16 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronRight className="mr-2 h-5 w-5" />
          Move L →
        </Button>

        <Button
          onClick={onMoveRight}
          disabled={disabled}
          size="lg"
          className="h-16 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Move R ←
        </Button>
      </div>

      <Button
        onClick={onFound}
        disabled={disabled}
        size="lg"
        className="h-16 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all"
      >
        <Check className="mr-2 h-6 w-6" />
        Found Triplet!
      </Button>

      {showNextI && (
        <Button
          onClick={onNextI}
          disabled={disabled}
          size="lg"
          variant="outline"
          className="h-16 text-lg font-bold border-2 border-purple-500 text-purple-600 hover:bg-purple-500/10 shadow-lg hover:shadow-xl transition-all"
        >
          <SkipForward className="mr-2 h-6 w-6" />
          Next i (Increment Base)
        </Button>
      )}
    </motion.div>
  );
}
