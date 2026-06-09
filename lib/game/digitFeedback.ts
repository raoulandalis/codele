import type { StoredGuess } from "@/lib/game/types";

export function getUsedDigits(guesses: StoredGuess[]): Set<number> {
  const used = new Set<number>();

  for (const guess of guesses) {
    for (const char of guess.value) {
      used.add(Number(char));
    }
  }

  return used;
}

export function getDigitTileClass(
  greenMask: boolean[],
  yellowMask: boolean[],
  index: number,
): "green" | "yellow" | "neutral" {
  if (greenMask[index]) return "green";
  if (yellowMask?.[index]) return "yellow";
  return "neutral";
}
