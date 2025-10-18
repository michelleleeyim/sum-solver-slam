// Random drill generators for each algorithm type

export function generateTwoPointersDrill(difficulty: "easy" | "medium" = "easy") {
  const length = difficulty === "easy" ? 5 : 8;
  const maxValue = difficulty === "easy" ? 15 : 30;
  
  // Generate sorted array
  const nums: number[] = [];
  for (let i = 0; i < length; i++) {
    nums.push(Math.floor(Math.random() * maxValue));
  }
  nums.sort((a, b) => a - b);
  
  // Pick a random valid target (sum of two elements)
  const idx1 = Math.floor(Math.random() * length);
  let idx2 = Math.floor(Math.random() * length);
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * length);
  }
  const target = nums[idx1] + nums[idx2];
  
  return {
    nums,
    target,
    L: 0,
    R: length - 1
  };
}

export function generateThreeSumDrill(difficulty: "easy" | "medium" = "easy") {
  const length = difficulty === "easy" ? 6 : 9;
  const maxValue = difficulty === "easy" ? 10 : 20;
  const minValue = difficulty === "easy" ? -5 : -10;
  
  // Generate sorted array with negative and positive numbers
  const nums: number[] = [];
  for (let i = 0; i < length; i++) {
    const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    nums.push(value);
  }
  nums.sort((a, b) => a - b);
  
  // Target is always 0 for simplicity
  const target = 0;
  
  return {
    nums,
    target
  };
}

export function generateContainerDrill(difficulty: "easy" | "medium" = "easy") {
  const length = difficulty === "easy" ? 7 : 12;
  const maxHeight = difficulty === "easy" ? 10 : 20;
  
  // Generate random heights
  const H: number[] = [];
  for (let i = 0; i < length; i++) {
    H.push(Math.floor(Math.random() * maxHeight) + 1); // at least 1
  }
  
  return {
    H,
    L: 0,
    R: length - 1
  };
}
