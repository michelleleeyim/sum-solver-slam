export type GAItem = { id: string; word: string };
export type GABin = { id: string; key: string; items: string[] };
export type GAMode = "count" | "sort";

export type GAState = {
  items: GAItem[]; // words left to place
  bins: GABin[]; // existing bins
  mode: GAMode; // counting vs sorting signatures
  showKeys: boolean; // toggles signature visibility
  decided?: boolean; // finished?
  score: number;
  mistakes: Record<string, number>; // wordId -> mistake count
};

export type GAAction =
  | { type: "TOGGLE_MODE" }
  | { type: "TOGGLE_KEYS" }
  | { type: "CREATE_BIN"; at?: number }
  | { type: "ASSIGN"; wordId: string; binId: string }
  | { type: "AUTO_CHECK"; wordId: string; binId: string }
  | { type: "FINISH" }
  | { type: "RESTART"; items: string[] }
  | { type: "NEW_SET"; items: string[] };

// Counting signature for lowercase a-z: O(k)
function countKey(word: string): string {
  const freq = Array(26).fill(0);
  for (const ch of word.toLowerCase()) {
    const c = ch.charCodeAt(0) - 97;
    if (c >= 0 && c < 26) freq[c]++;
  }
  return freq.join("#");
}

// Sorted signature: O(k log k)
function sortKey(word: string): string {
  return [...word.toLowerCase()].sort().join("");
}

export function keyFor(word: string, mode: GAMode): string {
  return mode === "count" ? countKey(word) : sortKey(word);
}

function findBinById(bins: GABin[], binId: string) {
  return bins.find((b) => b.id === binId);
}

export function canAssign(
  bins: GABin[],
  binId: string,
  word: string,
  mode: GAMode,
): { ok: boolean; expected?: string; actual?: string } {
  const bin = findBinById(bins, binId);
  if (!bin) return { ok: false };
  const actual = keyFor(word, mode);
  const expected = bin.key || actual; // if bin empty, it will accept this word
  return { ok: actual === expected, expected, actual };
}

export function initGA(words: string[], mode: GAMode = "count"): GAState {
  const safeWords = Array.isArray(words) ? words : [];
  return {
    items: safeWords.map((w, i) => ({ id: `w${i}`, word: w })),
    bins: [],
    mode,
    showKeys: false,
    score: 0,
    mistakes: {},
  };
}

export function reducer(state: GAState | null | undefined, action: GAAction): GAState {
  // If state is null/undefined (first render or bad dispatch), initialize safely
  if (state == null) {
    if (action.type === "NEW_SET" || action.type === "RESTART") {
      return initGA(action.items, "count");
    }
    return initGA([], "count");
  }

  // If already decided, ignore everything except restarts/new sets
  if (state.decided && action.type !== "RESTART" && action.type !== "NEW_SET") {
    return state;
  }

  switch (action.type) {
    case "TOGGLE_MODE": {
      // Recalculate bin keys when mode changes
      const newMode = state.mode === "count" ? "sort" : "count";
      const newBins = state.bins.map((bin) => {
        if (bin.items.length === 0) return bin;
        const newKey = keyFor(bin.items[0], newMode);
        return { ...bin, key: newKey };
      });
      return { ...state, mode: newMode, bins: newBins };
    }

    case "TOGGLE_KEYS":
      return { ...state, showKeys: !state.showKeys };

    case "CREATE_BIN": {
      const id = `b${state.bins.length}`;
      return { ...state, bins: [...state.bins, { id, key: "", items: [] }] };
    }

    case "ASSIGN": {
      const wordObj = state.items.find((it) => it.id === action.wordId);
      const bin = findBinById(state.bins, action.binId);
      if (!wordObj || !bin) return state;

      const key = bin.key || keyFor(wordObj.word, state.mode);
      const actual = keyFor(wordObj.word, state.mode);

      if (key !== actual) {
        // Wrong assignment - track mistake but don't place
        const mistakes = { ...state.mistakes, [wordObj.id]: (state.mistakes[wordObj.id] || 0) + 1 };
        return { ...state, mistakes };
        // (UI should show feedback)
      }

      // Correct assignment
      const mistakeCount = state.mistakes[wordObj.id] || 0;
      const points = mistakeCount === 0 ? 2 : mistakeCount === 1 ? 1 : 0;

      const newBins = state.bins.map((b) => (b.id === bin.id ? { ...b, key, items: [...b.items, wordObj.word] } : b));
      const newItems = state.items.filter((it) => it.id !== wordObj.id);
      const decided = newItems.length === 0;

      return {
        ...state,
        bins: newBins,
        items: newItems,
        decided,
        score: state.score + points,
      };
    }

    case "AUTO_CHECK":
      return state;

    case "FINISH": {
      // Bonus if all bins are pure
      const allPure = state.bins.every((bin) => {
        if (bin.items.length === 0) return true;
        const expectedKey = keyFor(bin.items[0], state.mode);
        return bin.items.every((word) => keyFor(word, state.mode) === expectedKey);
      });
      const bonus = allPure && state.items.length === 0 ? 5 : 0;
      return { ...state, decided: true, score: state.score + bonus };
    }

    case "RESTART": {
      // tolerate missing action.items
      return initGA(action.items, state.mode);
    }

    case "NEW_SET": {
      // tolerate missing action.items
      return initGA(action.items, state.mode);
    }

    default:
      return state;
  }
}

export function isFinished(state: GAState | null | undefined): boolean {
  return !!state && !!state.decided;
}

export function formatSignature(key: string, mode: GAMode): string {
  if (mode === "sort") return key;
  // For count mode, show as a compact map
  const parts = key
    .split("#")
    .map((v, i) => (parseInt(v) > 0 ? `${String.fromCharCode(97 + i)}:${v}` : ""))
    .filter(Boolean);
  return parts.join(" ");
}
