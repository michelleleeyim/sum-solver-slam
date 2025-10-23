export type Mode = "bucket" | "heap";

export type TKState = {
  nums: number[];
  k: number;
  idx: number;
  freq: Record<string, number>;
  mode: Mode;
  buckets?: Record<number, number[]>;
  heap?: Array<[number, number]>;
  result: number[];
  phase: "count" | "structure" | "extract" | "done";
  score: number;
  mistakes: number;
};

export type TKAction =
  | { type: "PROCESS_NEXT" }
  | { type: "BUILD_STRUCTURE" }
  | { type: "TAKE_TOP_K" }
  | { type: "TOGGLE_MODE" }
  | { type: "RESTART"; nums: number[]; k: number }
  | { type: "NEW_SET"; nums: number[]; k: number };

export function initTopK(nums: number[], k: number, mode: Mode = "bucket"): TKState {
  return { 
    nums, 
    k, 
    idx: 0, 
    freq: {}, 
    mode, 
    result: [], 
    phase: "count",
    score: 0,
    mistakes: 0
  };
}

function pushHeapMin(heap: Array<[number, number]>, node: [number, number], k: number) {
  heap.push(node);
  heap.sort((a, b) => a[0] - b[0]);
  if (heap.length > k) heap.shift();
}

export function reducer(state: TKState, action: TKAction): TKState {
  switch (action.type) {
    case "PROCESS_NEXT": {
      if (state.phase !== "count" || state.idx >= state.nums.length) return state;
      const v = state.nums[state.idx];
      const cnt = (state.freq[v] ?? 0) + 1;
      const freq = { ...state.freq, [v]: cnt };

      if (state.mode === "heap") {
        const heap = (state.heap ? [...state.heap] : []) as Array<[number, number]>;
        const existingIdx = heap.findIndex(([_, val]) => val === v);
        if (existingIdx >= 0) heap.splice(existingIdx, 1);
        pushHeapMin(heap, [cnt, v], state.k);
        return { ...state, idx: state.idx + 1, freq, heap, score: state.score + 1 };
      }

      return { ...state, idx: state.idx + 1, freq, score: state.score + 1 };
    }

    case "BUILD_STRUCTURE": {
      if (state.phase !== "count" || state.idx < state.nums.length) {
        return { ...state, mistakes: state.mistakes + 1 };
      }
      
      if (state.mode === "bucket") {
        const buckets: Record<number, number[]> = {};
        let maxF = 0;
        for (const [vk, c] of Object.entries(state.freq)) {
          const v = Number(vk);
          maxF = Math.max(maxF, c);
          (buckets[c] ??= []).push(v);
        }
        Object.values(buckets).forEach(arr => arr.sort((a, b) => a - b));
        return { ...state, buckets, phase: "extract", score: state.score + 3 };
      } else {
        let heap = state.heap ? [...state.heap] : [];
        if (!heap.length) {
          heap = [];
          Object.entries(state.freq).forEach(([vk, c]) => 
            pushHeapMin(heap, [c, Number(vk)], state.k)
          );
        }
        return { ...state, heap, phase: "extract", score: state.score + 3 };
      }
    }

    case "TAKE_TOP_K": {
      if (state.phase !== "extract") {
        return { ...state, mistakes: state.mistakes + 1 };
      }

      if (state.mode === "bucket") {
        const buckets = { ...(state.buckets ?? {}) };
        const result: number[] = [];
        const maxF = Math.max(0, ...Object.keys(buckets).map(n => Number(n)));
        for (let f = maxF; f >= 1 && result.length < state.k; f--) {
          const row = buckets[f];
          if (!row) continue;
          for (const v of row) {
            result.push(v);
            if (result.length === state.k) break;
          }
        }
        const bonus = state.mode === "bucket" ? 3 : 0;
        return { ...state, result, phase: "done", score: state.score + 5 + bonus };
      } else {
        const res = [...(state.heap ?? [])]
          .sort((a, b) => b[0] - a[0])
          .map(([_, v]) => v)
          .slice(0, state.k);
        return { ...state, result: res, phase: "done", score: state.score + 5 };
      }
    }

    case "TOGGLE_MODE": {
      const mode: Mode = state.mode === "bucket" ? "heap" : "bucket";
      const next: TKState = { ...state, mode };
      if (mode === "bucket") {
        delete next.heap;
      } else {
        delete next.buckets;
      }
      return next;
    }

    case "RESTART":
      return initTopK(action.nums, action.k, state.mode);

    case "NEW_SET":
      return initTopK(action.nums, action.k, state.mode);

    default:
      return state;
  }
}

export function isFinished(state: TKState): boolean {
  return state.phase === "done";
}

export function getComplexity(mode: Mode): string {
  return mode === "bucket" ? "O(n)" : "O(n log k)";
}
