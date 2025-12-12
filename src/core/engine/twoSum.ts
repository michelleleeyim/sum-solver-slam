export type TSState = {
  nums: number[];
  target: number;
  idx: number;
  seen: Map<number, number>; // value -> index
  phase: "scan" | "done";
  foundPair: [number, number] | null;
  score: number;
  startTime: number;
};

export type TSAction =
  | { type: "CHECK_NEXT" }
  | { type: "RESTART" }
  | { type: "NEW_SET"; nums: number[]; target: number };

export function initTwoSum(nums: number[], target: number): TSState {
  return {
    nums,
    target,
    idx: 0,
    seen: new Map(),
    phase: "scan",
    foundPair: null,
    score: 0,
    startTime: Date.now(),
  };
}

export function reducer(state: TSState, action: TSAction): TSState {
  switch (action.type) {
    case "CHECK_NEXT": {
      if (state.phase === "done") return state;

      const current = state.nums[state.idx];
      const complement = state.target - current;
      
      // Check if complement exists in seen
      if (state.seen.has(complement)) {
        const complementIdx = state.seen.get(complement)!;
        return {
          ...state,
          phase: "done",
          foundPair: [complementIdx, state.idx],
          score: state.score + 3, // Bonus for finding pair
        };
      }

      // Add current to seen
      const newSeen = new Map(state.seen);
      newSeen.set(current, state.idx);
      
      const nextIdx = state.idx + 1;
      const isDone = nextIdx >= state.nums.length;

      return {
        ...state,
        idx: nextIdx,
        seen: newSeen,
        phase: isDone ? "done" : "scan",
        score: state.score + 1,
      };
    }

    case "RESTART":
      return initTwoSum(state.nums, state.target);

    case "NEW_SET":
      return initTwoSum(action.nums, action.target);

    default:
      return state;
  }
}

export function isFinished(state: TSState): boolean {
  return state.phase === "done";
}

export function getTimeElapsed(state: TSState): number {
  return Math.floor((Date.now() - state.startTime) / 1000);
}

export function calculateBonus(state: TSState): number {
  const timeElapsed = getTimeElapsed(state);
  let bonus = 0;
  if (state.foundPair) bonus += 5; // Found the pair
  if (timeElapsed < 30) bonus += 2; // Speed bonus
  return bonus;
}
