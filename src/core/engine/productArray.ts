export type Stage = "prefix" | "suffix" | "combine" | "done";

export type ProductState = {
  nums: number[];
  prefix: number[];
  suffix: number[];
  result: number[];
  i: number; // pointer for current operation
  stage: Stage;
  score: number;
  mistakes: number;
  startTime: number;
};

export type ProductAction = "NEXT_STEP" | "RESTART" | "NEW_SET";

export function initProductArray(nums: number[]): ProductState {
  const n = nums.length;
  return {
    nums,
    prefix: new Array(n).fill(0),
    suffix: new Array(n).fill(0),
    result: new Array(n).fill(0),
    i: 0,
    stage: "prefix",
    score: 0,
    mistakes: 0,
    startTime: Date.now(),
  };
}

export function reducer(state: ProductState, action: ProductAction): ProductState {
  switch (action) {
    case "NEXT_STEP": {
      const n = state.nums.length;

      if (state.stage === "prefix") {
        if (state.i >= n) {
          // Move to suffix stage
          return {
            ...state,
            stage: "suffix",
            i: n - 1,
            score: state.score + 1,
          };
        }

        const prefix = [...state.prefix];
        if (state.i === 0) {
          prefix[0] = 1;
        } else {
          prefix[state.i] = prefix[state.i - 1] * state.nums[state.i - 1];
        }

        return {
          ...state,
          prefix,
          i: state.i + 1,
          score: state.score + 1,
        };
      }

      if (state.stage === "suffix") {
        if (state.i < 0) {
          // Move to combine stage
          return {
            ...state,
            stage: "combine",
            i: 0,
            score: state.score + 1,
          };
        }

        const suffix = [...state.suffix];
        if (state.i === n - 1) {
          suffix[n - 1] = 1;
        } else {
          suffix[state.i] = suffix[state.i + 1] * state.nums[state.i + 1];
        }

        return {
          ...state,
          suffix,
          i: state.i - 1,
          score: state.score + 1,
        };
      }

      if (state.stage === "combine") {
        if (state.i >= n) {
          // Done!
          return {
            ...state,
            stage: "done",
            score: state.score + 3, // bonus for completion
          };
        }

        const result = [...state.result];
        result[state.i] = state.prefix[state.i] * state.suffix[state.i];

        return {
          ...state,
          result,
          i: state.i + 1,
          score: state.score + 2,
        };
      }

      return state;
    }

    case "RESTART":
      return initProductArray(state.nums);

    case "NEW_SET": {
      // Generate random array of 4-6 elements with values 1-9
      const len = 4 + Math.floor(Math.random() * 3);
      const nums = Array.from({ length: len }, () => 1 + Math.floor(Math.random() * 9));
      return initProductArray(nums);
    }

    default:
      return state;
  }
}

export function isFinished(state: ProductState): boolean {
  return state.stage === "done";
}

export function getTimeElapsed(state: ProductState): number {
  return Math.floor((Date.now() - state.startTime) / 1000);
}

export function calculateBonus(state: ProductState, timeElapsed: number): number {
  let bonus = 0;
  if (state.mistakes === 0) bonus += 3;
  if (timeElapsed < 30) bonus += 1;
  return bonus;
}
