type AnagramBank = {
  bank: string[][];
  distractors: string[];
};

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function sample<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

export function generateAnagramSet(data: AnagramBank): string[] {
  const { bank, distractors } = data;
  
  // Pick 3-5 groups from bank
  const numGroups = 3 + Math.floor(Math.random() * 3); // 3-5
  const selectedGroups = sample(bank, numGroups);
  
  // For each group, sample 2-3 words
  const words: string[] = [];
  selectedGroups.forEach(group => {
    const numWords = 2 + Math.floor(Math.random() * 2); // 2-3
    const selectedWords = sample(group, numWords);
    words.push(...selectedWords);
  });
  
  // Add 0-2 distractors
  const numDistractors = Math.floor(Math.random() * 3); // 0-2
  if (numDistractors > 0 && distractors.length > 0) {
    const selectedDistractors = sample(distractors, numDistractors);
    words.push(...selectedDistractors);
  }
  
  // Shuffle final list
  return shuffle(words);
}
