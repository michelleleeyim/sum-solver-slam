export type ThreeSumState = {
  nums: number[];
  i: number;
  L: number;
  R: number;
  target: number;
  found: number[][];
  status: "playing" | "finished";
};

export type ThreeSumAction = "MOVE_LEFT" | "MOVE_RIGHT" | "FOUND_TRIPLET" | "NEXT_I";

export function getCurrentSum(s: ThreeSumState): number {
  if (s.i >= s.nums.length || s.L >= s.nums.length || s.R >= s.nums.length) {
    return 0;
  }
  return s.nums[s.i] + s.nums[s.L] + s.nums[s.R];
}

export function correctAction(s: ThreeSumState): ThreeSumAction {
  // If inner loop is done, move to next i
  if (s.L >= s.R) {
    return "NEXT_I";
  }

  const sum = getCurrentSum(s);

  if (sum === s.target) {
    return "FOUND_TRIPLET";
  } else if (sum < s.target) {
    return "MOVE_LEFT";
  } else {
    return "MOVE_RIGHT";
  }
}

export function nextState(s: ThreeSumState, a: ThreeSumAction): ThreeSumState {
  if (s.status === "finished") {
    return s;
  }

  switch (a) {
    case "MOVE_LEFT":
      return { ...s, L: s.L + 1 };

    case "MOVE_RIGHT":
      return { ...s, R: s.R - 1 };

    case "FOUND_TRIPLET": {
      const triplet = [s.nums[s.i], s.nums[s.L], s.nums[s.R]];
      const newFound = [...s.found, triplet];
      
      // Move both pointers inward after finding a triplet
      let newL = s.L + 1;
      let newR = s.R - 1;
      
      // Skip duplicates for L
      while (newL < newR && s.nums[newL] === s.nums[newL - 1]) {
        newL++;
      }
      
      // Skip duplicates for R
      while (newL < newR && s.nums[newR] === s.nums[newR + 1]) {
        newR--;
      }
      
      return { ...s, found: newFound, L: newL, R: newR };
    }

    case "NEXT_I": {
      let newI = s.i + 1;
      
      // Skip duplicates for i
      while (newI < s.nums.length - 2 && s.nums[newI] === s.nums[newI - 1]) {
        newI++;
      }
      
      // Check if we've reached the end
      if (newI >= s.nums.length - 2) {
        return { ...s, status: "finished" };
      }
      
      return {
        ...s,
        i: newI,
        L: newI + 1,
        R: s.nums.length - 1,
      };
    }

    default:
      return s;
  }
}

export function isFinished(s: ThreeSumState): boolean {
  return s.status === "finished" || s.i >= s.nums.length - 2;
}

export function getHint(s: ThreeSumState, attemptedAction: ThreeSumAction): string {
  const sum = getCurrentSum(s);
  const correct = correctAction(s);

  if (attemptedAction === correct) {
    return "";
  }

  if (s.L >= s.R) {
    return "Inner loop complete! Move to the next base element (i).";
  }

  if (sum === s.target) {
    return `Perfect! Sum equals ${s.target}. Record this triplet.`;
  } else if (sum < s.target) {
    return `Sum ${sum} < target ${s.target}. Need larger numbers → move L pointer right.`;
  } else {
    return `Sum ${sum} > target ${s.target}. Need smaller numbers → move R pointer left.`;
  }
}

export function initializeState(nums: number[], target: number = 0): ThreeSumState {
  return {
    nums: nums.sort((a, b) => a - b),
    i: 0,
    L: 1,
    R: nums.length - 1,
    target,
    found: [],
    status: "playing",
  };
}
