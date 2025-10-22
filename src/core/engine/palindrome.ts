export type PState = {
  s: string;
  L: number;
  R: number;
  decided?: boolean;
  isPalindrome?: boolean;
  status: "playing" | "finished";
};

export type PAction = "SKIP_LEFT" | "SKIP_RIGHT" | "COMPARE";

const isAlnum = (ch: string) => /[0-9A-Za-z]/.test(ch);
const norm = (ch: string) => ch.toLowerCase();

export function correctAction(state: PState): PAction {
  const { s, L, R } = state;
  if (L >= R) return "COMPARE";
  if (!isAlnum(s[L])) return "SKIP_LEFT";
  if (!isAlnum(s[R])) return "SKIP_RIGHT";
  return "COMPARE";
}

export function nextState(state: PState, action: PAction): PState {
  let { s, L, R } = state;
  if (state.decided) return state;
  
  if (action === "SKIP_LEFT") {
    L++;
  } else if (action === "SKIP_RIGHT") {
    R--;
  } else if (action === "COMPARE") {
    const ok = norm(s[L]) === norm(s[R]);
    if (!ok) {
      return { s, L, R, decided: true, isPalindrome: false, status: "finished" };
    }
    L++;
    R--;
  }
  
  if (L >= R) {
    return { s, L, R, decided: true, isPalindrome: true, status: "finished" };
  }
  
  return { s, L, R, status: "playing" };
}

export function isFinished(state: PState): boolean {
  return !!state.decided || state.L >= state.R;
}

export function getHint(state: PState): string {
  const { s, L, R } = state;
  if (L >= R) return "Pointers met - palindrome!";
  if (!isAlnum(s[L])) return `Skip non-alphanumeric '${s[L]}' on left`;
  if (!isAlnum(s[R])) return `Skip non-alphanumeric '${s[R]}' on right`;
  
  const lChar = norm(s[L]);
  const rChar = norm(s[R]);
  if (lChar === rChar) {
    return `Compare: '${s[L]}' == '${s[R]}' (match)`;
  } else {
    return `Compare: '${s[L]}' ≠ '${s[R]}' (mismatch)`;
  }
}

export function initializeState(s: string, L: number = 0, R?: number): PState {
  return {
    s,
    L,
    R: R ?? s.length - 1,
    decided: false,
    isPalindrome: undefined,
    status: "playing"
  };
}
