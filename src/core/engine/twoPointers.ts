export type TPState = {
  nums: number[];
  target: number;
  L: number;
  R: number;
  status: "playing" | "found" | "ended";
};

export type TPAction = "MOVE_LEFT" | "MOVE_RIGHT" | "FOUND";

export function nextState(s: TPState, a: TPAction): TPState {
  // Terminal states don't change
  if (s.status !== "playing") {
    return s;
  }

  // Check if pointers have crossed or met
  if (s.L >= s.R) {
    return { ...s, status: "ended" };
  }

  const currentSum = s.nums[s.L] + s.nums[s.R];

  switch (a) {
    case "MOVE_LEFT":
      if (s.L + 1 >= s.R) {
        return { ...s, L: s.L + 1, status: "ended" };
      }
      return { ...s, L: s.L + 1 };

    case "MOVE_RIGHT":
      if (s.R - 1 <= s.L) {
        return { ...s, R: s.R - 1, status: "ended" };
      }
      return { ...s, R: s.R - 1 };

    case "FOUND":
      if (currentSum === s.target) {
        return { ...s, status: "found" };
      }
      // If user claims found but it's wrong, stay in playing state
      return s;

    default:
      return s;
  }
}

export function correctAction(s: TPState): TPAction {
  // Terminal states have no correct action
  if (s.status !== "playing") {
    throw new Error("No correct action for terminal state");
  }

  const currentSum = s.nums[s.L] + s.nums[s.R];

  if (currentSum === s.target) {
    return "FOUND";
  } else if (currentSum < s.target) {
    return "MOVE_LEFT"; // Need to increase sum
  } else {
    return "MOVE_RIGHT"; // Need to decrease sum
  }
}

export function isTerminal(s: TPState): boolean {
  return s.status === "found" || s.status === "ended" || s.L >= s.R;
}

export function getCurrentSum(s: TPState): number {
  return s.nums[s.L] + s.nums[s.R];
}

export function getHint(s: TPState, attemptedAction: TPAction): string {
  const currentSum = getCurrentSum(s);
  const correct = correctAction(s);

  if (attemptedAction === correct) {
    return "";
  }

  if (currentSum === s.target) {
    return `Sum equals target! Click "Found Pair" to complete.`;
  } else if (currentSum < s.target) {
    return `Sum ${currentSum} < target ${s.target}. Move left pointer right to increase.`;
  } else {
    return `Sum ${currentSum} > target ${s.target}. Move right pointer left to decrease.`;
  }
}
