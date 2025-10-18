export type CWState = {
  H: number[];
  L: number;
  R: number;
  bestArea: number;
  status: "playing" | "finished";
};

export type CWAction = "MOVE_LEFT" | "MOVE_RIGHT";

export function area(H: number[], L: number, R: number): number {
  if (L < 0 || R >= H.length || L >= R) return 0;
  return Math.min(H[L], H[R]) * (R - L);
}

export function correctAction(s: CWState): CWAction | "EITHER" {
  if (s.L >= s.R) return "MOVE_LEFT";
  if (s.H[s.L] < s.H[s.R]) return "MOVE_LEFT";
  if (s.H[s.L] > s.H[s.R]) return "MOVE_RIGHT";
  return "EITHER"; // equal heights - both moves are valid
}

export function nextState(s: CWState, a: CWAction): CWState {
  if (s.status === "finished") return s;
  
  const curr = area(s.H, s.L, s.R);
  const bestArea = Math.max(curr, s.bestArea);
  
  let { L, R } = s;
  if (a === "MOVE_LEFT") L++;
  else R--;
  
  const status = L >= R ? "finished" : "playing";
  
  return { H: s.H, L, R, bestArea, status };
}

export function isFinished(s: CWState): boolean {
  return s.status === "finished" || s.L >= s.R;
}

export function getHint(s: CWState, attemptedAction: CWAction): string {
  const correct = correctAction(s);
  
  if (attemptedAction === correct || correct === "EITHER") {
    return "";
  }
  
  if (s.H[s.L] < s.H[s.R]) {
    return `Left height (${s.H[s.L]}) < right height (${s.H[s.R]}). Move the shorter line to find a potentially taller one.`;
  } else {
    return `Right height (${s.H[s.R]}) < left height (${s.H[s.L]}). Move the shorter line to find a potentially taller one.`;
  }
}

export function initializeState(H: number[]): CWState {
  return {
    H,
    L: 0,
    R: H.length - 1,
    bestArea: area(H, 0, H.length - 1),
    status: "playing",
  };
}
