function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateAnswer(date: string): string {
  const random = mulberry32(hashString(`codele:${date}`));
  const firstDigit = 1 + Math.floor(random() * 9);
  const remaining = Array.from({ length: 4 }, () => Math.floor(random() * 10));
  return `${firstDigit}${remaining.join("")}`;
}

export function generatePracticeAnswer(): string {
  const firstDigit = 1 + Math.floor(Math.random() * 9);
  const remaining = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10),
  );
  return `${firstDigit}${remaining.join("")}`;
}
