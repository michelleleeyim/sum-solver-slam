// Contains Duplicate engine - visualizes HashSet approach

export type CDPhase = "scan" | "done";

export type CDState = {
  nums: number[];
  idx: number;
  seen: Set<number>;
  foundDuplicate: boolean;
  duplicateValue: number | null;
  phase: CDPhase;
  score: number;
  mistakes: number;
  startTime: number;
};

export type CDAction =
  | { type: "CHECK_NEXT" }
  | { type: "RESTART"; nums?: number[] }
  | { type: "NEW_SET"; nums: number[] };

export function initContainsDuplicate(nums: number[]): CDState {
  return {
    nums,
    idx: 0,
    seen: new Set(),
    foundDuplicate: false,
    duplicateValue: null,
    phase: "scan",
    score: 0,
    mistakes: 0,
    startTime: Date.now(),
  };
}

export function reducer(state: CDState, action: CDAction): CDState {
  switch (action.type) {
    case "CHECK_NEXT": {
      if (state.phase !== "scan" || state.idx >= state.nums.length) return state;

      const currentNum = state.nums[state.idx];
      const newSeen = new Set(state.seen);

      // Check if we found a duplicate
      if (newSeen.has(currentNum)) {
        return {
          ...state,
          idx: state.idx + 1,
          foundDuplicate: true,
          duplicateValue: currentNum,
          phase: "done",
          score: state.score + 5, // Bonus for finding duplicate
        };
      }

      // Add to seen set
      newSeen.add(currentNum);
      const newIdx = state.idx + 1;
      const isComplete = newIdx >= state.nums.length;

      return {
        ...state,
        idx: newIdx,
        seen: newSeen,
        phase: isComplete ? "done" : "scan",
        score: state.score + 1, // +1 for each check
      };
    }

    case "RESTART": {
      const nums = action.nums || state.nums;
      return initContainsDuplicate(nums);
    }

    case "NEW_SET": {
      return initContainsDuplicate(action.nums);
    }

    default:
      return state;
  }
}

export function isFinished(state: CDState): boolean {
  return state.phase === "done";
}

export function getTimeElapsed(state: CDState): number {
  return Math.floor((Date.now() - state.startTime) / 1000);
}

export function getResult(state: CDState): boolean {
  return state.foundDuplicate;
}
