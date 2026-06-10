import type { StoredGuess } from "./types";

export function getUsedDigits(guesses: StoredGuess[]): Set<number> {
  const used = new Set<number>();

  for (const guess of guesses) {
    for (const digit of guess.value) {
      used.add(Number(digit));
    }
  }

  return used;
}
