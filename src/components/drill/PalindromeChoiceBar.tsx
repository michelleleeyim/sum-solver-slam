import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion } from "framer-motion";

interface PalindromeChoiceBarProps {
  onSkipLeft: () => void;
  onSkipRight: () => void;
  onCompare: () => void;
  disabled?: boolean;
}

export function PalindromeChoiceBar({ 
  onSkipLeft, 
  onSkipRight, 
  onCompare, 
  disabled = false 
}: PalindromeChoiceBarProps) {
  return (
    <motion.div
      className="flex flex-col gap-3 w-full max-w-md"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onSkipLeft}
          disabled={disabled}
          size="lg"
          className="h-16 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronRight className="mr-2 h-5 w-5" />
          Skip Left
          <span className="ml-auto text-xs opacity-70">(L++)</span>
        </Button>

        <Button
          onClick={onSkipRight}
          disabled={disabled}
          size="lg"
          className="h-16 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Skip Right
          <span className="ml-auto text-xs opacity-70">(R--)</span>
        </Button>
      </div>

      <Button
        onClick={onCompare}
        disabled={disabled}
        size="lg"
        className="h-16 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all"
      >
        <Check className="mr-2 h-6 w-6" />
        Compare Characters
      </Button>
    </motion.div>
  );
}
