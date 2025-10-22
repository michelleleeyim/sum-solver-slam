export type VAState = {
  s: string;
  t: string;
  iS: number;   // next index in s
  iT: number;   // next index in t
  freq: Record<string, number>; // char -> count
  mode: "count" | "sort";
  decided?: boolean;
  isAnagram?: boolean;
  sortedS?: string;
  sortedT?: string;
};

export type VAAction =
  | "PROCESS_S"
  | "PROCESS_T"
  | "CHECK"
  | "TOGGLE_MODE"
  | "SORT_S"
  | "SORT_T"
  | "RESTART";

export function initVA(s: string, t: string): VAState {
  return { s, t, iS: 0, iT: 0, freq: {}, mode: "count" };
}

function add(freq: Record<string, number>, ch: string) {
  freq[ch] = (freq[ch] ?? 0) + 1;
}

function sub(freq: Record<string, number>, ch: string) {
  freq[ch] = (freq[ch] ?? 0) - 1;
}

export function nextState(state: VAState, a: VAAction): VAState {
  if (a === "RESTART") return initVA(state.s, state.t);
  if (state.decided) return state;

  if (a === "TOGGLE_MODE") return { ...state, mode: state.mode === "count" ? "sort" : "count" };

  if (state.mode === "count") {
    // Early fail: length mismatch
    if (state.iS === 0 && state.iT === 0 && state.s.length !== state.t.length) {
      return { ...state, decided: true, isAnagram: false };
    }
    if (a === "PROCESS_S" && state.iS < state.s.length) {
      const freq = { ...state.freq };
      add(freq, state.s[state.iS]);
      return { ...state, iS: state.iS + 1, freq };
    }
    if (a === "PROCESS_T" && state.iT < state.t.length) {
      const freq = { ...state.freq };
      sub(freq, state.t[state.iT]);
      return { ...state, iT: state.iT + 1, freq };
    }
    if (a === "CHECK") {
      const done = state.iS >= state.s.length && state.iT >= state.t.length;
      if (!done) return state; // ignore until processed both
      const ok = Object.values(state.freq).every(v => v === 0);
      return { ...state, decided: true, isAnagram: ok };
    }
    return state;
  } else {
    // mode === "sort"
    if (a === "SORT_S" && state.sortedS === undefined) {
      return { ...state, sortedS: [...state.s].sort().join("") };
    }
    if (a === "SORT_T" && state.sortedT === undefined) {
      return { ...state, sortedT: [...state.t].sort().join("") };
    }
    if (a === "CHECK") {
      if (state.s.length !== state.t.length) return { ...state, decided: true, isAnagram: false };
      if (state.sortedS === undefined || state.sortedT === undefined) return state;
      const ok = state.sortedS === state.sortedT;
      return { ...state, decided: true, isAnagram: ok };
    }
    return state;
  }
}

export function isFinished(state: VAState): boolean {
  return !!state.decided;
}

export function getHint(state: VAState): string {
  if (state.mode === "count") {
    if (state.iS < state.s.length) return "Process next character from s (+1)";
    if (state.iT < state.t.length) return "Process next character from t (-1)";
    return "Check if all counts are zero";
  } else {
    if (!state.sortedS) return "Sort string s first";
    if (!state.sortedT) return "Sort string t next";
    return "Compare sorted strings";
  }
}

export function correctAction(state: VAState): VAAction {
  if (state.mode === "count") {
    if (state.iS < state.s.length) return "PROCESS_S";
    if (state.iT < state.t.length) return "PROCESS_T";
    return "CHECK";
  } else {
    if (!state.sortedS) return "SORT_S";
    if (!state.sortedT) return "SORT_T";
    return "CHECK";
  }
}
