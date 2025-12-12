export type ReverseState = {
  nodes: number[];
  prevIndex: number | null;
  currIndex: number | null;
  nextIndex: number | null;
  reversedUpTo: number; // how many links have been reversed
  phase: "ready" | "reversing" | "done";
  score: number;
  startTime: number;
  endTime: number | null;
};

export type ReverseAction =
  | { type: "START" }
  | { type: "NEXT_STEP" }
  | { type: "RESTART" }
  | { type: "NEW_LIST" };

export function generateRandomList(): number[] {
  const length = Math.floor(Math.random() * 4) + 4; // 4-7 nodes
  const nodes: number[] = [];
  for (let i = 0; i < length; i++) {
    nodes.push(Math.floor(Math.random() * 99) + 1);
  }
  return nodes;
}

export function initReverseLinkedList(nodes?: number[]): ReverseState {
  const list = nodes || generateRandomList();
  return {
    nodes: list,
    prevIndex: null,
    currIndex: 0,
    nextIndex: list.length > 1 ? 1 : null,
    reversedUpTo: 0,
    phase: "ready",
    score: 0,
    startTime: Date.now(),
    endTime: null,
  };
}

export function reducer(state: ReverseState, action: ReverseAction): ReverseState {
  switch (action.type) {
    case "START":
      return {
        ...state,
        phase: "reversing",
      };

    case "NEXT_STEP": {
      if (state.phase !== "reversing" || state.currIndex === null) {
        return state;
      }

      const newReversedUpTo = state.reversedUpTo + 1;
      const newPrevIndex = state.currIndex;
      const newCurrIndex = state.nextIndex;
      const newNextIndex = newCurrIndex !== null && newCurrIndex < state.nodes.length - 1
        ? newCurrIndex + 1
        : null;

      const isDone = newCurrIndex === null;

      return {
        ...state,
        prevIndex: newPrevIndex,
        currIndex: newCurrIndex,
        nextIndex: newNextIndex,
        reversedUpTo: newReversedUpTo,
        phase: isDone ? "done" : "reversing",
        score: state.score + 1,
        endTime: isDone ? Date.now() : null,
      };
    }

    case "RESTART":
      return {
        ...initReverseLinkedList(state.nodes),
        startTime: Date.now(),
      };

    case "NEW_LIST":
      return initReverseLinkedList();

    default:
      return state;
  }
}

export function isFinished(state: ReverseState): boolean {
  return state.phase === "done";
}

export function getTimeElapsed(state: ReverseState): number {
  if (state.endTime) {
    return Math.floor((state.endTime - state.startTime) / 1000);
  }
  return Math.floor((Date.now() - state.startTime) / 1000);
}

export function calculateBonus(state: ReverseState): number {
  let bonus = 0;
  const time = getTimeElapsed(state);
  
  // Perfect run bonus (completed all steps)
  if (state.reversedUpTo === state.nodes.length) {
    bonus += 2;
  }
  
  // Speed bonus
  if (time < 20) {
    bonus += 3;
  } else if (time < 30) {
    bonus += 1;
  }
  
  return bonus;
}

export function getReversedList(state: ReverseState): number[] {
  return [...state.nodes].reverse();
}
