"use client";

import type { Hint, StoredGuess } from "@/lib/game/types";
import { HINT_PREVIEW_LABELS, MAX_GUESSES } from "@/lib/game/types";
import { GuessRow } from "./GuessRow";
import { useEffect, useRef } from "react";

interface GameBoardProps {
  guesses: StoredGuess[];
  hints: Hint[];
  currentGuessIndex: number;
  status: "playing" | "won" | "lost";
  onSubmitGuess: (guess: string) => void;
  isSubmitting: boolean;
}

export function GameBoard({
  guesses,
  hints,
  currentGuessIndex,
  status,
  onSubmitGuess,
  isSubmitting,
}: GameBoardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "playing" && !isSubmitting) {
      inputRef.current?.focus();
    }
  }, [status, isSubmitting, currentGuessIndex]);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3 px-4 py-6">
      {Array.from({ length: MAX_GUESSES }, (_, index) => {
        const rowNumber = index + 1;
        const guess = guesses[index];
        const hint = hints.find((item) => item.attemptNumber === rowNumber);
        const isActive = status === "playing" && rowNumber === currentGuessIndex + 1;
        const isLocked = rowNumber > currentGuessIndex + 1;

        return (
          <GuessRow
            key={rowNumber}
            rowNumber={rowNumber}
            guess={guess}
            hint={hint}
            isActive={isActive}
            isLocked={isLocked}
            lockedPreview={HINT_PREVIEW_LABELS[rowNumber]}
            inputRef={isActive ? inputRef : undefined}
            onSubmitGuess={onSubmitGuess}
            isSubmitting={isSubmitting}
          />
        );
      })}
    </div>
  );
}
