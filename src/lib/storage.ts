export interface SessionSummary {
  id: string;
  date: string;
  setId: string;
  mode: string;
  difficulty: string;
  totalDrills: number;
  correctFirstTry: number;
  totalScore: number;
  longestCombo: number;
  averageTime: number;
  accuracy: number;
}

export interface GenericSessionSummary {
  type: string;
  score: number;
  accuracy: number;
  totalMoves: number;
  correctMoves: number;
  duration: number;
  timestamp: number;
  triplets?: number[][];
  [key: string]: any;
}

const STORAGE_KEY = "two_pointers_sessions";
const GENERIC_STORAGE_KEY = "algorithm_drill_sessions";
const MAX_SESSIONS = 10;

export function saveSession(summary: SessionSummary): void {
  const sessions = getSessions();
  sessions.unshift(summary);
  
  // Keep only the last MAX_SESSIONS
  const trimmed = sessions.slice(0, MAX_SESSIONS);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getSessions(): SessionSummary[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Generic session storage for all drill types
export function saveSessionSummary(summary: GenericSessionSummary): void {
  const sessions = getSessionSummaries();
  sessions.unshift(summary);
  
  // Keep only the last MAX_SESSIONS
  const trimmed = sessions.slice(0, MAX_SESSIONS);
  
  localStorage.setItem(GENERIC_STORAGE_KEY, JSON.stringify(trimmed));
}

export function getSessionSummaries(): GenericSessionSummary[] {
  const stored = localStorage.getItem(GENERIC_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function clearSessionSummaries(): void {
  localStorage.removeItem(GENERIC_STORAGE_KEY);
}
