export type EDPhase = "encode" | "decode" | "done";

export type EDState = {
  words: string[];
  encoded: string;
  decoded: string[];
  encodeIdx: number;
  decodePos: number;
  phase: EDPhase;
  score: number;
  mistakes: number;
  startTime: number;
};

export type EDAction =
  | { type: "ENCODE_NEXT" }
  | { type: "DECODE_NEXT" }
  | { type: "RESTART" }
  | { type: "NEW_SET"; words: string[] };

export function initEncodeDecode(words: string[]): EDState {
  return {
    words,
    encoded: "",
    decoded: [],
    encodeIdx: 0,
    decodePos: 0,
    phase: "encode",
    score: 0,
    mistakes: 0,
    startTime: Date.now(),
  };
}

export function encodeString(word: string): string {
  return `${word.length}#${word}`;
}

export function decodeNext(encoded: string, pos: number): { word: string; nextPos: number } | null {
  if (pos >= encoded.length) return null;
  
  // Find the '#' delimiter
  const delimiterIdx = encoded.indexOf("#", pos);
  if (delimiterIdx === -1) return null;
  
  // Extract length
  const lengthStr = encoded.substring(pos, delimiterIdx);
  const length = parseInt(lengthStr, 10);
  if (isNaN(length)) return null;
  
  // Extract word
  const wordStart = delimiterIdx + 1;
  const word = encoded.substring(wordStart, wordStart + length);
  
  return {
    word,
    nextPos: wordStart + length,
  };
}

export function reducer(state: EDState, action: EDAction): EDState {
  if (state.phase === "done" && action.type !== "RESTART" && action.type !== "NEW_SET") {
    return state;
  }

  switch (action.type) {
    case "ENCODE_NEXT": {
      if (state.phase !== "encode" || state.encodeIdx >= state.words.length) {
        return state;
      }

      const word = state.words[state.encodeIdx];
      const encodedPart = encodeString(word);
      const newEncoded = state.encoded + encodedPart;
      const newIdx = state.encodeIdx + 1;
      
      const newScore = state.score + 1;
      const isComplete = newIdx >= state.words.length;

      return {
        ...state,
        encoded: newEncoded,
        encodeIdx: newIdx,
        score: newScore,
        phase: isComplete ? "decode" : "encode",
      };
    }

    case "DECODE_NEXT": {
      if (state.phase !== "decode") {
        return state;
      }

      const result = decodeNext(state.encoded, state.decodePos);
      if (!result) {
        return { ...state, mistakes: state.mistakes + 1 };
      }

      const newDecoded = [...state.decoded, result.word];
      const newScore = state.score + 1;
      const isComplete = newDecoded.length >= state.words.length;

      return {
        ...state,
        decoded: newDecoded,
        decodePos: result.nextPos,
        score: newScore,
        phase: isComplete ? "done" : "decode",
      };
    }

    case "RESTART":
      return initEncodeDecode(state.words);

    case "NEW_SET":
      return initEncodeDecode(action.words);

    default:
      return state;
  }
}

export function isFinished(state: EDState): boolean {
  return state.phase === "done";
}

export function getTimeElapsed(state: EDState): number {
  return Math.floor((Date.now() - state.startTime) / 1000);
}

export function calculateBonus(state: EDState): number {
  return state.mistakes === 0 ? 3 : 0;
}
