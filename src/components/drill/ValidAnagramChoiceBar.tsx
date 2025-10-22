import { Button } from "@/components/ui/button";
import { VAState, VAAction } from "@/core/engine/validAnagram";
import { Play, CheckCircle2 } from "lucide-react";

interface ValidAnagramChoiceBarProps {
  state: VAState;
  onAction: (action: VAAction) => void;
  disabled?: boolean;
}

export function ValidAnagramChoiceBar({
  state,
  onAction,
  disabled = false,
}: ValidAnagramChoiceBarProps) {
  const { mode, iS, iT, s, t, decided, sortedS, sortedT } = state;

  if (mode === "count") {
    const canProcessS = iS < s.length;
    const canProcessT = iT < t.length;
    const canCheck = iS >= s.length && iT >= t.length;

    return (
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={() => onAction("PROCESS_S")}
          disabled={disabled || !canProcessS || decided}
          size="lg"
          className="gap-2 min-w-[160px]"
        >
          <Play className="h-4 w-4" />
          Process s (+1)
        </Button>
        <Button
          onClick={() => onAction("PROCESS_T")}
          disabled={disabled || !canProcessT || decided}
          size="lg"
          variant="secondary"
          className="gap-2 min-w-[160px]"
        >
          <Play className="h-4 w-4" />
          Process t (−1)
        </Button>
        <Button
          onClick={() => onAction("CHECK")}
          disabled={disabled || !canCheck || decided}
          size="lg"
          variant="outline"
          className="gap-2 min-w-[160px]"
        >
          <CheckCircle2 className="h-4 w-4" />
          Check Result
        </Button>
      </div>
    );
  } else {
    // sort mode
    const canSortS = !sortedS;
    const canSortT = !sortedT;
    const canCheck = sortedS !== undefined && sortedT !== undefined;

    return (
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={() => onAction("SORT_S")}
          disabled={disabled || !canSortS || decided}
          size="lg"
          className="gap-2 min-w-[140px]"
        >
          Sort s
        </Button>
        <Button
          onClick={() => onAction("SORT_T")}
          disabled={disabled || !canSortT || decided}
          size="lg"
          variant="secondary"
          className="gap-2 min-w-[140px]"
        >
          Sort t
        </Button>
        <Button
          onClick={() => onAction("CHECK")}
          disabled={disabled || !canCheck || decided}
          size="lg"
          variant="outline"
          className="gap-2 min-w-[140px]"
        >
          <CheckCircle2 className="h-4 w-4" />
          Compare
        </Button>
      </div>
    );
  }
}
