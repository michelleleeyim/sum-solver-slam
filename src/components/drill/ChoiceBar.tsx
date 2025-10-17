import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { motion } from "framer-motion";

interface ChoiceBarProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onFound: () => void;
  disabled?: boolean;
}

export function ChoiceBar({ onMoveLeft, onMoveRight, onFound, disabled = false }: ChoiceBarProps) {
  return (
    <motion.div
      className="flex flex-col gap-3 w-full max-w-md"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Button
        onClick={onMoveLeft}
        disabled={disabled}
        size="lg"
        className="h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
      >
        <ChevronRight className="mr-2 h-6 w-6" />
        Move Left Pointer →
        <span className="ml-auto text-xs opacity-70">(L++)</span>
      </Button>

      <Button
        onClick={onMoveRight}
        disabled={disabled}
        size="lg"
        className="h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
      >
        <ChevronLeft className="mr-2 h-6 w-6" />
        Move Right Pointer ←
        <span className="ml-auto text-xs opacity-70">(R--)</span>
      </Button>

      <Button
        onClick={onFound}
        disabled={disabled}
        size="lg"
        className="h-16 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all"
      >
        <Check className="mr-2 h-6 w-6" />
        Found Pair!
      </Button>
    </motion.div>
  );
}
