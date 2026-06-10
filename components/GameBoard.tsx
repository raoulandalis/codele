"use client";

import type { Hint, StoredGuess } from "@/lib/game/types";
import { MAX_GUESSES } from "@/lib/game/types";
import { validateGuess } from "@/lib/game/validateGuess";
import { DigitKeypad } from "./DigitKeypad";
import { GuessRow } from "./GuessRow";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  const [inputValue, setInputValue] = useState("");
  const isPlaying = status === "playing";

  useEffect(() => {
    if (isPlaying && !isSubmitting) {
      inputRef.current?.focus();
    }
  }, [isPlaying, isSubmitting, currentGuessIndex]);

  const submitCurrentGuess = useCallback(() => {
    if (isSubmitting || !isPlaying || inputValue.length !== 5) return;

    if (!validateGuess(inputValue)) {
      toast.error("ERR: require 5 digits, leading digit 1-9");
      return;
    }

    onSubmitGuess(inputValue);
    setInputValue("");
  }, [inputValue, isPlaying, isSubmitting, onSubmitGuess]);

  function appendDigit(digit: number) {
    if (isSubmitting || !isPlaying || inputValue.length >= 5) return;
    if (inputValue.length === 0 && digit === 0) return;
    setInputValue((current) => `${current}${digit}`);
  }

  function handleBackspace() {
    if (isSubmitting || !isPlaying) return;
    setInputValue((current) => current.slice(0, -1));
  }

  return (
    <div className="flex w-full flex-col items-center px-4 pb-2">
      <div className="flex w-full max-w-4xl flex-col gap-2 sm:gap-2.5">
        {Array.from({ length: MAX_GUESSES }, (_, index) => {
          const rowNumber = index + 1;
          const guess = guesses[index];
          const hint = hints.find((item) => item.attemptNumber === rowNumber);
          const isActive = isPlaying && rowNumber === currentGuessIndex + 1;

          return (
            <div
              key={rowNumber}
              className="grid grid-cols-1 items-center md:grid-cols-[1fr_auto_1fr] md:gap-x-6"
            >
              <div className="hidden md:block" />
              <GuessRow
                rowNumber={rowNumber}
                guess={guess}
                isActive={isActive}
                inputValue={isActive ? inputValue : ""}
                inputRef={isActive ? inputRef : undefined}
                onInputChange={isActive ? setInputValue : undefined}
                onEnter={isActive ? submitCurrentGuess : undefined}
                isSubmitting={isSubmitting}
              />
              <div className="flex h-14 items-center justify-center md:h-16 md:justify-start md:pl-2">
                {hint && (
                  <p className="animate-hint-fade-in text-center text-xs leading-snug text-foreground-muted sm:text-sm md:text-left">
                    {hint.text}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 sm:mt-5">
        <DigitKeypad
          disabled={!isPlaying || isSubmitting}
          onDigit={appendDigit}
          onBackspace={handleBackspace}
          onEnter={submitCurrentGuess}
        />
      </div>
    </div>
  );
}
